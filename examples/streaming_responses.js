/**
 * AgentHQ Streaming Response Example
 *
 * This example demonstrates how to handle streaming responses from AI agents in AgentHQ.
 * Streaming is useful for real-time feedback, long-running tasks, and improving perceived performance.
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Example 1: Server-Sent Events (SSE) for Real-time Updates
 *
 * SSE is perfect for streaming updates to the frontend without WebSocket complexity.
 * Use this for real-time agent activity feeds, log streaming, and progress updates.
 */
app.get('/api/agents/:id/stream', (req, res) => {
  const { id } = req.params;

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial connection message
  res.write('event: connected\ndata: {"agentId": "' + id + '", "status": "connected"}\n\n');

  // Simulate agent activity stream
  const activities = [
    { type: 'thinking', message: 'Analyzing task requirements...' },
    { type: 'progress', message: 'Planning approach...', progress: 20 },
    { type: 'progress', message: 'Executing step 1...', progress: 40 },
    { type: 'progress', message: 'Executing step 2...', progress: 60 },
    { type: 'progress', message: 'Executing step 3...', progress: 80 },
    { type: 'complete', message: 'Task completed successfully', progress: 100 }
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index >= activities.length) {
      clearInterval(interval);
      res.write('event: done\ndata: {"message": "Stream complete"}\n\n');
      res.end();
      return;
    }

    const activity = activities[index];
    res.write(`event: ${activity.type}\ndata: ${JSON.stringify(activity)}\n\n`);
    index++;
  }, 1000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

/**
 * Example 2: Streaming Agent Response (Chunked Transfer)
 *
 * For AI agent responses that come in chunks, use chunked transfer encoding.
 * This is useful when the agent is generating text/token by token.
 */
app.post('/api/agents/:id/chat', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Message must be a non-empty string',
      hint: 'Provide a message in the request body: { "message": "Your question here" }'
    });
  }

  // Set up streaming response
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  // Simulate streaming AI response
  const responseChunks = [
    'I understand you want me to ',
    'analyze the codebase and ',
    'provide recommendations. ',
    'Let me start by examining ',
    'the project structure...\n\n',
    'Based on my analysis:\n',
    '• The codebase has good separation of concerns\n',
    '• API endpoints are well organized\n',
    '• Consider adding more error handling\n',
    '• Performance could be improved with caching\n',
    '\n\nWould you like me to elaborate on any of these points?'
  ];

  for (const chunk of responseChunks) {
    res.write(chunk);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  res.end();
});

/**
 * Example 3: Task Progress Streaming
 *
 * Stream real-time progress updates for long-running tasks.
 * Perfect for agent workflows that take time to complete.
 */
app.get('/api/tasks/:taskId/progress', (req, res) => {
  const { taskId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Simulate task progress
  const steps = [
    { step: 1, total: 5, name: 'Initializing', progress: 0 },
    { step: 1, total: 5, name: 'Initializing', progress: 25 },
    { step: 1, total: 5, name: 'Initializing', progress: 50 },
    { step: 1, total: 5, name: 'Initializing', progress: 75 },
    { step: 1, total: 5, name: 'Initializing', progress: 100 },
    { step: 2, total: 5, name: 'Processing', progress: 0 },
    { step: 2, total: 5, name: 'Processing', progress: 50 },
    { step: 2, total: 5, name: 'Processing', progress: 100 },
    { step: 3, total: 5, name: 'Validating', progress: 0 },
    { step: 3, total: 5, name: 'Validating', progress: 100 },
    { step: 4, total: 5, name: 'Finalizing', progress: 0 },
    { step: 4, total: 5, name: 'Finalizing', progress: 100 },
    { step: 5, total: 5, name: 'Complete', progress: 100 }
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index >= steps.length) {
      clearInterval(interval);
      res.write('event: complete\ndata: {"taskId":"' + taskId + '","status":"completed"}\n\n');
      res.end();
      return;
    }

    const step = steps[index];
    const overallProgress = Math.round((step.step / step.total) * 100);
    res.write(`event: progress\ndata: ${JSON.stringify({
      taskId,
      step: step.step,
      totalSteps: step.total,
      stepName: step.name,
      stepProgress: step.progress,
      overallProgress
    })}\n\n`);
    index++;
  }, 800);

  req.on('close', () => {
    clearInterval(interval);
  });
});

/**
 * Example 4: Frontend Integration Guide
 *
 * Here's how to consume these streams in a React/Vue/Svelte frontend:
 */

// React Example:
// ----------------------
// function useAgentStream(agentId) {
//   const [events, setEvents] = useState([]);
//
//   useEffect(() => {
//     const eventSource = new EventSource(`/api/agents/${agentId}/stream`);
//
//     eventSource.addEventListener('connected', (e) => {
//       console.log('Connected:', JSON.parse(e.data));
//     });
//
//     eventSource.addEventListener('progress', (e) => {
//       setEvents(prev => [...prev, JSON.parse(e.data)]);
//     });
//
//     eventSource.addEventListener('complete', (e) => {
//       console.log('Stream complete');
//       eventSource.close();
//     });
//
//     return () => eventSource.close();
//   }, [agentId]);
//
//   return events;
// }

/**
 * Example 5: Fetch with ReadableStream (for chunked responses)
 *
 * For AI chat responses that stream token by token:
 */
// async function streamChat(agentId, message) {
//   const response = await fetch(`/api/agents/${agentId}/chat`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ message })
//   });
//
//   const reader = response.body.getReader();
//   const decoder = new TextDecoder();
//   let responseText = '';
//
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     responseText += decoder.decode(value);
//     console.log('Received chunk:', decoder.decode(value));
//   }
//
//   return responseText;
// }

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Streaming example server running on http://localhost:${PORT}`);
  console.log('\nAvailable streaming endpoints:');
  console.log('  GET  /api/agents/:id/stream      - SSE for agent activity');
  console.log('  POST /api/agents/:id/chat         - Chunked AI response streaming');
  console.log('  GET  /api/tasks/:taskId/progress - SSE for task progress');
  console.log('\nTest with: curl -N http://localhost:' + PORT + '/api/agents/test/stream');
});