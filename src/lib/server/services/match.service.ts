import { db } from '$lib/server/db';
import { matches, events } from '$lib/server/db/app-schema';
import { eq, or, and, gte, lte, inArray } from 'drizzle-orm';
import { AppError } from '$lib/server/utils/error';

export type MatchWithRelations = NonNullable<Awaited<ReturnType<MatchService['getById']>>>;

/**
 * Filter options for querying matches
 */
export interface MatchFilters {
	userId?: string | null;
	teamId?: number | null;
	company?: string | null;
	poolId?: number | null;
	status?: string | null;
	upcoming?: boolean;
	startDate?: Date;
	endDate?: Date;
}

/**
 * Service for match-related database operations including complex filtering and relations retrieval.
 */
export class MatchService {
	/**
	 * Returns a single match with its event and participating teams details.
	 */
	async getById(id: number) {
		const match = await db.query.matches.findFirst({
			where: eq(matches.id, id),
			with: {
				event: true,
				team1: {
					with: {
						player1: true,
						player2: true
					}
				},
				team2: {
					with: {
						player1: true,
						player2: true
					}
				}
			}
		});
		if (!match) throw AppError.notFound('Match introuvable');
		return match;
	}

	/**
	 * Returns all matches in the system with their primary relations.
	 */
	async getAll(): Promise<MatchWithRelations[]> {
		return await db.query.matches.findMany({
			with: {
				event: true,
				team1: {
					with: {
						player1: true,
						player2: true
					}
				},
				team2: {
					with: {
						player1: true,
						player2: true
					}
				}
			}
		});
	}

	/**
	 * Performs complex filtering on matches based on multiple criteria (user, team, company, date range).
	 * Implements multi-step filtering: first by event date (at DB level), then by other attributes.
	 */
	async getFiltered(filters: MatchFilters): Promise<MatchWithRelations[]> {
		let eventIds: number[] | null = null;

		let start: Date | undefined = filters.startDate;
		let end: Date | undefined = filters.endDate;

		// Default 'upcoming' window: from now until 30 days later
		if (filters.upcoming) {
			const now = new Date();
			start = now;
			const thirtyDaysLater = new Date(now);
			thirtyDaysLater.setDate(now.getDate() + 30);
			end = thirtyDaysLater;
		}

		// Filter events first to get IDs of matches within the requested timeframe
		if (start || end) {
			const conditions = [];
			if (start) conditions.push(gte(events.eventDate, start));
			if (end) conditions.push(lte(events.eventDate, end));

			const eventsInRange = await db.query.events.findMany({
				where: and(...conditions),
				columns: { id: true }
			});
			eventIds = eventsInRange.map((e) => e.id);

			if (eventIds?.length === 0) return [];
		}

		let matchConditions = [];
		if (eventIds !== null) {
			matchConditions.push(inArray(matches.eventId, eventIds));
		}
		if (filters.status) {
			matchConditions.push(eq(matches.status, filters.status as any));
		}

		let filteredMatches = await db.query.matches.findMany({
			where: matchConditions.length > 0 ? and(...matchConditions) : undefined,
			with: {
				event: true,
				team1: {
					with: {
						player1: true,
						player2: true
					}
				},
				team2: {
					with: {
						player1: true,
						player2: true
					}
				}
			}
		});

		// Secondary filtering at application level for relations-based attributes
		if (filters.userId) {
			const uId = filters.userId;
			filteredMatches = filteredMatches.filter(
				(match: any) =>
					match.team1.player1.userId === uId ||
					match.team1.player2.userId === uId ||
					match.team2.player1.userId === uId ||
					match.team2.player2.userId === uId
			);
		}

		if (filters.teamId) {
			const tId = filters.teamId;
			filteredMatches = filteredMatches.filter(
				(match: any) => match.team1Id === tId || match.team2Id === tId
			);
		}

		if (filters.company) {
			filteredMatches = filteredMatches.filter(
				(match: any) =>
					match.team1.company === filters.company || match.team2.company === filters.company
			);
		}

		if (filters.poolId) {
			filteredMatches = filteredMatches.filter(
				(match: any) =>
					match.team1.poolId === filters.poolId || match.team2.poolId === filters.poolId
			);
		}

		// Sort by date then by time (ascending)
		filteredMatches.sort((a: any, b: any) => {
			if (!a.event || !b.event) return 0;
			const dateA = new Date(a.event.eventDate).getTime();
			const dateB = new Date(b.event.eventDate).getTime();
			if (dateA !== dateB) return dateA - dateB;
			return a.event.eventTime.localeCompare(b.event.eventTime);
		});

		return filteredMatches as MatchWithRelations[];
	}

	/**
	 * Updates a match record.
	 */
	async update(id: number, data: Partial<typeof matches.$inferInsert>) {
		await this.getById(id);
		return await db.update(matches).set(data).where(eq(matches.id, id)).returning();
	}

	/**
	 * Deletes a match record.
	 */
	async delete(id: number): Promise<void> {
		await this.getById(id);
		await db.delete(matches).where(eq(matches.id, id));
	}

	/**
	 * Inserts a new match record.
	 */
	async create(data: typeof matches.$inferInsert) {
		return await db.insert(matches).values(data).returning();
	}

	/**
	 * Checks if a team has already participated in at least one match.
	 */
	async hasTeamPlayed(teamId: number): Promise<boolean> {
		const teamMatches = await db
			.select()
			.from(matches)
			.where(or(eq(matches.team1Id, teamId), eq(matches.team2Id, teamId)))
			.limit(1);
		return teamMatches.length > 0;
	}

	/**
	 * Checks if a team has already completed at least one match.
	 */
	async hasTeamCompletedMatch(teamId: number): Promise<boolean> {
		const teamMatches = await db
			.select()
			.from(matches)
			.where(
				and(
					or(eq(matches.team1Id, teamId), eq(matches.team2Id, teamId)),
					eq(matches.status, 'COMPLETED')
				)
			)
			.limit(1);
		return teamMatches.length > 0;
	}
}

export const matchService = new MatchService();
