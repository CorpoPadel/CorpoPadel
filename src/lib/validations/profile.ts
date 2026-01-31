import { z } from 'zod';
import { requiredErrorMap } from './utils';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/** Schema for personal profile updates, including birth date age requirement and photo validation */
export const updateProfileSchema = z.object({
	firstName: z
		.string({
			error: requiredErrorMap(
				'Le prénom est requis',
				'Le prénom doit être une chaîne de caractères'
			)
		})
		.min(2, 'Le prénom doit contenir au moins 2 caractères')
		.max(50, 'Le prénom ne peut pas dépasser 50 caractères')
		.regex(
			/^[a-zA-ZÀ-ÿ\s'-]+$/,
			'Le prénom ne doit contenir que des lettres, espaces, tirets et apostrophes'
		),
	lastName: z
		.string({
			error: requiredErrorMap('Le nom est requis', 'Le nom doit être une chaîne de caractères')
		})
		.min(2, 'Le nom doit contenir au moins 2 caractères')
		.max(50, 'Le nom ne peut pas dépasser 50 caractères')
		.regex(
			/^[a-zA-ZÀ-ÿ\s'-]+$/,
			'Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes'
		),
	email: z.email("Format d'email invalide"),
	birthDate: z.coerce
		.date({
			error: requiredErrorMap(
				'La date de naissance est requise',
				'La date de naissance doit être une date valide'
			)
		})
		.refine((date) => !isNaN(date.getTime()), {
			message: 'La date de naissance doit être une date valide'
		})
		.pipe(
			z
				.date()

				.min(new Date('1900-01-01'), 'La date est invalide (trop ancienne)')
				.max(new Date(), 'La date de naissance ne peut pas être dans le futur')
		)
		.refine((date) => {
			// Require at least 16 years old
			const ageDifMs = Date.now() - date.getTime();
			const ageDate = new Date(ageDifMs);
			return Math.abs(ageDate.getUTCFullYear() - 1970) >= 16;
		}, 'Vous devez avoir au moins 16 ans')
		.optional()
		.nullable(),
	photo: z
		.any()
		.optional()
		.refine(
			(file) => !file || file.size <= MAX_FILE_SIZE,
			`La taille de l'image ne doit pas dépasser 2MB.`
		)
		.refine(
			(file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
			'Seuls les formats .jpg, .jpeg, .png et .webp sont acceptés.'
		)
});
