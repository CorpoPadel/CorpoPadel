<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/shadcn/ui/button';
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { Input } from '$lib/components/shadcn/ui/input';
	import { Label } from '$lib/components/shadcn/ui/label';
	import { Badge } from '$lib/components/shadcn/ui/badge';
	import { Checkbox } from '$lib/components/shadcn/ui/checkbox';
	import FormError from '$lib/components/global/FormError.svelte';
	import { createPoolSchema } from '$lib/validations/pool';

	let {
		open = $bindable(),
		teams,
		pool = null
	}: { open: boolean; teams: any[]; pool?: any | null } = $props();

	let name = $state('');
	let selectedTeamIds = $state<number[]>([]);
	let clientErrors = $state<Record<string, string>>({});

	let isEditMode = $derived(!!pool);

	// Teams available: no pool OR already in this pool
	let availableTeams = $derived(teams.filter((t) => !t.poolId || (pool && t.poolId === pool.id)));

	$effect(() => {
		if (open && pool) {
			name = pool.name;
			// Pre-select teams that are currently in this pool
			// Note: 'pool.teams' might not be populated in the 'pool' object passed from the table row if the table doesn't have them.
			// The parent component passes 'pools' which has 'teams' relation loaded (from PoolService.getAll).
			// So we can assume pool.teams exists.
			selectedTeamIds = pool.teams?.map((t: any) => t.id) || [];
		} else if (open && !pool) {
			reset();
		}
	});

	function reset() {
		name = '';
		selectedTeamIds = [];
		clientErrors = {};
	}

	function toggleTeam(teamId: number, checked: boolean) {
		if (checked) {
			if (selectedTeamIds.length < 6) {
				selectedTeamIds = [...selectedTeamIds, teamId];
			}
		} else {
			selectedTeamIds = selectedTeamIds.filter((id) => id !== teamId);
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => !v && reset()}>
	<Dialog.Content class="sm:max-w-150">
		<Dialog.Header>
			<Dialog.Title>{isEditMode ? 'Modifier la Poule' : 'Nouvelle Poule'}</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action={isEditMode ? '?/update' : '?/create'}
			use:enhance={({ formData, cancel }) => {
				clientErrors = {};

				// Manually append array data
				selectedTeamIds.forEach((id) => formData.append('teamIds', id.toString()));

				const nameVal = formData.get('name');
				// Quick client-side validation using Zod schema
				const result = createPoolSchema.safeParse({
					name: nameVal,
					team_ids: selectedTeamIds
				});

				if (!result.success) {
					const fieldErrors = result.error.flatten().fieldErrors;
					clientErrors = {
						name: fieldErrors.name?.[0] || '',
						teamIds: fieldErrors.team_ids?.[0] || ''
					};
					cancel();
					return;
				}

				return async ({ result, update }) => {
					if (result.type === 'success') {
						open = false;
						reset();
					}
					update();
				};
			}}
		>
			{#if isEditMode}
				<input type="hidden" name="id" value={pool.id} />
			{/if}

			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="name">Nom de la poule</Label>
					<Input
						id="name"
						name="name"
						bind:value={name}
						placeholder="Ex: Poule C"
						aria-invalid={!!clientErrors.name}
					/>
					<FormError error={clientErrors.name} />
				</div>

				<div class="grid gap-2">
					<div class="flex items-center justify-between">
						<Label>Équipes ({selectedTeamIds.length}/6)</Label>
						{#if selectedTeamIds.length !== 6}
							<span class="text-xs text-destructive"
								>Vous devez sélectionner exactement 6 équipes</span
							>
						{:else}
							<span class="text-xs text-green-600">Sélection complète</span>
						{/if}
					</div>

					<div class="max-h-75 overflow-y-auto rounded-md border p-2">
						{#if availableTeams.length === 0}
							<p class="p-2 text-sm text-muted-foreground">Aucune équipe disponible.</p>
						{:else}
							<div class="grid gap-2">
								{#each availableTeams as team}
									{@const isSelected = selectedTeamIds.includes(team.id)}
									<div class="flex items-center space-x-2 rounded p-1 hover:bg-muted/50">
										<Checkbox
											id="team-{team.id}"
											checked={isSelected}
											onCheckedChange={(v) => toggleTeam(team.id, v as boolean)}
											disabled={!isSelected && selectedTeamIds.length >= 6}
										/>
										<Label
											for="team-{team.id}"
											class="flex flex-1 cursor-pointer items-center justify-between"
										>
											<span>{team.company}</span>
											<span class="text-xs text-muted-foreground">
												{team.player1.firstName} & {team.player2.firstName}
											</span>
										</Label>
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<FormError error={clientErrors.teamIds} />
				</div>
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={selectedTeamIds.length !== 6}>
					{isEditMode ? 'Enregistrer' : 'Créer la poule'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
