import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_PATH = join(__dirname, 'data', 'store.json');

// Middleware
app.use(cors());
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
    return {
      company: null,
      agents: [],
      tickets: [],
      activities: [],
      ticketCounter: 0
    };
  }
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

// Add activity log
function addActivity(data, type, agentId, ticketId, message, metadata = {}) {
  const activity = {
    id: `act_${uuidv4().slice(0, 8)}`,
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
  saveData(data);
  broadcast('activity', activity);
  return activity;
}

// ============ COMPANY ROUTES ============

// Get company details
app.get('/api/company', (req, res) => {
  const data = loadData();
  res.json(data.company || { name: 'AgentHQ', mission: '' });
});

// Update company
app.put('/api/company', (req, res) => {
  const data = loadData();
  const { name, mission } = req.body;

  if (data.company) {
    if (name !== undefined) data.company.name = name;
    if (mission !== undefined) data.company.mission = mission;
    data.company.updatedAt = new Date().toISOString();
  } else {
    data.company = {
      id: `comp_${uuidv4().slice(0, 8)}`,
      name: name || 'AgentHQ',
      mission: mission || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  saveData(data);
  res.json(data.company);
});

// ============ AGENT ROUTES ============

// List all agents
app.get('/api/agents', (req, res) => {
  const data = loadData();
  res.json(data.agents || []);
});

// Create agent
app.post('/api/agents', (req, res) => {
  const data = loadData();
  const { name, role, provider, model, systemPrompt, monthlyBudget, parentId } = req.body;

  const agent = {
    id: `agent_${role || 'new'}_${uuidv4().slice(0, 6)}`,
    name: name || 'New Agent',
    role: role || 'engineer',
    provider: provider || 'claude',
    model: model || (provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-haiku-20241022'),
    systemPrompt: systemPrompt || `You are ${name || 'an agent'} working at this company.`,
    monthlyBudget: monthlyBudget || 500,
    currentSpend: 0,
    status: 'active',
    parentId: parentId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.agents.push(agent);
  saveData(data);

  addActivity(data, 'agent_joined', agent.id, null, `${agent.name} joined as ${formatRole(agent.role)}`);

  res.status(201).json(agent);
});

// Get agent by ID
app.get('/api/agents/:id', (req, res) => {
  const data = loadData();
  const agent = data.agents.find(a => a.id === req.params.id);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.json(agent);
});

// Update agent
app.put('/api/agents/:id', (req, res) => {
  const data = loadData();
  const index = data.agents.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const allowedUpdates = ['name', 'role', 'provider', 'model', 'systemPrompt', 'monthlyBudget', 'status', 'parentId'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      data.agents[index][field] = req.body[field];
    }
  });

  data.agents[index].updatedAt = new Date().toISOString();
  saveData(data);
  res.json(data.agents[index]);
});

// Update agent budget
app.put('/api/agents/:id/budget', (req, res) => {
  const data = loadData();
  const index = data.agents.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  if (req.body.monthlyBudget !== undefined) {
    data.agents[index].monthlyBudget = req.body.monthlyBudget;
    data.agents[index].updatedAt = new Date().toISOString();
    saveData(data);
  }

  res.json(data.agents[index]);
});

// Delete/terminate agent
app.delete('/api/agents/:id', (req, res) => {
  const data = loadData();
  const index = data.agents.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const agent = data.agents[index];
  agent.status = 'terminated';
  agent.updatedAt = new Date().toISOString();

  // Unassign tickets from this agent
  data.tickets.forEach(ticket => {
    if (ticket.assigneeId === agent.id) {
      ticket.assigneeId = null;
    }
  });

  saveData(data);
  addActivity(data, 'agent_paused', agent.id, null, `${agent.name} was terminated`);

  res.json({ success: true, agent });
});

// ============ TICKET ROUTES ============

// List tickets with filters
app.get('/api/tickets', (req, res) => {
  const data = loadData();
  let tickets = data.tickets || [];

  // Apply filters
  if (req.query.status) {
    tickets = tickets.filter(t => t.status === req.query.status);
  }
  if (req.query.assigneeId) {
    tickets = tickets.filter(t => t.assigneeId === req.query.assigneeId);
  }
  if (req.query.priority) {
    tickets = tickets.filter(t => t.priority === req.query.priority);
  }

  // Sort by createdAt descending
  tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(tickets);
});

// Create ticket
app.post('/api/tickets', (req, res) => {
  const data = loadData();
  const { title, description, priority, assigneeId, budgetAllocated } = req.body;

  data.ticketCounter++;
  const ticket = {
    id: `TKT-${String(data.ticketCounter).padStart(3, '0')}`,
    title: title || 'Untitled Ticket',
    description: description || '',
    priority: priority || 'medium',
    status: 'backlog',
    assigneeId: assigneeId || null,
    budgetAllocated: budgetAllocated || 0,
    budgetConsumed: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  };

  data.tickets.push(ticket);
  saveData(data);

  addActivity(data, 'ticket_created', assigneeId, ticket.id, `Created ticket: ${ticket.title}`);

  res.status(201).json(ticket);
});

// Get ticket by ID
app.get('/api/tickets/:id', (req, res) => {
  const data = loadData();
  const ticket = data.tickets.find(t => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json(ticket);
});

// Update ticket
app.put('/api/tickets/:id', (req, res) => {
  const data = loadData();
  const index = data.tickets.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const allowedUpdates = ['title', 'description', 'priority', 'status', 'assigneeId', 'budgetAllocated', 'budgetConsumed'];
  const oldStatus = data.tickets[index].status;

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      data.tickets[index][field] = req.body[field];
    }
  });

  data.tickets[index].updatedAt = new Date().toISOString();

  // Set completedAt if status changed to done
  if (req.body.status === 'done' && oldStatus !== 'done') {
    data.tickets[index].completedAt = new Date().toISOString();
  } else if (req.body.status && req.body.status !== 'done') {
    data.tickets[index].completedAt = null;
  }

  saveData(data);

  // Log activity if status changed
  if (req.body.status && req.body.status !== oldStatus) {
    const agent = data.agents.find(a => a.id === data.tickets[index].assigneeId);
    const agentName = agent ? agent.name : 'Someone';
    addActivity(data, 'ticket_updated', data.tickets[index].assigneeId, data.tickets[index].id, `${agentName} moved ticket to ${formatStatus(req.body.status)}: ${data.tickets[index].title}`, { fromStatus: oldStatus, toStatus: req.body.status });
  }

  res.json(data.tickets[index]);
});

// Update ticket status
app.put('/api/tickets/:id/status', (req, res) => {
  const data = loadData();
  const index = data.tickets.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const oldStatus = data.tickets[index].status;
  const newStatus = req.body.status;

  data.tickets[index].status = newStatus;
  data.tickets[index].updatedAt = new Date().toISOString();

  if (newStatus === 'done') {
    data.tickets[index].completedAt = new Date().toISOString();
  } else {
    data.tickets[index].completedAt = null;
  }

  saveData(data);

  if (newStatus !== oldStatus) {
    const agent = data.agents.find(a => a.id === data.tickets[index].assigneeId);
    const agentName = agent ? agent.name : 'Someone';
    addActivity(data, 'ticket_updated', data.tickets[index].assigneeId, data.tickets[index].id, `${agentName} moved ticket to ${formatStatus(newStatus)}: ${data.tickets[index].title}`, { fromStatus: oldStatus, toStatus: newStatus });
  }

  res.json(data.tickets[index]);
});

// Delete ticket
app.delete('/api/tickets/:id', (req, res) => {
  const data = loadData();
  const index = data.tickets.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  data.tickets.splice(index, 1);
  saveData(data);

  res.json({ success: true });
});

// ============ ACTIVITY ROUTES ============

// List activities
app.get('/api/activities', (req, res) => {
  const data = loadData();
  const limit = parseInt(req.query.limit) || 50;
  res.json(data.activities.slice(0, limit));
});

// SSE stream for real-time activities
app.get('/api/activities/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection message
  res.write('event: connected\ndata: {}\n\n');

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// ============ STATS ROUTES ============

// Dashboard statistics
app.get('/api/stats', (req, res) => {
  const data = loadData();

  const activeAgents = data.agents.filter(a => a.status === 'active').length;
  const openTickets = data.tickets.filter(t => t.status !== 'done').length;
  const totalMonthlyBudget = data.agents.reduce((sum, a) => sum + a.monthlyBudget, 0);
  const totalSpend = data.agents.reduce((sum, a) => sum + a.currentSpend, 0);
  const completedTickets = data.tickets.filter(t => t.status === 'done').length;
  const totalTickets = data.tickets.length;
  const completionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0;

  // Tickets by status
  const ticketsByStatus = {
    backlog: data.tickets.filter(t => t.status === 'backlog').length,
    in_progress: data.tickets.filter(t => t.status === 'in_progress').length,
    review: data.tickets.filter(t => t.status === 'review').length,
    done: data.tickets.filter(t => t.status === 'done').length
  };

  // Budget alerts
  const budgetAlerts = data.agents.filter(a => {
    if (a.status !== 'active') return false;
    const percentage = (a.currentSpend / a.monthlyBudget) * 100;
    return percentage >= 80;
  }).map(a => ({
    agentId: a.id,
    agentName: a.name,
    percentage: Math.round((a.currentSpend / a.monthlyBudget) * 100),
    spent: a.currentSpend,
    budget: a.monthlyBudget
  }));

  res.json({
    activeAgents,
    openTickets,
    totalMonthlyBudget,
    totalSpend,
    completionRate,
    ticketsByStatus,
    budgetAlerts,
    totalTickets
  });
});

// Budget analytics
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

  // Monthly trend (mock data for demo)
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

// Helper functions
function formatRole(role) {
  const roles = {
    ceo: 'CEO',
    cto: 'CTO',
    engineer: 'Engineer',
    designer: 'Designer',
    marketing: 'Marketing Lead',
    support: 'Support Agent',
    custom: 'Team Member'
  };
  return roles[role] || role;
}

function formatStatus(status) {
  const statuses = {
    backlog: 'Backlog',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done'
  };
  return statuses[status] || status;
}

// Start server
app.listen(PORT, () => {
  console.log(`AgentHQ Backend running on http://localhost:${PORT}`);
});
