import { db } from '$lib/server/db';
import { pools, teams, matches } from '$lib/server/db/app-schema';
import { count, eq, inArray, or, and } from 'drizzle-orm';
import { AppError } from '$lib/server/utils/error';

export type PoolWithTeams = typeof pools.$inferSelect & {
	teams: (typeof teams.$inferSelect)[];
};

export class PoolService {
	async getAll(): Promise<PoolWithTeams[]> {
		const results = await db.query.pools.findMany({
			with: {
				teams: true
			}
		});
		return results as PoolWithTeams[];
	}

	async getByName(name: string) {
		return await db.query.pools.findFirst({
			where: eq(pools.name, name)
		});
	}

	async createWithTeams(name: string, teamIds: number[]): Promise<any> {
		if (teamIds.length !== 6) {
			throw AppError.badRequest('Une poule doit contenir exactement 6 équipes.');
		}

		return await db.transaction(async (tx: any) => {
			if (teamIds.length > 0) {
				const existingTeams = await tx.select().from(teams).where(inArray(teams.id, teamIds));
				const alreadyInPool = existingTeams.filter((t: any) => t.poolId !== null);

				if (alreadyInPool.length > 0) {
					throw AppError.conflict(
						`Certaines équipes sont déjà assignées à une poule : ${alreadyInPool.map((t: any) => t.company).join(', ')}`
					);
				}
			}

			const [newPool] = await tx.insert(pools).values({ name }).returning();

			if (teamIds.length > 0) {
				await tx.update(teams).set({ poolId: newPool.id }).where(inArray(teams.id, teamIds));
			}
			return newPool;
		});
	}

	async update(id: number, name: string, teamIds?: number[]): Promise<void> {
		if (teamIds && teamIds.length !== 6) {
			throw AppError.badRequest('Une poule doit contenir exactement 6 équipes.');
		}

		await this.checkMatches(id, 'modifier');

		return await db.transaction(async (tx: any) => {
			await tx.update(pools).set({ name }).where(eq(pools.id, id));

			if (teamIds) {
				await tx.update(teams).set({ poolId: null }).where(eq(teams.poolId, id));

				if (teamIds.length > 0) {
					await tx.update(teams).set({ poolId: id }).where(inArray(teams.id, teamIds));
				}
			}
		});
	}

	async delete(id: number): Promise<void> {
		await this.checkMatches(id, 'supprimer');
		await db.delete(pools).where(eq(pools.id, id));
	}

	async checkMatches(poolId: number, action: string): Promise<void> {
		const poolTeams = await db.select({ id: teams.id }).from(teams).where(eq(teams.poolId, poolId));
		const teamIds = poolTeams.map((t: any) => t.id);

		if (teamIds.length > 0) {
			const completedMatches = await db
				.select()
				.from(matches)
				.where(
					and(
						or(inArray(matches.team1Id, teamIds), inArray(matches.team2Id, teamIds)),
						eq(matches.status, 'COMPLETED')
					)
				)
				.limit(1);

			if (completedMatches.length > 0) {
				throw AppError.forbidden(
					`Impossible de ${action} : des matchs ont déjà été terminés avec ces équipes.`
				);
			}
		}
	}

	async count(): Promise<number> {
		const [result] = await db.select({ count: count() }).from(pools);
		return result.count;
	}
}

export const poolService = new PoolService();
