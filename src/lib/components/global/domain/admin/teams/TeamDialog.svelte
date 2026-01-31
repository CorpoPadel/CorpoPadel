<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/shadcn/ui/button';
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { Label } from '$lib/components/shadcn/ui/label';
	import * as Select from '$lib/components/shadcn/ui/select';
	import type { Player } from '$lib/models/player';
	import type { Pool } from '$lib/models/pool';
	import { createTeamSchema } from '$lib/validations/team';
	import FormError from '$lib/components/global/FormError.svelte';

	let {
		open = $bindable(),
		data,
		team = null
	}: { open: boolean; data: any; team?: any | null } = $props();

	let selectedCompany = $state<string>('');
	let player1Id = $state<string>('');
	let player2Id = $state<string>('');
	let clientErrors = $state<Record<string, string>>({});

	let isEditMode = $derived(!!team);

	// Initialize form when 'team' prop changes or dialog opens
	$effect(() => {
		if (open && team) {
			selectedCompany = team.company;
			player1Id = team.player1Id.toString();
			player2Id = team.player2Id.toString();
		} else if (open && !team) {
			reset();
		}
	});

	let companies = $derived(
		[...new Set(data.players.map((p: Player) => p.company))].sort() as string[]
	);

	let availablePlayers = $derived(
		selectedCompany ? data.players.filter((p: Player) => p.company === selectedCompany) : []
	);

	const companyLabel = $derived(selectedCompany || 'Choisir une entreprise');

	const p1Label = $derived(
		player1Id
			? (() => {
					// Check available players first
					let p = availablePlayers.find((p: Player) => p.id.toString() === player1Id);
					// If not found (maybe because company changed but p1Id still set, or initial load), try all players
					if (!p) p = data.players.find((p: Player) => p.id.toString() === player1Id);
					return p ? `${p.firstName} ${p.lastName}` : 'Choisir le joueur 1';
				})()
			: 'Choisir le joueur 1'
	);

	const p2Label = $derived(
		player2Id
			? (() => {
					let p = availablePlayers.find((p: Player) => p.id.toString() === player2Id);
					if (!p) p = data.players.find((p: Player) => p.id.toString() === player2Id);
					return p ? `${p.firstName} ${p.lastName}` : 'Choisir le joueur 2';
				})()
			: 'Choisir le joueur 2'
	);

	function reset() {
		selectedCompany = '';
		player1Id = '';
		player2Id = '';
		clientErrors = {};
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => !v && reset()}>
	<Dialog.Content class="sm:max-w-125">
		<Dialog.Header>
			<Dialog.Title>{isEditMode ? "Modifier l'équipe" : 'Nouvelle Équipe'}</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action={isEditMode ? '?/update' : '?/create'}
			use:enhance={({ formData, cancel }) => {
				clientErrors = {};

				const company = formData.get('company') as string;
				const p1 = Number(formData.get('player1Id'));
				const p2 = Number(formData.get('player2Id'));

				const result = createTeamSchema.safeParse({
					company,
					player1Id: p1,
					player2Id: p2
				});

				if (!result.success) {
					const fieldErrors = result.error.flatten().fieldErrors;
					clientErrors = {
						company: fieldErrors.company?.[0] || '',
						player1Id: fieldErrors.player1Id?.[0] || '',
						player2Id: fieldErrors.player2Id?.[0] || ''
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
				<input type="hidden" name="id" value={team.id} />
			{/if}

			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label>Entreprise</Label>
					<Select.Root type="single" bind:value={selectedCompany}>
						<Select.Trigger class="w-full" aria-invalid={!!clientErrors.company}
							>{companyLabel}</Select.Trigger
						>
						<Select.Content>
							{#each companies as company}
								<Select.Item value={company} label={company}>{company}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="company" value={selectedCompany} />
					<FormError error={clientErrors.company} />
				</div>

				<div class="grid gap-2">
					<Label>Joueur 1</Label>
					<Select.Root type="single" bind:value={player1Id} disabled={!selectedCompany}>
						<Select.Trigger class="w-full" aria-invalid={!!clientErrors.player1Id}
							>{p1Label}</Select.Trigger
						>
						<Select.Content>
							{#each availablePlayers as p}
								<Select.Item
									value={p.id.toString()}
									label={`${p.firstName} ${p.lastName}`}
									disabled={p.id.toString() === player2Id}
								>
									{p.firstName}
									{p.lastName}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="player1Id" value={player1Id} />
					<FormError error={clientErrors.player1Id} />
				</div>

				<div class="grid gap-2">
					<Label>Joueur 2</Label>
					<Select.Root type="single" bind:value={player2Id} disabled={!selectedCompany}>
						<Select.Trigger class="w-full" aria-invalid={!!clientErrors.player2Id}
							>{p2Label}</Select.Trigger
						>
						<Select.Content>
							{#each availablePlayers as p}
								<Select.Item
									value={p.id.toString()}
									label={`${p.firstName} ${p.lastName}`}
									disabled={p.id.toString() === player1Id}
								>
									{p.firstName}
									{p.lastName}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="player2Id" value={player2Id} />
					<FormError error={clientErrors.player2Id} />
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit">{isEditMode ? "Modifier l'équipe" : "Créer l'équipe"}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
