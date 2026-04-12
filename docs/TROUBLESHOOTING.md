# Troubleshooting Guide

Common issues and solutions for AgentHQ.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Runtime Errors](#runtime-errors)
- [Agent Configuration](#agent-configuration)
- [Performance Problems](#performance-problems)
- [Data & Storage](#data--storage)
- [Getting Help](#getting-help)

## Installation Issues

### Node.js Version Error

**Problem:** `Error: Node.js version 16.x is not supported`

**Solution:** Upgrade to Node.js 18 or higher:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or using official installer
# Download from https://nodejs.org/
```

### pnpm Install Fails

**Problem:** `ERR_MODULE_NOT_FOUND` or dependency resolution errors

**Solution:** Clear cache and reinstall:

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Fresh install
pnpm install
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE :::5173`

**Solution:** Find and kill the process using the port, or use a different port:

```bash
# Find process using port 5173
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or start on different port
pnpm run dev -- --port 3000
```

### Git Clone Fails

**Problem:** `SSL certificate problem` or authentication errors

**Solution:** Try one of these approaches:

```bash
# Skip SSL verification (not recommended for production)
GIT_SSL_NO_VERIFY=true git clone https://github.com/unn-Known1/agenthq.git

# Or use SSH
git clone git@github.com:unn-Known1/agenthq.git
```

## Runtime Errors

### Dashboard Not Loading

**Problem:** White screen or blank dashboard

**Solution:** Check browser console for errors:

1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages

Common fixes:
- Clear browser cache (Ctrl+Shift+Delete)
- Disable browser extensions temporarily
- Try incognito/private mode

### API Requests Failing

**Problem:** `Network Error` or `Failed to fetch`

**Solution:** Verify backend is running:

```bash
# Start backend server
cd backend
node server.js

# Verify API is responding
curl http://localhost:3000/api/agents
```

### TypeScript Errors on Build

**Problem:** `Cannot find module` or type errors

**Solution:** Regenerate type definitions:

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache tsconfig.tsbuildinfo

# Reinstall and rebuild
pnpm install
pnpm run build
```

## Agent Configuration

### Agent Not Responding

**Problem:** Agent shows "active" but doesn't respond to tasks

**Solution:** Check these settings:

1. **API Key Configuration**
   - Verify API key is set correctly
   - Check key has sufficient credits/quota
   - Ensure key isn't expired

2. **Budget Limits**
   ```javascript
   // Check agent budget settings
   {
     monthlyBudget: 100,    // Ensure > 0
     currentSpend: 95,     // May be at limit
     status: 'paused'      // Should be 'active'
   }
   ```

3. **Provider Connectivity**
   ```bash
   # Test API connectivity
   curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.anthropic.com/v1/messages
   ```

### Wrong Model Responses

**Problem:** Agent using wrong AI model

**Solution:** Check agent configuration:

```javascript
// Correct configuration for Claude
{
  provider: 'claude',
  model: 'claude-3-5-sonnet'  // Must match available models
}

// Correct configuration for OpenAI
{
  provider: 'openai',
  model: 'gpt-4o'  // Must match available models
}
```

### Custom Provider Not Connecting

**Problem:** Custom OpenAI-compatible API not working

**Solution:** Verify custom provider settings:

```javascript
{
  provider: 'custom',
  baseUrl: 'https://api.vllm.example.com/v1',  // Must include /v1
  model: 'meta-llama/Llama-3-70b-instruct'     // Must exist on server
}
```

Test connectivity:
```bash
curl -X POST https://api.vllm.example.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{"model": "meta-llama/Llama-3-70b-instruct", "messages": [{"role": "user", "content": "test"}]}'
```

## Performance Problems

### Slow Page Load

**Problem:** Dashboard takes >5 seconds to load

**Solution:** 

1. **Check Network Tab**
   - Look for slow API requests
   - Check for large payloads

2. **Browser Performance**
   - Disable unused browser extensions
   - Clear browser cache
   - Ensure sufficient RAM available

3. **Application Logs**
   ```bash
   # Check backend logs for slow queries
   cd backend
   node server.js 2>&1 | grep -i slow
   ```

### Memory Leaks

**Problem:** Browser tab consuming excessive memory over time

**Solution:**

1. Refresh the page periodically during long sessions
2. Check for excessive log accumulation
3. Monitor DevTools Performance tab
4. Report issue with:
   - Browser version
   - OS
   - Number of agents
   - Session duration

### High CPU Usage

**Problem:** Computer fans spinning, high CPU in Task Manager

**Solution:**

1. Reduce number of active agents
2. Lower log verbosity
3. Disable real-time updates if not needed:
   ```javascript
   // In settings
   {
     realTimeLogs: false,  // Disable live log streaming
     refreshInterval: 30000  // Increase polling interval (ms)
   }
   ```

## Data & Storage

### Data Not Persisting

**Problem:** Changes lost after refresh

**Solution:** Data is stored in memory by default. For persistence:

1. **Check localStorage** (browser):
   ```javascript
   // In DevTools Console
   localStorage.getItem('agenthq_state')
   ```

2. **Backend Storage** (if using backend):
   ```bash
   # Check backend data directory
   ls -la backend/data/
   
   # Verify write permissions
   chmod 755 backend/data/
   ```

### Export/Import Issues

**Problem:** Can't export or import agent configurations

**Solution:**

1. **Export Format**: Always use JSON format
   ```bash
   # Valid export
   {"agents": [...], "tasks": [...], "settings": {...}}
   ```

2. **File Size Limits**: Large exports may fail
   - Split into smaller batches
   - Clear old logs before export

3. **Character Encoding**: Use UTF-8
   ```bash
   # Check file encoding
   file export.json
   ```

## Getting Help

If you're still experiencing issues:

1. **Search Existing Issues**
   - [GitHub Issues](https://github.com/unn-Known1/agenthq/issues)
   - [Discussions](https://github.com/unn-Known1/agenthq/discussions)

2. **Create a Bug Report**
   Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS information
   - Console logs

3. **Community Support**
   - Ask in GitHub Discussions
   - Include minimal reproducible example

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Set debug environment variable
export DEBUG=agenthq:*
export DEBUG_LEVEL=verbose

# Restart application
pnpm run dev
```

### Log Collection

When reporting issues, collect relevant logs:

```bash
# Browser console logs (copy from DevTools)
# Network request/response details
# Backend server logs
# Steps to reproduce
```
