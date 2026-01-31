import type { RouteId } from '$app/types';
import auth from '$lib/server/auth';
import { route } from '$lib/utils/routes';
import { redirect, error, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getUserPermissions } from '$lib/server/services/permission.service';
import { playerService } from '$lib/server/services/player.service';
import { rateLimitService } from '$lib/server/services/rate-limit.service';

/** Routes that do not require authentication */
const unprotectedRoutes: RouteId[] = ['/api/auth/[...all]', '/auth', '/auth/sign-in', '/'];

/**
 * Standard security headers for better protection against common attacks
 */
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
	return response;
};

/**
 * Custom rate limiting middleware protecting API and Auth endpoints.
 */
const rateLimiterHandle: Handle = async ({ event, resolve }) => {
	const ip = event.getClientAddress();
	const path = event.url.pathname;

	// Determine the type of limit to apply
	let limitType: 'AUTH' | 'API' | null = null;

	if (path.startsWith('/api/auth')) {
		limitType = 'AUTH';
	} else if (path.startsWith('/api/v1')) {
		limitType = 'API';
	}

	if (limitType) {
		const status = rateLimitService.check(ip, limitType);

		if (!status.allowed) {
			return new Response(
				`Too Many Requests. Please try again after ${status.retryAfter} seconds.`,
				{
					status: 429,
					headers: {
						'Retry-After': status.retryAfter?.toString() || '60'
					}
				}
			);
		}
	}

	return resolve(event);
};

/**
 * Main handle to resolve user session, permissions, and enforce password change redirects
 */
export const defaultHandle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = session.user;
		event.locals.session = session.session;

		try {
			// Load additional user context: permissions and player profile
			const permissions = await getUserPermissions(session.user.id);
			event.locals.permissions = permissions;
			const player = await playerService.getByUserId(session.user.id);
			event.locals.player = player;

			// Force users to the change-password page if required
			if (session.user?.mustChangePassword) {
				const path = event.url.pathname;
				const allowedPaths = ['/api/auth', '/auth/sign-out', '/auth/change-password'];
				const isAllowed = allowedPaths.some((p) => path.startsWith(p));

				if (!isAllowed) {
					throw redirect(303, '/auth/change-password');
				}
			}
		} catch (err) {
			event.locals.permissions = { roles: [], privileges: [] };

			if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
				throw err;
			}
		}
	}

	return resolve(event);
};

/**
 * Guard middleware to protect routes and redirect unauthorized users to sign-in
 */
export const protectedRouteMiddleware: Handle = async ({ event, resolve }) => {
	if (!event.route.id || unprotectedRoutes.includes(event.route.id)) {
		return resolve(event);
	}

	if (!event.locals.session || !event.locals.user) {
		if (event.url.pathname.startsWith('/api')) {
			throw error(401, 'Unauthorized: Bearer token missing or invalid');
		}

		throw redirect(
			303,
			route('/auth/sign-in', {
				redirectTo: event.url.pathname + event.url.search
			})
		);
	}

	return resolve(event);
};

export const handle = sequence(
	securityHeaders,
	rateLimiterHandle,
	defaultHandle,
	protectedRouteMiddleware
);
