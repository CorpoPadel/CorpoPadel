<script lang="ts">
	import FormError from '$lib/components/global/FormError.svelte';
	import { Button, buttonVariants } from '$lib/components/shadcn/ui/button/index.js';
	import * as Dialog from '$lib/components/shadcn/ui/dialog/index.js';
	import { Label } from '$lib/components/shadcn/ui/label/index.js';
	import type { Event } from '$lib/models/event';
	import type { Team } from '$lib/models/team';
	import {
		createEventSchema,
		updateEventSchema,
		type CreateEventInput,
		type UpdateEventInput
	} from '$lib/validations/event';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import { toast } from 'svelte-sonner';
	import { ZodError } from 'zod';
	import PlusIcon from '~icons/lucide/plus';
	import TrashIcon from '~icons/lucide/trash-2';
	import DatePicker from '../../date-picker/DatePicker.svelte';
	import TimePicker from '../../time-picker/TimePicker.svelte';
	import MatchInput from './MatchInput.svelte';
	import { validateMatchScore, type MatchScore } from '$lib/validations/score';

	let {
		teams,
		maxMatches = 3,
		onEventCreated,
		eventToEdit,
		open = $bindable(false)
	}: {
		teams: Team[];
		maxMatches?: number;
		onEventCreated?: () => void;
		eventToEdit?: Event;
		open?: boolean;
	} = $props();

	const date = new Date();

	function parseScore(scoreString: string | null) {
		const initialScores = {
			set1: { team1: '', team2: '' },
			set2: { team1: '', team2: '' },
			set3: { team1: '', team2: '' }
		};

		if (scoreString) {
			const sets = scoreString.split(',').map((s) => s.trim());
			if (sets[0]) {
				const [t1, t2] = sets[0].split('-');
				initialScores.set1.team1 = t1 || '';
				initialScores.set1.team2 = t2 || '';
			}
			if (sets[1]) {
				const [t1, t2] = sets[1].split('-');
				initialScores.set2.team1 = t1 || '';
				initialScores.set2.team2 = t2 || '';
			}
			if (sets[2]) {
				const [t1, t2] = sets[2].split('-');
				initialScores.set3.team1 = t1 || '';
				initialScores.set3.team2 = t2 || '';
			}
		}
		return initialScores;
	}

	function getInitialValues() {
		if (eventToEdit) {
			const eventDate = new Date(eventToEdit.eventDate);
			return {
				date: new CalendarDate(
					eventDate.getFullYear(),
					eventDate.getMonth() + 1,
					eventDate.getDate()
				),
				time: eventToEdit.eventTime,
				matches: eventToEdit.matches.map((m) => ({
					courtNumber: m.courtNumber.toString(),
					team1Id: m.team1.id.toString(),
					team2Id: m.team2.id.toString(),
					status: m.status,
					scores: parseScore(m.scoreTeam1 ?? null)
				}))
			};
		}
		return {
			date: new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
			time:
				date.getHours().toString().padStart(2, '0') +
				':' +
				date.getMinutes().toString().padStart(2, '0'),
			matches: [
				{
					courtNumber: '',
					team1Id: '-1',
					team2Id: '-1',
					status: 'ONGOING',
					scores: {
						set1: { team1: '', team2: '' },
						set2: { team1: '', team2: '' },
						set3: { team1: '', team2: '' }
					}
				}
			]
		};
	}

	let values = $state(getInitialValues());
	let localMatches = $state(getInitialValues().matches);

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	$effect(() => {
		if (open) {
			const init = getInitialValues();
			values = init;
			localMatches = init.matches;
			errors = {};
		}
	});

	function addMatch() {
		if (localMatches.length < maxMatches) {
			localMatches = [
				...localMatches,
				{
					courtNumber: '',
					team1Id: '-1',
					team2Id: '-1',
					status: 'ONGOING',
					scores: {
						set1: { team1: '', team2: '' },
						set2: { team1: '', team2: '' },
						set3: { team1: '', team2: '' }
					}
				}
			];
		}
	}

	function removeMatch(index: number) {
		if (localMatches.length > 1) {
			localMatches = localMatches.filter((_, i) => i !== index);

			const newErrors = { ...errors };
			Object.keys(newErrors).forEach((key) => {
				if (key.startsWith(`matches.${index}`)) {
					delete newErrors[key];
				}
			});
			errors = newErrors;
		}
	}

	async function handleSubmit(e: any) {
		e.preventDefault();
		errors = {};

		const formattedMatches = localMatches.map((match, index) => {
			let scoreTeam1: string | null = null;
			let scoreTeam2: string | null = null;

			if (match.status === 'COMPLETED' && match.scores) {
				const matchScore: MatchScore = {
					set1: {
						team1: match.scores.set1.team1 !== '' ? parseInt(match.scores.set1.team1) : null,
						team2: match.scores.set1.team2 !== '' ? parseInt(match.scores.set1.team2) : null
					},
					set2: {
						team1: match.scores.set2.team1 !== '' ? parseInt(match.scores.set2.team1) : null,
						team2: match.scores.set2.team2 !== '' ? parseInt(match.scores.set2.team2) : null
					},
					set3: {
						team1: match.scores.set3.team1 !== '' ? parseInt(match.scores.set3.team1) : null,
						team2: match.scores.set3.team2 !== '' ? parseInt(match.scores.set3.team2) : null
					}
				};

				const validation = validateMatchScore(matchScore);
				if (!validation.isValid) {
					throw new Error(`Match ${index + 1}: ${validation.error}`);
				}

				const setsT1 = [];
				const setsT2 = [];

				setsT1.push(`${matchScore.set1.team1}-${matchScore.set1.team2}`);
				setsT2.push(`${matchScore.set1.team2}-${matchScore.set1.team1}`);
				setsT1.push(`${matchScore.set2.team1}-${matchScore.set2.team2}`);
				setsT2.push(`${matchScore.set2.team2}-${matchScore.set2.team1}`);

				const w1 = (matchScore.set1.team1 ?? 0) > (matchScore.set1.team2 ?? 0) ? 1 : 2;
				const w2 = (matchScore.set2.team1 ?? 0) > (matchScore.set2.team2 ?? 0) ? 1 : 2;

				if (w1 !== w2) {
					setsT1.push(`${matchScore.set3.team1}-${matchScore.set3.team2}`);
					setsT2.push(`${matchScore.set3.team2}-${matchScore.set3.team1}`);
				}

				scoreTeam1 = setsT1.join(', ');
				scoreTeam2 = setsT2.join(', ');
			}

			return {
				courtNumber: parseInt(match.courtNumber),
				team1Id: parseInt(match.team1Id),
				team2Id: parseInt(match.team2Id),
				status: match.status as any,
				scoreTeam1,
				scoreTeam2
			};
		});

		isSubmitting = true;

		try {
			const eventDate = values.date.toDate('UTC');

			const formData: CreateEventInput | UpdateEventInput = eventToEdit
				? {
						id: eventToEdit.id,
						eventDate: eventDate,
						eventTime: values.time,
						matches: formattedMatches
					}
				: {
						eventDate: eventDate,
						eventTime: values.time,
						matches: formattedMatches
					};

			const validatedData = eventToEdit
				? updateEventSchema.parse(formData)
				: createEventSchema.parse(formData);

			const url = eventToEdit ? `/api/v1/events/${eventToEdit.id}` : '/api/v1/events';
			const method = eventToEdit ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(validatedData)
			});

			if (!response.ok) {
				const data = await response.json();

				if (data.code === 'DUPLICATE_EVENT') {
					toast.error('Événement déjà existant', {
						description: 'Un événement existe déjà à cette date et heure'
					});
					return;
				}

				if (data.issues) {
					const newErrors: Record<string, string> = {};
					data.issues.forEach((issue: any) => {
						const path = issue.path.join('.');
						newErrors[path] = issue.message;
					});
					errors = newErrors;
					toast.error('Erreur de validation', {
						description: 'Veuillez vérifier les champs du formulaire'
					});
					return;
				}
				throw new Error(data.error || data.message || 'Erreur lors de la sauvegarde');
			}

			toast.success(eventToEdit ? 'Événement modifié' : 'Événement créé');

			open = false;

			onEventCreated?.();
		} catch (err: any) {
			if (err instanceof ZodError) {
				const newErrors: Record<string, string> = {};
				const issues = err.issues || [];

				issues.forEach((error: any) => {
					const path = error.path.join('.');
					newErrors[path] = error.message;
				});
				errors = newErrors;
				toast.error('Erreur de validation', {
					description: 'Veuillez vérifier les champs du formulaire'
				});
			} else {
				toast.error('Erreur', {
					description: err.message || 'Une erreur est survenue'
				});
			}
		} finally {
			isSubmitting = false;
		}
	}

	// Remove problematic $effect that causes infinite loop
