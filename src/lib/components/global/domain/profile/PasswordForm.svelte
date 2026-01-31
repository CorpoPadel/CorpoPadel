<script lang="ts">
	import { Button } from '$lib/components/shadcn/ui/button';
	import { Input } from '$lib/components/shadcn/ui/input';
	import { Label } from '$lib/components/shadcn/ui/label';
	import * as Card from '$lib/components/shadcn/ui/card';
	import Loader2 from '~icons/lucide/loader-2';
	import FormError from '$lib/components/global/FormError.svelte';
	import { enhance } from '$app/forms';
	import { changePasswordSchema } from '$lib/validations/auth';

	let {
		fieldErrors: serverErrors,
		isLoading = $bindable()
	}: {
		fieldErrors: Record<string, string>;
		isLoading: boolean;
	} = $props();

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let clientErrors = $state<Record<string, string>>({});

	let errors = $derived({ ...serverErrors, ...clientErrors });
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Sécurité</Card.Title>
		<Card.Description>Changez votre mot de passe pour sécuriser votre compte.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="POST"
			action="?/changePassword"
			use:enhance={({ formData, cancel }) => {
				clientErrors = {};
				const data = Object.fromEntries(formData);
				const result = changePasswordSchema.safeParse(data);

				if (!result.success) {
					const fieldErrors = result.error.flatten().fieldErrors;
					clientErrors = {
						currentPassword: fieldErrors.currentPassword?.[0] || '',
						newPassword: fieldErrors.newPassword?.[0] || '',
						confirmPassword: fieldErrors.confirmPassword?.[0] || ''
					};
					cancel();
					return;
				}

				isLoading = true;
				return async ({ result, update }) => {
					await update({ reset: false });
					isLoading = false;
					if (result.type === 'success') {
						currentPassword = '';
						newPassword = '';
						confirmPassword = '';
						clientErrors = {};
					}
				};
			}}
		>
			<div class="grid max-w-md gap-4">
				<div class="grid gap-2">
					<Label for="currentPassword">Mot de passe actuel</Label>
					<Input
						id="currentPassword"
						name="currentPassword"
						type="password"
						bind:value={currentPassword}
						required
						class={errors.currentPassword ? 'border-destructive' : ''}
					/>
					<FormError error={errors.currentPassword} />
				</div>
				<div class="grid gap-2">
					<Label for="newPassword">Nouveau mot de passe</Label>
					<Input
						id="newPassword"
						name="newPassword"
						type="password"
						bind:value={newPassword}
						required
						class={errors.newPassword ? 'border-destructive' : ''}
					/>
					<FormError error={errors.newPassword} />
				</div>
				<div class="grid gap-2">
					<Label for="confirmPassword">Confirmer le nouveau mot de passe</Label>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						required
						class={errors.confirmPassword
							? 'border-destructive focus-visible:ring-destructive'
							: ''}
					/>
					<FormError error={errors.confirmPassword} />
				</div>
				<div class="pt-2">
					<Button type="submit" variant="outline" disabled={isLoading} class="w-full sm:w-auto">
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Mettre à jour le mot de passe
					</Button>
				</div>
			</div>
		</form>
	</Card.Content>
</Card.Root>
