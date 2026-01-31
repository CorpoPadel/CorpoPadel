import type { Event } from '$lib/models/event';
import type { Team } from '$lib/models/team';
import { hasAnyPrivilege, hasRole } from '$lib/server/services/permission.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const now = new Date();
	const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

	const eventsResponse = await fetch(`/api/v1/events?month=${monthStr}`);
	const teamsResponse = await fetch('/api/v1/teams');

	const eventsResult = await eventsResponse.json();
	const teamsResult = await teamsResponse.json();

	const events: Event[] = eventsResult.data || [];
	const teams: Team[] = teamsResult.data?.teams || [];

	return {
		initialEvents: events,
		teams: teams,
		canManageEvents: await hasAnyPrivilege(String(locals.user?.id), [
			'MANAGE_EVENTS',
			'MANAGE_PLANNING'
		]),
		currentMonth: now.getMonth() + 1,
		currentYear: now.getFullYear(),
		currentDay: now.getDate(),
		userId: locals.user?.id,
		showOnlyMineDefault: await hasRole(locals.user?.id as string, 'JOUEUR')
	};
};
