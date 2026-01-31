import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '$lib/test/mocks/db';
import { mockDb } from '$lib/test/mocks/db';
import { LoginAttemptService } from './login-attempt.service';

vi.mock('$lib/server/db/app-schema', () => ({
	loginAttempts: { email: 'email' }
}));

describe('services/login-attempt.service', () => {
	let service: LoginAttemptService;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		service = new LoginAttemptService();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('checkLoginAttempts', () => {
		it('should return default state if no record exists', async () => {
			mockDb.query.loginAttempts.findFirst.mockResolvedValue(null);
			const res = await service.checkLoginAttempts('test@test.com');
			expect(res.isLocked).toBe(false);
			expect(res.remainingAttempts).toBe(5);
		});

		it('should return locked if record is locked', async () => {
			const future = new Date(Date.now() + 100000);
			mockDb.query.loginAttempts.findFirst.mockResolvedValue({ lockedUntil: future });
			const res = await service.checkLoginAttempts('test@test.com');
			expect(res.isLocked).toBe(true);
			expect(res.lockedUntil).toEqual(future);
		});

		it('should reset if lock expired', async () => {
			const past = new Date(Date.now() - 100000);
			mockDb.query.loginAttempts.findFirst.mockResolvedValue({ lockedUntil: past });
			const res = await service.checkLoginAttempts('test@test.com');
			expect(res.isLocked).toBe(false);
			expect(mockDb.update).toHaveBeenCalled();
		});
	});

	describe('recordFailedAttempt', () => {
		it('should create new attempt record if none exists', async () => {
			mockDb.query.loginAttempts.findFirst.mockResolvedValue(null);
			const res = await service.recordFailedAttempt('test@test.com');

			expect(res.isLocked).toBe(false);
			expect(res.remainingAttempts).toBe(4); // 5 - 1
			expect(mockDb.insert).toHaveBeenCalled();
		});

		it('should increment attempts', async () => {
			mockDb.query.loginAttempts.findFirst.mockResolvedValue({ attemptsCount: 1 });
			const res = await service.recordFailedAttempt('test@test.com');
			expect(res.remainingAttempts).toBe(3);
			expect(mockDb.update).toHaveBeenCalled();
		});

		it('should lock user if max attempts reached', async () => {
			mockDb.query.loginAttempts.findFirst.mockResolvedValue({ attemptsCount: 4 });
			const res = await service.recordFailedAttempt('test@test.com');
			expect(res.isLocked).toBe(true);
			expect(res.lockedUntil).toBeDefined();
		});
	});

	describe('resetLoginAttempts', () => {
		it('should reset attempts if record exists', async () => {
			mockDb.query.loginAttempts.findFirst.mockResolvedValue({ email: 'test@test.com' });
			await service.resetLoginAttempts('test@test.com');
			expect(mockDb.update).toHaveBeenCalled();
		});
	});

	describe('getRemainingLockTimeMinutes', () => {
		it('should return remaining minutes', () => {
			const future = new Date(Date.now() + 120000); // 2 mins
			expect(service.getRemainingLockTimeMinutes(future)).toBe(2);
		});
	});
});
