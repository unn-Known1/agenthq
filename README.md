# AgentHQ

<!-- Badge Row -->
<div align="center">

![License](https://img.shields.io/github/license/unn-Known1/agenthq?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)
![Stars](https://img.shields.io/github/stars/unn-Known1/agenthq?style=flat-square)
![GitHub Issues](https://img.shields.io/github/issues/unn-Known1/agenthq?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-FFD43B?style=flat-square&logo=python&logoColor=3776AB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)

</div>

<!-- One-liner Description -->
**AgentHQ** is a command center for running entire businesses with AI agents. Transform chaotic multi-agent workflows into an elegant, controlled experience.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           AgentHQ Platform                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │  Dashboard  │    │   Tasks     │    │      Org Chart          │ │
│  │  Overview   │    │  Management │    │   Hierarchical View     │ │
│  └──────┬──────┘    └──────┬──────┘    └───────────┬─────────────┘ │
│         │                  │                        │                │
│  ┌──────┴──────────────────┴────────────────────────┴─────────────┐ │
│  │                    State Management (Zustand)                   │ │
│  └──────────────────────────────┬──────────────────────────────────┘ │
│                                 │                                    │
│  ┌──────────────────────────────┴──────────────────────────────────┐ │
│  │                      Agent Orchestration Layer                  │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ │ │
│  │  │   CEO   │──│   CTO   │──│Designer │  │    Custom Agents    │ │ │
│  │  │  Agent  │  │  Agent  │  │  Agent  │  │                     │ │ │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └─────────────────────┘ │ │
│  │       │            │            │                                  │ │
│  │  ┌────┴────────────┴────────────┴────┐                             │ │
│  │  │     Agent Communication Bus       │                             │ │
│  │  └───────────────────────────────────┘                             │ │
│  └──────────────────────────────┬──────────────────────────────────┘ │
│                                 │                                    │
│  ┌──────────────────────────────┴──────────────────────────────────┐ │
│  │                    Provider Integration                          │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐    │ │
│  │  │   Claude   │  │  OpenAI    │  │   Custom (OpenAI-compat)│    │ │
│  │  │ (Anthropic)│  │            │  │   (vLLM, Ollama, etc.) │    │ │
│  │  └────────────┘  └────────────┘  └────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| ![Dashboard](https://img.shields.io/badge/-Dashboard-6366F1) | Real-time overview of all AI agents with live activity indicators |
| ![Agents](https://img.shields.io/badge/-Agent%20Management-10B981) | Configure agents from Claude, OpenAI, or custom providers |
| ![Org](https://img.shields.io/badge/-Org%20Chart-3B82F6) | Visual hierarchy of your agent workforce with drag-to-reorganize |
| ![Tasks](https://img.shields.io/badge/-Ticketing-8B5CF6) | Task assignment and tracking with priority levels |
| ![Budget](https://img.shields.io/badge/-Budget-10B981) | Control spending per agent with real-time tracking |
| ![Messages](https://img.shields.io/badge/-Messaging-F59E0B) | Agent-to-agent messaging and collaboration logs |
| ![Logs](https://img.shields.io/badge/-Logging-64748B) | Comprehensive logging of all agent activities |
| ![Themes](https://img.shields.io/badge/-Themes-EC4899) | Dark and light mode with smooth transitions |

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Python 3.9+ (for backend examples)

### Installation

```bash
# Clone the repository
git clone https://github.com/unn-Known1/agenthq.git
cd agenthq

# Install frontend dependencies
pnpm install

# Start the development server
pnpm run dev
```

### Web UI

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Desktop App

```bash
cd electron
pnpm install
pnpm run build
```

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Agent Types](#agent-types)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Agent Types

AgentHQ supports multiple agent types for different business functions:

| Role | Description | Capabilities |
|------|-------------|--------------|
| **CEO** | Top-level decision maker | Create agents, assign tasks |
| **CTO** | Technical leadership | Create subordinate agents, tool usage |
| **Engineer** | Development tasks | File operations, API calls |
| **Designer** | Creative tasks | Content generation, brainstorming |
| **Marketing** | Growth and outreach | Research, content creation |
| **Support** | Customer service | Task execution, reporting |
| **Custom** | User-defined roles | Configurable capabilities |

## Configuration

### Claude (Anthropic)

Configure Claude agents by selecting your model:

```javascript
{
  provider: 'claude',
  model: 'claude-3-5-sonnet' // or 'claude-3-5-haiku'
}
```

### OpenAI

```javascript
{
  provider: 'openai',
  model: 'gpt-4o' // or 'gpt-4o-mini', 'gpt-4-turbo'
}
```

### Custom Provider (OpenAI-Compatible)

Connect to any OpenAI-compatible API:

```javascript
{
  provider: 'custom',
  baseUrl: 'https://api.vllm.example.com/v1',
  model: 'meta-llama/Llama-3-70b-instruct'
}
```

Supported backends: vLLM, Ollama, LM Studio, Azure OpenAI, and more.

## Comparison

| Feature | AgentHQ | LangChain Agents | AutoGPT |
|---------|---------|------------------|---------|
| Visual Dashboard | ✅ | ❌ | ❌ |
| Agent Hierarchy | ✅ | Partial | ❌ |
| Budget Control | ✅ | ❌ | Basic |
| Real-time Logs | ✅ | ❌ | ❌ |
| Multiple Providers | ✅ | ✅ | Limited |
| Desktop App | ✅ | ❌ | ❌ |
| Open Source | ✅ | ✅ | ✅ |

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Good First Issues

Looking for a way to contribute? Check out these beginner-friendly issues:

- [Add streaming response example](https://github.com/unn-Known1/agenthq/issues)
- [Improve error messages](https://github.com/unn-Known1/agenthq/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with React, Vite, Zustand, and Framer Motion
</p>
