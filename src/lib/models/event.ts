import type { Match } from './match';

export interface Event {
	id: number;
	eventDate: string;
	eventTime: string;
	matches: Match[];
	createdAt: Date;
	updatedAt: Date;
}
