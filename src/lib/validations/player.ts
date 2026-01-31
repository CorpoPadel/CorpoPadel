import { z } from 'zod';
import { requiredErrorMap } from './utils';

/** Schema for player creation and personal data validation */
export const playerSchema = z.object({
	firstName: z
		.string({
			error: requiredErrorMap(
				'Le prénom est requis',
				'Le prénom doit être une chaîne de caractères'
			)
		})
		.min(2, 'Le prénom doit contenir au moins 2 caractères')
		.max(50, 'Le prénom ne doit pas dépasser 50 caractères')
		.regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le prénom ne doit contenir que des lettres, espaces et tirets'),
	lastName: z
		.string({
			error: requiredErrorMap('Le nom est requis', 'Le nom doit être une chaîne de caractères')
		})
		.min(2, 'Le nom doit contenir au moins 2 caractères')
		.max(50, 'Le nom ne doit pas dépasser 50 caractères')
		.regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le nom ne doit contenir que des lettres, espaces et tirets'),
	email: z.email("L'adresse email n'est pas valide"),
	company: z
		.string({
			error: requiredErrorMap(
				"L'entreprise est requise",
				"L'entreprise doit être une chaîne de caractères"
			)
		})
		.min(2, "L'entreprise doit contenir au moins 2 caractères")
		.max(100, "L'entreprise ne doit pas dépasser 100 caractères"),
	licenseNumber: z
		.string({
			error: requiredErrorMap(
				'Le numéro de licence est requis',
				'Le numéro de licence doit être une chaîne de caractères'
			)
		})
		.regex(/^L\d{6}$/, 'Le numéro de licence doit être au format LXXXXXX (L suivi de 6 chiffres)')
});

export const createPlayerSchema = playerSchema;
export const updatePlayerSchema = playerSchema.partial();

export type PlayerInput = z.infer<typeof playerSchema>;
