<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Button } from '$lib/components/shadcn/ui/button';
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { Input } from '$lib/components/shadcn/ui/input';
	import { Label } from '$lib/components/shadcn/ui/label';
	import FormError from '$lib/components/global/FormError.svelte';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import CopyIcon from '~icons/lucide/copy';
	import ShieldIcon from '~icons/lucide/shield';
	import AlertCircleIcon from '~icons/lucide/alert-circle';
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte';
	import AccountTable from '$lib/components/global/domain/admin/accounts/AccountTable.svelte';
	import { createAccountSchema } from '$lib/validations/account';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const app = ApplicationContext.get();

	let successDialogOpen = $state(false);
	let createDialogOpen = $state(false);
	let roleDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	let selectedPlayer = $state<any>(null);
	let roleData = $state<{ player: any; newRole: string } | null>(null);
	let clientErrors = $state<Record<string, string>>({});
	let serverErrors = $state<Record<string, string>>({});

	let fieldErrors = $derived({ ...serverErrors, ...clientErrors });

	let tempPassword = $state('');
	let createdEmail = $state('');
	let isReset = $state(false);

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		toast.success('Copié dans le presse-papier');
	}

	$effect(() => {
		if (form?.success && form?.tempPassword) {
			tempPassword = form.tempPassword;
			createdEmail = form.email;
			isReset = false;
			createDialogOpen = false;
			successDialogOpen = true;
			toast.success('Compte créé avec succès');
			serverErrors = {};
			clientErrors = {};
		} else if (form?.successReset && form?.tempPassword) {
			tempPassword = form.tempPassword;
			createdEmail = 'Compte existant';
			isReset = true;
			successDialogOpen = true;
			toast.success('Mot de passe réinitialisé');
		} else if (form?.successRoleChange) {
			roleDialogOpen = false;
			toast.success('Rôle mis à jour avec succès');
		} else if (form?.successDelete) {
			deleteDialogOpen = false;
			toast.success('Compte supprimé avec succès');
		} else if (form?.issues) {
			toast.error('Erreur de validation');
			const newErrors: Record<string, string> = {};
			form.issues.forEach((issue: any) => {
				newErrors[issue.path[0]] = issue.message;
			});
			serverErrors = newErrors;
		} else if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Gestion des Comptes</h1>
	</div>

	<AccountTable
		players={data.players}
		currentUserId={app.data.user?.id}
		onCreate={(p) => {
			selectedPlayer = p;
			createDialogOpen = true;
			serverErrors = {};
			clientErrors = {};
		}}
		onResetPassword={() => {}}
		onChangeRole={(p, r) => {
			roleData = { player: p, newRole: r };
			roleDialogOpen = true;
		}}
		onDelete={(p) => {
			selectedPlayer = p;
			deleteDialogOpen = true;
		}}
	/>

	<Dialog.Root bind:open={createDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Créer un compte utilisateur</Dialog.Title>
				<Dialog.Description>
					Confirmez la création du compte pour <strong
						>{selectedPlayer?.firstName} {selectedPlayer?.lastName}</strong
					>.
				</Dialog.Description>
			</Dialog.Header>
			{#if !selectedPlayer?.email}
				<div
					class="flex gap-2 rounded border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
				>
					<AlertCircleIcon class="h-5 w-5 shrink-0" />
					<div>
						<span class="font-bold">Erreur :</span> Ce joueur n'a pas d'adresse email. Veuillez d'abord
						ajouter un email dans la gestion des joueurs.
					</div>
				</div>
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (createDialogOpen = false)}>Fermer</Button>
				</Dialog.Footer>
			{:else}
				<form
					method="POST"
					action="?/createAccount"
					use:enhance={({ formData, cancel }) => {
						clientErrors = {};
						const playerId = Number(formData.get('playerId'));

						if (!playerId) {
							clientErrors = { playerId: 'ID joueur invalide' };
							cancel();
							return;
						}

						return async ({ update }) => {
							await update();
						};
					}}
				>
					<input type="hidden" name="playerId" value={selectedPlayer?.id} />
					<div class="grid gap-4 py-4">
						<div class="grid gap-2">
							<Label>Email associé au compte</Label>
							<div class="rounded border bg-muted p-2 font-mono text-sm">
								{selectedPlayer?.email}
							</div>
						</div>
					</div>
					<Dialog.Footer>
						<Button type="submit">Générer le compte</Button>
					</Dialog.Footer>
				</form>
			{/if}
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={successDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title
					>{isReset ? 'Mot de passe réinitialisé' : 'Compte créé avec succès'}</Dialog.Title
				>
				<Dialog.Description
					>Veuillez transmettre ces informations au joueur. Ce mot de passe ne sera affiché qu'une
					seule fois.</Dialog.Description
				>
			</Dialog.Header>
			<div class="grid gap-4 rounded bg-muted p-4 py-4">
				{#if !isReset}
					<div class="grid gap-1">
						<Label class="text-xs text-muted-foreground">Email</Label>
						<div class="font-mono text-sm">{createdEmail}</div>
					</div>
				{/if}
				<div class="grid gap-1">
					<Label class="text-xs text-muted-foreground">Mot de passe temporaire</Label>
					<div class="flex items-center gap-2">
						<div class="font-mono text-lg font-bold tracking-wider">{tempPassword}</div>
						<Button
							variant="ghost"
							size="icon"
							class="h-6 w-6"
							onclick={() => copyToClipboard(tempPassword)}
						>
							<CopyIcon class="h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>
			<Dialog.Footer>
				<Button onclick={() => (successDialogOpen = false)}>Fermer</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={roleDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Confirmer le changement de rôle</Dialog.Title>
				<Dialog.Description>
					Voulez-vous vraiment changer le rôle de <strong
						>{roleData?.player.firstName} {roleData?.player.lastName}</strong
					>
					en
					<span class="font-bold"
						>{roleData?.newRole === 'ADMINISTRATEUR' ? 'Administrateur' : 'Joueur'}</span
					> ?
				</Dialog.Description>
			</Dialog.Header>
			{#if roleData?.newRole === 'ADMINISTRATEUR'}
				<div
					class="flex gap-2 rounded border border-yellow-200 bg-yellow-100 p-3 text-sm text-yellow-800"
				>
					<ShieldIcon class="h-5 w-5 shrink-0" />
					<div>
						<span class="font-bold">Attention :</span> Les administrateurs ont un accès complet au système.
					</div>
				</div>
			{/if}
			<form method="POST" action="?/changeRole" use:enhance>
				<input type="hidden" name="userId" value={roleData?.player.userId} />
				<input type="hidden" name="role" value={roleData?.newRole} />
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (roleDialogOpen = false)}>Annuler</Button>
					<Button
						type="submit"
						variant={roleData?.newRole === 'ADMINISTRATEUR' ? 'default' : 'destructive'}
						>Confirmer</Button
					>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={deleteDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Supprimer le compte utilisateur</Dialog.Title>
				<Dialog.Description
					>Voulez-vous vraiment supprimer le compte de <strong
						>{selectedPlayer?.firstName} {selectedPlayer?.lastName}</strong
					> ?</Dialog.Description
				>
			</Dialog.Header>
			<div
				class="flex gap-2 rounded border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
			>
				<AlertCircleIcon class="h-5 w-5 shrink-0" />
				<div>
					<span class="font-bold">Attention :</span> Cette action supprimera uniquement l'accès utilisateur.
					Les données du joueur associées seront conservées.
				</div>
			</div>
			<form method="POST" action="?/deleteAccount" use:enhance>
				<input type="hidden" name="userId" value={selectedPlayer?.userId} />
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Annuler</Button>
					<Button type="submit" variant="destructive">Supprimer le compte</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
