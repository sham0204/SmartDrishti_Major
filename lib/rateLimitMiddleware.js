import rateLimiter from "./rateLimiter";
import { createAuthErrorResponse } from "./auth";

// Rate limiting middleware
export const withRateLimit = (handler, options = {}) => {
  const {
    maxRequests = 10,
    windowMs = 60000, // 1 minute
    identifierFn = (request) => request.ip || 'unknown'
  } = options;
  
  return async (request, ...args) => {
    try {
      // Get client IP
      const identifier = identifierFn(request);
      
      // Check rate limit
      const rateLimitResult = rateLimiter.checkRateLimit(
        identifier,
        maxRequests,
        windowMs
      );
      
      if (!rateLimitResult.allowed) {
        return createAuthErrorResponse(
          `Too many requests. Please try again in ${rateLimitResult.resetTime} seconds.`,
          429
        );
      }
      
      // Add rate limit headers
      const response = await handler(request, ...args);
      
      if (response && typeof response.json === 'function') {
        response.headers.set('X-RateLimit-Limit', maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
      }
      
      return response;
    } catch (error) {
      console.error('Rate limiting error:', error);
      return createAuthErrorResponse('Internal server error', 500);
    }
  };
};

// Specific rate limiters for different endpoints
export const withAuthRateLimit = (handler) => 
  withRateLimit(handler, {
    maxRequests: 5, // 5 attempts per minute
    windowMs: 60000
  });

export const withGeneralRateLimit = (handler) => 
  withRateLimit(handler, {
    maxRequests: 30, // 30 requests per minute
    windowMs: 60000
  });

export const withStrictRateLimit = (handler) => 
  withRateLimit(handler, {
    maxRequests: 3, // 3 requests per minute
    windowMs: 60000
  });