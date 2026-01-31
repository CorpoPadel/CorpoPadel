import { z } from 'zod';
import { requiredErrorMap } from './utils';

/** Schema for allowable match status values */
export const matchStatusSchema = z.enum(['ONGOING', 'CANCELED', 'COMPLETED'], {
	error: requiredErrorMap('Le statut est requis', 'Statut invalide')
});

/** Schema for standalone match form validation */
export const matchFormSchema = z
	.object({
		date: z.coerce.date({ error: requiredErrorMap('La date est requise', 'Date invalide') }),
		time: z
			.string({ error: requiredErrorMap("L'heure est requise", "Format d'heure invalide") })
			.regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, "L'heure doit être au format HH:MM"),
		courtNumber: z.coerce
			.number({
				error: requiredErrorMap('Le numéro de piste est requis', 'Numéro de piste invalide')
			})
			.int()
			.min(1, 'Le numéro de piste doit être au moins 1')
			.max(10, 'Le numéro de piste ne peut pas dépasser 10'),
		team1Id: z.coerce
			.number({ error: requiredErrorMap("L'équipe 1 est requise", 'ID équipe 1 invalide') })
			.positive("L'équipe 1 est requise"),
		team2Id: z.coerce
			.number({ error: requiredErrorMap("L'équipe 2 est requise", 'ID équipe 2 invalide') })
			.positive("L'équipe 2 est requise"),
		status: matchStatusSchema.default('ONGOING'),
		scoreTeam1: z.string().nullable().optional(),
		scoreTeam2: z.string().nullable().optional()
	})
	.refine((data) => data.team1Id !== data.team2Id, {
		message: 'Les deux équipes doivent être différentes',
		path: ['team2Id']
	})
	.refine(
		(data) => {
			// Require sets results if match is completed
			if (data.status === 'COMPLETED') {
				return !!data.scoreTeam1 && !!data.scoreTeam2;
			}
			return true;
		},
		{
			message: 'Le score est requis pour un match terminé',
			path: ['status']
		}
	);

/** Schema for updating only the score of a match */
export const patchScoreSchema = z.object({
	scoreTeam1: z
		.string({
			error: requiredErrorMap('Score équipe 1 requis', 'Score équipe 1 doit être une chaîne')
		})
		.min(1, 'Score équipe 1 requis'),
	scoreTeam2: z
		.string({
			error: requiredErrorMap('Score équipe 2 requis', 'Score équipe 2 doit être une chaîne')
		})
		.min(1, 'Score équipe 2 requis'),
	status: z.literal('COMPLETED', {
		error: requiredErrorMap('Le statut doit être COMPLETED', 'Le statut doit être COMPLETED')
	})
});

export type MatchFormInput = z.infer<typeof matchFormSchema>;
export type PatchScoreInput = z.infer<typeof patchScoreSchema>;
