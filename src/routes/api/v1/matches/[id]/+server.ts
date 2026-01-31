import { matchService } from '$lib/server/services/match.service';
import { eventService } from '$lib/server/services/event.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';
import { matchFormSchema } from '$lib/validations/match';

/**
 * @openapi
 * /api/v1/matches/{id}:
 *   get:
 *     summary: Récupérer un match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du match
 *     responses:
 *       200:
 *         description: Détails du match
 *       404:
 *         description: Match non trouvé
 *   put:
 *     summary: Mettre à jour un match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               courtNumber:
 *                 type: integer
 *               team1Id:
 *                 type: integer
 *               team2Id:
 *                 type: integer
 *               status:
 *                 type: string
 *               scoreTeam1:
 *                 type: string
 *               scoreTeam2:
 *                 type: string
 *     responses:
 *       200:
 *         description: Match mis à jour
 *       403:
 *         description: Accès refusé
 *   delete:
 *     summary: Supprimer un match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Match supprimé
 *       403:
 *         description: Accès refusé
 */
export const GET: RequestHandler = async ({ params }) => {
	return apiHandler(async () => {
		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		// Fetch specific match details
		const match = await matchService.getById(id);
		return match;
	});
};

/**
 * Updates a match. Handles rescheduling which might involve moving the match
 * to a different event container (time-slot) or creating a new one.
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_MATCHES'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		const currentMatch = await matchService.getById(id);
		const body = await request.json();
		const validated = matchFormSchema.parse(body);

		// Check if an event already exists for the target date/time
		const targetEventId = (await eventService.checkDuplicate(validated.date, validated.time))?.id;

		if (targetEventId && targetEventId !== currentMatch.eventId) {
			// Scenario: Rescheduling to an existing different event slot
			const targetEvent = await eventService.getById(targetEventId);
			if (targetEvent.matches.length >= 3) {
				throw AppError.badRequest('Ce créneau est complet (3 matchs maximum)');
			}

			const courtTaken = targetEvent.matches.some((m) => m.courtNumber === validated.courtNumber);
			if (courtTaken) {
				throw AppError.badRequest(
					`Le terrain ${validated.courtNumber} est déjà pris sur ce créneau`
				);
			}

			const teamPlaying = targetEvent.matches.some(
				(m: any) =>
					m.team1Id === validated.team1Id ||
					m.team2Id === validated.team1Id ||
					m.team1Id === validated.team2Id ||
					m.team2Id === validated.team2Id
			);
			if (teamPlaying) {
				throw AppError.badRequest('Une des équipes joue déjà sur ce créneau');
			}

			await matchService.update(id, {
				eventId: targetEventId,
				courtNumber: validated.courtNumber,
				team1Id: validated.team1Id,
				team2Id: validated.team2Id,
				status: validated.status,
				scoreTeam1: validated.scoreTeam1,
				scoreTeam2: validated.scoreTeam2
			});

			// Cleanup: if old event slot is now empty, delete it
			const oldEvent = await eventService.getById(currentMatch.eventId);
			if (oldEvent.matches.length === 0) {
				await eventService.delete(currentMatch.eventId);
			}
		} else if (!targetEventId) {
			// Scenario: Rescheduling to a new time slot (must create event container)
			const newEvent = await eventService.create({
				eventDate: validated.date,
				eventTime: validated.time,
				matches: []
			});

			await matchService.update(id, {
				eventId: newEvent!.id,
				courtNumber: validated.courtNumber,
				team1Id: validated.team1Id,
				team2Id: validated.team2Id,
				status: validated.status,
				scoreTeam1: validated.scoreTeam1,
				scoreTeam2: validated.scoreTeam2
			});

			const oldEvent = await eventService.getById(currentMatch.eventId);
			if (oldEvent.matches.length === 0) {
				await eventService.delete(currentMatch.eventId);
			}
		} else {
			// Scenario: Simple field update within the same event slot
			await matchService.update(id, {
				courtNumber: validated.courtNumber,
				team1Id: validated.team1Id,
				team2Id: validated.team2Id,
				status: validated.status,
				scoreTeam1: validated.scoreTeam1,
				scoreTeam2: validated.scoreTeam2
			});
		}

		return null;
	});
};

/**
 * Deletes a match and performs cleanup of its parent event container if it becomes empty.
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_MATCHES'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		const match = await matchService.getById(id);
		const eventId = match.eventId;

		await matchService.delete(id);

		// Remove event slot if no matches remain
		const event = await eventService.getById(eventId);
		if (event.matches.length === 0) {
			await eventService.delete(eventId);
		}

		return null;
	});
};
