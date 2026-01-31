<script lang="ts">
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { Button } from '$lib/components/shadcn/ui/button';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(false),
		eventId,
		onDeleteSuccess
	}: {
		open: boolean;
		eventId: number | null;
		onDeleteSuccess?: () => void;
	} = $props();

	let isDeleting = $state(false);

	async function confirmDelete() {
		if (!eventId) return;
		isDeleting = true;
		try {
			const res = await fetch(`/api/v1/events/${eventId}`, { method: 'DELETE' });
			if (res.ok) {
				toast.success('Événement supprimé');
				open = false;
				onDeleteSuccess?.();
			} else {
				const data = await res.json();
				toast.error(data.error || 'Erreur lors de la suppression');
			}
		} catch (err) {
			toast.error('Erreur lors de la suppression');
		} finally {
			isDeleting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirmer la suppression</Dialog.Title>
			<Dialog.Description>
				Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
			<Button variant="destructive" onclick={confirmDelete} disabled={isDeleting}>
				{isDeleting ? 'Suppression...' : 'Supprimer'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
