import { z } from 'zod';
import { requiredErrorMap } from './utils';

const baseTeamSchema = z.object({
	company: z
		.string({
			error: requiredErrorMap("Le nom de l'entreprise est requis", 'Le nom doit être une chaîne')
		})
		.min(2, "Le nom de l'entreprise doit faire au moins 2 caractères"),
	player1Id: z
		.number({ error: requiredErrorMap('Le joueur 1 est requis', 'ID joueur 1 invalide') })
		.int()
		.positive('Le joueur 1 est requis'),
	player2Id: z
		.number({ error: requiredErrorMap('Le joueur 2 est requis', 'ID joueur 2 invalide') })
		.int()
		.positive('Le joueur 2 est requis'),
	poolId: z.number().int().positive().optional().nullable()
});

export const createTeamSchema = baseTeamSchema.refine((data) => data.player1Id !== data.player2Id, {
	message: 'Les deux joueurs doivent être différents',
	path: ['player2Id']
});

export const updateTeamSchema = baseTeamSchema
	.partial()
	.extend({
		id: z.number().int().positive().optional()
	})
	.refine(
		(data) => {
			if (data.player1Id && data.player2Id) {
				return data.player1Id !== data.player2Id;
			}
			return true;
		},
		{
			message: 'Les deux joueurs doivent être différents',
			path: ['player2Id']
		}
	);

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