</script>

<Dialog.Root bind:open>
	{#if !eventToEdit}
		<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Ajouter un événement
		</Dialog.Trigger>
	{/if}
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-150">
		<form onsubmit={handleSubmit}>
			<Dialog.Header>
				<Dialog.Title>{eventToEdit ? "Modifier l'événement" : 'Nouvel événement'}</Dialog.Title>
				<Dialog.Description>
					{eventToEdit ? 'Modifiez' : 'Renseignez'} la date, l'heure et les matchs de l'événement.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-6 py-4">
				<div class="grid grid-cols-1 gap-4">
					<div class="grid gap-2">
						<Label for="event-date">Date</Label>
						<DatePicker bind:value={values.date} minValue={today(getLocalTimeZone())} />
						<FormError error={errors.eventDate} />
					</div>
					<div class="grid w-fit gap-2">
						<Label for="event-time">Heure</Label>
						<TimePicker bind:value={values.time} />
						<FormError error={errors.eventTime} />
					</div>
				</div>

				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<Label class="text-base">Matchs ({localMatches.length}/{maxMatches})</Label>
						{#if localMatches.length < maxMatches}
							<Button type="button" variant="outline" size="sm" onclick={addMatch}>
								<PlusIcon class="mr-2 h-4 w-4" />
								Ajouter un match
							</Button>
						{/if}
					</div>

					{#if errors.matches}
						<FormError error={errors.matches} class="mt-1" />
					{/if}

					<div class="space-y-3">
						{#each localMatches, index (index)}
							<div class="relative rounded-lg border bg-muted/50 p-4">
								<div class="mb-3 flex items-start justify-between">
									<span class="text-sm font-medium">Match {index + 1}</span>
									{#if localMatches.length > 1 && eventToEdit && localMatches[index].status === 'ONGOING'}
										<Button
											type="button"
											variant="ghost"
											size="icon"
											class="h-8 w-8 text-destructive"
											onclick={() => removeMatch(index)}
										>
											<TrashIcon class="h-4 w-4" />
										</Button>
									{/if}
								</div>
								<MatchInput id={index} {teams} bind:values={localMatches} date={values.date} />
								<FormError error={errors[`matches.${index}.courtNumber`]} class="mt-2" />
								<FormError error={errors[`matches.${index}.team1Id`]} class="mt-2" />
								<FormError error={errors[`matches.${index}.team2Id`]} class="mt-2" />
							</div>
						{/each}
					</div>
				</div>
			</div>
			<Dialog.Footer>
				<Dialog.Close class={buttonVariants({ variant: 'outline' })}>Annuler</Dialog.Close>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? 'Sauvegarde...'
						: eventToEdit
							? "Modifier l'événement"
							: "Créer l'événement"}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
