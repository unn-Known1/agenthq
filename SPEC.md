# AgentHQ - AI Agent Orchestration Platform

## 1. Concept & Vision

AgentHQ is a command center for running entire businesses with AI agents. It transforms the chaotic process of managing multiple AI workers into an elegant, controlled experience—think "Mission Control meets Notion." The platform feels like piloting a sophisticated operation: purposeful, powerful, yet approachable. Every interaction reinforces that you're in control of a capable, intelligent workforce.

## 2. Design Language

### Aesthetic Direction
**"Tech Command Center"** — A blend of modern SaaS elegance with subtle sci-fi undertones. Dark mode primary with glowing accent elements that suggest active intelligence. Clean geometric shapes, subtle gradients, and micro-animations that make the interface feel alive without being distracting.

### Color Palette
```
--bg-primary: #0C0F14          /* Deep space black */
--bg-secondary: #151921        /* Card backgrounds */
--bg-tertiary: #1C222D         /* Elevated surfaces */
--border-subtle: #2A3142       /* Subtle dividers */
--border-active: #3D4759       /* Active states */

--text-primary: #F4F5F7        /* Primary text */
--text-secondary: #9BA3B5      /* Secondary text */
--text-muted: #5C6578          /* Muted labels */

--accent-primary: #6366F1      /* Indigo - primary actions */
--accent-primary-glow: #6366F1/20
--accent-success: #10B981      /* Emerald - success, active */
--accent-warning: #F59E0B      /* Amber - warnings, budget alerts */
--accent-danger: #EF4444        /* Red - errors, critical */
--accent-info: #3B82F6         /* Blue - informational */

--agent-ceo: #A855F7           /* Purple for executive agents */
--agent-engineer: #06B6D4       /* Cyan for technical agents */
--agent-designer: #EC4899      /* Pink for creative agents */
--agent-marketing: #F97316     /* Orange for growth agents */
```

### Typography
- **Headings**: `"Outfit", system-ui, sans-serif` — Geometric, modern, authoritative
- **Body**: `"Inter", system-ui, sans-serif` — Highly legible for dashboard content
- **Monospace**: `"JetBrains Mono", monospace` — For code snippets, agent IDs, metrics

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Border radius: 6px (small), 12px (medium), 16px (large), 24px (cards)
- Max content width: 1400px

### Motion Philosophy
- **State changes**: 150ms ease-out (buttons, toggles)
- **Panel transitions**: 250ms cubic-bezier(0.4, 0, 0.2, 1)
- **Staggered reveals**: 50ms delay between items, 300ms duration
- **Agent activity pulses**: Subtle glow animations on active agents (2s infinite)
- **Drag operations**: Spring physics for natural feel

### Visual Assets
- **Icons**: Lucide React (consistent 1.5px stroke weight)
- **Agent avatars**: Gradient-based generated avatars with role-specific colors
- **Charts**: Recharts with custom theming
- **Decorative**: Subtle grid patterns, glowing orbs for active states

## 3. Layout & Structure

### Overall Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│  TopBar: Logo | Mission Statement | Budget Summary | User      │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│   Sidebar    │              Main Content Area                   │
│              │                                                  │
│  - Dashboard │   (Changes based on selected view)              │
│  - Org Chart │                                                  │
│  - Tickets   │                                                  │
│  - Budgets   │                                                  │
│  - Settings   │                                                  │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Page Structure

**Dashboard (Home)**
- Hero: Mission statement card with quick stats
- Grid: 2x2 metrics cards (Active Agents, Open Tickets, Monthly Spend, Completion Rate)
- Main: Activity feed + Agent status grid
- Sidebar: Quick actions, recent tickets

**Organization Chart**
- Visual org tree with drag-to-reorganize
- Agent cards with role, status, current task
- Add/remove agents with modal workflow
- Department groupings with collapsible sections

