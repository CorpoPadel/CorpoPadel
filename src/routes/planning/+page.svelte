<script lang="ts">
	import Calendar from '$lib/components/global/domain/planning/Calendar.svelte';
	import DeleteEventDialog from '$lib/components/global/domain/planning/DeleteEventDialog.svelte';
	import EventDialog from '$lib/components/global/domain/planning/EventDialog.svelte';
	import Navbar from '$lib/components/global/navbar/Navbar.svelte';
	import Checkbox from '$lib/components/shadcn/ui/checkbox/checkbox.svelte';
	import type { Event as PadelEvent } from '$lib/models/event';
	import { CalendarDate } from '@internationalized/date';
	import { watch } from 'runed';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	let currentEvents = $state(data.initialEvents || []);
	let isLoading = $state(false);
	// svelte-ignore state_referenced_locally
	let showOnlyMine = $state(data.showOnlyMineDefault);

	let placeholder = $state<CalendarDate>(
		// svelte-ignore state_referenced_locally
		new CalendarDate(data.currentYear, data.currentMonth, 1)
	);

	watch(
		() => showOnlyMine,
		() => {
			fetchEvents(placeholder.year, placeholder.month);
		}
	);

	watch(
		() => placeholder,
		(currentVal, oldVal) => {
			if (
				currentVal &&
				oldVal &&
				(currentVal.month !== oldVal.month || currentVal.year !== oldVal.year)
			) {
				fetchEvents(currentVal.year, currentVal.month);
			}
		}
	);

	async function fetchEvents(year: number, month: number) {
		isLoading = true;
		try {
			const monthStr = `${year}-${String(month).padStart(2, '0')}`;
			const params = new URLSearchParams({
				month: monthStr
			});

			const res = await fetch(`/api/v1/events?${params}`);
			if (res.ok) {
				const result = await res.json();
				const events = result.data || [];

				if (showOnlyMine && data.userId) {
					currentEvents = events.filter((e: any) =>
						e.matches.some(
							(m: any) =>
								m.team1.player1.userId === data.userId ||
								m.team1.player2.userId === data.userId ||
								m.team2.player1.userId === data.userId ||
								m.team2.player2.userId === data.userId
						)
					);
				} else {
					currentEvents = events;
				}
			}
		} catch (error) {
		} finally {
			isLoading = false;
		}
	}

	function handleEventCreated() {
		fetchEvents(placeholder.year, placeholder.month);
	}

	let eventToEdit = $state<PadelEvent | undefined>();
	let editDialogOpen = $state(false);

	function handleEditEvent(event: PadelEvent) {
		eventToEdit = event;
		editDialogOpen = true;
	}

	let deleteDialogOpen = $state(false);
	let eventToDeleteId = $state<number | null>(null);

	function handleDeleteEvent(eventId: number) {
		eventToDeleteId = eventId;
		deleteDialogOpen = true;
	}

	// svelte-ignore state_referenced_locally
	fetchEvents(placeholder.year, placeholder.month);
</script>

<div
	class="flex w-full flex-col items-center gap-6 px-4 pb-2 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-64"
>
	<Navbar />
	<div class="mb-6 flex w-full items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Planning des matchs</h1>
			<p class="text-muted-foreground">Vue calendrier des événements et matchs</p>
		</div>
		<div class="flex items-center gap-4">
			{#if data.canManageEvents}
				<EventDialog teams={data.teams} onEventCreated={handleEventCreated} />
				{#if eventToEdit}
					<EventDialog
						teams={data.teams}
						{eventToEdit}
						bind:open={editDialogOpen}
						onEventCreated={() => {
							handleEventCreated();
							eventToEdit = undefined;
						}}
					/>
				{/if}
			{/if}
		</div>
	</div>

	<DeleteEventDialog
		bind:open={deleteDialogOpen}
		eventId={eventToDeleteId}
		onDeleteSuccess={() => fetchEvents(placeholder.year, placeholder.month)}
	/>

	<div class="flex w-full flex-col gap-4">
		{#if data.userId}
			<label class="flex items-center gap-2">
				<Checkbox
					bind:checked={showOnlyMine}
					onCheckedChange={() => fetchEvents(placeholder.year, placeholder.month)}
				/>
				Voir seulement mes événements et matchs
			</label>
		{/if}
		<Calendar
			bind:data={currentEvents}
			bind:placeholder
			canManageEvents={data.canManageEvents}
			onEditEvent={handleEditEvent}
			onDeleteEvent={handleDeleteEvent}
			{showOnlyMine}
		/>
	</div>
</div>
