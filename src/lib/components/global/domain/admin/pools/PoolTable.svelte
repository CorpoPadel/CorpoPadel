<script lang="ts">
	import * as Table from '$lib/components/shadcn/ui/table';
	import { Button } from '$lib/components/shadcn/ui/button';
	import TrashIcon from '~icons/lucide/trash-2';
	import PencilIcon from '~icons/lucide/pencil';

	let {
		pools,
		onDelete,
		onEdit
	}: { pools: any[]; onDelete: (pool: any) => void; onEdit: (pool: any) => void } = $props();
</script>

<div class="rounded-md border bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Nom</Table.Head>
				<Table.Head>Équipes</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each pools as pool (pool.id)}
				<Table.Row>
					<Table.Cell class="font-semibold">{pool.name}</Table.Cell>
					<Table.Cell>{pool.teams?.length || 0} équipes</Table.Cell>
					<Table.Cell class="text-right">
						<Button variant="ghost" size="icon" onclick={() => onEdit(pool)}>
							<PencilIcon class="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="text-destructive hover:text-destructive"
							onclick={() => onDelete(pool)}
						>
							<TrashIcon class="h-4 w-4" />
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
