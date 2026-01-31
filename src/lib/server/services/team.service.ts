import { db } from '$lib/server/db';
import { teams, players, pools } from '$lib/server/db/app-schema';
import { eq, or, and, count, type InferSelectModel } from 'drizzle-orm';
import { matchService } from './match.service';
import { AppError } from '$lib/server/utils/error';

type Team = InferSelectModel<typeof teams>;
type Player = InferSelectModel<typeof players>;
type Pool = InferSelectModel<typeof pools>;

export type TeamWithRelations = Team & {
	player1: Player;
	player2: Player;
	pool: Pool | null;
};

export class TeamService {
	async getAll(): Promise<TeamWithRelations[]> {
		const results = await db.query.teams.findMany({
			with: {
				player1: true,
				player2: true,
				pool: true
			}
		});
		return results as unknown as TeamWithRelations[];
	}

	async getById(id: number): Promise<TeamWithRelations> {
		const team = await db.query.teams.findFirst({
			where: eq(teams.id, id),
			with: {
				player1: true,
				player2: true,
				pool: true
			}
		});
		if (!team) throw AppError.notFound('Équipe introuvable');
		return team as unknown as TeamWithRelations;
	}

	async getFiltered(filters: { poolId?: number; company?: string }): Promise<TeamWithRelations[]> {
		const conditions = [];
		if (filters.poolId) conditions.push(eq(teams.poolId, filters.poolId));
		if (filters.company) conditions.push(eq(teams.company, filters.company));

		const results = await db.query.teams.findMany({
			where: conditions.length > 0 ? and(...conditions) : undefined,
			with: {
				player1: true,
				player2: true,
				pool: true
			}
		});
		return results as TeamWithRelations[];
	}

	async count(filters: { poolId?: number; company?: string } = {}): Promise<number> {
		const conditions = [];
		if (filters.poolId) conditions.push(eq(teams.poolId, filters.poolId));
		if (filters.company) conditions.push(eq(teams.company, filters.company));

		const [result] = await db
			.select({ count: count() })
			.from(teams)
			.where(conditions.length > 0 ? and(...conditions) : undefined);
		return result.count;
	}

	async create(data: {
		company: string;
		player1Id: number;
		player2Id: number;
		poolId?: number | null;
	}) {
		await this.validateTeamCreation(data);
		return await db.insert(teams).values(data).returning();
	}

	private async validateTeamCreation(data: {
		company: string;
		player1Id: number;
		player2Id: number;
	}) {
		const player1 = await db.query.players.findFirst({ where: eq(players.id, data.player1Id) });
		const player2 = await db.query.players.findFirst({ where: eq(players.id, data.player2Id) });

		if (!player1 || !player2) {
			throw AppError.notFound('Un ou plusieurs joueurs introuvables');
		}

		if (player1.company !== data.company || player2.company !== data.company) {
			throw AppError.badRequest(
				`Les deux joueurs doivent appartenir à l'entreprise sélectionnée (${data.company})`
			);
		}

		if (player1.company !== player2.company) {
			throw AppError.badRequest("Les deux joueurs n'appartiennent pas à la même entreprise");
		}

		const existingTeam = await db.query.teams.findFirst({
			where: or(
				eq(teams.player1Id, data.player1Id),
				eq(teams.player2Id, data.player1Id),
				eq(teams.player1Id, data.player2Id),
				eq(teams.player2Id, data.player2Id)
			)
		});

		if (existingTeam) {
			throw AppError.conflict('Un des joueurs est déjà dans une équipe');
		}
	}

	async update(id: number, data: Partial<typeof teams.$inferInsert>): Promise<void> {
		const hasCompletedMatch = await matchService.hasTeamCompletedMatch(id);
		if (hasCompletedMatch) {
			throw AppError.forbidden('Impossible de modifier une équipe qui a déjà terminé des matchs.');
		}

		await db.update(teams).set(data).where(eq(teams.id, id));
	}

	async delete(id: number): Promise<void> {
		const hasPlayed = await matchService.hasTeamPlayed(id);
		if (hasPlayed) {
			throw AppError.forbidden('Impossible de supprimer une équipe qui a déjà joué des matchs.');
		}
		await db.delete(teams).where(eq(teams.id, id));
	}

	async isPlayerInTeam(playerId: number): Promise<boolean> {
		const inTeam = await db.query.teams.findFirst({
			where: or(eq(teams.player1Id, playerId), eq(teams.player2Id, playerId))
		});
		return !!inTeam;
	}
}

export const teamService = new TeamService();
