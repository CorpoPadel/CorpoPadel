import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { route } from '$lib/utils/routes';

export interface GuardOptions {
	/** Message to display in the error toast if the check fails */
	message?: string;
	/** Where to redirect if the check fails */
	redirectTo?: string;
}

/**
 * Higher-order function to create server-side route guards.
 * It encapsulates the logic of checking a condition and redirecting with an error toast on failure.
 */
export function createGuard(
	checkFn: (userId: string) => Promise<boolean>,
	options: GuardOptions = {}
) {
	const {
		message = "Accès refusé : vous n'avez pas les permissions nécessaires.",
		redirectTo = '/'
	} = options;

	return async (): Promise<boolean> => {
		const user = getRequestEvent().locals.user;

		// Execute check and return true if passed
		if (user && (await checkFn(user.id))) {
			return true;
		}

		// Throw SvelteKit redirect with error state
		throw redirect(
			303,
			route(redirectTo as any, {
				toast: {
					severity: 'error',
					content: message
				}
			})
		);
	};
}
