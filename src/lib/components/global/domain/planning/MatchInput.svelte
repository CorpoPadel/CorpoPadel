<script lang="ts">
	import Combobox from '$lib/components/global/combobox/Combobox.svelte';
	import { Label } from '$lib/components/shadcn/ui/label';
	import * as Select from '$lib/components/shadcn/ui/select';
	import type { Team } from '$lib/models/team';
	import * as InputOTP from '$lib/components/shadcn/ui/input-otp';
	import { CalendarDate, getLocalTimeZone, now } from '@internationalized/date';

	let {
		id = $bindable(0),
		values = $bindable([
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
		]),
		teams = $bindable([]),
		disabled = false,
		date = $bindable(
			new CalendarDate(
				now(getLocalTimeZone()).year,
				now(getLocalTimeZone()).month,
				now(getLocalTimeZone()).day
			)
		),
		occupiedCourts = [],
		occupiedTeams = []
	}: {
		id: number;
		values?: {
			courtNumber?: string;
			team1Id?: string;
			team2Id?: string;
			status?: string;
			scores?: {
				set1: { team1: string; team2: string };
				set2: { team1: string; team2: string };
				set3: { team1: string; team2: string };
			};
		}[];
		teams: Team[];
		disabled?: boolean;
		date?: CalendarDate;
		occupiedCourts?: string[];
		occupiedTeams?: string[];
	} = $props();

	if (!values[id].status) values[id].status = 'ONGOING';
	if (!values[id].scores) {
		values[id].scores = {
			set1: { team1: '', team2: '' },
			set2: { team1: '', team2: '' },
			set3: { team1: '', team2: '' }
		};
	}

	const isCompleted = $derived(values[id].status === 'COMPLETED');

	const isSet3Visible = $derived.by(() => {
		const s1 = values[id].scores!.set1;
		const s2 = values[id].scores!.set2;
		if (!s1.team1 || !s1.team2 || !s2.team1 || !s2.team2) return false;

		const w1 = parseInt(s1.team1) > parseInt(s1.team2) ? 1 : 2;
		const w2 = parseInt(s2.team1) > parseInt(s2.team2) ? 1 : 2;
		return w1 !== w2;
	});

	const courtOptions = $derived(
		Array.from({ length: 10 }, (_, i) => {
			const courtValue = String(i + 1);
			return {
				value: courtValue,
				label: `Piste ${i + 1}`
			};
		}).filter(
			(court) =>
				court.value === values[id].courtNumber ||
				(!values.some((v) => v.courtNumber === court.value) &&
					!occupiedCourts.includes(court.value))
		)
	);

	const itemsSelector1 = $derived(
		teams
			.filter(
				(team) =>
					String(team.id) === values[id].team1Id ||
					(!values.some((v) => v.team1Id === String(team.id) || v.team2Id === String(team.id)) &&
						!occupiedTeams.includes(String(team.id)))
			)
			.map((team) => ({
				value: String(team.id),
				label: team.company
			}))
	);

	const itemsSelector2 = $derived(
		teams
			.filter(
				(team) =>
					String(team.id) === values[id].team2Id ||
					(!values.some((v) => v.team1Id === String(team.id) || v.team2Id === String(team.id)) &&
						!occupiedTeams.includes(String(team.id)))
			)
			.map((team) => ({
				value: String(team.id),
				label: team.company
			}))
	);
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label for="court">Numéro de piste</Label>
		<Select.Root type="single" bind:value={values[id].courtNumber} {disabled}>
			<Select.Trigger id="court" class="h-13.5 w-full py-6">
				{#if values[id].courtNumber}
					{courtOptions.find((court) => court.value === values[id].courtNumber)?.label}
				{:else}
					Sélectionner une piste...
				{/if}
			</Select.Trigger>
			<Select.Content>
				{#each courtOptions as court (court.value)}
					<Select.Item value={court.value}>{court.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<div class="space-y-2">
		<Label for="team1">Équipe 1</Label>
		<Combobox
			items={itemsSelector1}
			bind:value={values[id].team1Id}
			{disabled}
			placeholder={{
				button: 'Sélectionner une équipe...',
				input: 'Rechercher une équipe...',
				empty: 'Aucune équipe trouvée.'
			}}
		/>
	</div>

	<div class="space-y-2">
		<Label for="team2">Équipe 2</Label>
		<Combobox
			items={itemsSelector2}
			bind:value={values[id].team2Id}
			{disabled}
			placeholder={{
				button: 'Sélectionner une équipe...',
				input: 'Rechercher une équipe...',
				empty: 'Aucune équipe trouvée.'
			}}
		/>
	</div>

	<div class="space-y-2">
		<Label>Statut</Label>
		<Select.Root type="single" bind:value={values[id].status} {disabled}>
			<Select.Trigger class="h-10 w-full">
				{values[id].status === 'ONGOING'
					? 'Programmé'
					: values[id].status === 'CANCELED'
						? 'Annulé'
						: values[id].status === 'COMPLETED'
							? 'Terminé'
							: values[id].status}
			</Select.Trigger>
			<Select.Content>
				<!-- It's not allowed to select "Programmé" if the event date is in the past -->
				{#if !(date.year < now(getLocalTimeZone()).year || (date.year === now(getLocalTimeZone()).year && date.month < now(getLocalTimeZone()).month) || (date.year === now(getLocalTimeZone()).year && date.day < now(getLocalTimeZone()).day))}
					<Select.Item value="ONGOING">Programmé</Select.Item>
				{/if}
				<Select.Item value="CANCELED">Annulé</Select.Item>
				<!-- It's not allowed to select "Terminé" if the event date is in the future -->
				{#if !(date.year > now(getLocalTimeZone()).year || (date.year === now(getLocalTimeZone()).year && date.month > now(getLocalTimeZone()).month) || (date.year === now(getLocalTimeZone()).year && date.day > now(getLocalTimeZone()).day))}
					<Select.Item value="COMPLETED">Terminé</Select.Item>
				{/if}
			</Select.Content>
		</Select.Root>
	</div>

	{#if isCompleted}
		<div class="grid animate-in gap-4 rounded-lg border p-4 fade-in slide-in-from-top-2">
			<div
				class="grid grid-cols-3 gap-2 text-center text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
			>
				<div></div>
				<div class="truncate">Équipe 1</div>
				<div class="truncate">Équipe 2</div>
			</div>

			<div class="grid grid-cols-3 items-center gap-2">
				<Label class="text-right text-xs font-semibold">Set 1</Label>
				<div class="flex justify-center">
					<InputOTP.Root maxlength={1} bind:value={values[id].scores!.set1.team1} {disabled}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								<InputOTP.Slot cell={cells[0]} class="h-8 w-8 text-sm font-bold" />
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				</div>
				<div class="flex justify-center">
					<InputOTP.Root maxlength={1} bind:value={values[id].scores!.set1.team2} {disabled}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								<InputOTP.Slot cell={cells[0]} class="h-8 w-8 text-sm font-bold" />
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				</div>
			</div>

			<div class="grid grid-cols-3 items-center gap-2">
				<Label class="text-right text-xs font-semibold">Set 2</Label>
				<div class="flex justify-center">
					<InputOTP.Root maxlength={1} bind:value={values[id].scores!.set2.team1} {disabled}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								<InputOTP.Slot cell={cells[0]} class="h-8 w-8 text-sm font-bold" />
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				</div>
				<div class="flex justify-center">
					<InputOTP.Root maxlength={1} bind:value={values[id].scores!.set2.team2} {disabled}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								<InputOTP.Slot cell={cells[0]} class="h-8 w-8 text-sm font-bold" />
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				</div>
			</div>

			{#if isSet3Visible}
				<div class="grid animate-in grid-cols-3 items-center gap-2 fade-in slide-in-from-top-1">
					<Label class="text-right text-xs font-semibold text-primary">Set 3</Label>
					<div class="flex justify-center">
						<InputOTP.Root maxlength={1} bind:value={values[id].scores!.set3.team1} {disabled}>
							{#snippet children({ cells })}
								<InputOTP.Group>
									<InputOTP.Slot
										cell={cells[0]}
										class="h-8 w-8 border-primary/50 text-sm font-bold"
									/>
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
					</div>
					<div class="flex justify-center">
						<InputOTP.Root maxlength={1} bind:value={values[id].scores!.set3.team2} {disabled}>
							{#snippet children({ cells })}
								<InputOTP.Group>
									<InputOTP.Slot
										cell={cells[0]}
										class="h-8 w-8 border-primary/50 text-sm font-bold"
									/>
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
