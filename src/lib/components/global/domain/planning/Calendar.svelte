<script lang="ts">
	import * as Card from '$lib/components/shadcn/ui/card/index.js';
	import Calendar from '$lib/components/shadcn/ui/calendar-2/calendar.svelte';
	import { CalendarDate, type DateValue } from '@internationalized/date';
	import CalendarDay from '../../../shadcn/ui/calendar-2/calendar-day.svelte';
	import { cn } from '$lib/utils/utils';
	import PadelBall from '$lib/assets/padelBall.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import type { Event } from '$lib/models/event';
	import type { Match } from '$lib/models/match';
	import { Button } from '$lib/components/shadcn/ui/button';
	import PencilIcon from '~icons/lucide/pencil';
	import TrashIcon from '~icons/lucide/trash-2';
	import { isEventEditable } from '$lib/validations/event';
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte';

	/**
	 * Main interactive calendar component displaying events and allowing detailed view/management.
	 */
	let {
		data = $bindable([]),
		placeholder = $bindable<CalendarDate>(),
		class: className,
		canManageEvents = false,
		onEditEvent,
		onDeleteEvent,
		showOnlyMine = $bindable(true)
	}: {
		data: Event[];
		placeholder?: CalendarDate;
		class?: string;
		canManageEvents?: boolean;
		onEditEvent?: (event: Event) => void;
		onDeleteEvent?: (eventId: number) => void;
		showOnlyMine?: boolean;
	} = $props();

	const date = new Date();
	const app = ApplicationContext.get();
	/** Currently selected date in the calendar */
	let value = $state<CalendarDate>(
		new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
	);

	/** Returns the list of events matching a specific date */
	function getEventsOnDate(date: DateValue) {
		if (!data || !Array.isArray(data)) return [];
		const jsDate = new Date(date.year, date.month - 1, date.day);
		return data.filter(
			(e: Event) => new Date(e.eventDate).toDateString() === jsDate.toDateString()
		);
	}

	/** Determines if the current user can delete a specific event (no match COMPLETED or CANCELED) */
	function eventCanBeDeleted(event: Event) {
		for (const match of event.matches) {
			if (match.status === 'COMPLETED' || match.status === 'CANCELED') {
				return false;
			}
		}
		return true;
	}

	/** Checks if the current user is involved in a specific match */
	function checkIfUserInMatch(match: Match) {
		return (
			match.team1.player1.userId === app.data.user?.id ||
			match.team1.player2.userId === app.data.user?.id ||
			match.team2.player1.userId === app.data.user?.id ||
			match.team2.player2.userId === app.data.user?.id
		);
	}

	/** Determines which team won a specific match based on the score string */
	function getWinner(match: Match) {
		if (match.status !== 'COMPLETED') return null;
		if (!match.scoreTeam1) return null;

		let t1Sets = 0;
		let t2Sets = 0;

		const sets = match.scoreTeam1.split(',').map((s: string) => s.trim());

		for (const set of sets) {
			const parts = set.split('-');
			if (parts.length === 2) {
				const s1 = parseInt(parts[0]);
				const s2 = parseInt(parts[1]);
				if (s1 > s2) t1Sets++;
				else if (s2 > s1) t2Sets++;
			}
		}

		return t1Sets > t2Sets ? match.team1 : match.team2;
	}
</script>

