interface RateLimitEntry {
    count: number;
    timestamp: number;
}

class RateLimiter {
    private static instance: RateLimiter;
    private attempts: Map<string, RateLimitEntry>;
    private readonly maxAttempts: number;
    private readonly timeWindow: number; // in milliseconds

    private constructor() {
        this.attempts = new Map();
        this.maxAttempts = 5; // Maximum attempts per time window
        this.timeWindow = 15 * 60 * 1000; // 15 minutes
    }

    static getInstance(): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.attempts.entries()) {
            if (now - entry.timestamp > this.timeWindow) {
                this.attempts.delete(key);
            }
        }
    }

    isAllowed(key: string): boolean {
        this.cleanup();
        const now = Date.now();
        const entry = this.attempts.get(key);

        if (!entry || now - entry.timestamp > this.timeWindow) {
            this.attempts.set(key, { count: 1, timestamp: now });
            return true;
        }

        if (entry.count >= this.maxAttempts) {
            return false;
        }

        entry.count++;
        return true;
    }

    getRemainingAttempts(key: string): number {
        this.cleanup();
        const entry = this.attempts.get(key);
        return entry ? Math.max(0, this.maxAttempts - entry.count) : this.maxAttempts;
    }

    getTimeUntilReset(key: string): number {
        this.cleanup();
        const entry = this.attempts.get(key);
        return entry ? Math.max(0, this.timeWindow - (Date.now() - entry.timestamp)) : 0;
    }

    reset(key: string): void {
        this.attempts.delete(key);
    }
}

export const rateLimiter = RateLimiter.getInstance(); 