# Contributing to AgentHQ

Thank you for your interest in contributing to AgentHQ! We welcome contributions from the community.

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## 📋 How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the [existing issues](https://github.com/agenthq/agenthq/issues) to avoid duplicates
2. Update to the latest version to see if the issue persists
3. Collect information about your environment (OS, Node version, etc.)

When creating a bug report, please include:
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

### Suggesting Features

We welcome feature suggestions! Please:
1. Check existing issues and pull requests
2. Describe the feature and its benefits
3. Consider implementation complexity
4. Think about backward compatibility

### Pull Requests

#### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/agenthq/agenthq.git
   cd agenthq/frontend
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Set up development environment**
   ```bash
   pnpm install
   ```

4. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic

5. **Test your changes**
   ```bash
   pnpm run dev
   # Test your changes in development mode
   ```

6. **Run linting and type checks**
   ```bash
   pnpm run lint
   npx tsc --noEmit
   ```

7. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   ```

   Follow conventional commits:
   - `Add:` New feature
   - `Fix:` Bug fix
   - `Update:` Update existing feature
   - `Refactor:` Code refactoring
   - `Docs:` Documentation changes
   - `Style:` Code style changes
   - `Test:` Adding/updating tests
   - `Chore:` Maintenance tasks

8. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Create a Pull Request**
   - Fill out the PR template
   - Reference any related issues
   - Wait for review

#### PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(dashboard): add real-time agent status updates
fix(tickets): resolve assignment issue
docs(readme): update installation instructions
```

#### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Keep functions small and focused

#### Testing Guidelines

- Test your changes manually
- Check edge cases
- Verify backward compatibility
- Test across different browsers (for web)

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── stores/        # Zustand state management
│   ├── lib/           # Utilities and API
│   └── styles/        # Global styles
├── electron/          # Desktop app
└── .github/workflows/ # CI/CD
```

## 🔍 Review Process

1. Automated checks must pass (lint, type check, tests)
2. At least one maintainer review required
3. Address review feedback
4. Squash and merge when approved

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

- Open an issue for bugs/feature requests
- Check existing discussions
- Contact maintainers for sensitive issues

## 🙏 Thank You!

Your contributions make AgentHQ better for everyone. Thank you for taking the time to contribute!
