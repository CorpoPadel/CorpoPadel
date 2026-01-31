import { z } from 'zod';
import { requiredErrorMap } from './utils';

/**
 * Reusable password schema with complexity requirements:
 * Min 12 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char.
 */
export const passwordSchema = z
	.string({
		error: requiredErrorMap(
			'Le mot de passe est requis',
			'Le mot de passe doit être une chaîne de caractères'
		) as any
	})
	.min(12, 'Le mot de passe doit contenir au moins 12 caractères')
	.regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
	.regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
	.regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
	.regex(/[\W_]/, 'Le mot de passe doit contenir au moins un caractère spécial');

/** Schema for user login */
export const loginSchema = z.object({
	email: z.email("L'email n'est pas valide"),
	password: z
		.string({
			error: requiredErrorMap(
				'Mot de passe requis',
				'Le mot de passe doit être une chaîne de caractères'
			) as any
		})
		.min(12, 'Le mot de passe doit contenir au moins 12 caractères')
		.regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
		.regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
		.regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
		.regex(/[\W_]/, 'Le mot de passe doit contenir au moins un caractère spécial')
});

/** Schema for password change request with confirmation and diff check */
export const changePasswordSchema = z
	.object({
		currentPassword: z
			.string({
				error: requiredErrorMap(
					'Le mot de passe actuel est requis',
					'Le mot de passe doit être une chaîne de caractères'
				) as any
			})
			.min(1, 'Le mot de passe actuel est requis'),
		newPassword: passwordSchema,
		confirmPassword: z
			.string({
				error: requiredErrorMap(
					'La confirmation est requise',
					'La confirmation doit être une chaîne de caractères'
				) as any
			})
			.min(1, 'La confirmation est requise')
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword']
	})
	.refine((data) => data.newPassword !== data.currentPassword, {
		message: "Le nouveau mot de passe doit être différent de l'ancien",
		path: ['newPassword']
	});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
