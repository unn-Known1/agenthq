import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { readFileSync, writeFileSync, readdirSync, readFile, writeFile, mkdir, rm, stat } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, isAbsolute, normalize } from 'path';
import { v4 as uuidv4 } from 'uuid';

// API Key Encryption - AES-256-GCM
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || null;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey() {
  if (!ENCRYPTION_KEY) {
    console.warn('WARNING: ENCRYPTION_KEY not set. API keys will NOT be encrypted!');
    return null;
  }
  if (ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(ENCRYPTION_KEY, 'hex');
}

function encryptApiKey(apiKey) {
  if (!apiKey) return null;
  const key = getEncryptionKey();
  if (!key) return apiKey; // Return plaintext if no encryption key

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptApiKey(encryptedApiKey) {
  if (!encryptedApiKey) return null;
  const key = getEncryptionKey();
  if (!key) return encryptedApiKey; // Return as-is if no encryption key

  // Check if it's encrypted format (has colons)
  if (!encryptedApiKey.includes(':')) return encryptedApiKey;

  try {
    const [ivHex, authTagHex, encrypted] = encryptedApiKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt API key:', error.message);
    return null;
  }
}

// Mask API key for display (show first 8 and last 4 chars)
function maskApiKey(apiKey) {
  if (!apiKey) return null;
  if (apiKey.includes(':')) {
    // It's encrypted, mask the whole thing
    return '[ENCRYPTED]';
  }
  if (apiKey.length > 12) {
    return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  }
  return '****';
}

// Path Traversal Prevention
function validateAndResolvePath(userPath) {
  // Normalize the user-provided path
  const normalizedPath = userPath.replace(/\\/g, '/');

  // Resolve the full path
  const fullPath = join(WORKSPACE_PATH, normalizedPath);
  const resolvedPath = resolve(fullPath);

  // Ensure the resolved path is within WORKSPACE_PATH
  const resolvedWorkspace = resolve(WORKSPACE_PATH);

  if (!resolvedPath.startsWith(resolvedWorkspace + '/')) {
    throw new Error('Path traversal detected: Access outside workspace is not allowed');
  }

  return resolvedPath;
}

// Input Validation for Tool Parameters
function validateToolParameters(toolId, parameters) {
  const MAX_PATH_LENGTH = 4096;
  const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB
  const MAX_PATTERN_LENGTH = 256;

  switch (toolId) {
    case 'read_file':
    case 'delete_file':
    case 'list_files':
    case 'create_folder':
    case 'delete_folder':
      if (!parameters.path || typeof parameters.path !== 'string') {
        throw new Error('Invalid parameters: path is required and must be a string');
      }
      if (parameters.path.length > MAX_PATH_LENGTH) {
        throw new Error(`Invalid parameters: path exceeds maximum length of ${MAX_PATH_LENGTH}`);
      }
      // Check for obviously malicious patterns
      if (parameters.path.includes('\0')) {
        throw new Error('Invalid parameters: null bytes are not allowed');
      }
      break;

    case 'write_file':
      if (!parameters.path || typeof parameters.path !== 'string') {
        throw new Error('Invalid parameters: path is required and must be a string');
      }
      if (parameters.path.length > MAX_PATH_LENGTH) {
        throw new Error(`Invalid parameters: path exceeds maximum length of ${MAX_PATH_LENGTH}`);
      }
      if (typeof parameters.content !== 'string') {
        throw new Error('Invalid parameters: content is required and must be a string');
      }
      if (parameters.content.length > MAX_CONTENT_LENGTH) {
        throw new Error(`Invalid parameters: content exceeds maximum length of ${MAX_CONTENT_LENGTH} bytes`);
      }
      if (parameters.path.includes('\0')) {
        throw new Error('Invalid parameters: null bytes are not allowed');
      }
      break;

    case 'edit_file':
      if (!parameters.path || typeof parameters.path !== 'string') {
        throw new Error('Invalid parameters: path is required and must be a string');
      }
      if (typeof parameters.old_string !== 'string' || typeof parameters.new_string !== 'string') {
        throw new Error('Invalid parameters: old_string and new_string are required and must be strings');
      }
      if (parameters.path.length > MAX_PATH_LENGTH) {
        throw new Error(`Invalid parameters: path exceeds maximum length of ${MAX_PATH_LENGTH}`);
      }
      if (parameters.old_string.length > MAX_CONTENT_LENGTH || parameters.new_string.length > MAX_CONTENT_LENGTH) {
        throw new Error(`Invalid parameters: string parameters exceed maximum length`);
      }
      if (parameters.path.includes('\0')) {
        throw new Error('Invalid parameters: null bytes are not allowed');
      }
      break;

    case 'search_files':
      if (!parameters.path || typeof parameters.path !== 'string') {
        throw new Error('Invalid parameters: path is required and must be a string');
      }
      if (!parameters.pattern || typeof parameters.pattern !== 'string') {
        throw new Error('Invalid parameters: pattern is required and must be a string');
      }
      if (parameters.path.length > MAX_PATH_LENGTH) {
        throw new Error(`Invalid parameters: path exceeds maximum length of ${MAX_PATH_LENGTH}`);
      }
      if (parameters.pattern.length > MAX_PATTERN_LENGTH) {
        throw new Error(`Invalid parameters: pattern exceeds maximum length of ${MAX_PATTERN_LENGTH}`);
      }
      // Prevent regex injection - only allow simple glob patterns
      if (!/^[a-zA-Z0-9_.\-*?]+$/.test(parameters.pattern)) {
        throw new Error('Invalid parameters: pattern contains invalid characters');
      }
      if (parameters.path.includes('\0')) {
        throw new Error('Invalid parameters: null bytes are not allowed');
      }
      break;
  }

  return true;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_PATH = join(__dirname, 'data', 'store.json');
const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/workspace';

// CORS Configuration - secure by default
const getCorsOptions = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];

  // In production, require explicit origin list
  if (process.env.NODE_ENV === 'production') {
    if (allowedOrigins.length === 0) {
      console.warn('WARNING: CORS_ALLOWED_ORIGINS not set in production! No origins will be allowed.');
    }
    return {
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };
  }

  // In development, allow localhost for easier testing
  return {
    origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  };
};

// Middleware
app.use(cors(getCorsOptions()));
app.use(express.json());

// SSE clients for real-time updates
const sseClients = new Set();

// Load data from file
function loadData() {
  try {
    const data = readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading data:', error);
    return initData();
  }
}

function initData() {
  return {
    company: {
      id: 'comp_001',
      name: 'AgentHQ Demo',
      mission: 'Build the #1 AI note-taking app',
      theme: 'dark',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    agents: [],
    tickets: [],
    conversations: [],
    messages: [],
    logs: [],
    reports: [],
    toolExecutions: [],
    ticketCounter: 0,
    activityCounter: 0
  };
}

// Save data to file
function saveData(data) {
  try {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Broadcast to SSE clients
function broadcast(event, payload) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    client.write(message);
  });
}

// Add log entry
function addLog(data, level, category, message, metadata = {}) {
  const log = {
    id: `log_${uuidv4().slice(0, 8)}`,
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    metadata,
    agentId: metadata.agentId || null,
    taskId: metadata.taskId || null
  };
  data.logs.unshift(log);
  if (data.logs.length > 500) {
    data.logs = data.logs.slice(0, 500);
  }
  saveData(data);
  broadcast('log', log);
  return log;
}

// Add activity log
function addActivity(data, type, agentId, ticketId, message, metadata = {}) {
  data.activityCounter++;
  const activity = {
    id: `act_${String(data.activityCounter).padStart(4, '0')}`,
    type,
    agentId,
    ticketId,
    message,
    metadata,
    createdAt: new Date().toISOString()
  };
  data.activities.unshift(activity);
  if (data.activities.length > 100) {
    data.activities = data.activities.slice(0, 100);
  }
  addLog(data, 'info', 'agent', message, { agentId, ...metadata });
  saveData(data);
  broadcast('activity', activity);
  return activity;
}

// ============ COMPANY ROUTES ============

app.get('/api/company', (req, res) => {
  const data = loadData();
  res.json(data.company || { name: 'AgentHQ', mission: '', theme: 'dark' });
});

app.put('/api/company', (req, res) => {
  const data = loadData();
  const { name, mission, theme } = req.body;

  if (data.company) {
    if (name !== undefined) data.company.name = name;
    if (mission !== undefined) data.company.mission = mission;
    if (theme !== undefined) data.company.theme = theme;
    data.company.updatedAt = new Date().toISOString();
  } else {
    data.company = {
      id: `comp_${uuidv4().slice(0, 8)}`,
      name: name || 'AgentHQ',
      mission: mission || '',
      theme: theme || 'dark',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  addLog(data, 'info', 'system', `Company settings updated`);
  saveData(data);
  res.json(data.company);
});

// ============ AGENT ROUTES ============

app.get('/api/agents', (req, res) => {
  const data = loadData();
  // Mask API keys in response for security
  const agentsWithMaskedKeys = (data.agents || []).map(agent => ({
    ...agent,
    apiKey: maskApiKey(agent.apiKey)
  }));
  res.json(agentsWithMaskedKeys);
});

app.post('/api/agents', (req, res) => {
  const data = loadData();
  const {
    name, role, provider, baseUrl, model, apiKey,
    systemPrompt, monthlyBudget, parentId, canCreateAgents, canUseTools
  } = req.body;

  // Encrypt API key before storing
  const encryptedApiKey = encryptApiKey(apiKey);

  const agent = {
    id: `agent_${role || 'new'}_${uuidv4().slice(0, 6)}`,
    name: name || 'New Agent',
    role: role || 'engineer',
    provider: provider || 'claude',
    baseUrl: baseUrl || null,
    model: model || getDefaultModel(provider),
    apiKey: encryptedApiKey, // Store encrypted
    systemPrompt: systemPrompt || `You are ${name || 'an agent'} working at this company.`,
    monthlyBudget: monthlyBudget || 500,
    currentSpend: 0,
    status: 'active',
    parentId: parentId || null,
    reportsTo: parentId || null,
    subordinates: [],
    canCreateAgents: canCreateAgents ?? (role === 'ceo' || role === 'cto'),
    canUseTools: canUseTools ?? (role === 'engineer'),
    toolPermissions: ['read_file', 'write_file', 'list_files'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Update parent's subordinates
  if (parentId) {
    const parentIndex = data.agents.findIndex(a => a.id === parentId);
    if (parentIndex !== -1) {
      data.agents[parentIndex].subordinates.push(agent.id);
    }
  }

  data.agents.push(agent);
  addLog(data, 'info', 'agent', `${agent.name} joined as ${formatRole(agent.role)}`, { agentId: agent.id });
  addActivity(data, 'agent_joined', agent.id, null, `${agent.name} joined as ${formatRole(agent.role)}`);
  saveData(data);

  // Return with masked API key for display
  const response = { ...agent, apiKey: maskApiKey(encryptedApiKey) };
  res.status(201).json(response);
});

app.get('/api/agents/:id', (req, res) => {
  const data = loadData();
  const agent = data.agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  // Mask API key in response
  const response = { ...agent, apiKey: maskApiKey(agent.apiKey) };
  res.json(response);
});

app.put('/api/agents/:id', (req, res) => {
  const data = loadData();
  const index = data.agents.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Agent not found' });

  const allowedUpdates = [
    'name', 'role', 'provider', 'baseUrl', 'model', 'apiKey',
    'systemPrompt', 'monthlyBudget', 'status', 'parentId',
    'canCreateAgents', 'canUseTools', 'toolPermissions'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      // Encrypt API key if being updated
      if (field === 'apiKey') {
        data.agents[index][field] = encryptApiKey(req.body[field]);
      } else {
        data.agents[index][field] = req.body[field];
      }
    }
  });

  data.agents[index].updatedAt = new Date().toISOString();
  addLog(data, 'info', 'agent', `${data.agents[index].name} settings updated`, { agentId: req.params.id });
  saveData(data);
  // Return with masked API key
  const response = { ...data.agents[index], apiKey: maskApiKey(data.agents[index].apiKey) };
  res.json(response);
});

app.put('/api/agents/:id/budget', (req, res) => {
  const data = loadData();
  const index = data.agents.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Agent not found' });

  if (req.body.monthlyBudget !== undefined) {
    data.agents[index].monthlyBudget = req.body.monthlyBudget;
    data.agents[index].updatedAt = new Date().toISOString();
    addLog(data, 'info', 'budget', `${data.agents[index].name} budget updated to $${req.body.monthlyBudget}`, { agentId: req.params.id });
    saveData(data);
  }

  res.json(data.agents[index]);
});

app.delete('/api/agents/:id', (req, res) => {
  const data = loadData();
  const index = data.agents.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Agent not found' });

  const agent = data.agents[index];
  agent.status = 'terminated';
  agent.updatedAt = new Date().toISOString();

  data.tickets.forEach(ticket => {
    if (ticket.assigneeId === agent.id) ticket.assigneeId = null;
  });

  addLog(data, 'warning', 'agent', `${agent.name} was terminated`, { agentId: agent.id });
  addActivity(data, 'agent_paused', agent.id, null, `${agent.name} was terminated`);
  saveData(data);

  res.json({ success: true, agent });
});

app.get('/api/agents/:id/subordinates', (req, res) => {
  const data = loadData();
  const subordinates = data.agents.filter(a => a.parentId === req.params.id);
  res.json(subordinates);
});

// ============ TICKET ROUTES ============

app.get('/api/tickets', (req, res) => {
  const data = loadData();
  let tickets = data.tickets || [];

  if (req.query.status) tickets = tickets.filter(t => t.status === req.query.status);
  if (req.query.assigneeId) tickets = tickets.filter(t => t.assigneeId === req.query.assigneeId);
  if (req.query.priority) tickets = tickets.filter(t => t.priority === req.query.priority);
  if (req.query.createdBy) tickets = tickets.filter(t => t.createdBy === req.query.createdBy);

  tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(tickets);
});

app.post('/api/tickets', (req, res) => {
  const data = loadData();
  const { title, description, priority, assigneeId, budgetAllocated, createdBy, parentTaskId } = req.body;

  data.ticketCounter++;
  const ticket = {
    id: `TKT-${String(data.ticketCounter).padStart(4, '0')}`,
    title: title || 'Untitled Task',
    description: description || '',
    priority: priority || 'medium',
    status: 'backlog',
    assigneeId: assigneeId || null,
    createdBy: createdBy || null,
    parentTaskId: parentTaskId || null,
    budgetAllocated: budgetAllocated || 0,
    budgetConsumed: 0,
    subtasks: [],
    toolExecutions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  };

  data.tickets.push(ticket);
  addLog(data, 'info', 'task', `Task created: ${ticket.title}`, { taskId: ticket.id, agentId: assigneeId });
  addActivity(data, 'ticket_created', assigneeId, ticket.id, `Created task: ${ticket.title}`);
  saveData(data);

  res.status(201).json(ticket);
});

app.get('/api/tickets/:id', (req, res) => {
  const data = loadData();
  const ticket = data.tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

app.put('/api/tickets/:id', (req, res) => {
  const data = loadData();
  const index = data.tickets.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' });

  const allowedUpdates = ['title', 'description', 'priority', 'status', 'assigneeId', 'budgetAllocated', 'budgetConsumed'];
  const oldStatus = data.tickets[index].status;

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      data.tickets[index][field] = req.body[field];
    }
  });

  data.tickets[index].updatedAt = new Date().toISOString();

  if (req.body.status === 'done' && oldStatus !== 'done') {
    data.tickets[index].completedAt = new Date().toISOString();
  } else if (req.body.status && req.body.status !== 'done') {
    data.tickets[index].completedAt = null;
  }

  addLog(data, 'info', 'task', `Task updated: ${data.tickets[index].title}`, { taskId: req.params.id });
  saveData(data);

  if (req.body.status && req.body.status !== oldStatus) {
    const agent = data.agents.find(a => a.id === data.tickets[index].assigneeId);
    const agentName = agent ? agent.name : 'Someone';
    addActivity(data, 'ticket_updated', data.tickets[index].assigneeId, data.tickets[index].id, `${agentName} moved task to ${formatStatus(req.body.status)}: ${data.tickets[index].title}`, { fromStatus: oldStatus, toStatus: req.body.status });
  }

  res.json(data.tickets[index]);
});

app.put('/api/tickets/:id/status', (req, res) => {
  const data = loadData();
  const index = data.tickets.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' });

  const oldStatus = data.tickets[index].status;
  const newStatus = req.body.status;

  data.tickets[index].status = newStatus;
  data.tickets[index].updatedAt = new Date().toISOString();
  data.tickets[index].completedAt = newStatus === 'done' ? new Date().toISOString() : null;

  addLog(data, 'info', 'task', `Task "${data.tickets[index].title}" status changed to ${newStatus}`, { taskId: req.params.id });
  saveData(data);

  if (newStatus !== oldStatus) {
    const agent = data.agents.find(a => a.id === data.tickets[index].assigneeId);
    const agentName = agent ? agent.name : 'Someone';
    addActivity(data, 'ticket_updated', data.tickets[index].assigneeId, data.tickets[index].id, `${agentName} moved task to ${formatStatus(newStatus)}: ${data.tickets[index].title}`, { fromStatus: oldStatus, toStatus: newStatus });
  }

  res.json(data.tickets[index]);
});

app.delete('/api/tickets/:id', (req, res) => {
  const data = loadData();
  const index = data.tickets.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' });

  const ticket = data.tickets[index];
  addLog(data, 'info', 'task', `Task deleted: ${ticket.title}`, { taskId: req.params.id });
  data.tickets.splice(index, 1);
  saveData(data);

  res.json({ success: true });
});

// ============ CONVERSATIONS ROUTES ============

app.get('/api/conversations', (req, res) => {
  const data = loadData();
  let conversations = data.conversations || [];

  if (req.query.agentId) {
    conversations = conversations.filter(c => c.participants.includes(req.query.agentId));
  }
  if (req.query.type) {
    conversations = conversations.filter(c => c.type === req.query.type);
  }

  conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  res.json(conversations);
});

app.post('/api/conversations', (req, res) => {
  const data = loadData();
  const { participants, type, subject, taskId } = req.body;

  const conversation = {
    id: `conv_${uuidv4().slice(0, 8)}`,
    participants: participants || [],
    type: type || 'direct',
    subject: subject || null,
    taskId: taskId || null,
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  data.conversations.push(conversation);
  addLog(data, 'info', 'conversation', `Conversation created: ${subject || conversation.id}`, { conversationId: conversation.id });
  saveData(data);

  res.status(201).json(conversation);
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const data = loadData();
  const messages = data.messages.filter(m => m.conversationId === req.params.id);
  messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json(messages);
});

app.post('/api/conversations/:id/messages', (req, res) => {
  const data = loadData();
  const { senderId, content, attachments } = req.body;

  const conversation = data.conversations.find(c => c.id === req.params.id);
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

  const message = {
    id: `msg_${uuidv4().slice(0, 8)}`,
    conversationId: req.params.id,
    senderId,
    content,
    attachments: attachments || [],
    readBy: [senderId],
    createdAt: new Date().toISOString()
  };

  data.messages.push(message);
  conversation.lastMessageAt = new Date().toISOString();

  const sender = data.agents.find(a => a.id === senderId);
  addLog(data, 'info', 'conversation', `${sender?.name || 'Unknown'} sent message in ${subject || req.params.id}`, { conversationId: req.params.id, agentId: senderId });
  saveData(data);

  res.status(201).json(message);
});

// ============ LOGS ROUTES ============

app.get('/api/logs', (req, res) => {
  const data = loadData();
  let logs = data.logs || [];

  if (req.query.level) logs = logs.filter(l => l.level === req.query.level);
  if (req.query.category) logs = logs.filter(l => l.category === req.query.category);
  if (req.query.agentId) logs = logs.filter(l => l.agentId === req.query.agentId);
  if (req.query.taskId) logs = logs.filter(l => l.taskId === req.query.taskId);

  const limit = parseInt(req.query.limit) || 100;
  res.json(logs.slice(0, limit));
});

app.get('/api/logs/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write('event: connected\ndata: {}\n\n');
  sseClients.add(res);

  req.on('close', () => sseClients.delete(res));
});

// ============ REPORTS ROUTES ============

app.get('/api/reports', (req, res) => {
  const data = loadData();
  let reports = data.reports || [];

  if (req.query.agentId) reports = reports.filter(r => r.agentId === req.query.agentId);
  if (req.query.submittedTo) reports = reports.filter(r => r.submittedTo === req.query.submittedTo);

  reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(reports);
});

app.post('/api/reports', (req, res) => {
  const data = loadData();
  const { agentId, taskId, content, progress, submittedTo } = req.body;

  const report = {
    id: `rpt_${uuidv4().slice(0, 8)}`,
    agentId,
    taskId: taskId || null,
    content,
    progress: progress || 0,
    submittedTo: submittedTo || null,
    createdAt: new Date().toISOString()
  };

  data.reports.push(report);
  const agent = data.agents.find(a => a.id === agentId);
  addLog(data, 'info', 'report', `${agent?.name || 'Agent'} submitted progress report (${progress}%)`, { agentId, taskId });
  addActivity(data, 'report_submitted', agentId, taskId, `${agent?.name || 'Agent'} submitted report: ${content.substring(0, 50)}...`);
  saveData(data);

  res.status(201).json(report);
});

// ============ TOOLS ROUTES ============

const TOOLS = {
  read_file: {
    id: 'read_file',
    name: 'Read File',
    description: 'Read contents of a file',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'File path to read' }
    ]
  },
  write_file: {
    id: 'write_file',
    name: 'Write File',
    description: 'Create or overwrite a file',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'File path to write' },
      { name: 'content', type: 'string', required: true, description: 'Content to write' }
    ]
  },
  edit_file: {
    id: 'edit_file',
    name: 'Edit File',
    description: 'Edit specific parts of a file',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'File path to edit' },
      { name: 'old_string', type: 'string', required: true, description: 'String to replace' },
      { name: 'new_string', type: 'string', required: true, description: 'Replacement string' }
    ]
  },
  delete_file: {
    id: 'delete_file',
    name: 'Delete File',
    description: 'Delete a file',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'File path to delete' }
    ]
  },
  create_folder: {
    id: 'create_folder',
    name: 'Create Folder',
    description: 'Create a directory',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'Directory path to create' }
    ]
  },
  delete_folder: {
    id: 'delete_folder',
    name: 'Delete Folder',
    description: 'Delete a directory',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'Directory path to delete' }
    ]
  },
  list_files: {
    id: 'list_files',
    name: 'List Files',
    description: 'List files in a directory',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'Directory path to list' }
    ]
  },
  search_files: {
    id: 'search_files',
    name: 'Search Files',
    description: 'Search for files by pattern',
    category: 'file',
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'Directory to search in' },
      { name: 'pattern', type: 'string', required: true, description: 'Search pattern (glob)' }
    ]
  }
};

