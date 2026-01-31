<script lang="ts">
	import DeleteMatchDialog from '$lib/components/global/domain/matches/DeleteMatchDialog.svelte';
	import MatchDialog from '$lib/components/global/domain/matches/MatchDialog.svelte';
	import MatchScoreDialog from '$lib/components/global/domain/matches/MatchScoreDialog.svelte';
	import Navbar from '$lib/components/global/navbar/Navbar.svelte';
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte';
	import type { Match } from '$lib/models/match';
	import Loader2 from '~icons/lucide/loader-2';
	import type { PageData } from './$types';
	import MatchFilters from '$lib/components/global/domain/matches/MatchFilters.svelte';
	import MatchItem from '$lib/components/global/domain/matches/MatchItem.svelte';
	import { watch } from 'runed';

	let { data }: { data: PageData } = $props();
	const app = ApplicationContext.get();

	// svelte-ignore state_referenced_locally
	let matches = $state<Match[]>(data.initialMatches || []);
	let isLoading = $state(false);

	let showOnlyMine = $state(false);
	let showAllMatches = $state(false);
	let selectedCompany = $state('all');
	let selectedPoolId = $state('all');
	let selectedStatus = $state('all');

	function resetFilters() {
		showOnlyMine = false;
		showAllMatches = false;
		selectedCompany = 'all';
		selectedPoolId = 'all';
		selectedStatus = 'all';
	}

	let editDialogOpen = $state(false);
	let matchToEdit = $state<Match | undefined>();
	let scoreDialogOpen = $state(false);
	let matchToScore = $state<Match | undefined>();
	let deleteDialogOpen = $state(false);
	let matchToDelete = $state<Match | null>(null);

	async function fetchMatches() {
		isLoading = true;
		try {
			const params = new URLSearchParams();
			if (showOnlyMine && app.data.user) params.append('my_matches', 'true');
			if (selectedCompany !== 'all') params.append('company', selectedCompany);
			if (selectedPoolId !== 'all') params.append('pool_id', selectedPoolId);
			if (selectedStatus !== 'all') params.append('status', selectedStatus);

			const res = await fetch(`/api/v1/matches?${params}`);
			if (res.ok) {
				const result = await res.json();
				let fetchedMatches = result.data.matches || [];

				if (!showAllMatches) {
					const today = new Date();
					today.setHours(0, 0, 0, 0);
					const in30Days = new Date(today);
					in30Days.setDate(today.getDate() + 30);

					matches = fetchedMatches
						.filter((m: Match) => m.status === 'ONGOING' || m.status === 'CANCELED')
						.filter((m: Match) => {
							const eventDate = new Date(m.event?.eventDate as string);
							return eventDate >= today && eventDate <= in30Days;
						});
				} else {
					matches =
						selectedStatus === 'all'
							? fetchedMatches.filter(
									(m: Match) => m.status === 'ONGOING' || m.status === 'CANCELED'
								)
							: fetchedMatches;
				}
			}
		} catch (error) {
		} finally {
			isLoading = false;
		}
	}

	watch(
		() => [showOnlyMine, showAllMatches, selectedCompany, selectedPoolId, selectedStatus],
		() => {
			fetchMatches();
		}
	);

	function handleEditMatch(match: Match) {
		matchToEdit = match;
		editDialogOpen = true;
	}

	function handleScoreMatch(match: Match) {
		matchToScore = match;
		scoreDialogOpen = true;
	}

	function handleDeleteMatch(match: Match) {
		matchToDelete = match;
		deleteDialogOpen = true;
	}

	function refresh() {
		fetchMatches();
		matchToEdit = undefined;
		matchToScore = undefined;
		matchToDelete = null;
	}
</script>

<div
	class="flex w-full flex-col items-center gap-6 px-4 pb-2 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-64"
>
	<Navbar />

	<div class="mb-2 flex w-full flex-col gap-4">
		<div class="flex w-full items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Liste des matchs</h1>
				<p class="text-muted-foreground">
					{showAllMatches
						? 'Tous les matchs (Administration)'
						: 'Matchs à venir dans les 30 prochains jours'}
				</p>
			</div>
			{#if data.isAdministrator}
				<MatchDialog teams={data.teams} onMatchSaved={refresh} />
				{#if matchToEdit}
					<MatchDialog
						teams={data.teams}
						{matchToEdit}
						bind:open={editDialogOpen}
						onMatchSaved={refresh}
					/>
				{/if}
				{#if matchToScore}
					<MatchScoreDialog
						match={matchToScore}
						bind:open={scoreDialogOpen}
						onScoreSaved={refresh}
					/>
				{/if}
			{/if}
		</div>

		<MatchFilters
			bind:showOnlyMine
			bind:showAllMatches
			bind:selectedCompany
			bind:selectedPoolId
			bind:selectedStatus
			{data}
			user={app.data.user}
			onReset={resetFilters}
		/>
	</div>

	<div class="flex w-full flex-col gap-4">
		{#if isLoading}
			<div class="flex justify-center py-8">
				<Loader2 class="h-8 w-8 animate-spin text-primary" />
			</div>
		{:else if matches.length === 0}
			<div
				class="flex h-32 w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground"
			>
				Aucun match trouvé pour ces critères.
			</div>
		{:else}
			{#each matches as match (match.id)}
				<MatchItem
					{match}
					isAdministrator={data.isAdministrator}
					onEdit={handleEditMatch}
					onDelete={handleDeleteMatch}
					onScore={handleScoreMatch}
				/>
			{/each}
		{/if}
	</div>

	{#if data.isAdministrator}
		<DeleteMatchDialog
			bind:open={deleteDialogOpen}
			match={matchToDelete}
			onDeleteSuccess={refresh}
		/>
	{/if}
</div>
