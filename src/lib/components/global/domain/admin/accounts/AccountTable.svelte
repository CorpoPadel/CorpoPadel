<script lang="ts">
	import * as Table from '$lib/components/shadcn/ui/table';
	import { Button } from '$lib/components/shadcn/ui/button';
	import ShieldIcon from '~icons/lucide/shield';
	import UserIcon from '~icons/lucide/user';
	import KeyIcon from '~icons/lucide/key-round';
	import TrashIcon from '~icons/lucide/trash-2';
	import UserPlusIcon from '~icons/lucide/user-plus';
	import CheckCircleIcon from '~icons/lucide/check-circle';
	import AlertCircleIcon from '~icons/lucide/alert-circle';
	import { enhance } from '$app/forms';

	/**
	 * Table component for managing user accounts and their roles.
	 */
	let {
		players,
		currentUserId,
		onCreate,
		onResetPassword,
		onChangeRole,
		onDelete
	}: {
		/** List of players with their linked user accounts */
		players: any[];
		/** ID of the currently logged-in administrator (to prevent self-actions) */
		currentUserId?: string;
		onCreate: (p: any) => void;
		onResetPassword: (p: any) => void;
		onChangeRole: (p: any, role: string) => void;
		onDelete: (p: any) => void;
	} = $props();

	/** Resolves the display label for a player's primary role */
	function getRoleLabel(player: any) {
		if (!player.user || !player.user.userRoles || player.user.userRoles.length === 0)
			return 'Aucun';
		const roles = player.user.userRoles.map((ur: any) => ur.role.label);
		if (roles.includes('ADMINISTRATEUR')) return 'ADMINISTRATEUR';
		return roles[0];
	}
</script>

<div class="rounded-md border bg-card">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Joueur</Table.Head>
				<Table.Head>Email Compte</Table.Head>
				<Table.Head>Rôle</Table.Head>
				<Table.Head>Statut Compte</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each players as player (player.id)}
				{@const role = getRoleLabel(player)}
				{@const isMe = player.userId == currentUserId}
				<Table.Row>
					<Table.Cell class="font-medium">{player.firstName} {player.lastName}</Table.Cell>
					<Table.Cell class="text-muted-foreground">{player.user?.email || '-'}</Table.Cell>
					<Table.Cell>
						<!-- Role display with icon -->
						{#if player.user}
							<div class="flex items-center gap-2">
								{#if role === 'ADMINISTRATEUR'}
									<ShieldIcon class="h-4 w-4 text-purple-500" />
									<span class="text-xs font-bold text-purple-500">Admin</span>
								{:else}
									<UserIcon class="h-4 w-4 text-primary" />
									<span class="text-xs text-primary">Joueur</span>
								{/if}
							</div>
						{:else}
							-
						{/if}
					</Table.Cell>
					<Table.Cell>
						<!-- Account creation status -->
						{#if player.user}
							<div class="flex items-center gap-2 text-green-600">
								<CheckCircleIcon class="h-4 w-4" />
								<span class="text-xs font-medium">Actif</span>
							</div>
						{:else}
							<div class="flex items-center gap-2 text-amber-600">
								<AlertCircleIcon class="h-4 w-4" />
								<span class="text-xs font-medium">Inexistant</span>
							</div>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-right">
						{#if !player.user}
							<!-- Prompt to create account for unlinked players -->
							<Button variant="outline" size="sm" onclick={() => onCreate(player)}>
								<UserPlusIcon class="mr-2 h-4 w-4" />
								Créer Compte
							</Button>
						{:else}
							<!-- Account actions for existing users -->
							<div class="flex items-center justify-end gap-1">
								<form method="POST" action="?/resetPassword" use:enhance class="inline-block">
									<input type="hidden" name="userId" value={player.userId} />
									<Button
										variant="ghost"
										size="icon"
										type="submit"
										title="Réinitialiser le mot de passe"
									>
										<KeyIcon class="h-4 w-4" />
									</Button>
								</form>

								{#if !isMe}
									{#if role === 'ADMINISTRATEUR'}
										<Button
											variant="ghost"
											size="icon"
											class="text-destructive hover:text-destructive"
											title="Rétrograder en Joueur"
											onclick={() => onChangeRole(player, 'JOUEUR')}
										>
											<UserIcon class="h-4 w-4" />
										</Button>
									{:else}
										<Button
											variant="ghost"
											size="icon"
											class="text-purple-500 hover:text-purple-500"
											title="Promouvoir Admin"
											onclick={() => onChangeRole(player, 'ADMINISTRATEUR')}
										>
											<ShieldIcon class="h-4 w-4" />
										</Button>
									{/if}

									<Button
										variant="ghost"
										size="icon"
										class="text-destructive hover:text-destructive"
										title="Supprimer le compte"
										onclick={() => onDelete(player)}
									>
										<TrashIcon class="h-4 w-4" />
									</Button>
								{/if}
							</div>
						{/if}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