app.get('/api/tools', (req, res) => {
  res.json(Object.values(TOOLS));
});

app.post('/api/tools/execute', async (req, res) => {
  const data = loadData();
  const { toolId, agentId, taskId, parameters } = req.body;

  const tool = TOOLS[toolId];
  if (!tool) return res.status(404).json({ error: 'Tool not found' });

  // Validate input parameters
  try {
    validateToolParameters(toolId, parameters);
  } catch (validationError) {
    return res.status(400).json({ error: validationError.message });
  }

  const startTime = Date.now();
  let result, success = true, error = null;

  try {
    switch (toolId) {
      case 'read_file': {
        const fullPath = validateAndResolvePath(parameters.path);
        result = await readFile(fullPath, 'utf-8');
        break;
      }
      case 'write_file': {
        const fullPath = validateAndResolvePath(parameters.path);
        await writeFile(fullPath, parameters.content);
        result = `File written: ${parameters.path}`;
        break;
      }
      case 'edit_file': {
        const fullPath = validateAndResolvePath(parameters.path);
        const content = await readFile(fullPath, 'utf-8');
        const newContent = content.replace(parameters.old_string, parameters.new_string);
        await writeFile(fullPath, newContent);
        result = `File edited: ${parameters.path}`;
        break;
      }
      case 'delete_file': {
        const fullPath = validateAndResolvePath(parameters.path);
        await rm(fullPath, { force: true });
        result = `File deleted: ${parameters.path}`;
        break;
      }
      case 'create_folder': {
        const fullPath = validateAndResolvePath(parameters.path);
        await mkdir(fullPath, { recursive: true });
        result = `Folder created: ${parameters.path}`;
        break;
      }
      case 'delete_folder': {
        const fullPath = validateAndResolvePath(parameters.path);
        await rm(fullPath, { recursive: true, force: true });
        result = `Folder deleted: ${parameters.path}`;
        break;
      }
      case 'list_files': {
        const fullPath = validateAndResolvePath(parameters.path);
        const files = readdirSync(fullPath);
        result = JSON.stringify(files);
        break;
      }
      case 'search_files': {
        const fullPath = validateAndResolvePath(parameters.path);
        const files = readdirSync(fullPath).filter(f => f.includes(parameters.pattern));
        result = JSON.stringify(files);
        break;
      }
      default:
        throw new Error('Tool not implemented');
    }
  } catch (e) {
    success = false;
    error = e.message;
    result = null;
  }

  const execution = {
    id: `exec_${uuidv4().slice(0, 8)}`,
    toolId,
    agentId,
    taskId: taskId || null,
    input: parameters,
    output: result,
    success,
    error,
    duration: Date.now() - startTime,
    createdAt: new Date().toISOString()
  };

  data.toolExecutions.push(execution);
  if (data.toolExecutions.length > 200) {
    data.toolExecutions = data.toolExecutions.slice(-200);
  }

  const agent = data.agents.find(a => a.id === agentId);
  addLog(data, success ? 'info' : 'error', 'tool', `${tool.name} executed by ${agent?.name || 'Unknown'}: ${success ? 'Success' : error}`, { agentId, taskId, toolId });

  // Update task budget consumed
  if (taskId) {
    const taskIndex = data.tickets.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      data.tickets[taskIndex].budgetConsumed += execution.duration * 0.001; // Rough cost estimate
    }
  }

  // Update agent spend
  if (agentId) {
    const agentIndex = data.agents.findIndex(a => a.id === agentId);
    if (agentIndex !== -1) {
      data.agents[agentIndex].currentSpend += execution.duration * 0.001;
    }
  }

  saveData(data);
  res.json(execution);
});

