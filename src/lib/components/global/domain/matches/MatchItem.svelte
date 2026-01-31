<script lang="ts">
	import StatusBadge from '$lib/components/global/domain/planning/StatusBadge.svelte';
	import { Button } from '$lib/components/shadcn/ui/button';
	import type { Match } from '$lib/models/match';
	import type { Team } from '$lib/models/team';
	import { format } from 'date-fns';
	import { fr } from 'date-fns/locale';
	import PencilIcon from '~icons/lucide/pencil';
	import TrashIcon from '~icons/lucide/trash-2';
	import TrophyIcon from '~icons/lucide/trophy';

	/**
	 * Component representing a single match card with details and administrative actions.
	 */
	let {
		match,
		isAdministrator,
		onEdit,
		onDelete,
		onScore
	}: {
		match: Match;
		isAdministrator: boolean;
		onEdit: (m: Match) => void;
		onDelete: (m: Match) => void;
		onScore: (m: Match) => void;
	} = $props();

	/** Formats the players of a team as a concatenated string */
	function getPlayerNames(team: Team) {
		return `${team.player1?.firstName} ${team.player1?.lastName} & ${team.player2?.firstName} ${team.player2?.lastName}`;
	}
</script>

<div
	class="flex w-full flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm md:flex-row md:items-center md:justify-between"
>
	<!-- Event date and time info -->
	<div class="flex min-w-37.5 flex-col gap-1">
		<div class="text-sm font-medium text-primary capitalize">
			{format(new Date(match.event?.eventDate as string), 'EEEE d MMMM yyyy', { locale: fr })}
		</div>
		<div class="flex items-center gap-2 text-xs text-muted-foreground">
			<span>{match.event?.eventTime.slice(0, 5)}</span>
			<span>•</span>
			<span>Terrain {match.courtNumber}</span>
		</div>
	</div>

	<!-- Opposing teams details -->
	<div class="flex flex-1 flex-col items-center justify-center gap-2 md:flex-row md:gap-8">
		<div class="flex flex-1 flex-col items-center text-center md:items-end md:text-right">
			<span class="font-bold">{match.team1.company}</span>
			<span class="text-xs text-muted-foreground">{getPlayerNames(match.team1)}</span>
		</div>

		<div class="text-sm font-medium text-muted-foreground">VS</div>

		<div class="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
			<span class="font-bold">{match.team2.company}</span>
			<span class="text-xs text-muted-foreground">{getPlayerNames(match.team2)}</span>
		</div>
	</div>

	<!-- Match status and admin action buttons -->
	<div class="flex min-w-30 items-center justify-center gap-2">
		<StatusBadge status={match.status} />
		{#if isAdministrator && match.status !== 'COMPLETED'}
			{#if match.status === 'ONGOING'}
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
					title="Saisir le score"
					onclick={() => onScore(match)}
				>
					<TrophyIcon class="h-4 w-4" />
				</Button>
			{/if}
			<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => onEdit(match)}>
				<PencilIcon class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8 text-destructive hover:text-destructive"
				onclick={() => onDelete(match)}
			>
				<TrashIcon class="h-4 w-4" />
			</Button>
		{/if}
	</div>
</div>
