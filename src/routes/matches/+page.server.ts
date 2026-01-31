import type { Match } from '$lib/models/match';
import type { Pool } from '$lib/models/pool';
import type { Team } from '$lib/models/team';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const matchesResponse = await fetch('/api/v1/matches');
	const matchesResult = await matchesResponse.json();

	const initialMatches: Match[] = (matchesResult.data?.matches || [])
		.filter((m: Match) => m.status === 'ONGOING' || m.status === 'CANCELED')
		.filter((m: Match) => {
			const eventDate = new Date(m.event?.eventDate as string);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const in30Days = new Date();
			in30Days.setDate(today.getDate() + 30);
			return eventDate >= today && eventDate <= in30Days;
		});

	const poolsResponse = await fetch('/api/v1/pools');
	const poolsResult = await poolsResponse.json();

	const teamsResponse = await fetch('/api/v1/teams');
	const teamsResult = await teamsResponse.json();

	const allPools: Pool[] = poolsResult.data?.pools || [];
	const allTeams: Team[] = teamsResult.data?.teams || [];

	const companies = [...new Set(allTeams.map((t: Team) => t.company))].sort();

	const userRoles = locals.permissions?.roles || [];
	const isAdministrator = userRoles.includes('ADMINISTRATEUR');

	return {
		initialMatches,
		pools: allPools,
		companies,
		teams: allTeams,
		isAdministrator
	};
};
