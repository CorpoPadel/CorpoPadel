import { playerService } from '$lib/server/services/player.service';
import { apiHandler } from '$lib/server/utils/response';
import { AppError } from '$lib/server/utils/error';
import type { RequestHandler } from './$types';
import sharp from 'sharp';
import { put, del } from '@vercel/blob';
import fs from 'node:fs/promises';
import path from 'node:path';
import { dev } from '$app/environment';

/**
 * @openapi
 * /api/v1/profile/me/photo:
 *   post:
 *     summary: Uploader une photo de profil
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploadée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 photo_url:
 *                   type: string
 *       400:
 *         description: Fichier invalide ou trop volumineux
 *       401:
 *         description: Non authentifié
 *   delete:
 *     summary: Supprimer la photo de profil
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Photo supprimée
 *       401:
 *         description: Non authentifié
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	return apiHandler(async () => {
		if (!locals.user) throw AppError.unauthorized();

		const formData = await request.formData();
		const file = formData.get('photo') as File;

		// Validation
		if (!file || file.size === 0) throw AppError.badRequest('Aucun fichier téléchargé');
		if (file.size > 5 * 1024 * 1024) throw AppError.badRequest('Fichier trop volumineux (max 5Mo)');

		const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
		if (!allowedTypes.includes(file.type)) throw AppError.badRequest('Type de fichier invalide');

		const player = await playerService.getByUserId(locals.user.id);
		if (!player) throw AppError.notFound('Profil joueur introuvable');

		// Image processing with Sharp: resize and convert to WebP
		const buffer = Buffer.from(await file.arrayBuffer());
		const optimizedBuffer = await sharp(buffer)
			.resize({ width: 400, height: 400, fit: 'cover' })
			.webp({ quality: 80 })
			.toBuffer();

		// Cleanup old photo
		if (player.photoUrl) {
			if (player.photoUrl.startsWith('http')) {
				await del(player.photoUrl).catch((e) => console.error('Blob delete error', e));
			} else if (player.photoUrl.startsWith('/')) {
				try {
					if (dev) {
						await fs.unlink(path.join('static', player.photoUrl));
					}
				} catch (e) {}
			}
		}

		let finalUrl = '';

		// Persistent storage handling (Local for Dev, Vercel Blob for Prod)
		if (dev) {
			const uploadDir = 'static/uploads/avatars';
			await fs.mkdir(uploadDir, { recursive: true });

			const fileName = `${locals.user.id}-${Date.now()}.webp`;
			const filePath = path.join(uploadDir, fileName);

			await fs.writeFile(filePath, optimizedBuffer);
			finalUrl = `/uploads/avatars/${fileName}`;
		} else {
			const fileName = `avatars/${locals.user.id}-${Date.now()}.webp`;

			const { url } = await put(fileName, optimizedBuffer, {
				access: 'public',
				contentType: 'image/webp'
			});

			finalUrl = url;
		}

		await playerService.update(player.id, { photoUrl: finalUrl });

		return { photo_url: finalUrl };
	});
};

/**
 * Removes the profile photo from storage and database.
 */
export const DELETE: RequestHandler = async ({ locals }) => {
	return apiHandler(async () => {
		if (!locals.user) throw AppError.unauthorized();

		const player = await playerService.getByUserId(locals.user.id);
		if (!player) throw AppError.notFound('Profil joueur introuvable');

		// Remove file from storage
		if (player.photoUrl) {
			if (player.photoUrl.startsWith('http')) {
				await del(player.photoUrl).catch((e) => console.error(e));
			} else {
				if (dev) {
					try {
						await fs.unlink(path.join('static', player.photoUrl));
					} catch (e) {
						console.error('Fichier local introuvable');
					}
				}
			}
		}

		// Reset database reference
		await playerService.update(player.id, { photoUrl: null });

		return null;
	});
};
