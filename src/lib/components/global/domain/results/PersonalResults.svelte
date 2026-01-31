<script lang="ts">
	import * as Card from '$lib/components/shadcn/ui/card';
	import { cn } from '$lib/utils/utils';
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';

	/**
	 * Component displaying a list of completed matches for the authenticated user.
	 */
	let {
		myMatches
	}: {
		/** List of historical matches involving the current user */
		myMatches: any[];
	} = $props();
</script>

<div class="flex flex-col gap-4">
	{#if myMatches.length === 0}
		<!-- Empty state -->
		<div
			class="flex h-32 w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground"
		>
			Vous n'avez pas encore joué de match terminé.
		</div>
	{:else}
		{#each myMatches.sort((a: any, b: any) => {
			if (!a.event || !b.event) return 0;
			const dateA = new Date(a.event.eventDate).getTime();
			const dateB = new Date(b.event.eventDate).getTime();
			if (dateA !== dateB) return dateB - dateA;
			return b.event.eventTime.localeCompare(a.event.eventTime);
		}) as match}
			<!-- Match result card with victory/defeat color coding -->
			<Card.Root
				class={cn(
					'border-l-4 transition-all',
					match.result === 'VICTOIRE' ? 'border-l-green-500' : 'border-l-red-500'
				)}
			>
				<Card.Content
					class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
				>
					<div class="flex items-center gap-4">
						<!-- Formatted date display -->
						<div
							class="flex min-w-16 flex-col items-center justify-center rounded bg-muted px-2 py-1 text-center"
						>
							<span class="text-xs font-bold text-muted-foreground uppercase">
								{format(new Date(match.date), 'MMM', { locale: fr })}
							</span>
							<span class="text-lg font-bold">
								{format(new Date(match.date), 'dd', { locale: fr })}
							</span>
						</div>

						<!-- Opponent information -->
						<div class="flex flex-col">
							<div class="text-sm text-muted-foreground">Adversaire</div>
							<div class="text-lg font-semibold">{match.opponents.company}</div>
							<div class="text-xs text-muted-foreground">
								{match.opponents.players.join(' & ')}
							</div>
						</div>
					</div>

					<!-- Score and final result -->
					<div class="mt-2 flex items-center justify-between sm:mt-0 sm:justify-end sm:gap-8">
						<div class="flex flex-col items-end">
							<div class="flex items-center gap-2">
								<span
									class={cn(
										'font-mono text-xl font-bold tracking-widest',
										match.result === 'VICTOIRE' ? 'text-green-600' : 'text-red-600'
									)}
								>
									{match.sets}
								</span>
							</div>
							<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
								{match.result === 'VICTOIRE' ? 'Victoire' : 'Défaite'}
							</span>
						</div>

						<!-- Court number details -->
						<div class="flex min-w-16 flex-col items-end text-xs text-muted-foreground">
							<span>Terrain {match.courtNumber}</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	{/if}
</div>
