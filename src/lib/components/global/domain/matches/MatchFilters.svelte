<script lang="ts">
	import { Checkbox } from '$lib/components/shadcn/ui/checkbox';
	import { Label } from '$lib/components/shadcn/ui/label';
	import { Button } from '$lib/components/shadcn/ui/button';
	import * as Select from '$lib/components/shadcn/ui/select';
	import type { Pool } from '$lib/models/pool';
	import RotateCcw from '~icons/lucide/rotate-ccw';

	/**
	 * Component for filtering match lists by various criteria.
	 */
	let {
		showOnlyMine = $bindable(),
		showAllMatches = $bindable(),
		selectedCompany = $bindable(),
		selectedPoolId = $bindable(),
		selectedStatus = $bindable(),
		data,
		user,
		onReset
	}: {
		/** Filter: only matches where the current user participates (bindable) */
		showOnlyMine: boolean;
		/** Filter: show all matches including completed (admin mode) (bindable) */
		showAllMatches: boolean;
		/** Filter: company name (bindable) */
		selectedCompany: string;
		/** Filter: pool ID (bindable) */
		selectedPoolId: string;
		/** Filter: match status (bindable) */
		selectedStatus: string;
		/** Page data containing lists for select options */
		data: any;
		/** Current user object */
		user: any;
		/** Callback when filters are reset */
		onReset: () => void;
	} = $props();

	/** Reactive helper to detect if any filter is currently applied */
	const hasActiveFilters = $derived(
		showOnlyMine ||
			showAllMatches ||
			selectedCompany !== 'all' ||
			selectedPoolId !== 'all' ||
			selectedStatus !== 'all'
	);

	/** Localized labels for select triggers */
	const companyTriggerContent = $derived(
		selectedCompany && selectedCompany !== 'all' ? selectedCompany : 'Toutes les entreprises'
	);

	const poolTriggerContent = $derived(
		selectedPoolId && selectedPoolId !== 'all'
			? data.pools.find((p: Pool) => p.id.toString() === selectedPoolId)?.name
			: 'Toutes les poules'
	);

	const statusTriggerContent = $derived(
		selectedStatus === 'ONGOING'
			? 'Programmé'
			: selectedStatus === 'COMPLETED'
				? 'Terminé'
				: selectedStatus === 'CANCELED'
					? 'Annulé'
					: 'Tous les status'
	);
</script>

<div
	class="flex w-full flex-wrap gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
>
	<!-- User participation toggle -->
	{#if user}
		<div class="flex items-center space-x-2">
			<Checkbox id="mine" bind:checked={showOnlyMine} />
			<Label
				for="mine"
				class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Mes matchs uniquement
			</Label>
		</div>
	{/if}

	<!-- Administrative specific filters -->
	{#if data.isAdministrator}
		<div class="hidden h-8 w-px bg-border sm:block"></div>

		<div class="flex items-center space-x-2">
			<Checkbox id="all-admin" bind:checked={showAllMatches} />
			<Label
				for="all-admin"
				class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Mode saisie des scores
			</Label>
		</div>

		<div class="hidden h-8 w-px bg-border sm:block"></div>

		<div class="flex flex-wrap gap-4">
			<!-- Company filter -->
			<Select.Root type="single" bind:value={selectedCompany}>
				<Select.Trigger class="w-50">{companyTriggerContent}</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">Toutes les entreprises</Select.Item>
					{#each data.companies as company}
						<Select.Item value={company}>{company}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<!-- Pool filter -->
			<Select.Root type="single" bind:value={selectedPoolId}>
				<Select.Trigger class="w-45">{poolTriggerContent}</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">Toutes les poules</Select.Item>
					{#each data.pools as pool}
						<Select.Item value={pool.id.toString()}>{pool.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<!-- Status filter -->
			<Select.Root type="single" bind:value={selectedStatus}>
				<Select.Trigger class="w-45">{statusTriggerContent}</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">Tous les status</Select.Item>
					<Select.Item value="ONGOING">Programmé</Select.Item>
					<Select.Item value="CANCELED">Annulé</Select.Item>
					<Select.Item value="COMPLETED">Terminé</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	{/if}

	<!-- Global reset button -->
	{#if hasActiveFilters}
		<Button
			variant="outline"
			size="icon"
			onclick={onReset}
			title="Réinitialiser les filtres"
			class="h-9 w-9"
		>
			<RotateCcw class="h-4 w-4" />
		</Button>
	{/if}
</div>
