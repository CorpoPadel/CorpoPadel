import type { Team } from './team';

export interface Pool {
	id: number;
	name: string;
	teams: Team[];
	createdAt: Date;
	updatedAt: Date;
}
