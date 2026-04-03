# AgentHQ

![AgentHQ Logo](electron/build/icon.svg)

**AI Agent Orchestration Platform** - Your command center for running entire businesses with AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/agenthq/agenthq)](https://github.com/agenthq/agenthq/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/agenthq/agenthq)](https://github.com/agenthq/agenthq/issues)

## 🚀 Features

### Core Functionality
- **Central Dashboard** - Real-time overview of all AI agents and their activities
- **Agent Management** - Hire, configure, and manage AI agents from various providers
- **Org Chart** - Visual hierarchy of your agent workforce (CEO, CTO, Engineer, Designer, etc.)
- **Ticketing System** - Task assignment and tracking across agents
- **Budget Management** - Control spending per agent with monthly budgets
- **Conversations** - Agent-to-agent messaging and collaboration
- **Reporting System** - Agents report to senior agents, creating accountability chains
- **Tool System** - Agents can use tools for file operations and other tasks

### Agent Providers
- **Claude** (Anthropic) - Advanced reasoning and analysis
- **OpenAI** - GPT models for various tasks
- **Custom Provider** - Bring your own OpenAI-compatible API

### Agent Roles
| Role | Description | Can Create Agents |
|------|-------------|-------------------|
| CEO | Executive decision maker | Yes |
| CTO | Technical leadership | Yes |
| Engineer | Development tasks | No |
| Designer | Creative work | No |
| Marketing | Promotional activities | No |
| Support | Customer service | No |
| Custom | Flexible role | Configurable |

## 📦 Installation

### Desktop Application (Recommended)

Download the latest release for your platform:

| Platform | Format |
|----------|--------|
| Windows | NSIS Installer (.exe) |
| Windows (Portable) | Portable EXE |
| macOS | DMG Package |
| Linux | Debian Package (.deb) |
| Linux | Tarball (.tar.gz) |

### Web Version

Access the live demo: [https://cl328asu31k4.space.minimax.io](https://cl328asu31k4.space.minimax.io)

### Build from Source

```bash
# Clone the repository
git clone https://github.com/agenthq/agenthq.git
cd agenthq/frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Build desktop applications
pnpm run build:all
```

## 🖥️ Desktop App Development

### Prerequisites
- Node.js 18+
- pnpm 8+
- npm 9+ (for Electron)

### Development Commands

```bash
# Start frontend dev server
pnpm run dev

# Start Electron app with dev server
pnpm run electron:dev

# Build specific platform
pnpm run electron:build:win   # Windows
pnpm run electron:build:mac   # macOS
pnpm run electron:build:linux # Linux

# Build all platforms
pnpm run electron:build:all
```

### Building Desktop Apps Manually

```bash
cd electron

# Install Electron dependencies
npm install

# Build for current platform
npm run build

# Build for specific platforms
npx electron-builder --win
npx electron-builder --mac
npx electron-builder --linux
```

### Output Artifacts

After building, artifacts will be in `electron/release/`:

```
electron/release/
├── win-unpacked/           # Portable Windows app
├── AgentHQ-1.0.0-x64-setup.exe  # Windows installer
├── AgentHQ-1.0.0.dmg       # macOS installer
├── AgentHQ_1.0.0_amd64.deb # Debian package
├── AgentHQ-1.0.0-amd64.tar.gz  # Linux tarball
└── ...
```

## 🏗️ Architecture

```
agenthq/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand state management
│   │   ├── lib/            # API and utilities
│   │   └── styles/         # CSS and themes
│   ├── electron/           # Electron desktop app
│   │   ├── main.js         # Main process
│   │   ├── preload.js      # Preload scripts
│   │   ├── package.json    # Electron config
│   │   └── build/          # App icons and resources
│   └── .github/workflows/  # CI/CD pipelines
├── backend/                 # Node.js backend (optional)
│   └── server.js           # Express API server
└── SPEC.md                  # Project specification
```

## 🎨 UI/UX

### Themes
- **Dark Mode** - Default, optimized for extended use
- **Light Mode** - Easy on the eyes in bright environments
- **System** - Follows your OS preference

### Navigation Pages
- **Dashboard** - Overview and activity feed
- **Org Chart** - Visual hierarchy of agents
- **Tickets** - Task management
- **Budgets** - Financial overview
- **Conversations** - Agent messaging
- **Logs** - System logs
- **History** - Historical data
- **Settings** - Configuration

## 🔧 Configuration

### Agent Configuration

```typescript
interface Agent {
  name: string;              // Display name
  role: AgentRole;           // Role in organization
  provider: ProviderType;     // 'claude' | 'openai' | 'custom'
  model?: string;            // Model identifier
  apiKey?: string;           // API key for provider
  baseUrl?: string;          // Custom API endpoint
  monthlyBudget?: number;    // Budget limit
  parentId?: string;         // Supervisor agent ID
  status: AgentStatus;       // 'active' | 'paused' | 'terminated'
}
```

### Environment Variables

```env
# Backend (optional)
PORT=3001
NODE_ENV=production

# API Keys
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
```

## 📖 Documentation

### Quick Start Guide

1. **Launch AgentHQ**
2. **Configure your first agent** - Select provider and set credentials
3. **Define company mission** - Set your organization's goals
4. **Create agent hierarchy** - Assign supervisors and reports
5. **Start delegating tasks** - Create tickets and track progress

### Agent Setup Guide

1. Navigate to **Settings** → **Add Agent**
2. Choose a provider (Claude, OpenAI, or Custom)
3. Enter API credentials
4. Select agent role
5. Assign to supervisor (optional)
6. Set monthly budget (recommended)

## 🚢 Publishing Releases

### Automated Release Process

Releases are automated via GitHub Actions. To create a new release:

1. Update version in `package.json` and `electron/package.json`
2. Update `CHANGELOG.md`
3. Create and push a version tag:

```bash
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

GitHub Actions will automatically:
- Build all platforms (Windows, macOS, Linux)
- Create GitHub Release
- Upload all artifacts

### Manual Release

```bash
# Build all platforms
pnpm run build:all

# Create zip archives
cd electron/release
zip -r AgentHQ-v1.0.0-win.zip win-unpacked/
zip -r AgentHQ-v1.0.0-mac.zip mac/
tar -czf AgentHQ-v1.0.0-linux.tar.gz linux-unpacked/
```

## 🤝 Contributing

We welcome contributions! Please see our Contributing Guide.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/agenthq.git
cd agenthq/frontend

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
pnpm run dev

# Run linting
pnpm run lint

# Run type check
npx tsc --noEmit

# Commit and push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature

# Open Pull Request
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), and [Electron](https://www.electronjs.org/)
- State management by [Zustand](https://zustand-demo.pmnd.rs/)
- UI animations by [Framer Motion](https://www.framer.com/motion/)
- Icons by [Lucide](https://lucide.dev/)

## 📬 Contact

- **GitHub Issues** - For bug reports and feature requests
- **Discussions** - For questions and community support

## 🔗 Links

- [Live Demo](https://cl328asu31k4.space.minimax.io)
- [Releases](https://github.com/agenthq/agenthq/releases)
- [Milestones](https://github.com/agenthq/agenthq/milestones)

---

<p align="center">
  Made with ❤️ by the AgentHQ team
</p>
