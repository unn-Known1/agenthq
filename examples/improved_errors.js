/**
 * AgentHQ Error Messages Improvement Guide
 *
 * This file provides examples of improved, descriptive error messages
 * that enhance the developer experience when things go wrong.
 */

// ============================================
// ERROR MESSAGE TEMPLATES
// ============================================

// Instead of generic errors, provide actionable messages with context

/**
 * Before (Poor Error Message):
 * {
 *   "error": "Invalid input"
 * }
 *
 * After (Improved Error Message):
 * {
 *   "error": "Invalid Agent Configuration",
 *   "message": "The agent configuration contains validation errors that must be fixed before proceeding.",
 *   "details": {
 *     "field": "monthlyBudget",
 *     "reason": "Value must be a positive number",
 *     "received": "-50",
 *     "hint": "Monthly budget should be greater than 0. Example: 500"
 *   },
 *   "documentation": "https://docs.agenthq.io/errors/INVALID_AGENT_CONFIG"
 * }
 */

/**
 * Example Error Classes for AgentHQ
 */

// Error types with consistent structure
const ErrorTypes = {
  // Authentication & Authorization
  AUTH_REQUIRED: {
    error: 'Authentication Required',
    message: 'This action requires you to be authenticated.',
    hint: 'Please log in or provide a valid API key in the X-API-Key header.',
    statusCode: 401
  },
  AUTH_INVALID: {
    error: 'Invalid Credentials',
    message: 'The provided authentication credentials are invalid or expired.',
    hint: 'Please check your API key or re-authenticate.',
    statusCode: 401
  },
  PERMISSION_DENIED: {
    error: 'Permission Denied',
    message: 'You do not have permission to perform this action.',
    hint: 'Contact your administrator to request access or check the agent permissions.',
    statusCode: 403
  },

  // Resource Errors
  RESOURCE_NOT_FOUND: {
    error: 'Resource Not Found',
    message: 'The requested resource does not exist.',
    hint: 'Verify the ID and try again, or check the resource list.',
    statusCode: 404
  },
  RESOURCE_CONFLICT: {
    error: 'Resource Conflict',
    message: 'A resource with this identifier already exists.',
    hint: 'Use a different identifier or update the existing resource.',
    statusCode: 409
  },

  // Validation Errors
  VALIDATION_FAILED: {
    error: 'Validation Failed',
    message: 'The provided data does not meet the required format.',
    hint: 'Review the field requirements and try again.',
    statusCode: 400
  },
  INVALID_FIELD: (field, reason, hint) => ({
    error: 'Invalid Field Value',
    message: `The value for "${field}" is invalid.`,
    details: { field, reason, received: hint },
    hint: `Please provide a valid value for ${field}.`,
    statusCode: 400
  }),

  // Operation Errors
  OPERATION_FAILED: {
    error: 'Operation Failed',
    message: 'The requested operation could not be completed.',
    hint: 'Please try again or contact support if the issue persists.',
    statusCode: 500
  },
  OPERATION_TIMEOUT: {
    error: 'Operation Timeout',
    message: 'The operation took too long to complete.',
    hint: 'Try a smaller operation or increase the timeout setting.',
    statusCode: 408
  },

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: {
    error: 'Rate Limit Exceeded',
    message: 'Too many requests have been made. Please slow down.',
    hint: 'Wait a moment before making more requests, or contact us to increase your limits.',
    statusCode: 429
  },

  // Budget Errors
  BUDGET_EXCEEDED: {
    error: 'Budget Exceeded',
    message: 'The monthly budget for this agent has been exceeded.',
    hint: 'Upgrade the budget, wait for the next billing cycle, or reduce usage.',
    statusCode: 402
  }
};

// ============================================
// ERROR RESPONSE BUILDER
// ============================================

/**
 * Creates a structured error response with all relevant context
 * @param {string} type - Error type from ErrorTypes
 * @param {object} context - Additional context for the error
 * @returns {object} Structured error response
 */
function createErrorResponse(type, context = {}) {
  const baseError = typeof type === 'string' ? ErrorTypes[type] : type;

  return {
    error: baseError.error,
    message: baseError.message,
    ...(baseError.details && { details: { ...baseError.details, ...context.details } }),
    ...(context.field && { field: context.field }),
    ...(context.received !== undefined && { received: context.received }),
    hint: baseError.hint,
    requestId: generateRequestId(),
    timestamp: new Date().toISOString(),
    ...(context.documentation && { documentation: context.documentation })
  };
}