app.get('/api/tools/executions', (req, res) => {
  const data = loadData();
  let executions = data.toolExecutions || [];

  if (req.query.agentId) executions = executions.filter(e => e.agentId === req.query.agentId);
  if (req.query.taskId) executions = executions.filter(e => e.taskId === req.query.taskId);

  executions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(executions.slice(0, 100));
});

// ============ ACTIVITY ROUTES ============

app.get('/api/activities', (req, res) => {
  const data = loadData();
  const limit = parseInt(req.query.limit) || 50;
  res.json(data.activities.slice(0, limit));
});

app.get('/api/activities/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write('event: connected\ndata: {}\n\n');
  sseClients.add(res);

  req.on('close', () => sseClients.delete(res));
});

// ============ HISTORY ROUTES ============

app.get('/api/history', (req, res) => {
  const data = loadData();
  const history = [];

  // Add completed tasks
  data.tickets.filter(t => t.status === 'done').forEach(t => {
    history.push({
      id: t.id,
      type: 'task_completed',
      title: t.title,
      completedAt: t.completedAt,
      assigneeId: t.assigneeId,
      duration: t.completedAt ? new Date(t.completedAt) - new Date(t.createdAt) : null,
      cost: t.budgetConsumed
    });
  });

  // Add agent joins
  data.activities.filter(a => a.type === 'agent_joined').forEach(a => {
    history.push({
      id: a.id,
      type: 'agent_joined',
      title: a.message,
      completedAt: a.createdAt,
      agentId: a.agentId
    });
  });

  history.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
  res.json(history.slice(0, 100));
});

