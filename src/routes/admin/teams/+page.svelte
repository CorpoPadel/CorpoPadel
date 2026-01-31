<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Button } from '$lib/components/shadcn/ui/button';
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import PlusIcon from '~icons/lucide/plus';
	import TeamDialog from '$lib/components/global/domain/admin/teams/TeamDialog.svelte';
	import TeamTable from '$lib/components/global/domain/admin/teams/TeamTable.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let dialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let selectedTeam = $state<any>(null);

	function openCreate() {
		selectedTeam = null;
		dialogOpen = true;
	}

	function openEdit(team: any) {
		selectedTeam = team;
		dialogOpen = true;
	}

	function openDelete(team: any) {
		selectedTeam = team;
		deleteDialogOpen = true;
	}

	$effect(() => {
		if (form?.success) {
			dialogOpen = false;
			deleteDialogOpen = false;
			toast.success('Action effectuée');
		} else if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Gestion des Équipes</h1>
		<Button onclick={openCreate}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Créer une équipe
		</Button>
	</div>

	<TeamTable teams={data.teams} onDelete={openDelete} onEdit={openEdit} />

	<TeamDialog bind:open={dialogOpen} {data} team={selectedTeam} />

	<Dialog.Root bind:open={deleteDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Supprimer l'équipe</Dialog.Title>
			</Dialog.Header>
			<p>Voulez-vous vraiment supprimer l'équipe <strong>{selectedTeam?.company}</strong> ?</p>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={selectedTeam?.id} />
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Annuler</Button>
					<Button variant="destructive" type="submit">Supprimer</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
