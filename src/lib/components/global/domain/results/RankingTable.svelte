<script lang="ts">
	import * as Card from '$lib/components/shadcn/ui/card';

	/**
	 * Table component displaying company standings based on match results.
	 */
	let {
		ranking
	}: {
		/** List of ranked companies with points and stats */
		ranking: any[];
	} = $props();
</script>

<Card.Root class="p-0">
	<Card.Content class="p-0">
		<div class="w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
						<th class="h-12 w-16 px-4 text-left align-middle font-medium text-muted-foreground"
							>Pos</th
						>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
							>Entreprise</th
						>
						<th class="h-12 px-4 text-center align-middle font-medium text-muted-foreground"
							>Joués</th
						>
						<th class="h-12 px-4 text-center align-middle font-medium text-muted-foreground">V</th>
						<th class="h-12 px-4 text-center align-middle font-medium text-muted-foreground">D</th>
						<th class="h-12 px-4 text-center align-middle font-medium text-muted-foreground"
							>Diff</th
						>
						<th class="h-12 px-4 text-center align-middle font-bold text-foreground">Pts</th>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#each ranking as rank, i}
						<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<td class="p-4 align-middle font-medium">
								<!-- Ranking badges for top 3 -->
								{#if i === 0}
									<span
										class="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-700"
										>1</span
									>
								{:else if i === 1}
									<span
										class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700"
										>2</span
									>
								{:else if i === 2}
									<span
										class="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800"
										>3</span
									>
								{:else}
									<span class="pl-1.5 text-muted-foreground">{i + 1}</span>
								{/if}
							</td>
							<td class="p-4 align-middle font-semibold">{rank.company}</td>
							<td class="p-4 text-center align-middle">{rank.played}</td>
							<td class="p-4 text-center align-middle text-green-600">{rank.wins}</td>
							<td class="p-4 text-center align-middle text-red-600">{rank.losses}</td>
							<td class="p-4 text-center align-middle text-xs text-muted-foreground">
								{rank.setsWon - rank.setsLost > 0 ? '+' : ''}{rank.setsWon - rank.setsLost}
							</td>
							<td class="p-4 text-center align-middle text-lg font-bold">{rank.points}</td>
						</tr>
					{/each}

					{#if ranking.length === 0}
						<tr>
							<td colspan="7" class="p-8 text-center text-muted-foreground">
								Aucun match terminé pour le moment.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</Card.Content>
</Card.Root>