// ============ STATS ROUTES ============

app.get('/api/stats', (req, res) => {
  const data = loadData();

  const activeAgents = data.agents.filter(a => a.status === 'active').length;
  const openTasks = data.tickets.filter(t => t.status !== 'done').length;
  const totalMonthlyBudget = data.agents.reduce((sum, a) => sum + a.monthlyBudget, 0);
  const totalSpend = data.agents.reduce((sum, a) => sum + a.currentSpend, 0);
  const completedTasks = data.tickets.filter(t => t.status === 'done').length;
  const totalTasks = data.tickets.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const ticketsByStatus = {
    backlog: data.tickets.filter(t => t.status === 'backlog').length,
    in_progress: data.tickets.filter(t => t.status === 'in_progress').length,
    review: data.tickets.filter(t => t.status === 'review').length,
    done: data.tickets.filter(t => t.status === 'done').length
  };

  const budgetAlerts = data.agents.filter(a => {
    if (a.status !== 'active') return false;
    return (a.currentSpend / a.monthlyBudget) * 100 >= 80;
  }).map(a => ({
    agentId: a.id,
    agentName: a.name,
    percentage: Math.round((a.currentSpend / a.monthlyBudget) * 100),
    spent: a.currentSpend,
    budget: a.monthlyBudget
  }));

  res.json({
    activeAgents,
    openTasks,
    totalMonthlyBudget,
    totalSpend,
    completionRate,
    ticketsByStatus,
    budgetAlerts,
    totalTasks,
    totalConversations: (data.conversations || []).length,
    totalLogs: (data.logs || []).length,
    totalReports: (data.reports || []).length
  });
});

