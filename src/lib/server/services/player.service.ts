import { db } from '$lib/server/db';
import { players } from '$lib/server/db/app-schema';
import { user } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { teamService } from './team.service';
import { AppError } from '$lib/server/utils/error';

export type PlayerWithUser = NonNullable<Awaited<ReturnType<PlayerService['getByIdWithUser']>>>;

export class PlayerService {
	async getAll() {
		return await db.query.players.findMany({
			with: {
				user: {
					with: {
						userRoles: {
							with: {
								role: true
							}
						}
					}
				}
			},
			orderBy: [desc(players.createdAt)]
		});
	}

	async count(): Promise<number> {
		const [result] = await db.select({ count: count() }).from(players);
		return result.count;
	}

	async getById(id: number) {
		const player = await db.query.players.findFirst({
			where: eq(players.id, id)
		});
		if (!player) throw AppError.notFound('Joueur introuvable');
		return player;
	}

	async getByIdWithUser(id: number) {
		return await db.query.players.findFirst({
			where: eq(players.id, id),
			with: { user: true }
		});
	}

	async getByLicense(licenseNumber: string) {
		return await db.select().from(players).where(eq(players.licenseNumber, licenseNumber)).get();
	}

	async getByUserId(userId: string) {
		return await db.query.players.findFirst({
			where: eq(players.userId, userId)
		});
	}

	async create(data: typeof players.$inferInsert) {
		// Ensure no existing player with same email or license number
		const existingByEmail = await db
			.select()
			.from(players)
			.where(eq(players.email, data.email))
			.get();
		if (existingByEmail) {
			throw AppError.conflict('Cette adresse email est déjà utilisée par un autre joueur.');
		}
		const existingByLicense = await db
			.select()
			.from(players)
			.where(eq(players.licenseNumber, data.licenseNumber))
			.get();
		if (existingByLicense) {
			throw AppError.conflict('Ce numéro de licence est déjà utilisé.');
		}

		try {
			const result = await db.insert(players).values(data).returning();
			return result[0];
		} catch (error: any) {
			// Handle SQLite constraint violations (unique email or license)
			if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE constraint')) {
				if (error.message?.includes('players.email')) {
					throw AppError.conflict('Cette adresse email est déjà utilisée par un autre joueur.');
				}
				if (error.message?.includes('players.license_number')) {
					throw AppError.conflict('Ce numéro de licence est déjà utilisé.');
				}
				throw AppError.conflict('Données uniques en conflit (email ou licence).');
			}
			throw error;
		}
	}

	async update(id: number, data: Partial<typeof players.$inferInsert>) {
		await this.getById(id);
		try {
			return await db.update(players).set(data).where(eq(players.id, id)).returning();
		} catch (error: any) {
			if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('UNIQUE constraint')) {
				if (error.message?.includes('players.email')) {
					throw AppError.conflict('Cette adresse email est déjà utilisée par un autre joueur.');
				}
				if (error.message?.includes('players.license_number')) {
					throw AppError.conflict('Ce numéro de licence est déjà utilisé.');
				}
				throw AppError.conflict('Données uniques en conflit (email ou licence).');
			}
			throw error;
		}
	}

	async delete(id: number): Promise<void> {
		const inTeam = await teamService.isPlayerInTeam(id);

		if (inTeam) {
			throw AppError.forbidden('Impossible de supprimer ce joueur car il appartient à une équipe.');
		}

		const player = await this.getById(id);
		const userId = player?.userId;

		await db.delete(players).where(eq(players.id, id));

		if (userId) {
			await db.delete(user).where(eq(user.id, userId));
		}
	}
}

export const playerService = new PlayerService();
