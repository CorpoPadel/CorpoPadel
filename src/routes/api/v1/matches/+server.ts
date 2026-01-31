import { matchService } from '$lib/server/services/match.service';
import { eventService } from '$lib/server/services/event.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { matchFormSchema } from '$lib/validations/match';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/matches:
 *   get:
 *     summary: Récupérer la liste des matchs
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filtrer les matchs à venir
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: integer
 *         description: Filtrer par équipe
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ONGOING, COMPLETED, CANCELED]
 *         description: Filtrer par statut
 *       - in: query
 *         name: my_matches
 *         schema:
 *           type: boolean
 *         description: Filtrer les matchs de l'utilisateur connecté
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filtrer par entreprise
 *       - in: query
 *         name: pool_id
 *         schema:
 *           type: integer
 *         description: Filtrer par poule
 *     responses:
 *       200:
 *         description: Liste des matchs
 *   post:
 *     summary: Créer un match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, time, courtNumber, team1Id, team2Id]
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
 *                 enum: [ONGOING, COMPLETED, CANCELED]
 *               scoreTeam1:
 *                 type: string
 *               scoreTeam2:
 *                 type: string
 *     responses:
 *       200:
 *         description: Match créé
 *       400:
 *         description: Erreur de validation ou conflit
 *       403:
 *         description: Accès refusé
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	return apiHandler(async () => {
		const upcoming = url.searchParams.get('upcoming') === 'true';
		const teamIdParam = url.searchParams.get('team_id');
		const statusParam = url.searchParams.get('status');
		const myMatches = url.searchParams.get('my_matches') === 'true';
		const company = url.searchParams.get('company');
		const poolIdParam = url.searchParams.get('pool_id');

		const userId = myMatches ? locals.user?.id : undefined;
		const teamId = teamIdParam ? parseInt(teamIdParam) : undefined;
		const status = statusParam || undefined;
		const poolId = poolIdParam ? parseInt(poolIdParam) : undefined;

		const matches = await matchService.getFiltered({
			userId,
			teamId,
			status,
			upcoming,
			company,
			poolId
		});

		return {
			matches,
			total: matches.length
		};
	});
};

/**
 * Handles match creation.
 * Logic: Checks if an event exists for the given date/time.
 * If yes, adds the match to the event (max 3). If no, creates a new event first.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	return apiHandler(async () => {
		// Authorization
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_MATCHES'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const body = await request.json();
		const validated = matchFormSchema.parse(body);

		// Check for an existing event slot
		let event = await eventService.checkDuplicate(validated.date, validated.time);

		if (event) {
			const fullEvent = await eventService.getById(event.id);
			if (!fullEvent) throw new AppError("État de l'événement incohérent", 500);

			// Enforce domain constraints: max 3 matches per event
			if (fullEvent.matches.length >= 3) {
				throw AppError.badRequest('Cet créneau est complet (3 matchs maximum)');
			}

			// Ensure the specific court is free
			const courtTaken = fullEvent.matches.some((m) => m.courtNumber === validated.courtNumber);
			if (courtTaken) {
				throw AppError.badRequest(
					`Le terrain ${validated.courtNumber} est déjà pris sur ce créneau`
				);
			}

			// Ensure participating teams aren't already playing in another match at the same time
			const teamPlaying = fullEvent.matches.some(
				(m: any) =>
					m.team1Id === validated.team1Id ||
					m.team2Id === validated.team1Id ||
					m.team1Id === validated.team2Id ||
					m.team2Id === validated.team2Id
			);
			if (teamPlaying) {
				throw AppError.badRequest('Une des équipes joue déjà sur ce créneau');
			}

			await matchService.create({
				eventId: event.id,
				courtNumber: validated.courtNumber,
				team1Id: validated.team1Id,
				team2Id: validated.team2Id,
				status: validated.status,
				scoreTeam1: validated.scoreTeam1,
				scoreTeam2: validated.scoreTeam2
			});
		} else {
			// Create a new event container if none exists for this time slot
			await eventService.create({
				eventDate: validated.date,
				eventTime: validated.time,
				matches: [
					{
						courtNumber: validated.courtNumber,
						team1Id: validated.team1Id,
						team2Id: validated.team2Id,
						status: validated.status,
						scoreTeam1: validated.scoreTeam1,
						scoreTeam2: validated.scoreTeam2
					}
				]
			});
		}

		return null;
	});
};
