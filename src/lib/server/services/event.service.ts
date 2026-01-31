import { db } from '$lib/server/db';
import { events, matches } from '$lib/server/db/app-schema';
import { eq, and, gte, lte, asc, ne } from 'drizzle-orm';
import { AppError } from '$lib/server/utils/error';

export type EventWithRelations = NonNullable<Awaited<ReturnType<EventService['getById']>>>;

/**
 * Service for managing tournament events and their associated matches.
 */
export class EventService {
	/**
	 * Retrieves an event by its ID including full relation tree: matches -> teams -> players.
	 */
	async getById(id: number) {
		const event = await db.query.events.findFirst({
			where: eq(events.id, id),
			with: {
				matches: {
					with: {
						team1: { with: { player1: true, player2: true } },
						team2: { with: { player1: true, player2: true } }
					}
				}
			}
		});
		if (!event) throw AppError.notFound('Événement introuvable');
		return event;
	}

	/**
	 * Fetches events within a specific date range.
	 * Optionally filters events where a specific user is participating.
	 */
	async getByDateRange(
		startDate: Date,
		endDate: Date,
		userId?: string
	): Promise<EventWithRelations[]> {
		let monthEvents = await db.query.events.findMany({
			where: and(gte(events.eventDate, startDate), lte(events.eventDate, endDate)),
			with: {
				matches: {
					with: {
						team1: { with: { player1: true, player2: true } },
						team2: { with: { player1: true, player2: true } }
					}
				}
			},
			orderBy: [asc(events.eventDate)]
		});

		if (userId) {
			// Client-side filtering for user participation across all matches in the event
			monthEvents = monthEvents.filter((event: any) =>
				event.matches.some(
					(match: any) =>
						match.team1.player1.userId === userId ||
						match.team1.player2.userId === userId ||
						match.team2.player1.userId === userId ||
						match.team2.player2.userId === userId
				)
			);
		}
		return monthEvents as EventWithRelations[];
	}

	/**
	 * Checks if an event already exists at the given date and time.
	 */
	async checkDuplicate(eventDate: Date, eventTime: string, excludeId?: number) {
		const dateToStore = new Date(eventDate);
		dateToStore.setHours(0, 0, 0, 0);

		const conditions = [eq(events.eventDate, dateToStore), eq(events.eventTime, eventTime)];

		if (excludeId) {
			conditions.push(ne(events.id, excludeId));
		}

		return await db.query.events.findFirst({
			where: and(...conditions)
		});
	}

	/**
	 * Creates a new event and its associated matches within a transaction.
	 * Enforces a 1-hour conflict rule for scheduling.
	 */
	async create(data: {
		eventDate: Date;
		eventTime: string;
		matches: any[];
	}): Promise<EventWithRelations> {
		const startOfDay = new Date(data.eventDate);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(data.eventDate);
		endOfDay.setHours(23, 59, 59, 999);

		// Check for conflicts within the same day
		const eventsOnDay = await db.query.events.findMany({
			where: and(gte(events.eventDate, startOfDay), lte(events.eventDate, endOfDay))
		});

		const newEventTime =
			Number(data.eventTime.split(':')[0]) * 60 + Number(data.eventTime.split(':')[1]);

		const hasConflict = eventsOnDay.some((event: any) => {
			const [h, m] = event.eventTime.split(':').map(Number);
			const eventMinutes = h * 60 + m;
			// Rule: no two events within 60 minutes of each other
			return Math.abs(eventMinutes - newEventTime) < 60;
		});

		if (hasConflict) {
			throw AppError.conflict("Un événement existe déjà à moins d'une heure d'intervalle.");
		}

		return (await db.transaction(async (tx: any) => {
			const [newEvent] = await tx
				.insert(events)
				.values({
					eventDate: startOfDay,
					eventTime: data.eventTime
				})
				.returning();

			const matchValues = data.matches.map((match) => ({
				eventId: newEvent.id,
				courtNumber: match.courtNumber,
				team1Id: match.team1Id,
				team2Id: match.team2Id,
				status: match.status || 'ONGOING',
				scoreTeam1: match.scoreTeam1,
				scoreTeam2: match.scoreTeam2
			}));

			if (matchValues.length > 0) {
				await tx.insert(matches).values(matchValues);
			}

			return await tx.query.events.findFirst({
				where: eq(events.id, newEvent.id),
				with: {
					matches: {
						with: {
							team1: { with: { player1: true, player2: true } },
							team2: { with: { player1: true, player2: true } }
						}
					}
				}
			});
		})) as EventWithRelations;
	}

	/**
	 * Updates an existing event and refreshes its matches list.
	 * Re-evaluates scheduling conflicts.
	 */
	async update(
		id: number,
		data: { eventDate: Date; eventTime: string; matches: any[] }
	): Promise<EventWithRelations> {
		const startOfDay = new Date(data.eventDate);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(data.eventDate);
		endOfDay.setHours(23, 59, 59, 999);

		const eventsOnDay = await db.query.events.findMany({
			where: and(
				gte(events.eventDate, startOfDay),
				lte(events.eventDate, endOfDay),
				ne(events.id, id)
			)
		});

		const newEventTime =
			Number(data.eventTime.split(':')[0]) * 60 + Number(data.eventTime.split(':')[1]);

		const hasConflict = eventsOnDay.some((event: any) => {
			const [h, m] = event.eventTime.split(':').map(Number);
			const eventMinutes = h * 60 + m;
			return Math.abs(eventMinutes - newEventTime) < 60;
		});

		if (hasConflict) {
			throw AppError.conflict("Un événement existe déjà à moins d'une heure d'intervalle.");
		}

		return (await db.transaction(async (tx: any) => {
			// Simple approach: delete all current matches and re-insert the new list
			await tx.delete(matches).where(eq(matches.eventId, id));

			await tx
				.update(events)
				.set({
					eventDate: data.eventDate,
					eventTime: data.eventTime
				})
				.where(eq(events.id, id));

			const matchValues = data.matches.map((match) => ({
				eventId: id,
				courtNumber: match.courtNumber,
				team1Id: match.team1Id,
				team2Id: match.team2Id,
				status: match.status || 'ONGOING',
				scoreTeam1: match.scoreTeam1,
				scoreTeam2: match.scoreTeam2
			}));

			if (matchValues.length > 0) {
				await tx.insert(matches).values(matchValues);
			}

			return await tx.query.events.findFirst({
				where: eq(events.id, id),
				with: {
					matches: {
						with: {
							team1: { with: { player1: true, player2: true } },
							team2: { with: { player1: true, player2: true } }
						}
					}
				}
			});
		})) as EventWithRelations;
	}

	/**
	 * Deletes an event by ID. Cascade delete on matches is handled by the database schema.
	 */
	async delete(id: number): Promise<void> {
		await this.getById(id);
		await db.delete(events).where(eq(events.id, id));
	}
}

export const eventService = new EventService();
