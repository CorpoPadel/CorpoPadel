import { matchService, type MatchWithRelations } from '$lib/server/services/match.service';
import { playerService } from '$lib/server/services/player.service';
import { statService } from '$lib/server/services/stat.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/results/my-results:
 *   get:
 *     summary: Récupérer mes résultats
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Résultats de l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 player:
 *                   $ref: '#/components/schemas/Player'
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       opponents:
 *                         type: object
 *                         properties:
 *                           company:
 *                             type: string
 *                           players:
 *                             type: array
 *                             items:
 *                               type: string
 *                       result:
 *                         type: string
 *                         enum: [VICTOIRE, DEFAITE]
 *                       score:
 *                         type: string
 *                       courtNumber:
 *                         type: number
 */
export const GET: RequestHandler = async ({ locals }) => {
	return apiHandler(async () => {
		// Authorization
		if (!locals.user) throw AppError.unauthorized();

		const userId = locals.user.id;
		const player = await playerService.getByUserId(userId);
		if (!player) throw AppError.notFound('Profil joueur introuvable');

		// Fetch completed matches involving the current user
		const matches = await matchService.getFiltered({ userId, status: 'COMPLETED' });

		// Transform matches for the frontend PersonalResults component
		const transformedMatches = matches.map((match: MatchWithRelations) => {
			const isTeam1 =
				match.team1.player1.userId === userId || match.team1.player2.userId === userId;
			const opponents = isTeam1 ? match.team2 : match.team1;

			// Parse scores to determine result
			const [sets1, sets2] = statService.parseMatchScore(match.scoreTeam1);
			const mySets = isTeam1 ? sets1 : sets2;
			const opponentSets = isTeam1 ? sets2 : sets1;

			return {
				date: match.event.eventDate,
				opponents: {
					company: opponents.company,
					players: [
						`${opponents.player1.firstName} ${opponents.player1.lastName}`,
						`${opponents.player2.firstName} ${opponents.player2.lastName}`
					]
				},
				result: mySets > opponentSets ? 'VICTOIRE' : 'DEFAITE',
				score: `${mySets} - ${opponentSets}`,
				sets: mySets > opponentSets ? match.scoreTeam1 : match.scoreTeam2,
				courtNumber: match.courtNumber
			};
		});

		return {
			player,
			matches: transformedMatches
		};
	});
};
