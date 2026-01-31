<script lang="ts">
	import * as Table from '$lib/components/shadcn/ui/table';
	import { Button } from '$lib/components/shadcn/ui/button';
	import TrashIcon from '~icons/lucide/trash-2';
	import PencilIcon from '~icons/lucide/pencil';

	/**
	 * Table component for displaying and managing team duos.
	 */
	let {
		teams,
		onDelete,
		onEdit
	}: {
		/** List of tournament teams with linked players and pool */
		teams: any[];
		onDelete: (team: any) => void;
		onEdit: (team: any) => void;
	} = $props();
</script>

<div class="rounded-md border bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Entreprise</Table.Head>
				<Table.Head>Joueur 1</Table.Head>
				<Table.Head>Joueur 2</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each teams as team (team.id)}
				<Table.Row>
					<Table.Cell class="font-semibold">{team.company}</Table.Cell>
					<Table.Cell>{team.player1.firstName} {team.player1.lastName}</Table.Cell>
					<Table.Cell>{team.player2.firstName} {team.player2.lastName}</Table.Cell>
					<Table.Cell class="text-right">
						<Button variant="ghost" size="icon" onclick={() => onEdit(team)}>
							<PencilIcon class="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="text-destructive hover:text-destructive"
							onclick={() => onDelete(team)}
						>
							<TrashIcon class="h-4 w-4" />
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
