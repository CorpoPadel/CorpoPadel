<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Button } from '$lib/components/shadcn/ui/button';
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import PlusIcon from '~icons/lucide/plus';
	import PoolTable from '$lib/components/global/domain/admin/pools/PoolTable.svelte';
	import PoolDialog from '$lib/components/global/domain/admin/pools/PoolDialog.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let dialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
	let selectedPool = $state<any>(null);

	function openCreate() {
		selectedPool = null;
		dialogOpen = true;
	}

	function openEdit(pool: any) {
		selectedPool = pool;
		dialogOpen = true;
	}

	function openDelete(pool: any) {
		selectedPool = pool;
		deleteDialogOpen = true;
	}

	$effect(() => {
		if (form?.success) {
			dialogOpen = false;
			deleteDialogOpen = false;
			selectedPool = null;
			toast.success('Action effectuée avec succès');
		} else if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Gestion des Poules</h1>
		<Button onclick={openCreate}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Créer une poule
		</Button>
	</div>

	<PoolTable pools={data.pools} onDelete={openDelete} onEdit={openEdit} />

	<PoolDialog bind:open={dialogOpen} teams={data.teams} pool={selectedPool} />

	<Dialog.Root bind:open={deleteDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Supprimer la poule</Dialog.Title>
			</Dialog.Header>
			<p>Voulez-vous vraiment supprimer la poule <strong>{selectedPool?.name}</strong> ?</p>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={selectedPool?.id} />
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Annuler</Button>
					<Button variant="destructive" type="submit">Supprimer</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
