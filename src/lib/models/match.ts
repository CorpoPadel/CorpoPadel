import type { MatchStatusEnum } from '$lib/server/db/app-schema';
import type { Team } from './team';
import type { Event } from './event';

export interface Match {
	id: number;
	eventId: number;
	event?: Event;
	courtNumber: number;
	team1: Team;
	team2: Team;
	status: MatchStatusEnum;
	scoreTeam1?: string | null;
	scoreTeam2?: string | null;
	createdAt: Date;
	updatedAt: Date;
}
