<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/shadcn/ui/button';
	import DatePicker from '$lib/components/global/date-picker/DatePicker.svelte';
	import TimePicker from '$lib/components/global/time-picker/TimePicker.svelte';
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { Label } from '$lib/components/shadcn/ui/label';
	import MatchInput from '$lib/components/global/domain/planning/MatchInput.svelte';
	import FormError from '$lib/components/global/FormError.svelte';
	import type { Team } from '$lib/models/team';
	import type { Match } from '$lib/models/match';
	import PlusIcon from '~icons/lucide/plus';
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import { matchFormSchema, type MatchFormInput } from '$lib/validations/match';
	import { toast } from 'svelte-sonner';
	import { ZodError } from 'zod';
	import * as Select from '$lib/components/shadcn/ui/select';
	import { watch } from 'runed';
	import { untrack } from 'svelte';
	import type { Event } from '$lib/models/event';
	import * as InputOTP from '$lib/components/shadcn/ui/input-otp';
	import { Checkbox } from '$lib/components/shadcn/ui/checkbox';
	import { validateMatchScore, type MatchScore } from '$lib/validations/score';

	let {
		teams,
		onMatchSaved,
		matchToEdit,
		open = $bindable(false)
	}: {
		teams: Team[];
		onMatchSaved?: () => void;
		matchToEdit?: Match;
		open?: boolean;
	} = $props();

	const date = new Date();

	function getInitialValues() {
		if (matchToEdit && matchToEdit.event) {
			const eventDate = new Date(matchToEdit.event.eventDate);

			const initialScores = {
				set1: { team1: '', team2: '' },
				set2: { team1: '', team2: '' },
				set3: { team1: '', team2: '' }
			};

			if (matchToEdit.status === 'COMPLETED' && matchToEdit.scoreTeam1) {
				const sets = matchToEdit.scoreTeam1.split(',').map((s) => s.trim());
				if (sets[0]) {
					const [t1, t2] = sets[0].split('-');
					initialScores.set1.team1 = t1;
					initialScores.set1.team2 = t2;
				}
				if (sets[1]) {
					const [t1, t2] = sets[1].split('-');
					initialScores.set2.team1 = t1;
					initialScores.set2.team2 = t2;
				}
				if (sets[2]) {
					const [t1, t2] = sets[2].split('-');
					initialScores.set3.team1 = t1;
					initialScores.set3.team2 = t2;
				}
			}

			return {
				date: new CalendarDate(
					eventDate.getFullYear(),
					eventDate.getMonth() + 1,
					eventDate.getDate()
				),
				time: matchToEdit.event.eventTime,
				matches: [
					{
						courtNumber: matchToEdit.courtNumber.toString(),
						team1Id: matchToEdit.team1.id.toString(),
						team2Id: matchToEdit.team2.id.toString(),
						status: matchToEdit.status,
						scores: initialScores
					}
				]
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
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	let occupiedCourts = $state<string[]>([]);
	let occupiedTeams = $state<string[]>([]);
	let checkTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (open) {
			values = getInitialValues();
			errors = {};
			untrack(() => {
				checkAvailability();
			});
		}
	});

	async function findEventAtDateTime(dateStr: string, time: string): Promise<Event | null> {
		if (!dateStr) return null;

		const [year, month] = dateStr.split('-').map(Number);
		const monthStr = `${year}-${String(month).padStart(2, '0')}`;

		try {
			const res = await fetch(`/api/v1/events?month=${monthStr}`);
			if (res.ok) {
				const result = await res.json();
				const events: Event[] = (result.data || []).map((e: any) => ({
					id: e.id,
					eventDate: new Date(e.eventDate),
					eventTime: e.eventTime,
					matches: e.matches.map((m: any) => ({
						id: m.id,
						eventId: e.id,
						courtNumber: m.courtNumber,
						team1: m.team1,
						team2: m.team2,
						status: m.status
					}))
				}));

				const target = events.find((e) => {
					const eDateStr = new Date(e.eventDate).toISOString().split('T')[0];
					return eDateStr === dateStr && e.eventTime.slice(0, 5) === time.slice(0, 5);
				});
				return target || null;
			}
		} catch (error) {
			return null;
		}
		return null;
	}

	async function checkAvailability() {
		if (!values.date || !values.time) return;

		const dateStr = values.date.toString();

		const event = await findEventAtDateTime(dateStr, values.time);

		if (event) {
			const otherMatches = event.matches.filter((m) => !matchToEdit || m.id !== matchToEdit.id);

			occupiedCourts = otherMatches.map((m) => m.courtNumber.toString());
			occupiedTeams = otherMatches.flatMap((m) => [m.team1.id.toString(), m.team2.id.toString()]);
		} else {
			occupiedCourts = [];
			occupiedTeams = [];
		}
	}

	function debouncedCheckAvailability() {
		clearTimeout(checkTimeout);
		checkTimeout = setTimeout(() => {
			checkAvailability();
		}, 300);
	}

	watch(
		() => [values.date, values.time],
		() => {
			debouncedCheckAvailability();
		}
	);

	async function handleSubmit(e: any) {
		e.preventDefault();
		errors = {};

		const matchData = values.matches[0];
		let scoreStringT1: string | null = null;
		let scoreStringT2: string | null = null;

		if (matchData.status === 'COMPLETED' && matchData.scores) {
			const matchScore: MatchScore = {
				set1: {
					team1: matchData.scores.set1.team1 !== '' ? parseInt(matchData.scores.set1.team1) : null,
					team2: matchData.scores.set1.team2 !== '' ? parseInt(matchData.scores.set1.team2) : null
				},
				set2: {
					team1: matchData.scores.set2.team1 !== '' ? parseInt(matchData.scores.set2.team1) : null,
					team2: matchData.scores.set2.team2 !== '' ? parseInt(matchData.scores.set2.team2) : null
				},
				set3: {
					team1: matchData.scores.set3.team1 !== '' ? parseInt(matchData.scores.set3.team1) : null,
					team2: matchData.scores.set3.team2 !== '' ? parseInt(matchData.scores.set3.team2) : null
				}
			};

			const validation = validateMatchScore(matchScore);
			if (!validation.isValid) {
				toast.error('Erreur de score', { description: validation.error });
				return;
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

			scoreStringT1 = setsT1.join(', ');
			scoreStringT2 = setsT2.join(', ');
		}

		isSubmitting = true;

		try {
			const eventDate = values.date.toDate('UTC');
			const time = values.time;

			const formData: MatchFormInput = {
				date: eventDate,
				time: time,
				courtNumber: parseInt(matchData.courtNumber),
				team1Id: parseInt(matchData.team1Id),
				team2Id: parseInt(matchData.team2Id),
				status: matchData.status as 'ONGOING' | 'CANCELED' | 'COMPLETED',
				scoreTeam1: scoreStringT1,
				scoreTeam2: scoreStringT2
			};

			matchFormSchema.parse(formData);

			if (matchToEdit) {
				await updateMatch(matchToEdit.id, formData);
				toast.success('Match modifié');
			} else {
				await createMatch(formData);
				toast.success('Match créé');
			}

			open = false;
			onMatchSaved?.();
		} catch (err: any) {
			if (err instanceof ZodError) {
				const newErrors: Record<string, string> = {};
				err.issues.forEach((error: any) => {
					let field = error.path[0];
					newErrors[field] = error.message;
				});
				errors = newErrors;
				toast.error('Erreur de validation');
			} else {
				toast.error('Erreur', {
					description: err.message || 'Une erreur est survenue'
				});
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function createMatch(data: MatchFormInput) {
		const payload = {
			...data,
			date: data.date.toISOString().split('T')[0]
		};
		const response = await fetch('/api/v1/matches', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const result = await response.json();
		if (!result.success) throw new Error(result.error?.message || 'Erreur lors de la création');
	}

	async function updateMatch(id: number, data: MatchFormInput) {
		const payload = {
			...data,
			date: data.date.toISOString().split('T')[0]
		};
		const response = await fetch(`/api/v1/matches/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const result = await response.json();
		if (!result.success) throw new Error(result.error?.message || 'Erreur lors de la modification');
	}
</script>

<Dialog.Root bind:open>
	{#if !matchToEdit}
		<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Nouveau Match
		</Dialog.Trigger>
	{/if}
	<Dialog.Content class="sm:max-w-106.25">
		<form onsubmit={handleSubmit}>
			<Dialog.Header>
				<Dialog.Title>{matchToEdit ? 'Modifier le match' : 'Nouveau match'}</Dialog.Title>
				<Dialog.Description>
					{matchToEdit ? 'Modifiez' : 'Renseignez'} les détails du match.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-6 py-4">
				<div class="grid grid-cols-1 gap-4">
					<div class="grid gap-2">
						<Label for="event-date">Date</Label>
						<DatePicker bind:value={values.date} minValue={today(getLocalTimeZone())} />
						<FormError error={errors.date} />
					</div>
					<div class="grid w-fit gap-2">
						<Label for="event-time">Heure</Label>
						<TimePicker bind:value={values.time} />
						<FormError error={errors.time} />
					</div>
				</div>

				<div class="space-y-4">
					<MatchInput
						id={0}
						{teams}
						bind:values={values.matches}
						{occupiedCourts}
						{occupiedTeams}
					/>

					<FormError error={errors.courtNumber} class="mt-2" />
					<FormError error={errors.team1Id} class="mt-2" />
					<FormError error={errors.team2Id} class="mt-2" />
					<FormError error={errors.status} class="mt-2" />
				</div>
			</div>
			<Dialog.Footer>
				<Dialog.Close class={buttonVariants({ variant: 'outline' })}>Annuler</Dialog.Close>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Sauvegarde...' : matchToEdit ? 'Modifier' : 'Créer'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
