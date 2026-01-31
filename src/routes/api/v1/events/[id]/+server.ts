import { eventService } from '$lib/server/services/event.service';
import { hasPrivilege } from '$lib/server/services/permission.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import { updateEventSchema } from '$lib/validations/event';
import type { RequestHandler } from './$types';

/**
 * @openapi
 * /api/v1/events/{id}:
 *   get:
 *     summary: Récupérer un événement
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Détails de l'événement
 *       404:
 *         description: Événement non trouvé
 *   put:
 *     summary: Mettre à jour un événement
 *     tags: [Events]
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
 *               eventDate:
 *                 type: string
 *                 format: date
 *               eventTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Événement mis à jour
 *       403:
 *         description: Accès refusé
 *   delete:
 *     summary: Supprimer un événement
 *     tags: [Events]
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
 *         description: Événement supprimé
 *       403:
 *         description: Accès refusé
 */
export const GET: RequestHandler = async ({ params }) => {
	return apiHandler(async () => {
		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		return await eventService.getById(id);
	});
};

/**
 * Removes an entire event time-slot and its associated matches.
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_EVENTS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		await eventService.delete(id);
		return null;
	});
};

/**
 * Updates event scheduling details and associated matches list.
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	return apiHandler(async () => {
		// Authorization guard
		if (!(await hasPrivilege(locals.user?.id as string, 'MANAGE_EVENTS'))) {
			throw AppError.forbidden("Accès refusé : vous n'avez pas les permissions nécessaires.");
		}

		const id = parseInt(params.id as string);
		if (isNaN(id)) throw AppError.badRequest('ID invalide');

		const body = await request.json();
		const validated = updateEventSchema.parse({ ...body, id });

		return await eventService.update(id, validated);
	});
};
