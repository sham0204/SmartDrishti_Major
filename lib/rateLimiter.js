// Simple in-memory rate limiter (for production, use Redis)
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  // Check if the request is allowed based on rate limit
  checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create request history for this identifier
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const requestTimes = this.requests.get(identifier);
    
    // Remove outdated requests
    const validRequests = requestTimes.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return {
      allowed: true,
      remaining: maxRequests - validRequests.length,
      resetTime: Math.ceil(windowMs / 1000)
    };
  }
  
  // Clear old request data to prevent memory leaks
  cleanup() {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    
    for (const [identifier, requestTimes] of this.requests.entries()) {
      const validRequests = requestTimes.filter(time => time > now - windowMs);
      
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter();

// Periodically clean up old request data
setInterval(() => {
  rateLimiter.cleanup();
}, 300000); // Every 5 minutes

export default rateLimiter;