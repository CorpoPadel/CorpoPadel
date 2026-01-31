import type { LayoutServerLoad } from './$types';

/**
 * Root layout loader responsible for making user session, permissions,
 * and player profile available to all components via page data.
 */
export const load: LayoutServerLoad = async (event) => {
	return {
		user: event.locals.user,
		permissions: event.locals.permissions,
		player: event.locals.player
	};
};
