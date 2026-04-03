# AgentHQ - AI Agent Orchestration Platform

## 1. Concept & Vision

AgentHQ is a command center for running entire businesses with AI agents. It transforms the chaotic process of managing multiple AI workers into an elegant, controlled experience—think "Mission Control meets Notion." The platform feels like piloting a sophisticated operation: purposeful, powerful, yet approachable. Every interaction reinforces that you're in control of a capable, intelligent workforce that can collaborate, report, and execute tasks autonomously.

## 2. Design Language

### Aesthetic Direction
**"Tech Command Center"** — A blend of modern SaaS elegance with subtle sci-fi undertones. Dark mode primary with glowing accent elements that suggest active intelligence. Clean geometric shapes, subtle gradients, and micro-animations that make the interface feel alive without being distracting. Light mode available for bright environments.

### Color Palette (Dark Mode)
```
--bg-primary: #0C0F14          /* Deep space black */
--bg-secondary: #151921        /* Card backgrounds */
--bg-tertiary: #1C222D         /* Elevated surfaces */
--border-subtle: #2A3142       /* Subtle dividers */
--border-active: #3D4759       /* Active states */
--text-primary: #F4F5F7        /* Primary text */
--text-secondary: #9BA3B5      /* Secondary text */
--text-muted: #5C6578          /* Muted labels */
--accent-primary: #6366F1       /* Indigo - primary actions */
--accent-success: #10B981       /* Emerald - success, active */
--accent-warning: #F59E0B       /* Amber - warnings, budget alerts */
--accent-danger: #EF4444        /* Red - errors, critical */
--accent-info: #3B82F6          /* Blue - informational */
```

### Color Palette (Light Mode)
```
--bg-primary: #FFFFFF           /* Pure white */
--bg-secondary: #F8FAFC         /* Card backgrounds */
--bg-tertiary: #F1F5F9         /* Elevated surfaces */
--border-subtle: #E2E8F0        /* Subtle dividers */
--border-active: #CBD5E1        /* Active states */
--text-primary: #0F172A         /* Primary text */
--text-secondary: #64748B       /* Secondary text */
--text-muted: #94A3B8           /* Muted labels */
```

### Typography
- **Headings**: `"Outfit", system-ui, sans-serif` — Geometric, modern, authoritative
- **Body**: `"Inter", system-ui, sans-serif` — Highly legible for dashboard content
- **Monospace**: `"JetBrains Mono", monospace` — For code snippets, agent IDs, metrics

### Motion Philosophy
- **State changes**: 150ms ease-out (buttons, toggles)
- **Panel transitions**: 250ms cubic-bezier(0.4, 0, 0.2, 1)
- **Staggered reveals**: 50ms delay between items, 300ms duration
- **Agent activity pulses**: Subtle glow animations on active agents (2s infinite)
- **Drag operations**: Spring physics for natural feel

## 3. Navigation Structure

### Sidebar Navigation
- **Dashboard** - Overview with metrics, activity feed, and agent status
- **Tasks** - Full task list view with filters and sorting
- **Org Chart** - Hierarchical organization with drag-to-reorganize
- **Conversations** - Agent-to-agent messaging and collaboration logs
- **Logs** - System logs, agent activity logs, tool execution logs
- **History** - Historical records, completed tasks, audit trail
- **Budgets** - Budget management with per-agent spending
- **Settings** - System configuration, theme toggle, API keys

## 4. Core Features

### 4.1 Agent Management

#### Agent Types
- **CEO** - Top-level decision maker, can create other agents
- **CTO** - Technical leadership, reports to CEO
- **Engineer** - Development tasks, can use tool calls
- **Designer** - Creative tasks
- **Marketing** - Growth and outreach
- **Support** - Customer service
- **Custom** - User-defined roles

#### Agent Properties
```typescript
interface Agent {
  id: string;
  name: string;
  role: 'ceo' | 'cto' | 'engineer' | 'designer' | 'marketing' | 'support' | 'custom';
  provider: 'claude' | 'openai' | 'custom';

  // Provider Configuration
  baseUrl?: string;        // For custom providers
  model?: string;          // Model ID
  apiKey?: string;         // Encrypted API key

  systemPrompt: string;
  monthlyBudget: number;
  currentSpend: number;
  status: 'active' | 'paused' | 'terminated';
  parentId: string | null;  // Reporting hierarchy
  reportsTo?: string;       // Senior agent
  subordinates: string[];   // Agents reporting to this one

  // Capabilities
  canCreateAgents: boolean;
  canUseTools: boolean;
  toolPermissions: ToolPermission[];

  createdAt: Date;
  updatedAt: Date;
}
```

#### Agent Capabilities
- **Hire Agents**: Senior agents can create subordinate agents
- **Assign Tasks**: Senior agents assign work to subordinates
- **Review Reports**: Receive status reports from subordinates
- **Tool Usage**: Execute file operations, API calls, etc.

### 4.2 Provider Configuration

#### Claude (Anthropic)
- Model selection: claude-3-5-sonnet, claude-3-5-haiku
- Uses built-in API key

#### OpenAI
- Model selection: gpt-4o, gpt-4o-mini, gpt-4-turbo
- Uses built-in API key

#### Custom Provider (OpenAI Compatible)
- **Base URL**: Custom endpoint (e.g., `https://api.vllm.example.com/v1`)
- **Model ID**: OpenAI-compatible model name
- **API Key**: Custom authentication token
- Supports any OpenAI-compatible API (vLLM, Ollama, LM Studio, etc.)

### 4.3 Task Management

