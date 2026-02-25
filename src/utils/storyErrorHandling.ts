import type { RateLimitError } from '../types/story';

/**
 * Story Error Handling Utilities
 * 
 * Comprehensive error handling for all story-related operations
 * Matches the error types from the requirements document
 */

// =================================
// Error Type Guards
// =================================

export const isRateLimitError = (error: any): error is RateLimitError => {
  return error?.error_code === 'RATE_LIMIT_EXCEEDED';
};

export const isValidationError = (error: any): boolean => {
  return error?.error_code === 'VALIDATION_ERROR' && !!error?.errors;
};

export const isAuthError = (error: any): boolean => {
  return error?.error_code === 'AUTH_REQUIRED';
};

export const isNetworkError = (error: any): boolean => {
  return error?.error_code === 'NETWORK_ERROR';
};

// =================================
// Error Message Formatters
// =================================

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  // Rate limit errors
  if (isRateLimitError(error)) {
    return `You've reached your story generation limit. ${error.remaining_quota} remaining. Try again in a few minutes.`;
  }
  
  // Validation errors
  if (isValidationError(error)) {
    const firstError = Object.values(error.errors)[0];
    return Array.isArray(firstError) ? firstError[0] : 'Validation failed';
  }
  
  // Authentication errors
  if (isAuthError(error)) {
    return 'Please log in to continue';
  }
  
  // Network errors
  if (isNetworkError(error)) {
    return 'Connection lost. Please check your internet and try again.';
  }
  
  // Generic message
  return error.message || 'An error occurred. Please try again.';
};

/**
 * Get error title for notifications
 */
export const getErrorTitle = (error: any): string => {
  if (isRateLimitError(error)) return 'Rate Limit Reached';
  if (isValidationError(error)) return 'Invalid Input';
  if (isAuthError(error)) return 'Authentication Required';
  if (isNetworkError(error)) return 'Connection Error';
  return 'Error';
};

/**
 * Get error severity level
 */
export const getErrorSeverity = (error: any): 'error' | 'warning' | 'info' => {
  if (isRateLimitError(error)) return 'warning';
  if (isValidationError(error)) return 'warning';
  if (isAuthError(error)) return 'error';
  if (isNetworkError(error)) return 'error';
  return 'error';
};

// =================================
// Error Notifications
// =================================

export interface ErrorNotification {
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Create error notification object
 */
export const createErrorNotification = (
  error: any,
  customAction?: ErrorNotification['action']
): ErrorNotification => {
  return {
    title: getErrorTitle(error),
    message: getErrorMessage(error),
    severity: getErrorSeverity(error),
    action: customAction,
  };
};

// =================================
// Specific Error Handlers
// =================================

/**
 * Handle generation errors with user-friendly messages
 */
export const handleGenerationError = (error: any): string => {
  if (isRateLimitError(error)) {
    return `Story generation limit reached. You can generate ${error.remaining_quota} more ${error.remaining_quota === 1 ? 'story' : 'stories'} after the limit resets.`;
  }
  
  // AI-specific errors
  if (error?.error_code === 'OPENAI_API_FAILURE') {
    return 'AI service temporarily unavailable. Please try again in a moment.';
  }
  
  if (error?.error_code === 'IMAGE_GENERATION_FAILED') {
    return 'Image generation failed. Your story was generated without images.';
  }
  
  if (error?.error_code === 'CONTENT_POLICY_VIOLATION') {
    return 'Your prompt contains content that violates our policy. Please modify your request.';
  }
  
  return getErrorMessage(error);
};

/**
 * Handle user interaction errors (like, comment, share)
 */
export const handleInteractionError = (error: any, action: string): string => {
  if (isAuthError(error)) {
    return `Please log in to ${action} this story`;
  }
  
  if (isNetworkError(error)) {
    return `Failed to ${action}. Please check your connection and try again.`;
  }
  
  return `Failed to ${action}. Please try again.`;
};

/**
 * Handle rate limit errors with helpful guidance
 */
export const handleRateLimitError = (error: RateLimitError): {
  message: string;
  canRetry: boolean;
  retryAfter?: string;
} => {
  const remaining = error.remaining_quota;
  const resetsAt = error.resets_at;
  
  return {
    message: remaining > 0
      ? `You have ${remaining} ${remaining === 1 ? 'story' : 'stories'} remaining this hour.`
      : `You've used all your story generations this hour. Limit resets soon.`,
    canRetry: remaining > 0,
    retryAfter: resetsAt,
  };
};

// =================================
// Validation Error Formatting
// =================================

/**
 * Format validation errors for form display
 */
export const formatValidationErrors = (
  errors: Record<string, string[]>
): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  for (const [field, messages] of Object.entries(errors)) {
    formatted[field] = Array.isArray(messages) ? messages[0] : messages;
  }
  
  return formatted;
};

/**
 * Get validation error for specific field
 */
export const getFieldError = (
  errors: Record<string, string[]> | undefined,
  field: string
): string | null => {
  if (!errors || !errors[field]) return null;
  const messages = errors[field];
  return Array.isArray(messages) ? messages[0] : messages;
};

// =================================
// Error Logging
// =================================

/**
 * Log error for debugging (in development only)
 */
export const logError = (context: string, error: any): void => {
  if (import.meta.env.DEV) {
    console.group(`❌ Error: ${context}`);
    console.error('Error details:', error);
    console.trace();
    console.groupEnd();
  }
};

/**
 * Log error to external service (production)
 * TODO: Integrate with error tracking service (e.g., Sentry)
 */
export const reportError = (context: string, error: any, metadata?: any): void => {
  if (!import.meta.env.DEV) {
    // TODO: Send to error tracking service
    console.error(`[${context}]`, error, metadata);
  }
};

// =================================
// Retry Logic
// =================================

/**
 * Determine if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  // Network errors are retryable
  if (isNetworkError(error)) return true;
  
  // 5xx server errors are retryable
  if (error?.error_code === 'SERVER_ERROR') return true;
  
  // Timeout errors are retryable
  if (error?.code === 'ECONNABORTED') return true;
  
  // Rate limits are NOT retryable immediately
  if (isRateLimitError(error)) return false;
  
  // Auth errors are NOT retryable
  if (isAuthError(error)) return false;
  
  return false;
};

/**
 * Calculate retry delay with exponential backoff
 */
export const getRetryDelay = (attemptNumber: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attemptNumber - 1), 10000);
};
