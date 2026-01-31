import { z } from 'zod';
import { requiredErrorMap } from './utils';

/** Schema for creating a new user account linked to a player */
export const createAccountSchema = z.object({
	playerId: z
		.number({ error: requiredErrorMap('ID joueur requis', 'ID joueur invalide') as any })
		.int()
		.positive()
});

const roles = ['ADMINISTRATEUR', 'JOUEUR'] as const;

/** Schema for updating a user's role with value restriction */
export const updateRoleSchema = z.object({
	role: z
		.string({ error: requiredErrorMap('Le rôle est requis', 'Rôle invalide') as any })
		.refine((val): val is (typeof roles)[number] => roles.includes(val as any), {
			message: 'Rôle invalide'
		})
});

/** Schema for administrative password reset request */
export const resetPasswordSchema = z.object({
	userId: z
		.string({ error: requiredErrorMap('ID utilisateur requis', 'ID utilisateur invalide') as any })
		.min(1, 'ID utilisateur requis')
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