<div class={cn('h-full w-full', className)}>
	<Card.Root class="gap-0 overflow-hidden p-0">
		<Card.Content class="flex max-h-fit w-full flex-col p-0 md:flex-row">
			<!-- Left side: The monthly calendar view -->
			<div class="mt-4 max-h-fit flex-1 px-2 sm:px-3 md:px-4">
				<Calendar
					type="single"
					bind:value
					bind:placeholder
					locale="fr-FR"
					weekdayFormat="long"
					monthFormat="long"
					yearFormat="numeric"
					class="bg-transparent p-0 [--cell-size:clamp(1.25rem,6vw,4.5rem)]"
					fixedWeeks
				>
					{#snippet day({ day })}
						{@const events = getEventsOnDate(day)}
						<CalendarDay
							class="not([data-selected])]:border! min-h-6 min-w-6 border border-border bg-accent/30 data-selected:border-2 data-selected:border-dashed data-selected:border-primary data-selected:bg-primary/20! data-selected:hover:bg-primary/20! sm:min-h-14 sm:min-w-14 lg:min-h-20 lg:min-w-20 [&[data-outside-month]:not([data-selected])]:bg-background/10"
						>
							<span
								class="absolute top-0.5 left-0.5 text-[0.625rem] sm:top-1 sm:left-1 sm:text-xs lg:top-1.5 lg:left-1.5 lg:text-sm"
								>{day.day}</span
							>
							{#if events && events.length > 0}
								<!-- Ball icon displayed if there are matches scheduled on this day -->
								<div class="absolute top-1/2 left-1/2 size-fit -translate-x-1/2 -translate-y-1/2">
									<PadelBall class="size-4 sm:size-6 lg:size-8" />
								</div>
							{/if}
						</CalendarDay>
					{/snippet}
				</Calendar>
			</div>

			<!-- Right side: Daily agenda details for the selected day -->
			<div
				class="no-scrollbar flex w-full max-w-full min-w-0 shrink-0 flex-col gap-2 overflow-y-auto border-t p-2 sm:p-3 md:h-90 md:w-1/3 md:border-s md:border-t-0 md:p-4 lg:h-170 lg:w-1/4"
				style="scrollbar-gutter: stable;"
			>
				<div class="grid gap-1.5">
					<div class="mb-3 flex flex-col gap-0.5 sm:mb-4 lg:mb-6">
						<h3 class="text-sm font-medium capitalize sm:text-base lg:text-lg">
							{#if value}
								{@const eventDate = new Date(value.year, value.month - 1, value.day)}
								{eventDate.toLocaleDateString('fr-FR', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							{/if}
						</h3>
						<p class="text-[0.625rem] text-muted-foreground sm:text-xs">Liste des évènements</p>
					</div>
					{#if value && getEventsOnDate(value).length > 0}
						{#each getEventsOnDate(value).sort( (a: any, b: any) => a.eventTime.localeCompare(b.eventTime) ) as event}
							<div class="mb-3 last:mb-0 sm:mb-4 lg:mb-6">
								<div class="mb-1.5 flex items-center gap-1.5">
									<span class="text-[0.625rem] font-medium sm:text-xs"
										>{event.eventTime.slice(0, 5)}</span
									>
									<hr class="flex-1 border-t border-muted-foreground opacity-40" />
									{#if canManageEvents}
										<div class="flex gap-1">
											{#if isEventEditable(event)}
												<Button
													variant="ghost"
													size="icon"
													class="h-6 w-6"
													onclick={() => onEditEvent?.(event)}
												>
													<PencilIcon class="h-3 w-3" />
												</Button>
											{/if}
											{#if eventCanBeDeleted(event)}
												<Button
													variant="ghost"
													size="icon"
													class="h-6 w-6 text-destructive hover:text-destructive"
													onclick={() => onDeleteEvent?.(event.id)}
												>
													<TrashIcon class="h-3 w-3" />
												</Button>
											{/if}
										</div>
									{/if}
								</div>
								<div class="flex flex-col gap-1.5 sm:gap-2">
									{#each event.matches as match}
										{#if !showOnlyMine || (showOnlyMine && checkIfUserInMatch(match))}
											<div class="flex flex-col gap-0.5 rounded-md border p-2 sm:p-2.5">
												<h4
													class="flex justify-between text-xs font-normal sm:text-sm lg:text-base"
												>
													<span class={getWinner(match) === match.team1 ? 'font-semibold' : ''}
														>{match.team1.company}</span
													>
													vs
													<span class={getWinner(match) === match.team2 ? 'font-semibold' : ''}
														>{match.team2.company}</span
													>
												</h4>
												<div class="flex w-full items-center justify-between">
													<div>
														<p class="text-[0.625rem] text-muted-foreground sm:text-xs">
															{match.team1.player1.firstName}
															{match.team1.player1.lastName}
														</p>
														<p class="text-[0.625rem] text-muted-foreground sm:text-xs">
															&amp; {match.team1.player2.firstName}
															{match.team1.player2.lastName}
														</p>
													</div>
													<div>
														<p class="text-[0.625rem] text-muted-foreground sm:text-xs">
															{match.team2.player1.firstName}
															{match.team2.player1.lastName}
														</p>
														<p class="text-[0.625rem] text-muted-foreground sm:text-xs">
															&amp; {match.team2.player2.firstName}
															{match.team2.player2.lastName}
														</p>
													</div>
												</div>
												{#if match.status == 'COMPLETED'}
													<p class="text-xs sm:text-sm">
														{match.scoreTeam1}
													</p>
												{:else}
													<p class="text-[0.625rem] text-muted-foreground italic sm:text-xs">
														Score à venir
													</p>
												{/if}
												<div class="flex w-full flex-row items-center justify-between">
													<p class="text-[0.625rem] text-muted-foreground sm:text-xs">
														Terrain n°{match.courtNumber}
													</p>
													<StatusBadge status={match.status} />
												</div>
											</div>
										{/if}
									{/each}
								</div>
							</div>
						{/each}
					{:else}
						<p class="mb-8 text-center text-[0.625rem] text-muted-foreground sm:text-xs">
							Aucun évènement pour cette date.
						</p>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
