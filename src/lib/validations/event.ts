import { z } from 'zod';
import { requiredErrorMap } from './utils';

/** Schema for match input within an event creation/update flow */
export const createMatchInputSchema = z
	.object({
		courtNumber: z.coerce
			.number({
				error: requiredErrorMap(
					'Le numéro de piste est requis',
					'Le numéro de piste doit être un nombre'
				) as any
			})
			.int()
			.min(1, 'Le numéro de piste doit être au moins 1')
			.max(10, 'Le numéro de piste ne peut pas dépasser 10'),
		team1Id: z.coerce
			.number({ error: requiredErrorMap("L'équipe 1 est requise", 'ID équipe 1 invalide') as any })
			.int()
			.positive("L'équipe 1 est requise"),
		team2Id: z.coerce
			.number({ error: requiredErrorMap("L'équipe 2 est requise", 'ID équipe 2 invalide') as any })
			.int()
			.positive("L'équipe 2 est requise"),
		status: z
			.enum(['ONGOING', 'CANCELED', 'COMPLETED'], {
				error: requiredErrorMap('Statut requis', 'Statut invalide') as any
			})
			.default('ONGOING'),
		scoreTeam1: z.string().nullable().optional(),
		scoreTeam2: z.string().nullable().optional()
	})
	.refine((data) => data.team1Id !== data.team2Id, {
		message: 'Les deux équipes doivent être différentes',
		path: ['team2Id']
	})
	.refine(
		(data) => {
			// Require scores only if the match is marked as completed
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

/** Common base for event validation */
const eventBaseSchema = z.object({
	eventDate: z.coerce.date({
		error: requiredErrorMap('La date est requise', 'Date invalide') as any
	}),
	eventTime: z
		.string({ error: requiredErrorMap("L'heure est requise", "Format d'heure invalide") as any })
		.regex(
			/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
			"L'heure doit être au format HH:MM ou HH:MM:SS"
		),
	matches: z
		.array(createMatchInputSchema)
		.min(1, 'Au moins un match est requis')
		.max(3, 'Maximum 3 matchs par événement')
		.refine(
			(matches) => {
				// Ensure court uniqueness within the same time slot
				const courtNumbers = matches.map((m) => m.courtNumber);
				const uniqueCourts = new Set(courtNumbers);
				return courtNumbers.length === uniqueCourts.size;
			},
			{
				message: 'Chaque match doit avoir un numéro de piste unique',
				path: ['matches']
			}
		)
});

/** Schema for creating a new event, includes past date check */
export const createEventSchema = eventBaseSchema
	.transform((data) => ({
		eventDate: data.eventDate,
		eventTime: data.eventTime,
		matches: data.matches
	}))
	.refine(
		(data) => {
			// Allow past dates only if all matches are already completed
			if (data.matches.every((m) => m.status === 'COMPLETED')) return true;

			const [hours, minutes] = data.eventTime.split(':').map(Number);
			const eventDateTime = new Date(data.eventDate);
			eventDateTime.setHours(hours, minutes, 0, 0);

			// Allow a small buffer (10 mins) for clock synchronization
			return eventDateTime >= new Date(Date.now() - 600000);
		},
		{
			message: "L'événement ne peut pas être dans le passé",
			path: ['eventTime']
		}
	);

/** Schema for updating an existing event */
export const updateEventSchema = eventBaseSchema
	.extend({
		id: z.coerce.number().int().positive().optional()
	})
	.transform((data) => ({
		id: data.id,
		eventDate: data.eventDate,
		eventTime: data.eventTime,
		matches: data.matches
	}));

export type CreateEventInput = z.input<typeof createEventSchema>;
export type UpdateEventInput = z.input<typeof updateEventSchema>;
export type CreateMatchInput = z.infer<typeof createMatchInputSchema>;

/** Placeholder for business logic checking if an event is still editable */
export function isEventEditable(event: { matches: { status: string }[] }): boolean {
	return true;
}
