import type { Player } from './player';

export interface Team {
	id: number;
	company: string;
	player1: Player;
	player2: Player;
	poolId?: number;
	createdAt: Date;
	updatedAt: Date;
}
