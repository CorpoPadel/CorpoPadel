import { z } from 'zod';
import { requiredErrorMap } from './utils';

/** Schema for tournament pool validation */
export const poolSchema = z.object({
	name: z
		.string({
			error: requiredErrorMap(
				'Le nom de la poule est requis',
				'Le nom doit être une chaîne de caractères'
			)
		})
		.min(2, 'Le nom de la poule doit contenir au moins 2 caractères'),
	team_ids: z
		.array(z.number().int().positive())
		.length(6, 'Une poule doit être composée exactement de 6 équipes.')
});

export const createPoolSchema = poolSchema;

export const updatePoolSchema = poolSchema.extend({
	id: z.number().int().positive().optional()
});

export type PoolInput = z.infer<typeof poolSchema>;
