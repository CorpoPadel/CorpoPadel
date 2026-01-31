import type { PageServerLoad } from './$types';
import { roleGuard } from '$lib/server/guards/roleGuard';

export const load: PageServerLoad = async ({ fetch }) => {
	await roleGuard('ADMINISTRATEUR');

	const response = await fetch('/api/v1/admin/stats');
	const result = await response.json();

	return {
		counts: result.data || { users: 0, players: 0, teams: 0, pools: 0 }
	};
};
