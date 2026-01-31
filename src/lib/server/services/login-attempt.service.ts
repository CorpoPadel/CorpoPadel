import { db } from '$lib/server/db';
import { loginAttempts } from '$lib/server/db/app-schema';
import { eq } from 'drizzle-orm';

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;

export interface LoginAttemptResult {
	isLocked: boolean;
	remainingAttempts?: number;
	lockedUntil?: Date;
}

export class LoginAttemptService {
	async checkLoginAttempts(email: string): Promise<LoginAttemptResult> {
		const attempt = await db.query.loginAttempts.findFirst({
			where: eq(loginAttempts.email, email)
		});

		if (!attempt) {
			return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
		}

		const now = new Date();

		if (attempt.lockedUntil && attempt.lockedUntil > now) {
			return {
				isLocked: true,
				lockedUntil: attempt.lockedUntil
			};
		}

		if (attempt.lockedUntil && attempt.lockedUntil <= now) {
			await db
				.update(loginAttempts)
				.set({
					attemptsCount: 0,
					lockedUntil: null,
					lastAttempt: now
				})
				.where(eq(loginAttempts.email, email));

			return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
		}

		return {
			isLocked: false,
			remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempt.attemptsCount)
		};
	}

	async recordFailedAttempt(email: string): Promise<LoginAttemptResult> {
		const now = new Date();

		const existing = await db.query.loginAttempts.findFirst({
			where: eq(loginAttempts.email, email)
		});

		if (!existing) {
			await db.insert(loginAttempts).values({
				email,
				attemptsCount: 1,
				lastAttempt: now
			});

			return {
				isLocked: false,
				remainingAttempts: MAX_ATTEMPTS - 1
			};
		}

		const newCount = existing.attemptsCount + 1;
		const shouldLock = newCount >= MAX_ATTEMPTS;

		await db
			.update(loginAttempts)
			.set({
				attemptsCount: newCount,
				lastAttempt: now,
				lockedUntil: shouldLock ? new Date(now.getTime() + LOCK_DURATION_MS) : null
			})
			.where(eq(loginAttempts.email, email));

		if (shouldLock) {
			return {
				isLocked: true,
				lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS)
			};
		}

		return {
			isLocked: false,
			remainingAttempts: Math.max(0, MAX_ATTEMPTS - newCount)
		};
	}

	async resetLoginAttempts(email: string): Promise<void> {
		const existing = await db.query.loginAttempts.findFirst({
			where: eq(loginAttempts.email, email)
		});

		if (existing) {
			await db
				.update(loginAttempts)
				.set({
					attemptsCount: 0,
					lockedUntil: null,
					lastAttempt: new Date()
				})
				.where(eq(loginAttempts.email, email));
		}
	}

	getRemainingLockTimeMinutes(lockedUntil: Date): number {
		const now = new Date();
		const diff = lockedUntil.getTime() - now.getTime();
		return Math.ceil(diff / 60000);
	}
}

export const loginAttemptService = new LoginAttemptService();
