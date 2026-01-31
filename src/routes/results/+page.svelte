<script lang="ts">
	import Navbar from '$lib/components/global/navbar/Navbar.svelte';
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte';
	import { cn } from '$lib/utils/utils';
	import HistoryIcon from '~icons/lucide/history';
	import TrophyIcon from '~icons/lucide/trophy';
	import type { PageData } from './$types';
	import RankingTable from '$lib/components/global/domain/results/RankingTable.svelte';
	import PersonalResults from '$lib/components/global/domain/results/PersonalResults.svelte';

	let { data }: { data: PageData } = $props();
	const app = ApplicationContext.get();

	let activeTab = $state<'personal' | 'ranking'>('ranking');
</script>

<div
	class="flex w-full flex-col items-center gap-6 px-4 pb-12 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-64"
>
	<Navbar />

	<div class="flex w-full flex-col gap-6">
		<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="text-3xl font-bold">Résultats & Classement</h1>
				<p class="text-muted-foreground">Consultez les scores et le classement des entreprises.</p>
			</div>

			<div class="flex items-center gap-1 rounded-lg border bg-muted p-1">
				<button
					class={cn(
						'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
						activeTab === 'ranking'
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:bg-background/50'
					)}
					onclick={() => (activeTab = 'ranking')}
				>
					<TrophyIcon class="h-4 w-4" />
					Classement
				</button>
				{#if app.data.user}
					<button
						class={cn(
							'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
							activeTab === 'personal'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:bg-background/50'
						)}
						onclick={() => (activeTab = 'personal')}
					>
						<HistoryIcon class="h-4 w-4" />
						Mes Résultats
					</button>
				{/if}
			</div>
		</div>

		{#if activeTab === 'ranking'}
			<RankingTable ranking={data.ranking} />
		{:else if activeTab === 'personal'}
			<PersonalResults myMatches={data.myMatches} />
		{/if}
	</div>
</div>
