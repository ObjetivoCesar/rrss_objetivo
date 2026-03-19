// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export const rateLimit = {
  check: (ip: string, limit: number = 5, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const record = rateLimitMap.get(ip);
    
    if (!record) {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
      return true;
    }
    
    if (now - record.timestamp > windowMs) {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
      return true;
    }
    
    if (record.count >= limit) {
      return false; 
    }
    
    record.count += 1;
    return true;
  }
};
