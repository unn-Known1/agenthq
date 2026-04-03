import { create } from 'zustand';
import {
  agentsApi,
  ticketsApi,
  activitiesApi,
  statsApi,
  conversationsApi,
  logsApi,
  reportsApi,
  toolsApi,
  Agent,
  Ticket,
  Activity,
  Conversation,
  Message,
  LogEntry,
  Report,
  Tool,
} from '../lib/api';

interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalTickets: number;
  openTickets: number;
  completedTickets: number;
  totalBudget: number;
  totalSpent: number;
  totalConversations: number;
  unreadMessages: number;
  totalLogs: number;
}

interface AppState {
  // Company
  company: { id: string; name: string; mission: string } | null;
  setCompany: (company: { id: string; name: string; mission: string }) => void;
  updateMission: (mission: string) => void;

  // Agents
  agents: Agent[];
  selectedAgent: Agent | null;
  loadingAgents: boolean;
  fetchAgents: () => Promise<void>;
  createAgent: (data: Partial<Agent>) => Promise<Agent>;
  updateAgent: (id: string, data: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  setSelectedAgent: (agent: Agent | null) => void;

  // Tickets
  tickets: Ticket[];
  loadingTickets: boolean;
  fetchTickets: () => Promise<void>;
  createTicket: (data: Partial<Ticket>) => Promise<Ticket>;
  updateTicket: (id: string, data: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;

  // Activities
  activities: Activity[];
  fetchActivities: () => Promise<void>;

  // Stats
  stats: DashboardStats | null;
  fetchStats: () => Promise<void>;

  // Conversations
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (participants: string[], initialMessage: string) => Promise<Conversation>;
  setSelectedConversation: (conversation: Conversation | null) => void;

  // Logs
  logs: LogEntry[];
  fetchLogs: (filters?: { level?: string; category?: string; agentId?: string }) => Promise<void>;

  // History (using existing types)
  taskHistory: any[];
  agentHistory: any[];
  budgetHistory: any[];
  fetchHistory: () => Promise<void>;

  // Reports
  reports: Report[];
  fetchReports: () => Promise<void>;
  submitReport: (data: Omit<Report, 'id' | 'createdAt'>) => Promise<void>;

  // Tools
  tools: Tool[];
  fetchTools: () => Promise<void>;

  // UI State
  showAgentModal: boolean;
  showTicketModal: boolean;
  editingAgent: Agent | null;
  editingTicket: Ticket | null;
  setShowAgentModal: (show: boolean) => void;
  setShowTicketModal: (show: boolean) => void;
  setEditingAgent: (agent: Agent | null) => void;
  setEditingTicket: (ticket: Ticket | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Company
  company: { id: '1', name: 'AgentHQ Corp', mission: 'Build the #1 AI note-taking app' },
  setCompany: (company) => set({ company }),
  updateMission: (mission) => set((state) => ({ company: state.company ? { ...state.company, mission } : null })),

  // Agents
  agents: [],
  selectedAgent: null,
  loadingAgents: false,
  fetchAgents: async () => {
    set({ loadingAgents: true });
    try {
      const agents = await agentsApi.getAll();
      set({ agents, loadingAgents: false });
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      set({ loadingAgents: false });
    }
  },
  createAgent: async (data) => {
    const agent = await agentsApi.create(data as any);
    set((state) => ({ agents: [...state.agents, agent] }));
    return agent;
  },
  updateAgent: async (id, data) => {
    const agent = await agentsApi.update(id, data);
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? agent : a)),
      selectedAgent: state.selectedAgent?.id === id ? agent : state.selectedAgent,
    }));
  },
  deleteAgent: async (id) => {
    await agentsApi.delete(id);
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent,
    }));
  },
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  // Tickets
  tickets: [],
  loadingTickets: false,
  fetchTickets: async () => {
    set({ loadingTickets: true });
    try {
      const tickets = await ticketsApi.getAll();
      set({ tickets, loadingTickets: false });
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      set({ loadingTickets: false });
    }
  },
  createTicket: async (data) => {
    const ticket = await ticketsApi.create(data as any);
    set((state) => ({ tickets: [ticket, ...state.tickets] }));
    return ticket;
  },
  updateTicket: async (id, data) => {
    const ticket = await ticketsApi.update(id, data);
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? ticket : t)),
    }));
  },
  deleteTicket: async (id) => {
    await ticketsApi.delete(id);
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== id),
    }));
  },

  // Activities
  activities: [],
  fetchActivities: async () => {
    try {
      const activities = await activitiesApi.getRecent(50);
      set({ activities });
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  },

  // Stats
  stats: null,
  fetchStats: async () => {
    try {
      const stats = await statsApi.get();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  // Conversations
  conversations: [],
  selectedConversation: null,
  messages: [],
  fetchConversations: async () => {
    try {
      const conversations = await conversationsApi.getAll();
      set({ conversations });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },
  fetchMessages: async (conversationId) => {
    try {
      const messages = await conversationsApi.getMessages(conversationId);
      set({ messages });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },
  sendMessage: async (conversationId, content) => {
    try {
      const currentUser = get().agents[0];
      await conversationsApi.sendMessage(conversationId, currentUser?.id || 'agent_ceo_001', content);
      get().fetchMessages(conversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },
  createConversation: async (participants, initialMessage) => {
    const newConv = {
      id: `conv_${Date.now()}`,
      participants,
      lastMessage: initialMessage,
      updatedAt: new Date().toISOString(),
      unreadCount: 0,
    };
    set((state) => ({ conversations: [newConv, ...state.conversations] }));
    return newConv;
  },
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),

  // Logs
  logs: [],
  fetchLogs: async (filters) => {
    try {
      const logs = await logsApi.getAll(filters);
      set({ logs });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  },

  // History
  taskHistory: [],
  agentHistory: [],
  budgetHistory: [],
  fetchHistory: async () => {
    set({ taskHistory: get().tickets, agentHistory: get().agents, budgetHistory: get().agents });
  },

  // Reports
  reports: [],
  fetchReports: async () => {
    try {
      const reports = await reportsApi.getAll();
      set({ reports });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  },
  submitReport: async (data) => {
    try {
      const report = await reportsApi.create(data);
      set((state) => ({ reports: [...state.reports, report] }));
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  },

  // Tools
  tools: [],
  fetchTools: async () => {
    try {
      const tools = await toolsApi.getAll();
      set({ tools });
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  },

  // UI State
  showAgentModal: false,
  showTicketModal: false,
  editingAgent: null,
  editingTicket: null,
  setShowAgentModal: (show) => set({ showAgentModal: show }),
  setShowTicketModal: (show) => set({ showTicketModal: show }),
  setEditingAgent: (agent) => set({ editingAgent: agent }),
  setEditingTicket: (ticket) => set({ editingTicket: ticket }),
}));