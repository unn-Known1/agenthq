import { create } from 'zustand';
import { agentsApi, ticketsApi, activitiesApi, statsApi, companyApi, Agent, Ticket, Activity, DashboardStats } from '../lib/api';

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

  // UI State
  showAgentModal: false,
  showTicketModal: false,
  setShowAgentModal: (show) => set({ showAgentModal: show }),
  setShowTicketModal: (show) => set({ showTicketModal: show }),
}));