**Ticket System**
- Kanban board: Backlog → In Progress → Review → Done
- Ticket cards: Title, assignee, priority, budget consumed
- Filters: By agent, priority, date, status
- Create ticket modal with agent assignment

**Budget Management**
- Per-agent budget cards with progress bars
- Spend history charts
- Alerts configuration
- Monthly rollover settings

### Responsive Strategy
- Desktop (>1024px): Full sidebar + content
- Tablet (768-1024px): Collapsible sidebar
- Mobile (<768px): Bottom navigation, stacked layouts

## 4. Features & Interactions

### Company Mission
- Editable mission statement at top of dashboard
- Character limit: 500
- Auto-save with debounce (1s)
- Version history (last 5 edits)

### Agent Management
**Hiring Agents**
- "Hire Agent" button opens modal
- Provider selection: Claude (Anthropic), OpenAI, Custom
- Role assignment: CEO, CTO, Engineer, Designer, Marketing, etc.
- Name customization
- Initial budget allocation
- System prompt/instructions

**Agent Properties**
- Unique ID (auto-generated)
- Name (editable)
- Role (from predefined list)
- Provider (Claude/OpenAI/Custom)
- Model selection (Claude 3.5, GPT-4, etc.)
- Monthly budget ($ limit)
- System prompt
- Status: Active, Paused, Terminated

**Agent Card Interactions**
- Click: Open agent detail panel
- Drag: Reorganize in org chart
- Status toggle: Active ↔ Paused
- Quick actions: Assign ticket, View activity, Edit

### Organization Chart
- Hierarchical tree visualization
- Root node: Company (with mission)
- Child nodes: Agents organized by role
- Drag agents to change reporting structure
- Expand/collapse departments
- Zoom controls for large orgs

### Ticketing System
**Ticket Properties**
- ID (auto-generated: TKT-001)
- Title (required, 200 char max)
- Description (markdown supported)
- Priority: Low, Medium, High, Critical
- Status: Backlog, In Progress, Review, Done
- Assignee (single agent)
- Budget allocated
- Budget consumed
- Created date
- Updated date

**Ticket Interactions**
- Create: Floating action button → Modal
- Edit: Click ticket → Side panel
- Move: Drag between columns (Kanban)
- Delete: Context menu → Confirm dialog
- Assign: Click assignee field → Agent selector

**Kanban Board**
- Columns: Backlog | In Progress | Review | Done
- Drag-and-drop between columns
- Column counts in headers
- Quick filters per column
- Bulk actions: Archive, reassign

### Budget Management
**Per-Agent Budgets**
- Monthly limit (editable)
- Current spend (auto-calculated)
- Progress bar visualization
- Alert threshold (default 80%)
- Spending history chart

**Budget Alerts**
- Visual warning at 80% threshold (amber)
- Critical alert at 100% (red)
- Toast notifications
- Optional email alerts (settings)

**Spending Analytics**
- Monthly spend chart
- Spend by agent breakdown
- Spend by category (if categorized)
- Cost per ticket
- ROI metrics (if tickets linked to outcomes)

### Dashboard Widgets
**Metrics Cards**
- Active Agents count
- Open Tickets count
- Monthly Spend (with budget comparison)
- Completion Rate (tickets closed / total)

**Activity Feed**
- Real-time agent activity
- Ticket status changes
- Budget alerts
- Agent joins/leaves
- Scrolling list, newest first
- Click to navigate to source

**Agent Status Grid**
- Grid of agent avatars with status dots
- Hover: Quick info tooltip
- Click: Open agent detail
- Activity indicator for busy agents

## 5. Component Inventory

### Navigation Components

**Sidebar**
- States: Expanded, Collapsed, Mobile hidden
- Active item: Accent background, icon highlight
- Hover: Subtle background shift
- Collapse animation: Width transition 250ms

**TopBar**
- Fixed position
- Contains: Logo, Mission preview (truncated), Budget indicator, User menu
- Budget shows: "$X / $Y" with mini progress bar

### Agent Components

