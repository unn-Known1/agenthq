import { create } from 'zustand';
import {
  agentsApi,
  ticketsApi,
  activitiesApi,
  statsApi,
  companyApi,
  conversationsApi,
  messagesApi,
  logsApi,
  historyApi,
  reportsApi,
  toolsApi,
  Agent,
  Ticket,
  Activity,
  DashboardStats,
  Conversation,
  Message,
  LogEntry,
  HistoryEntry,
  StatusReport,
  ToolDefinition,
  ToolExecution,
} from '../lib/api';

interface AppState {
  // Company
  company: { id: string; name: string; mission: string } | null;
  setCompany: (company: { id: string; name: string; mission: string }) => void;
  updateMission: (mission: string) => Promise<void>;

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
  updateTicketStatus: (id: string, status: string) => Promise<void>;
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
  createConversation: (data: Partial<Conversation>) => Promise<Conversation>;
  setSelectedConversation: (conversation: Conversation | null) => void;

  // Logs
  logs: LogEntry[];
  fetchLogs: (filters?: { category?: string; agentId?: string; level?: string }) => Promise<void>;

  // History
  taskHistory: HistoryEntry[];
  agentHistory: HistoryEntry[];
  budgetHistory: HistoryEntry[];
  fetchHistory: () => Promise<void>;

  // Reports
  reports: StatusReport[];
  fetchReports: (agentId: string) => Promise<void>;
  submitReport: (data: { agentId: string; taskId?: string; content: string; progress: number; submittedTo: string }) => Promise<void>;

  // Tools
  tools: ToolDefinition[];
  toolExecutions: ToolExecution[];
  fetchTools: () => Promise<void>;
  fetchToolExecutions: (filters?: { agentId?: string; toolId?: string }) => Promise<void>;
  executeTool: (toolId: string, agentId: string, parameters: Record<string, unknown>) => Promise<ToolExecution>;

  // UI State
  showAgentModal: boolean;
  showTicketModal: boolean;
  setShowAgentModal: (show: boolean) => void;
  setShowTicketModal: (show: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Company
  company: null,
  setCompany: (company) => set({ company }),
  updateMission: async (mission) => {
    await companyApi.update({ mission });
    const { company } = get();
    if (company) {
      set({ company: { ...company, mission } });
    }
  },

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
    const agent = await agentsApi.create(data);
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
      agents: state.agents.map((a) => (a.id === id ? { ...a, status: 'terminated' } : a)),
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
    const ticket = await ticketsApi.create(data);
    set((state) => ({ tickets: [ticket, ...state.tickets] }));
    return ticket;
  },
  updateTicket: async (id, data) => {
    const ticket = await ticketsApi.update(id, data);
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? ticket : t)),
    }));
  },
  updateTicketStatus: async (id, status) => {
    const ticket = await ticketsApi.updateStatus(id, status);
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
      const activities = await activitiesApi.getAll(50);
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
      await messagesApi.send(conversationId, { content });
      get().fetchMessages(conversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },
  createConversation: async (data) => {
    const conversation = await conversationsApi.create(data);
    set((state) => ({ conversations: [conversation, ...state.conversations] }));
    return conversation;
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
    try {
      const [tasks, agents, budget] = await Promise.all([
        historyApi.getTasks(),
        historyApi.getAgents(),
        historyApi.getBudget(),
      ]);
      set({ taskHistory: tasks, agentHistory: agents, budgetHistory: budget });
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  },

  // Reports
  reports: [],
  fetchReports: async (agentId) => {
    try {
      const reports = await reportsApi.getByAgent(agentId);
      set({ reports });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  },
  submitReport: async (data) => {
    try {
      await reportsApi.submit(data);
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  },

  // Tools
  tools: [],
  toolExecutions: [],
  fetchTools: async () => {
    try {
      const tools = await toolsApi.getAll();
      set({ tools });
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  },
  fetchToolExecutions: async (filters) => {
    try {
      const toolExecutions = await toolsApi.getExecutions(filters);
      set({ toolExecutions });
    } catch (error) {
      console.error('Failed to fetch tool executions:', error);
    }
  },
  executeTool: async (toolId, agentId, parameters) => {
    try {
      const execution = await toolsApi.execute({ toolId, agentId, parameters });
      set((state) => ({ toolExecutions: [execution, ...state.toolExecutions] }));
      return execution;
    } catch (error) {
      console.error('Failed to execute tool:', error);
      throw error;
    }
  },

  // UI State
  showAgentModal: false,
  showTicketModal: false,
  setShowAgentModal: (show) => set({ showAgentModal: show }),
  setShowTicketModal: (show) => set({ showTicketModal: show }),
}));
