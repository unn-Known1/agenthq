# Architecture Overview

This document provides a technical overview of AgentHQ's architecture and design decisions.

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                           Client Layer                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  React SPA (Vite)                                               │  │
│  │  ├── Components (UI)                                             │  │
│  │  ├── Pages (Routes)                                              │  │
│  │  ├── Stores (Zustand)                                            │  │
│  │  └── Services (API Client)                                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTP/WebSocket
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           Server Layer                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Express.js API                                                  │  │
│  │  ├── REST Endpoints                                              │  │
│  │  ├── WebSocket (SSE)                                             │  │
│  │  └── Agent Orchestration Engine                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Data Layer                                                       │  │
│  │  ├── In-Memory Store (Demo)                                      │  │
│  │  └── File System (Persistence)                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ External APIs
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           Provider Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────────────┐   │
│  │   Claude    │  │   OpenAI    │  │   Custom (OpenAI-compatible)  │   │
│  │  (Anthropic)│  │             │  │   vLLM, Ollama, LM Studio   │   │
│  └─────────────┘  └─────────────┘  └───────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| TypeScript | Type Safety | 5.x |
| Vite | Build Tool | 5.x |
| Zustand | State Management | 4.x |
| React Router | Navigation | 6.x |
| Tailwind CSS | Styling | 3.x |
| Framer Motion | Animations | 11.x |
| @dnd-kit | Drag & Drop | 6.x |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18.x |
| Express | HTTP Server | 4.x |
| Server-Sent Events | Real-time Updates | - |

## Directory Structure

```
agenthq/
├── agenthq-frontend/           # Main React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Base UI components (Button, Input, etc.)
│   │   │   ├── agents/        # Agent-related components
│   │   │   ├── tasks/         # Task-related components
│   │   │   └── layout/        # Layout components (Sidebar, Header)
│   │   ├── pages/             # Route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── OrgChart.tsx
│   │   │   ├── Conversations.tsx
│   │   │   ├── Logs.tsx
│   │   │   ├── History.tsx
│   │   │   └── Settings.tsx
│   │   ├── stores/            # Zustand state stores
│   │   │   ├── agentStore.ts
│   │   │   ├── taskStore.ts
│   │   │   └── settingsStore.ts
│   │   ├── lib/               # Utilities
│   │   │   ├── api.ts         # API client
│   │   │   └── utils.ts       # Helper functions
│   │   ├── hooks/             # Custom React hooks
│   │   └── types/             # TypeScript type definitions
│   └── public/                # Static assets
│
├── backend/                    # Express.js API server
│   ├── server.js              # Main server entry
│   ├── routes/                # API route handlers
│   │   ├── agents.js
│   │   ├── tasks.js
│   │   ├── conversations.js
│   │   └── logs.js
│   ├── services/               # Business logic
│   │   ├── agentService.js
│   │   └── taskService.js
│   ├── middleware/             # Express middleware
│   └── data/                  # Data storage
│
├── browser/                   # Browser extension
├── electron/                  # Desktop app (Electron)
├── src/                       # Shared source code
├── docs/                      # Documentation
└── examples/                  # Example scripts
```

## Data Models

### Agent

```typescript
interface Agent {
  id: string;
  name: string;
  role: 'ceo' | 'cto' | 'engineer' | 'designer' | 'marketing' | 'support' | 'custom';
  provider: 'claude' | 'openai' | 'custom';
  baseUrl?: string;        // For custom providers
  model?: string;
  apiKey?: string;
  systemPrompt: string;
  monthlyBudget: number;
  currentSpend: number;
  status: 'active' | 'paused' | 'terminated';
  parentId: string | null;
  reportsTo?: string;
  subordinates: string[];
  canCreateAgents: boolean;
  canUseTools: boolean;
  toolPermissions: ToolPermission[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Task

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  assigneeId: string | null;
  createdBy: string;
  parentTaskId?: string;
  budgetAllocated: number;
  budgetConsumed: number;
  statusReports: StatusReport[];
  toolExecutions: ToolExecution[];
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}
```

## State Management

AgentHQ uses Zustand for global state management with the following stores:

### AgentStore

```typescript
// Manages agent state and operations
interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  
  // Actions
  fetchAgents: () => Promise<void>;
  createAgent: (agent: Partial<Agent>) => Promise<Agent>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  selectAgent: (id: string) => void;
}
```

### TaskStore

```typescript
// Manages task state and operations
interface TaskStore {
  tasks: Task[];
  filters: TaskFilters;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: TaskFilters) => void;
}
```

### SettingsStore

```typescript
// Manages user preferences
interface SettingsStore {
  theme: 'dark' | 'light' | 'system';
  sidebarCollapsed: boolean;
  notifications: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
}
```

## API Design

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/agents | List all agents |
| POST | /api/agents | Create agent |
| GET | /api/agents/:id | Get agent details |
| PUT | /api/agents/:id | Update agent |
| DELETE | /api/agents/:id | Delete agent |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| GET | /api/logs | Get logs |
| GET | /api/logs/stream | SSE stream |

### Request/Response Format

```typescript
// Request
interface ApiRequest<T> {
  body?: T;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

// Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

## Provider Integration

### Claude (Anthropic)

```typescript
const claudeConfig = {
  provider: 'claude',
  model: 'claude-3-5-sonnet',
  apiEndpoint: 'https://api.anthropic.com/v1/messages',
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  }
};
```

### OpenAI

```typescript
const openaiConfig = {
  provider: 'openai',
  model: 'gpt-4o',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};
```

### Custom (OpenAI-Compatible)

```typescript
const customConfig = {
  provider: 'custom',
  baseUrl: 'https://api.vllm.example.com/v1',
  model: 'meta-llama/Llama-3-70b-instruct',
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
};
```

## Security Considerations

1. **API Key Storage**: Keys are stored client-side in localStorage; consider using secure storage in production
2. **Encryption**: API keys should be encrypted at rest
3. **Input Validation**: All inputs are validated on the frontend and backend
4. **Rate Limiting**: Consider implementing rate limiting for production deployments

## Performance Optimizations

1. **Code Splitting**: Routes are lazy-loaded
2. **Memoization**: Expensive computations use `useMemo` and `useCallback`
3. **Virtualization**: Long lists use windowing for performance
4. **Caching**: API responses are cached in Zustand stores

## Future Considerations

- Database integration (PostgreSQL/MongoDB)
- Authentication and multi-user support
- Plugin system for custom tools
- WebAssembly-based agent execution
- Distributed agent orchestration
