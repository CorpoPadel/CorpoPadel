<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Button } from '$lib/components/shadcn/ui/button';
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import PlusIcon from '~icons/lucide/plus';
	import PlayerTable from '$lib/components/global/domain/admin/players/PlayerTable.svelte';
	import PlayerDialog from '$lib/components/global/domain/admin/players/PlayerDialog.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let dialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let selectedPlayer = $state<any>(null);
	let fieldErrors = $state<Record<string, string>>({});

	function openCreate() {
		selectedPlayer = null;
		fieldErrors = {};
		dialogOpen = true;
	}

	function openEdit(player: any) {
		selectedPlayer = player;
		fieldErrors = {};
		dialogOpen = true;
	}

	function openDelete(player: any) {
		selectedPlayer = player;
		deleteDialogOpen = true;
	}

	$effect(() => {
		if (form?.success) {
			dialogOpen = false;
			deleteDialogOpen = false;
			toast.success('Action effectuée avec succès');
			fieldErrors = {};
		} else if (form?.issues) {
			toast.error('Erreur de validation');
			const newErrors: Record<string, string> = {};
			form.issues.forEach((issue: any) => {
				newErrors[issue.path[0]] = issue.message;
			});
			fieldErrors = newErrors;
		} else if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Gestion des Joueurs</h1>
		<Button onclick={openCreate}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Ajouter un joueur
		</Button>
	</div>

	<PlayerTable
		players={data.players}
		currentPlayerId={data.currentPlayerId}
		onEdit={openEdit}
		onDelete={openDelete}
	/>

	<PlayerDialog bind:open={dialogOpen} player={selectedPlayer} bind:fieldErrors />

	<Dialog.Root bind:open={deleteDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Supprimer le joueur</Dialog.Title>
				<Dialog.Description class="font-bold text-destructive"
					>Attention, cette action est irréversible.</Dialog.Description
				>
			</Dialog.Header>
			<p>
				Êtes-vous sûr de vouloir supprimer {selectedPlayer?.firstName}
				{selectedPlayer?.lastName} ?
			</p>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={selectedPlayer?.id} />
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Annuler</Button>
					<Button variant="destructive" type="submit">Supprimer</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