app.get('/api/stats/budget', (req, res) => {
  const data = loadData();

  const agentStats = data.agents.map(agent => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    budget: agent.monthlyBudget,
    spent: agent.currentSpend,
    remaining: agent.monthlyBudget - agent.currentSpend,
    percentage: Math.round((agent.currentSpend / agent.monthlyBudget) * 100)
  }));

  const monthlyTrend = [
    { month: 'Jan', budget: 3200, spent: 2880 },
    { month: 'Feb', budget: 3200, spent: 3100 },
    { month: 'Mar', budget: 3600, spent: 3200 }
  ];

  res.json({
    agentStats,
    monthlyTrend,
    totalBudget: data.agents.reduce((sum, a) => sum + a.monthlyBudget, 0),
    totalSpent: data.agents.reduce((sum, a) => sum + a.currentSpend, 0)
  });
});

// ============ SEED DATA ============

function seedData() {
  const data = loadData();
  if (data.agents.length > 0) return;

  // Company
  data.company = {
    id: 'comp_001',
    name: 'AgentHQ Demo',
    mission: 'Build the #1 AI note-taking app',
    theme: 'dark',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Create agents
  const ceo = {
    id: 'agent_ceo_001',
    name: 'Alex',
    role: 'ceo',
    provider: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    systemPrompt: 'You are Alex, the CEO. You oversee all operations and make high-level decisions.',
    monthlyBudget: 500, currentSpend: 127.50, status: 'active',
    parentId: null, reportsTo: null, subordinates: [],
    canCreateAgents: true, canUseTools: false,
    toolPermissions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };

  const cto = {
    id: 'agent_cto_001',
    name: 'Sam',
    role: 'cto',
    provider: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    systemPrompt: 'You are Sam, the CTO. You lead technical decisions and architecture.',
    monthlyBudget: 800, currentSpend: 342.00, status: 'active',
    parentId: 'agent_ceo_001', reportsTo: 'agent_ceo_001', subordinates: [],
    canCreateAgents: true, canUseTools: true,
    toolPermissions: ['read_file', 'write_file', 'list_files', 'search_files'],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  ceo.subordinates.push('agent_cto_001');

  const eng1 = {
    id: 'agent_eng_001',
    name: 'Jordan',
    role: 'engineer',
    provider: 'claude',
    model: 'claude-3-5-haiku-20241022',
    systemPrompt: 'You are Jordan, a backend engineer. You implement APIs and server logic.',
    monthlyBudget: 600, currentSpend: 189.25, status: 'active',
    parentId: 'agent_cto_001', reportsTo: 'agent_cto_001', subordinates: [],
    canCreateAgents: false, canUseTools: true,
    toolPermissions: ['read_file', 'write_file', 'list_files', 'create_folder', 'delete_file'],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  cto.subordinates.push('agent_eng_001');

  const eng2 = {
    id: 'agent_eng_002',
    name: 'Taylor',
    role: 'engineer',
    provider: 'openai',
    model: 'gpt-4o-mini',
    systemPrompt: 'You are Taylor, a frontend engineer. You build user interfaces.',
    monthlyBudget: 450, currentSpend: 156.80, status: 'active',
    parentId: 'agent_cto_001', reportsTo: 'agent_cto_001', subordinates: [],
    canCreateAgents: false, canUseTools: true,
    toolPermissions: ['read_file', 'write_file', 'list_files'],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  cto.subordinates.push('agent_eng_002');

  const designer = {
    id: 'agent_des_001',
    name: 'Morgan',
    role: 'designer',
    provider: 'claude',
    model: 'claude-3-5-haiku-20241022',
    systemPrompt: 'You are Morgan, a product designer. You create UI/UX designs.',
    monthlyBudget: 400, currentSpend: 98.50, status: 'active',
    parentId: 'agent_ceo_001', reportsTo: 'agent_ceo_001', subordinates: [],
    canCreateAgents: false, canUseTools: false,
    toolPermissions: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  ceo.subordinates.push('agent_des_001');

  const marketing = {
    id: 'agent_mkt_001',
    name: 'Casey',
    role: 'marketing',
    provider: 'claude',
    model: 'claude-3-5-haiku-20241022',
    systemPrompt: 'You are Casey, the marketing lead. You create growth strategies.',
    monthlyBudget: 350, currentSpend: 67.25, status: 'active',
    parentId: 'agent_ceo_001', reportsTo: 'agent_ceo_001', subordinates: [],
    canCreateAgents: false, canUseTools: false,
    toolPermissions: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  ceo.subordinates.push('agent_mkt_001');

  data.agents = [ceo, cto, eng1, eng2, designer, marketing];

  // Create tasks
  data.tickets = [
    { id: 'TKT-0001', title: 'Implement user authentication', description: 'Set up OAuth with Google and GitHub', priority: 'high', status: 'in_progress', assigneeId: 'agent_eng_001', createdBy: 'agent_cto_001', budgetAllocated: 150, budgetConsumed: 78.50, subtasks: [], toolExecutions: [], createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(), completedAt: null },
    { id: 'TKT-0002', title: 'Design landing page mockup', description: 'Create hero, features, pricing sections', priority: 'medium', status: 'review', assigneeId: 'agent_des_001', createdBy: 'agent_ceo_001', budgetAllocated: 100, budgetConsumed: 95.00, subtasks: [], toolExecutions: [], createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString(), completedAt: null },
    { id: 'TKT-0003', title: 'Build note editor component', description: 'Rich text editor with markdown support', priority: 'critical', status: 'backlog', assigneeId: 'agent_eng_002', createdBy: 'agent_cto_001', budgetAllocated: 200, budgetConsumed: 0, subtasks: [], toolExecutions: [], createdAt: new Date(Date.now() - 43200000).toISOString(), updatedAt: new Date().toISOString(), completedAt: null },
    { id: 'TKT-0004', title: 'Plan launch campaign', description: 'Go-to-market strategy and press release', priority: 'medium', status: 'in_progress', assigneeId: 'agent_mkt_001', createdBy: 'agent_ceo_001', budgetAllocated: 80, budgetConsumed: 35.25, subtasks: [], toolExecutions: [], createdAt: new Date(Date.now() - 129600000).toISOString(), updatedAt: new Date().toISOString(), completedAt: null },
    { id: 'TKT-0005', title: 'Set up CI/CD pipeline', description: 'GitHub Actions for testing and deployment', priority: 'high', status: 'done', assigneeId: 'agent_eng_001', createdBy: 'agent_cto_001', budgetAllocated: 75, budgetConsumed: 62.30, subtasks: [], toolExecutions: [], createdAt: new Date(Date.now() - 345600000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'TKT-0006', title: 'Create API documentation', description: 'Comprehensive API docs with examples', priority: 'low', status: 'backlog', assigneeId: 'agent_cto_001', createdBy: 'agent_cto_001', budgetAllocated: 60, budgetConsumed: 0, subtasks: [], toolExecutions: [], createdAt: new Date(Date.now() - 21600000).toISOString(), updatedAt: new Date().toISOString(), completedAt: null },
    { id: 'TKT-0007', title: 'Implement dark mode toggle', description: 'Theme switcher with local storage', priority: 'low', status: 'done', assigneeId: 'agent_eng_002', createdBy: 'agent_cto_001', budgetAllocated: 40, budgetConsumed: 38.50, subtasks: [], toolExecutions: [], createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString(), completedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'TKT-0008', title: 'Design mobile responsive layout', description: 'Ensure mobile-friendly breakpoints', priority: 'medium', status: 'backlog', assigneeId: 'agent_des_001', createdBy: 'agent_des_001', budgetAllocated: 120, budgetConsumed: 0, subtasks: [], toolExecutions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: null }
  ];
  data.ticketCounter = 8;

  // Create conversation
  const conv1 = {
    id: 'conv_001',
    participants: ['agent_cto_001', 'agent_eng_001'],
    type: 'direct',
    subject: 'API Architecture Discussion',
    taskId: null,
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString()
  };

  const conv2 = {
    id: 'conv_002',
    participants: ['agent_ceo_001', 'agent_cto_001', 'agent_des_001'],
    type: 'group',
    subject: 'Product Design Review',
    taskId: 'TKT-0002',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString()
  };

  data.conversations = [conv1, conv2];

  // Add messages
  data.messages = [
    { id: 'msg_001', conversationId: 'conv_001', senderId: 'agent_cto_001', content: 'Hey Jordan, can you review the auth implementation?', attachments: [], readBy: ['agent_cto_001', 'agent_eng_001'], createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'msg_002', conversationId: 'conv_001', senderId: 'agent_eng_001', content: 'Sure! I\'ll look at it today. Should have feedback by EOD.', attachments: [], readBy: ['agent_eng_001', 'agent_cto_001'], createdAt: new Date(Date.now() - 5400000).toISOString() },
    { id: 'msg_003', conversationId: 'conv_001', senderId: 'agent_cto_001', content: 'Perfect. Also, check if we need to add rate limiting.', attachments: [], readBy: ['agent_cto_001'], createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'msg_004', conversationId: 'conv_002', senderId: 'agent_ceo_001', content: 'Team, let\'s review the landing page design today.', attachments: [], readBy: ['agent_ceo_001', 'agent_cto_001', 'agent_des_001'], createdAt: new Date(Date.now() - 14400000).toISOString() },
    { id: 'msg_005', conversationId: 'conv_002', senderId: 'agent_des_001', content: 'I\'ve uploaded the latest mockup. Let me know your thoughts!', attachments: [], readBy: ['agent_des_001', 'agent_ceo_001'], createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: 'msg_006', conversationId: 'conv_002', senderId: 'agent_cto_001', content: 'Looking good Morgan! Can we make the CTA button more prominent?', attachments: [], readBy: ['agent_cto_001', 'agent_des_001', 'agent_ceo_001'], createdAt: new Date(Date.now() - 7200000).toISOString() }
  ];

  // Add reports
  data.reports = [
    { id: 'rpt_001', agentId: 'agent_eng_001', taskId: 'TKT-0001', content: 'Authentication system is 60% complete. OAuth flow working, need to add session management.', progress: 60, submittedTo: 'agent_cto_001', createdAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'rpt_002', agentId: 'agent_des_001', taskId: 'TKT-0002', content: 'Landing page design ready for review. Hero section completed.', progress: 85, submittedTo: 'agent_ceo_001', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'rpt_003', agentId: 'agent_mkt_001', taskId: 'TKT-0004', content: 'Launch campaign plan drafted. Preparing social media content calendar.', progress: 40, submittedTo: 'agent_ceo_001', createdAt: new Date(Date.now() - 21600000).toISOString() }
  ];

  // Add logs
  data.logs = [
    { id: 'log_001', timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'info', category: 'agent', message: 'Jordan started working on TKT-0001', agentId: 'agent_eng_001', taskId: 'TKT-0001', metadata: {} },
    { id: 'log_002', timestamp: new Date(Date.now() - 7200000).toISOString(), level: 'info', category: 'tool', message: 'read_file executed by Jordan: src/auth/oauth.ts', agentId: 'agent_eng_001', taskId: 'TKT-0001', metadata: { toolId: 'read_file' } },
    { id: 'log_003', timestamp: new Date(Date.now() - 14400000).toISOString(), level: 'info', category: 'conversation', message: 'Alex started conversation in Product Design Review', agentId: 'agent_ceo_001', metadata: { conversationId: 'conv_002' } },
    { id: 'log_004', timestamp: new Date(Date.now() - 86400000).toISOString(), level: 'info', category: 'task', message: 'Task completed: Set up CI/CD pipeline', agentId: 'agent_eng_001', taskId: 'TKT-0005', metadata: {} },
    { id: 'log_005', timestamp: new Date(Date.now() - 172800000).toISOString(), level: 'info', category: 'agent', message: 'Taylor joined as Frontend Engineer', agentId: 'agent_eng_002', metadata: {} }
  ];

  data.activityCounter = 10;
  data.activities = [
    { id: 'act_0001', type: 'agent_joined', agentId: 'agent_ceo_001', ticketId: null, message: 'Alex joined as CEO', metadata: {}, createdAt: new Date(Date.now() - 604800000).toISOString() },
    { id: 'act_0002', type: 'agent_joined', agentId: 'agent_cto_001', ticketId: null, message: 'Sam joined as CTO', metadata: {}, createdAt: new Date(Date.now() - 518400000).toISOString() },
    { id: 'act_0003', type: 'ticket_created', agentId: 'agent_eng_001', ticketId: 'TKT-0005', message: 'Jordan created task: Set up CI/CD pipeline', metadata: {}, createdAt: new Date(Date.now() - 345600000).toISOString() },
    { id: 'act_0004', type: 'ticket_updated', agentId: 'agent_eng_001', ticketId: 'TKT-0005', message: 'Jordan moved task to Done: Set up CI/CD pipeline', metadata: { fromStatus: 'review', toStatus: 'done' }, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'act_0005', type: 'report_submitted', agentId: 'agent_eng_001', ticketId: 'TKT-0001', message: 'Jordan submitted report: Authentication system is 60% complete...', metadata: {}, createdAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'act_0006', type: 'ticket_created', agentId: 'agent_des_001', ticketId: 'TKT-0008', message: 'Morgan created task: Design mobile responsive layout', metadata: {}, createdAt: new Date(Date.now() - 3600000).toISOString() }
  ];

  saveData(data);
  console.log('Demo data seeded successfully');
}

// Helper functions
function getDefaultModel(provider) {
  if (provider === 'openai') return 'gpt-4o-mini';
  if (provider === 'custom') return 'custom-model';
  return 'claude-3-5-haiku-20241022';
}

function formatRole(role) {
  const roles = { ceo: 'CEO', cto: 'CTO', engineer: 'Engineer', designer: 'Designer', marketing: 'Marketing Lead', support: 'Support Agent', custom: 'Team Member' };
  return roles[role] || role;
}

function formatStatus(status) {
  const statuses = { backlog: 'Backlog', in_progress: 'In Progress', review: 'Review', done: 'Done' };
  return statuses[status] || status;
}

// Initialize data
seedData();

// Start server
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`AgentHQ Backend running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});