#### Task Properties
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_progress' | 'review' | 'done';

  assigneeId: string | null;
  createdBy: string;           // Agent who created it
  parentTaskId?: string;       // For sub-tasks

  budgetAllocated: number;
  budgetConsumed: number;

  // Reporting
  statusReport?: StatusReport[];

  // Tool executions
  toolExecutions: ToolExecution[];

  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}
```

#### Task Hierarchy
- Tasks can have parent tasks (sub-tasks)
- Senior agents can assign tasks to subordinates
- Tasks can be linked to create workflows

### 4.4 Reporting System

#### Status Reports
```typescript
interface StatusReport {
  id: string;
  agentId: string;
  taskId: string | null;
  content: string;
  progress: number;  // 0-100
  submittedTo: string;  // Senior agent ID
  createdAt: Date;
}
```

#### Reporting Flow
1. Subordinate agent submits report to senior
2. Senior agent reviews and can:
   - Approve current progress
   - Request modifications
   - Assign follow-up tasks
   - Escalate to higher authority

### 4.5 Tool Calls System

#### Available Tools
```typescript
interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'file' | 'api' | 'system' | 'communication';

  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];

  execute: (params: any) => Promise<ToolResult>;
}
```

#### File Operations
- **read_file**: Read file contents
- **write_file**: Create or overwrite file
- **edit_file**: Modify specific parts
- **delete_file**: Remove file
- **create_folder**: Create directory
- **delete_folder**: Remove directory
- **list_files**: List directory contents
- **search_files**: Search for files by pattern

#### Tool Execution Log
```typescript
interface ToolExecution {
  id: string;
  taskId: string;
  agentId: string;
  toolId: string;
  input: Record<string, any>;
  output: any;
  success: boolean;
  error?: string;
  duration: number;  // ms
  createdAt: Date;
}
```

### 4.6 Conversation & Messaging

#### Agent Conversations
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string | null;  // null = broadcast
  content: string;
  attachments: Attachment[];
  readBy: string[];
  createdAt: Date;
}

interface Conversation {
  id: string;
  participants: string[];
  type: 'direct' | 'group' | 'task' | 'system';
  taskId?: string;
  subject?: string;
  lastMessageAt: Date;
  createdAt: Date;
}
```

#### Message Types
- **Direct**: Agent to agent private message
- **Group**: Multi-agent discussion
- **Task**: Task-related conversation thread
- **System**: Automated system messages

### 4.7 Logging System

#### Log Categories
1. **Agent Activity Logs**: What each agent is doing
2. **Tool Execution Logs**: File operations, API calls
3. **Conversation Logs**: All inter-agent communications
4. **Task History**: Task creation, updates, completions
5. **System Logs**: App events, errors, warnings
6. **Budget Logs**: Spending transactions

#### Log Entry
```typescript
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  category: 'agent' | 'tool' | 'task' | 'conversation' | 'system' | 'budget';

  agentId?: string;
  taskId?: string;

  message: string;
  metadata: Record<string, any>;
}
```

### 4.8 History & Audit

#### Historical Records
- Task completion history with duration and cost
- Agent creation/deletion records
- Budget transactions over time
- System configuration changes
- Agent performance metrics

## 5. Design Improvements

### Theme System
- Dark mode (default) with light mode option
- System preference detection
- Smooth transition between themes
- Theme persisted to localStorage

### Dashboard Enhancements
- Real-time agent activity indicators
- Live log stream widget
- Quick action buttons
- Task completion trends
- Budget burn rate visualization

### Navigation Improvements
- Collapsible sidebar
- Breadcrumb navigation
- Quick switcher (Cmd+K)
- Notification badges

## 6. Data Model Summary

```
Company
├── Agents (hierarchical tree)
│   ├── Reports relationships
│   └── Tool permissions
├── Tasks (with hierarchy)
│   ├── Sub-tasks
│   ├── Status reports
│   └── Tool executions
├── Conversations
│   └── Messages
├── Logs
│   └── Categorized entries
├── History
│   └── Audit trail
└── Budgets
    └── Transactions
```

## 7. API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create agent (with hierarchy)
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Terminate agent
- `GET /api/agents/:id/subordinates` - List subordinates
- `GET /api/agents/:id/reports` - Get reports to agent

### Tasks
- `GET /api/tasks` - List tasks with filters
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/status` - Update status
- `POST /api/tasks/:id/subtasks` - Add subtask

### Conversations
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/conversations/:id/messages` - Send message

### Logs
- `GET /api/logs` - Get logs with filters
- `GET /api/logs/stream` - SSE stream for live logs

### Tools
- `GET /api/tools` - List available tools
- `POST /api/tools/execute` - Execute tool
- `GET /api/tools/executions` - Get execution history

### Reports
- `POST /api/reports` - Submit status report
- `GET /api/reports/:agentId` - Get reports for agent

## 8. Technical Implementation

### Frontend Stack
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS with CSS variables
- Zustand for state management
- React Router for navigation
- Framer Motion for animations
- @dnd-kit for drag-and-drop
- Light/dark theme via CSS custom properties

### Backend Stack
- Node.js + Express
- In-memory JSON store (demo)
- SSE for real-time updates
- RESTful API design

### Key Files Structure
```
/workspace
├── SPEC.md
├── backend/
│   ├── server.js           # Express API
│   └── data/store.json     # Demo data
└── agenthq-frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Page components
    │   │   ├── Dashboard.tsx
    │   │   ├── Tasks.tsx
    │   │   ├── OrgChart.tsx
    │   │   ├── Conversations.tsx
    │   │   ├── Logs.tsx
    │   │   ├── History.tsx
    │   │   └── Settings.tsx
    │   ├── stores/         # Zustand stores
    │   └── lib/api.ts      # API client
    └── dist/               # Built output
```
