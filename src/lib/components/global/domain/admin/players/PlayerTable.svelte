<script lang="ts">
	import * as Table from '$lib/components/shadcn/ui/table';
	import { Button } from '$lib/components/shadcn/ui/button';
	import PencilIcon from '~icons/lucide/pencil';
	import TrashIcon from '~icons/lucide/trash-2';

	/**
	 * Table component for displaying and managing players.
	 */
	let {
		players,
		currentPlayerId,
		onEdit,
		onDelete
	}: {
		/** List of player profiles */
		players: any[];
		/** ID of the player profile linked to current user */
		currentPlayerId?: number;
		onEdit: (p: any) => void;
		onDelete: (p: any) => void;
	} = $props();
</script>

<div class="rounded-md border bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Nom</Table.Head>
				<Table.Head>Prénom</Table.Head>
				<Table.Head>Entreprise</Table.Head>
				<Table.Head>Licence</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each players as player (player.id)}
				<Table.Row>
					<Table.Cell>{player.lastName}</Table.Cell>
					<Table.Cell>{player.firstName}</Table.Cell>
					<Table.Cell>{player.company}</Table.Cell>
					<Table.Cell class="font-mono">{player.licenseNumber}</Table.Cell>
					<Table.Cell class="text-right">
						<Button variant="ghost" size="icon" onclick={() => onEdit(player)}>
							<PencilIcon class="h-4 w-4" />
						</Button>
						<!-- Disable deletion for the current administrator's own player profile -->
						{#if player.id !== currentPlayerId}
							<Button
								variant="ghost"
								size="icon"
								class="text-destructive hover:text-destructive"
								onclick={() => onDelete(player)}
							>
								<TrashIcon class="h-4 w-4" />
							</Button>
						{/if}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
