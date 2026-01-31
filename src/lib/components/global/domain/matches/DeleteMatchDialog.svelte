<script lang="ts">
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { Button } from '$lib/components/shadcn/ui/button';
	import { toast } from 'svelte-sonner';
	import type { Match } from '$lib/models/match';

	let {
		open = $bindable(false),
		match,
		onDeleteSuccess
	}: {
		open: boolean;
		match: Match | null;
		onDeleteSuccess?: () => void;
	} = $props();

	let isDeleting = $state(false);

	async function confirmDelete() {
		if (!match) return;
		isDeleting = true;
		try {
			const res = await fetch(`/api/v1/events/${match.eventId}`);
			const result = await res.json();

			if (!result.success)
				throw new Error(result.error?.message || "Impossible de récupérer l'événement");

			const event = result.data;

			if (!event) throw new Error('Événement introuvable');

			const remainingMatches = event.matches.filter((m: any) => m.id !== match!.id);

			if (remainingMatches.length === 0) {
				const delRes = await fetch(`/api/v1/events/${event.id}`, { method: 'DELETE' });
				const delResult = await delRes.json();
				if (!delResult.success)
					throw new Error(delResult.error?.message || 'Erreur lors de la suppression');
			} else {
				const cleanedMatches = remainingMatches.map((m: any) => ({
					courtNumber: m.courtNumber,
					team1Id: typeof m.team1 === 'object' ? m.team1.id : m.team1Id,
					team2Id: typeof m.team2 === 'object' ? m.team2.id : m.team2Id,
					status: m.status
				}));

				const data = {
					id: event.id,
					date: event.eventDate,
					time: event.eventTime,
					matches: cleanedMatches
				};

				const updateRes = await fetch(`/api/v1/events/${event.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data)
				});
				const updateResult = await updateRes.json();
				if (!updateResult.success)
					throw new Error(updateResult.error?.message || 'Erreur lors de la mise à jour');
			}

			toast.success('Match supprimé');
			open = false;
			onDeleteSuccess?.();
		} catch (err: any) {
			toast.error(err.message || 'Erreur lors de la suppression');
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
				Êtes-vous sûr de vouloir supprimer ce match ? Cette action est irréversible.
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
