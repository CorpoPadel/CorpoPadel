import { eventService } from '$lib/server/services/event.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import { createEventSchema } from '$lib/validations/event';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/events:
 *   get:
 *     summary: Récupérer les événements
 *     description: Récupère la liste des événements sur une période donnée
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}$'
 *         description: Mois spécifique (YYYY-MM)
 *     responses:
 *       200:
 *         description: Liste des événements
 *       400:
 *         description: Paramètres manquants ou invalides
 *   post:
 *     summary: Créer un événement
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventDate, eventTime]
 *             properties:
 *               eventDate:
 *                 type: string
 *                 format: date
 *               eventTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Événement créé
 *       403:
 *         description: Accès refusé
 */
export const GET: RequestHandler = async ({ url }) => {
	return apiHandler(async () => {
		const startStr = url.searchParams.get('start');
		const endStr = url.searchParams.get('end');
		const monthStr = url.searchParams.get('month');

		let startDate: Date;
		let endDate: Date;

		// Parse date criteria: priority to month parameter
		if (monthStr) {
			const [year, month] = monthStr.split('-').map(Number);
			startDate = new Date(year, month - 1, 1);
			endDate = new Date(year, month, 0, 23, 59, 59, 999);
		} else if (startStr && endStr) {
			startDate = new Date(startStr);
			endDate = new Date(endStr);
		} else {
			throw AppError.badRequest('Paramètres start/end ou month requis');
		}

		return await eventService.getByDateRange(startDate, endDate);
	});
};

/**
 * Creates a new event time-slot with its associated matches.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	return apiHandler(async () => {
		// Guard access
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_EVENTS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const body = await request.json();
		const validated = createEventSchema.parse(body);

		return await eventService.create(validated);
	});
};