/**
 * Generates a unique request ID for error tracking
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// EXAMPLE USAGE IN EXPRESS
// ============================================

// Express middleware example for consistent error handling
/*
const errorHandler = (err, req, res, next) => {
  console.error(`[${err.timestamp || new Date().toISOString()}] ${err.error}: ${err.message}`);

  const response = createErrorResponse(err.type || 'OPERATION_FAILED', {
    details: { originalError: err.message },
    field: err.field,
    received: err.received
  });

  res.status(err.statusCode || 500).json(response);
};

// Usage in routes:
app.post('/api/agents', (req, res, next) => {
  try {
    // Validation
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json(createErrorResponse('INVALID_FIELD', {
        field: 'name',
        reason: 'Name is required and cannot be empty',
        details: { received: req.body.name }
      }));
    }

    if (req.body.monthlyBudget <= 0) {
      return res.status(400).json(createErrorResponse('INVALID_FIELD', {
        field: 'monthlyBudget',
        reason: 'Budget must be a positive number',
        details: { received: req.body.monthlyBudget },
        hint: 'Example: 500'
      }));
    }

    // Create agent...
  } catch (error) {
    next(error);
  }
});
*/

// ============================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================

/**
 * Human-readable error messages for different scenarios
 */
const UserMessages = {
  // Agent errors
  'agent.not_found': {
    title: 'Agent Not Found',
    description: 'We couldn\'t find the agent you\'re looking for.',
    action: 'Check the agent ID or browse the agent list to find the correct one.',
    icon: '👤'
  },
  'agent.name_required': {
    title: 'Name Required',
    description: 'Every agent needs a name to be identified.',
    action: 'Please provide a name for the agent (e.g., "Data Analyzer" or "Support Bot").',
    icon: '📝'
  },
  'agent.budget_exceeded': {
    title: 'Budget Exceeded',
    description: 'This agent has reached its monthly spending limit.',
    action: 'You can increase the budget in the agent settings, or wait until next month.',
    icon: '💰'
  },

  // Task errors
  'task.not_found': {
    title: 'Task Not Found',
    description: 'The task you\'re looking for doesn\'t exist or has been deleted.',
    action: 'Check your task list or create a new task.',
    icon: '📋'
  },
  'task.already_completed': {
    title: 'Task Already Done',
    description: 'This task has already been completed.',
    action: 'View the task history or create a new task.',
    icon: '✅'
  },
  'task.status_invalid': {
    title: 'Invalid Status',
    description: 'The provided task status is not recognized.',
    action: 'Valid statuses are: backlog, in_progress, review, done',
    icon: '⚠️'
  },

  // Tool errors
  'tool.not_found': {
    title: 'Tool Not Found',
    description: 'The requested tool is not available.',
    action: 'Check the available tools list for valid options.',
    icon: '🔧'
  },
  'tool.execution_failed': {
    title: 'Tool Execution Failed',
    description: 'The tool could not complete the requested operation.',
    action: 'Check the error details, verify the parameters, and try again.',
    icon: '❌'
  },
  'tool.path_invalid': {
    title: 'Invalid Path',
    description: 'The file or directory path is invalid or inaccessible.',
    action: 'Use valid paths within the workspace directory. Avoid special characters.',
    icon: '📁'
  },

  // Network errors
  'network.timeout': {
    title: 'Request Timeout',
    description: 'The server took too long to respond.',
    action: 'Please try again. If the problem persists, the service may be overloaded.',
    icon: '⏱️'
  },
  'network.offline': {
    title: 'Connection Lost',
    description: 'Unable to connect to the server.',
    action: 'Check your internet connection and try again.',
    icon: '📡'
  }
};

/**
 * Get a user-friendly message for an error code
 */
function getUserMessage(errorCode) {
  const message = UserMessages[errorCode];
  if (!message) {
    return {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred.',
      action: 'Please try again or contact support if the problem persists.',
      icon: '🚨'
    };
  }
  return message;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  ErrorTypes,
  createErrorResponse,
  getUserMessage,
  generateRequestId
};

// ============================================
// USAGE EXAMPLE
// ============================================

/*
const { ErrorTypes, createErrorResponse, getUserMessage } = require('./error_messages');

// In an Express route:
app.post('/api/agents/:id/budget', (req, res) => {
  const agent = getAgent(req.params.id);

  if (!agent) {
    return res.status(404).json(createErrorResponse('RESOURCE_NOT_FOUND', {
      details: { type: 'agent', id: req.params.id }
    }));
  }

  if (req.body.monthlyBudget < 0) {
    return res.status(400).json(createErrorResponse('INVALID_FIELD', {
      field: 'monthlyBudget',
      reason: 'Budget cannot be negative',
      details: { received: req.body.monthlyBudget },
      hint: 'Example: 500'
    }));
  }

  // Update budget...
});

// For displaying to users (React/Vue components):
app.get('/api/errors/:code', (req, res) => {
  const message = getUserMessage(req.params.code);
  res.json(message);
});
*/