**AgentCard**
- Default: Avatar, name, role badge, status dot
- Hover: Elevated shadow, quick action buttons appear
- Active: Pulsing border glow
- Paused: Muted colors, pause icon overlay
- Selected: Accent border

**AgentDetailPanel**
- Slides in from right (300px width)
- Sections: Profile, Current Task, Budget, Activity
- Close button (X) + click outside to close

**OrgChartNode**
- Compact card with avatar, name, role
- Connection lines to children
- Drag handle for reordering
- Expand/collapse toggle for managers

### Ticket Components

**TicketCard**
- Default: Title, priority dot, assignee avatar, budget badge
- Hover: Lift effect, shadow increase
- Dragging: Reduced opacity, rotation
- Selected: Accent border

**KanbanColumn**
- Header: Title, count badge, add button
- Drop zone highlight when dragging over
- Empty state: Dashed border, "No tickets" message

**TicketModal**
- Form fields: Title, Description, Priority, Assignee, Budget
- Validation: Required fields highlighted
- Submit: Loading state, success close

### Budget Components

**BudgetCard**
- Agent avatar + name header
- Progress bar (color changes: green → amber → red)
- Spend fraction: "$120 / $500"
- Alert icon at thresholds

**BudgetChart**
- Line chart with area fill
- Hover: Tooltip with date + amount
- Legend: Budget limit line

### Feedback Components

**Toast Notifications**
- Types: Success, Warning, Error, Info
- Position: Bottom-right
- Auto-dismiss: 5 seconds
- Action button optional

**ConfirmDialog**
- Modal with icon, title, message
- Cancel + Confirm buttons
- Danger variant for destructive actions

**EmptyStates**
- Illustrated (simple SVG)
- Headline + description
- Action button when applicable

## 6. Technical Approach

### Frontend Architecture
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + CSS custom properties
- **State Management**: Zustand for global state
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Drag & Drop**: @dnd-kit/core
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend Architecture
- **Runtime**: Node.js + Express
- **Database**: In-memory store (JSON) for demo
- **API Style**: RESTful JSON
- **Real-time**: Server-Sent Events for activity feed

### Data Model

**Company**
```typescript
{
  id: string;
  name: string;
  mission: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Agent**
```typescript
{
  id: string;
  name: string;
  role: 'ceo' | 'cto' | 'engineer' | 'designer' | 'marketing' | 'support' | 'custom';
  provider: 'claude' | 'openai' | 'custom';
  model: string;
  systemPrompt: string;
  monthlyBudget: number;
  currentSpend: number;
  status: 'active' | 'paused' | 'terminated';
  parentId: string | null; // For org chart hierarchy
  createdAt: Date;
  updatedAt: Date;
}
```

**Ticket**
```typescript
{
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  assigneeId: string | null;
  budgetAllocated: number;
  budgetConsumed: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}
```

**Activity**
```typescript
{
  id: string;
  type: 'agent_joined' | 'agent_paused' | 'ticket_created' | 'ticket_updated' | 'budget_alert' | 'budget_exceeded';
  agentId: string | null;
  ticketId: string | null;
  message: string;
  metadata: Record<string, any>;
  createdAt: Date;
}
```

### API Endpoints

**Company**
- `GET /api/company` - Get company details
- `PUT /api/company` - Update company (mission)

**Agents**
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Terminate agent
- `PUT /api/agents/:id/budget` - Update budget

**Tickets**
- `GET /api/tickets` - List tickets (with filters)
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `PUT /api/tickets/:id/status` - Update status

**Activity**
- `GET /api/activities` - List activities
- `GET /api/activities/stream` - SSE stream for real-time

**Stats**
- `GET /api/stats` - Dashboard statistics
- `GET /api/stats/budget` - Budget analytics

### Project Structure
```
/workspace
├── SPEC.md
├── backend/
│   ├── package.json
│   ├── server.js
│   └── data/
│       └── store.json
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        ├── pages/
        ├── stores/
        └── api/
```
