# Contributing to AgentHQ

Thank you for your interest in contributing to AgentHQ! This guide will help you get started with development.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- Python 3.9+ (for backend examples)
- Git

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/agenthq.git
cd agenthq
```

### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Install frontend-specific dependencies
cd agenthq-frontend && pnpm install
cd ../electron && pnpm install
```

### 3. Run Development Server

```bash
# Start the Vite dev server with hot reload
pnpm run dev

# Run the backend server (in another terminal)
cd backend && node server.js
```

### 4. Verify Installation

Open [http://localhost:5173](http://localhost:5173) and verify:
- The dashboard loads without errors
- You can see the navigation sidebar
- Theme toggle works

## Project Structure

```
agenthq/
├── agenthq-frontend/     # React frontend application
├── backend/              # Express.js backend API
├── browser/              # Browser extension code
├── electron/             # Electron desktop app
├── src/                  # Shared source code
├── docs/                 # Documentation
├── examples/             # Example scripts
└── user_input_files/     # User data directory
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test -- src/components/Dashboard.test.tsx
```

### Writing Tests

- Place test files alongside source files with `.test.tsx` or `.test.ts` extension
- Use descriptive test names: `describe('AgentList'), it('should filter agents by role')`
- Aim for >80% coverage on new code

```typescript
// Example test structure
describe('AgentCard', () => {
  it('should display agent name and status', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toHaveAttribute('data-status', 'active');
  });
});
```

## Code Style

### TypeScript

- Use strict TypeScript with no `any` types
- Prefer interfaces over type aliases for object shapes
- Use functional components with hooks
- Export components and functions at the top level

```typescript
// Good
export interface AgentProps {
  agent: Agent;
  onSelect: (id: string) => void;
}

export function AgentCard({ agent, onSelect }: AgentProps) {
  // ...
}

// Avoid
const AgentCard = (props: any) => {
  // ...
};
```

### React Patterns

- Use Zustand for global state management
- Use React Query for server state
- Prefer composition over prop drilling
- Use `useMemo` and `useCallback` for expensive operations

### CSS/Tailwind

- Use Tailwind utility classes for styling
- Use CSS custom properties for theme values
- Follow mobile-first responsive design

```tsx
// Good
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">

// Avoid inline styles
<button style={{ padding: '16px', backgroundColor: '#6366F1' }}>
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `AgentDashboard.tsx` |
| Hooks | camelCase with `use` prefix | `useAgentStore.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Constants | SCREAMING_SNAKE | `MAX_BUDGET_LIMIT` |
| CSS classes | kebab-case | `agent-card-container` |

## Ways to Contribute

### Bug Reports

- Search existing issues first
- Include browser/OS version
- Provide reproduction steps
- Add labels: `bug`

### Feature Requests

- Describe the use case clearly
- Explain why it would benefit users
- Include mockups if applicable
- Add labels: `enhancement`

### Documentation

- Fix typos and grammar
- Add examples to existing docs
- Create tutorials for common tasks
- Add labels: `documentation`

### UI/UX

- Report accessibility issues
- Suggest design improvements
- Share user research insights
- Add labels: `ui/ux`

### Code

- Pick up issues labeled `good first issue`
- Write tests for new features
- Refactor existing code
- Add labels: `enhancement`, `refactor`

## Good First Issues

Looking for a place to start? These issues are designed for new contributors:

1. **[Add streaming response example](https://github.com/unn-Known1/agenthq/issues)** - Create an example showing how to handle streaming responses
2. **[Improve error messages](https://github.com/unn-Known1/agenthq/issues)** - Make error messages more descriptive
3. **[Add keyboard shortcuts](https://github.com/unn-Known1/agenthq/issues)** - Implement common keyboard navigation
4. **[Improve mobile responsiveness](https://github.com/unn-Known1/agenthq/issues)** - Enhance mobile experience

## Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/add-agent-filters
```

### 2. Make Your Changes

- Write code following our style guidelines
- Add/update tests
- Update documentation if needed

### 3. Commit Your Changes

We use conventional commits:

```bash
git commit -m "feat(agents): add filtering by agent role"
git commit -m "fix(tasks): resolve status update race condition"
git commit -m "docs: update installation instructions"
```

### 4. Push and Create PR

```bash
git push origin feature/add-agent-filters
```

Then create a Pull Request on GitHub with:
- Clear title describing the change
- Reference any related issues
- Screenshots for UI changes

### 5. Review Process

- Maintainers will review your PR
- Address any feedback
- Once approved, your PR will be merged

## Code of Conduct

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

## Questions?

- Open an issue for bugs or feature requests
- Join the discussion on GitHub Discussions
- Check existing documentation in the `docs/` directory

## Recognition

Contributors will be recognized in our README and release notes. Thank you for making AgentHQ better!
