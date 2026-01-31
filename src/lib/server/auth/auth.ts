import { betterAuth, APIError } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { bearer } from 'better-auth/plugins';
import { loginAttemptService } from '$lib/server/services/login-attempt.service';
import { createAuthMiddleware } from 'better-auth/api';
import { loginSchema } from '$lib/validations/auth';

/**
 * Helper to create a consistent JSON response
 */
const jsonResponse = (data: any, status: number) => {
	const body = JSON.stringify(data);
	const headers = new Headers({
		'Content-Type': 'application/json',
		'Content-Length': new TextEncoder().encode(body).length.toString()
	});
	return new Response(body, { status, headers });
};

/**
 * Hook executed before sign-in to check for account locking and validate credentials format
 */
export const handleBeforeSignIn = async (ctx: any) => {
	if (ctx.path === '/sign-in/email' && ctx.method === 'POST') {
		const body = ctx.body as { email?: string; password?: string };

		if (body?.password) {
			const validation = loginSchema.safeParse(body);
			if (!validation.success) {
				const firstError = validation.error.issues[0];
				throw new APIError('BAD_REQUEST', {
					code: 'VALIDATION_ERROR',
					message: firstError.message
				});
			}
		}

		if (body?.email) {
			const status = await loginAttemptService.checkLoginAttempts(body.email);

			if (status.isLocked && status.lockedUntil) {
				const mins = loginAttemptService.getRemainingLockTimeMinutes(status.lockedUntil);

				throw new APIError('TOO_MANY_REQUESTS', {
					code: 'ACCOUNT_LOCKED',
					message: `Compte verrouillé. Réessayez dans ${mins} minute(s).`
				});
			}
		}
	}
};

/**
 * Hook executed after sign-in attempt to reset counter on success or record failure on error
 */
export const handleAfterSignIn = async (ctx: any) => {
	if (ctx.path === '/sign-in/email' && ctx.method === 'POST') {
		const body = ctx.body as { email?: string };

		const newSession = ctx.context.newSession;

		if (newSession && body?.email) {
			// Reset attempts on successful login
			await loginAttemptService.resetLoginAttempts(body.email);
		} else if (body?.email) {
			// Record failure and check if it triggers a lock
			const failResult = await loginAttemptService.recordFailedAttempt(body.email);

			if (failResult.isLocked && failResult.lockedUntil) {
				const mins = loginAttemptService.getRemainingLockTimeMinutes(failResult.lockedUntil);

				throw new APIError('TOO_MANY_REQUESTS', {
					code: 'ACCOUNT_LOCKED',
					message: `Compte verrouillé en raison de trop nombreuses tentatives échouées. Réessayez dans ${mins} minute(s).`
				});
			}

			return jsonResponse(
				{
					code: 'INVALID_EMAIL_OR_PASSWORD',
					message: 'Email ou mot de passe incorrect',
					remainingAttempts: failResult.remainingAttempts
				},
				401
			);
		}
	}
};

/**
 * BetterAuth instance configuration with Drizzle adapter and custom hooks
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: schema
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 12
	},
	user: {
		additionalFields: {
			mustChangePassword: {
				type: 'boolean',
				input: false
			}
		}
	},
	plugins: [bearer()],
	hooks: {
		before: createAuthMiddleware(handleBeforeSignIn),
		after: createAuthMiddleware(handleAfterSignIn)
	}
});
