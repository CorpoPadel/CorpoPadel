import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleBeforeSignIn, handleAfterSignIn } from './auth';
import { APIError } from 'better-auth';
import { loginAttemptService } from '../services/login-attempt.service';

vi.mock('../services/login-attempt.service', () => ({
	loginAttemptService: {
		checkLoginAttempts: vi.fn(),
		getRemainingLockTimeMinutes: vi.fn(),
		resetLoginAttempts: vi.fn(),
		recordFailedAttempt: vi.fn()
	}
}));

vi.mock('$lib/server/db', () => ({
	db: {}
}));

// We need to mock loginSchema from validations if we want to test validation failure strictly
// But since we can trigger it with bad input, we might rely on real schema.
// However, the code imports it.

describe('server/auth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('handleBeforeSignIn', () => {
		it('should validate password format', async () => {
			const ctx = {
				path: '/sign-in/email',
				method: 'POST',
				body: { email: 'test@example.com', password: 'short' } // Invalid password
			};

			await expect(handleBeforeSignIn(ctx)).rejects.toThrow(APIError);
			// Assert message/code if possible, but APIError structure is custom class
		});

		it('should check lock status', async () => {
			const ctx = {
				path: '/sign-in/email',
				method: 'POST',
				body: { email: 'locked@example.com', password: 'ValidPass123!' }
			};

			vi.mocked(loginAttemptService.checkLoginAttempts).mockResolvedValue({
				isLocked: true,
				lockedUntil: new Date(),
				remainingAttempts: 0
			});
			vi.mocked(loginAttemptService.getRemainingLockTimeMinutes).mockReturnValue(5);

			await expect(handleBeforeSignIn(ctx)).rejects.toThrow('Compte verrouillé');
		});

		it('should allow valid request', async () => {
			const ctx = {
				path: '/sign-in/email',
				method: 'POST',
				body: { email: 'ok@example.com', password: 'ValidPass123!' }
			};

			vi.mocked(loginAttemptService.checkLoginAttempts).mockResolvedValue({ isLocked: false });

			await expect(handleBeforeSignIn(ctx)).resolves.not.toThrow();
		});
	});

	describe('handleAfterSignIn', () => {
		it('should reset attempts on success', async () => {
			const ctx = {
				path: '/sign-in/email',
				method: 'POST',
				body: { email: 'test@example.com' },
				context: { newSession: { id: 's1' } }
			};

			await handleAfterSignIn(ctx);
			expect(loginAttemptService.resetLoginAttempts).toHaveBeenCalledWith('test@example.com');
		});

		it('should record failure on error', async () => {
			const ctx = {
				path: '/sign-in/email',
				method: 'POST',
				body: { email: 'test@example.com' },
				context: { newSession: null }
			};

			vi.mocked(loginAttemptService.recordFailedAttempt).mockResolvedValue({
				isLocked: false,
				remainingAttempts: 3
			});

			const res = await handleAfterSignIn(ctx);
			// It returns a Response object
			expect(res).toBeDefined();
			// We can't easily read Response body in jsdom/node without await .json(),
			// but api is simple enough.
			expect(loginAttemptService.recordFailedAttempt).toHaveBeenCalled();
		});

		it('should throw if account gets locked after failure', async () => {
			const ctx = {
				path: '/sign-in/email',
				method: 'POST',
				body: { email: 'test@example.com' },
				context: { newSession: null }
			};

			vi.mocked(loginAttemptService.recordFailedAttempt).mockResolvedValue({
				isLocked: true,
				lockedUntil: new Date(),
				remainingAttempts: 0
			});

			await expect(handleAfterSignIn(ctx)).rejects.toThrow('Compte verrouillé');
		});
	});
});
