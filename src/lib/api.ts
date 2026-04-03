const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const USE_MOCK = true // Always use mock data for demo

// Types
export interface Agent {
  id: string
  name: string
  role: string
  provider: string
  model: string
  monthlyBudget: number
  currentSpend: number
  status: 'active' | 'paused' | 'terminated'
  parentId: string | null
  canCreateAgents: boolean
  canUseTools: boolean
  toolPermissions: string[]
  avatar?: string
  createdAt: string
  lastActive: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: string
  updatedAt: string
  unreadCount: number
}

export interface LogEntry {
  id: string
  level: 'debug' | 'info' | 'warning' | 'error'
  category: string
  agentId: string | null
  message: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface Activity {
  id: string
  type: string
  agentId: string
  description: string
  timestamp: string
}

export interface Report {
  id: string
  agentId: string
  toAgentId: string
  content: string
  status: 'pending' | 'reviewed' | 'actioned'
  createdAt: string
}

export interface Tool {
  id: string
  name: string
  description: string
  category: string
  lastUsed: string
  usageCount: number
}

// Mock Data
const mockAgents: Agent[] = [
  {
    id: 'agent_ceo_001',
    name: 'Alex',
    role: 'ceo',
    provider: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    monthlyBudget: 500,
    currentSpend: 127.50,
    status: 'active',
    parentId: null,
    canCreateAgents: true,
    canUseTools: false,
    toolPermissions: [],
    createdAt: '2024-01-15T08:00:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'agent_cto_001',
    name: 'Jordan',
    role: 'cto',
    provider: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    monthlyBudget: 400,
    currentSpend: 89.25,
    status: 'active',
    parentId: 'agent_ceo_001',
    canCreateAgents: true,
    canUseTools: true,
    toolPermissions: ['read_file', 'write_file', 'edit_file', 'delete_file'],
    createdAt: '2024-01-16T09:00:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'agent_eng_001',
    name: 'Casey',
    role: 'engineer',
    provider: 'openai',
    model: 'gpt-4o',
    monthlyBudget: 300,
    currentSpend: 156.80,
    status: 'active',
    parentId: 'agent_cto_001',
    canCreateAgents: false,
    canUseTools: true,
    toolPermissions: ['read_file', 'write_file', 'edit_file'],
    createdAt: '2024-01-17T10:00:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'agent_eng_002',
    name: 'Morgan',
    role: 'engineer',
    provider: 'openai',
    model: 'gpt-4o',
    monthlyBudget: 300,
    currentSpend: 112.40,
    status: 'active',
    parentId: 'agent_cto_001',
    canCreateAgents: false,
    canUseTools: true,
    toolPermissions: ['read_file', 'write_file', 'edit_file'],
    createdAt: '2024-01-18T11:00:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'agent_des_001',
    name: 'Riley',
    role: 'designer',
    provider: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    monthlyBudget: 200,
    currentSpend: 45.60,
    status: 'active',
    parentId: 'agent_cto_001',
    canCreateAgents: false,
    canUseTools: false,
    toolPermissions: [],
    createdAt: '2024-01-19T12:00:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'agent_mkt_001',
    name: 'Taylor',
    role: 'marketing',
    provider: 'openai',
    model: 'gpt-4o-mini',
    monthlyBudget: 150,
    currentSpend: 78.90,
    status: 'active',
    parentId: 'agent_ceo_001',
    canCreateAgents: false,
    canUseTools: false,
    toolPermissions: [],
    createdAt: '2024-01-20T13:00:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'agent_sup_001',
    name: 'Quinn',
    role: 'support',
    provider: 'openai',
    model: 'gpt-4o-mini',
    monthlyBudget: 100,
    currentSpend: 23.10,
    status: 'paused',
    parentId: 'agent_ceo_001',
    canCreateAgents: false,
    canUseTools: false,
    toolPermissions: [],
    createdAt: '2024-01-21T14:00:00Z',
    lastActive: new Date().toISOString(),
  },
]

const mockTickets: Ticket[] = [
  {
    id: 'ticket_001',
    title: 'Implement user authentication',
    description: 'Add OAuth2 authentication with Google and GitHub providers',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'agent_eng_001',
    createdById: 'agent_cto_001',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-15T14:30:00Z',
    tags: ['backend', 'security'],
  },
  {
    id: 'ticket_002',
    title: 'Design landing page',
    description: 'Create a modern, responsive landing page with hero section and features overview',
    status: 'completed',
    priority: 'medium',
    assigneeId: 'agent_des_001',
    createdById: 'agent_cto_001',
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-20T16:00:00Z',
    tags: ['design', 'frontend'],
  },
  {
    id: 'ticket_003',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'open',
    priority: 'medium',
    assigneeId: 'agent_eng_002',
    createdById: 'agent_cto_001',
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-10T11:00:00Z',
    tags: ['devops', 'automation'],
  },
  {
    id: 'ticket_004',
    title: 'Create marketing campaign',
    description: 'Develop social media strategy and content calendar for Q1 launch',
    status: 'in_progress',
    priority: 'low',
    assigneeId: 'agent_mkt_001',
    createdById: 'agent_ceo_001',
    createdAt: '2024-02-12T08:00:00Z',
    updatedAt: '2024-02-18T10:00:00Z',
    tags: ['marketing', 'social'],
  },
  {
    id: 'ticket_005',
    title: 'Fix payment integration bug',
    description: 'Users reporting failed transactions with Stripe payment gateway',
    status: 'open',
    priority: 'urgent',
    assigneeId: 'agent_eng_001',
    createdById: 'agent_sup_001',
    createdAt: '2024-02-20T15:00:00Z',
    updatedAt: '2024-02-20T15:00:00Z',
    tags: ['bug', 'payments'],
  },
]

const mockConversations: Conversation[] = [
  {
    id: 'conv_001',
    participants: ['agent_ceo_001', 'agent_cto_001'],
    lastMessage: 'The Q1 roadmap looks solid. Let\'s prioritize the core features.',
    updatedAt: new Date().toISOString(),
    unreadCount: 2,
  },
  {
    id: 'conv_002',
    participants: ['agent_cto_001', 'agent_eng_001'],
    lastMessage: 'Authentication module is 70% complete. Should finish by Friday.',
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'conv_003',
    participants: ['agent_cto_001', 'agent_des_001'],
    lastMessage: 'The new color palette has been applied to all components.',
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    unreadCount: 1,
  },
  {
    id: 'conv_004',
    participants: ['agent_ceo_001', 'agent_mkt_001'],
    lastMessage: 'Social media strategy is ready for review.',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
  },
]

const mockMessages: Message[] = [
  {
    id: 'msg_001',
    conversationId: 'conv_001',
    senderId: 'agent_ceo_001',
    content: 'How\'s the progress on the MVP?',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'msg_002',
    conversationId: 'conv_001',
    senderId: 'agent_cto_001',
    content: 'We\'re on track. Backend is 60% done and design is nearly complete.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg_003',
    conversationId: 'conv_001',
    senderId: 'agent_ceo_001',
    content: 'The Q1 roadmap looks solid. Let\'s prioritize the core features.',
    timestamp: new Date().toISOString(),
  },
]

const mockLogs: LogEntry[] = [
  {
    id: 'log_001',
    level: 'info',
    category: 'agent',
    agentId: 'agent_eng_001',
    message: 'Started processing task: Implement user authentication',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'log_002',
    level: 'debug',
    category: 'tool',
    agentId: 'agent_eng_001',
    message: 'Executing tool: read_file(path="/src/auth/oauth.ts")',
    timestamp: new Date(Date.now() - 1700000).toISOString(),
  },
  {
    id: 'log_003',
    level: 'warning',
    category: 'budget',
    agentId: 'agent_eng_001',
    message: 'Agent spending at 52% of monthly budget',
    timestamp: new Date(Date.now() - 1600000).toISOString(),
  },
  {
    id: 'log_004',
    level: 'info',
    category: 'conversation',
    agentId: 'agent_cto_001',
    message: 'New message received from Alex',
    timestamp: new Date(Date.now() - 1500000).toISOString(),
  },
  {
    id: 'log_005',
    level: 'error',
    category: 'system',
    agentId: null,
    message: 'Failed to connect to external API: rate limit exceeded',
    timestamp: new Date(Date.now() - 1400000).toISOString(),
    metadata: { service: 'payment-gateway', retryAfter: 60 },
  },
  {
    id: 'log_006',
    level: 'info',
    category: 'agent',
    agentId: 'agent_des_001',
    message: 'Completed task: Design landing page',
    timestamp: new Date(Date.now() - 1300000).toISOString(),
  },
  {
    id: 'log_007',
    level: 'debug',
    category: 'tool',
    agentId: 'agent_eng_002',
    message: 'Tool output: File created successfully at /.github/workflows/ci.yml',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'log_008',
    level: 'info',
    category: 'system',
    agentId: null,
    message: 'Daily budget report generated',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
]

const mockActivities: Activity[] = [
  {
    id: 'act_001',
    type: 'task_completed',
    agentId: 'agent_eng_001',
    description: 'Completed: Design API endpoints',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'act_002',
    type: 'budget_alert',
    agentId: 'agent_eng_001',
    description: 'Budget usage exceeded 50%',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'act_003',
    type: 'agent_created',
    agentId: 'agent_ceo_001',
    description: 'Hired new agent: Quinn (Support)',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'act_004',
    type: 'conversation',
    agentId: 'agent_cto_001',
    description: 'Sent message to Casey',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'act_005',
    type: 'task_assigned',
    agentId: 'agent_cto_001',
    description: 'Assigned task to Casey',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
]

const mockReports: Report[] = [
  {
    id: 'report_001',
    agentId: 'agent_cto_001',
    toAgentId: 'agent_ceo_001',
    content: 'Weekly Status Report: Sprint 1 complete. Backend API is 60% complete, frontend design finalized. Two critical bugs fixed. No blockers.',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'report_002',
    agentId: 'agent_eng_001',
    toAgentId: 'agent_cto_001',
    content: 'Daily Report: Implemented OAuth2 authentication. Working on session management. ETA for completion: 2 days.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'report_003',
    agentId: 'agent_mkt_001',
    toAgentId: 'agent_ceo_001',
    content: 'Marketing Update: Social media strategy finalized. Content calendar for Q1 created. Awaiting final approval for budget allocation.',
    status: 'actioned',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

const mockTools: Tool[] = [
  {
    id: 'tool_001',
    name: 'Read File',
    description: 'Read contents of a file from the filesystem',
    category: 'file',
    lastUsed: new Date(Date.now() - 1800000).toISOString(),
    usageCount: 156,
  },
  {
    id: 'tool_002',
    name: 'Write File',
    description: 'Create or overwrite a file with specified content',
    category: 'file',
    lastUsed: new Date(Date.now() - 3600000).toISOString(),
    usageCount: 89,
  },
  {
    id: 'tool_003',
    name: 'Edit File',
    description: 'Make targeted modifications to specific sections of a file',
    category: 'file',
    lastUsed: new Date(Date.now() - 7200000).toISOString(),
    usageCount: 234,
  },
  {
    id: 'tool_004',
    name: 'Delete File',
    description: 'Remove a file from the filesystem',
    category: 'file',
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
    usageCount: 12,
  },
  {
    id: 'tool_005',
    name: 'Create Folder',
    description: 'Create a new directory in the filesystem',
    category: 'file',
    lastUsed: new Date(Date.now() - 43200000).toISOString(),
    usageCount: 45,
  },
  {
    id: 'tool_006',
    name: 'Web Search',
    description: 'Search the web for relevant information',
    category: 'search',
    lastUsed: new Date(Date.now() - 600000).toISOString(),
    usageCount: 312,
  },
]

// Stats mock
const mockStats = {
  totalAgents: 7,
  activeAgents: 6,
  totalTickets: 5,
  openTickets: 3,
  completedTickets: 1,
  totalBudget: 1950,
  totalSpent: 633.55,
  totalConversations: 4,
  unreadMessages: 3,
  totalLogs: 8,
}

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// API Functions
export const agentsApi = {
  getAll: async (): Promise<Agent[]> => {
    if (USE_MOCK) {
      await delay(200)
      return mockAgents
    }
    const res = await fetch(`${API_BASE_URL}/api/agents`)
    return res.json()
  },

  getById: async (id: string): Promise<Agent | undefined> => {
    if (USE_MOCK) {
      await delay(100)
      return mockAgents.find((a) => a.id === id)
    }
    const res = await fetch(`${API_BASE_URL}/api/agents/${id}`)
    return res.json()
  },

  create: async (agent: Omit<Agent, 'id' | 'createdAt' | 'lastActive'>): Promise<Agent> => {
    if (USE_MOCK) {
      await delay(300)
      const newAgent: Agent = {
        ...agent,
        id: `agent_${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      }
      mockAgents.push(newAgent)
      return newAgent
    }
    const res = await fetch(`${API_BASE_URL}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    })
    return res.json()
  },

  update: async (id: string, updates: Partial<Agent>): Promise<Agent> => {
    if (USE_MOCK) {
      await delay(200)
      const index = mockAgents.findIndex((a) => a.id === id)
      if (index !== -1) {
        mockAgents[index] = { ...mockAgents[index], ...updates }
        return mockAgents[index]
      }
      throw new Error('Agent not found')
    }
    const res = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return res.json()
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(200)
      const index = mockAgents.findIndex((a) => a.id === id)
      if (index !== -1) {
        mockAgents.splice(index, 1)
      }
      return
    }
    await fetch(`${API_BASE_URL}/api/agents/${id}`, { method: 'DELETE' })
  },
}

export const ticketsApi = {
  getAll: async (): Promise<Ticket[]> => {
    if (USE_MOCK) {
      await delay(200)
      return mockTickets
    }
    const res = await fetch(`${API_BASE_URL}/api/tickets`)
    return res.json()
  },

  getById: async (id: string): Promise<Ticket | undefined> => {
    if (USE_MOCK) {
      await delay(100)
      return mockTickets.find((t) => t.id === id)
    }
    const res = await fetch(`${API_BASE_URL}/api/tickets/${id}`)
    return res.json()
  },

  create: async (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> => {
    if (USE_MOCK) {
      await delay(300)
      const newTicket: Ticket = {
        ...ticket,
        id: `ticket_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockTickets.push(newTicket)
      return newTicket
    }
    const res = await fetch(`${API_BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    })
    return res.json()
  },

  update: async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
    if (USE_MOCK) {
      await delay(200)
      const index = mockTickets.findIndex((t) => t.id === id)
      if (index !== -1) {
        mockTickets[index] = { ...mockTickets[index], ...updates, updatedAt: new Date().toISOString() }
        return mockTickets[index]
      }
      throw new Error('Ticket not found')
    }
    const res = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return res.json()
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(200)
      const index = mockTickets.findIndex((t) => t.id === id)
      if (index !== -1) {
        mockTickets.splice(index, 1)
      }
      return
    }
    await fetch(`${API_BASE_URL}/api/tickets/${id}`, { method: 'DELETE' })
  },
}

export const conversationsApi = {
  getAll: async (): Promise<Conversation[]> => {
    if (USE_MOCK) {
      await delay(200)
      return mockConversations
    }
    const res = await fetch(`${API_BASE_URL}/api/conversations`)
    return res.json()
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    if (USE_MOCK) {
      await delay(150)
      return mockMessages.filter((m) => m.conversationId === conversationId)
    }
    const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`)
    return res.json()
  },

  sendMessage: async (conversationId: string, senderId: string, content: string): Promise<Message> => {
    if (USE_MOCK) {
      await delay(200)
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId,
        content,
        timestamp: new Date().toISOString(),
      }
      mockMessages.push(newMessage)
      return newMessage
    }
    const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, content }),
    })
    return res.json()
  },
}

export const logsApi = {
  getAll: async (filters?: { level?: string; category?: string; agentId?: string }): Promise<LogEntry[]> => {
    if (USE_MOCK) {
      await delay(150)
      let filtered = [...mockLogs]
      if (filters?.level) {
        filtered = filtered.filter((l) => l.level === filters.level)
      }
      if (filters?.category) {
        filtered = filtered.filter((l) => l.category === filters.category)
      }
      if (filters?.agentId) {
        filtered = filtered.filter((l) => l.agentId === filters.agentId)
      }
      return filtered
    }
    const params = new URLSearchParams(filters as Record<string, string>)
    const res = await fetch(`${API_BASE_URL}/api/logs?${params}`)
    return res.json()
  },
}

export const statsApi = {
  get: async () => {
    if (USE_MOCK) {
      await delay(100)
      return mockStats
    }
    const res = await fetch(`${API_BASE_URL}/api/stats`)
    return res.json()
  },
}

export const reportsApi = {
  getAll: async (): Promise<Report[]> => {
    if (USE_MOCK) {
      await delay(200)
      return mockReports
    }
    const res = await fetch(`${API_BASE_URL}/api/reports`)
    return res.json()
  },

  create: async (report: Omit<Report, 'id' | 'createdAt'>): Promise<Report> => {
    if (USE_MOCK) {
      await delay(300)
      const newReport: Report = {
        ...report,
        id: `report_${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      mockReports.push(newReport)
      return newReport
    }
    const res = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    })
    return res.json()
  },
}

export const toolsApi = {
  getAll: async (): Promise<Tool[]> => {
    if (USE_MOCK) {
      await delay(150)
      return mockTools
    }
    const res = await fetch(`${API_BASE_URL}/api/tools`)
    return res.json()
  },
}

export const activitiesApi = {
  getRecent: async (limit: number = 10): Promise<Activity[]> => {
    if (USE_MOCK) {
      await delay(100)
      return mockActivities.slice(0, limit)
    }
    const res = await fetch(`${API_BASE_URL}/api/activities?limit=${limit}`)
    return res.json()
  },
}
