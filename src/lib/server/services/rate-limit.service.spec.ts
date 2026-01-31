import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimitService } from './rate-limit.service';

describe('services/rate-limit.service', () => {
	// Note: RateLimitService uses internal Map, no DB calls.

	beforeEach(() => {
		vi.useFakeTimers();
		// Reset storage hack: create new instance or access private property if possible?
		// JS allows access private via casting
		(rateLimitService as any).storage.clear();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should allow first request', () => {
		const res = rateLimitService.check('1.2.3.4', 'API');
		expect(res.allowed).toBe(true);
	});

	it('should block after limit exceeded', () => {
		// Limit is 500 for API
		for (let i = 0; i < 500; i++) {
			rateLimitService.check('1.2.3.4', 'API');
		}
		const res = rateLimitService.check('1.2.3.4', 'API');
		expect(res.allowed).toBe(false);
		expect(res.retryAfter).toBeGreaterThan(0);
	});

	it('should reset after window', () => {
		rateLimitService.check('1.2.3.4', 'AUTH'); // Limit 50
		// Advance time
		vi.advanceTimersByTime(61000);
		const res = rateLimitService.check('1.2.3.4', 'AUTH');
		expect(res.allowed).toBe(true);
	});

	it('should cleanup expired entries', () => {
		rateLimitService.check('1.1.1.1', 'API');
		vi.advanceTimersByTime(61000);
		// Call private cleanup
		(rateLimitService as any).cleanup();
		expect((rateLimitService as any).storage.size).toBe(0);
	});
});
