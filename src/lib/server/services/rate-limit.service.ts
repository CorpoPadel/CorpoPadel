import { dev } from '$app/environment';

interface RateLimitEntry {
	count: number;
	expiresAt: number;
}

export const RATE_LIMITS = {
	// Standard API: 500 requests per minute
	API: { limit: 500, windowMs: 60 * 1000 },
	// Auth endpoints (login): 50 requests per minute to prevent brute-force
	AUTH: { limit: 50, windowMs: 60 * 1000 }
};

class RateLimitService {
	private storage = new Map<string, RateLimitEntry>();
	private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup every 5 minutes

	constructor() {
		// Periodically clean up expired entries to prevent memory leaks
		if (!dev) {
			setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
		}
	}

	/**
	 * Checks if a request is allowed based on the IP and configuration.
	 */
	check(ip: string, type: 'API' | 'AUTH'): { allowed: boolean; retryAfter?: number } {
		const config = RATE_LIMITS[type];
		const key = `${type}:${ip}`;
		const now = Date.now();

		const entry = this.storage.get(key);

		// If no entry or entry expired, reset
		if (!entry || now > entry.expiresAt) {
			this.storage.set(key, {
				count: 1,
				expiresAt: now + config.windowMs
			});
			return { allowed: true };
		}

		// Check limit
		if (entry.count >= config.limit) {
			const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
			return { allowed: false, retryAfter };
		}

		// Increment count
		entry.count++;
		return { allowed: true };
	}

	/**
	 * Removes expired entries from memory.
	 */
	private cleanup() {
		const now = Date.now();
		for (const [key, entry] of this.storage.entries()) {
			if (now > entry.expiresAt) {
				this.storage.delete(key);
			}
		}
	}
}

export const rateLimitService = new RateLimitService();
