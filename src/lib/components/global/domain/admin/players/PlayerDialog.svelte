<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/shadcn/ui/button';
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import { Input } from '$lib/components/shadcn/ui/input';
	import { Label } from '$lib/components/shadcn/ui/label';
	import FormError from '$lib/components/global/FormError.svelte';
	import { createPlayerSchema, updatePlayerSchema } from '$lib/validations/player';

	let {
		open = $bindable(),
		player = null,
		fieldErrors: serverErrors = $bindable({})
	}: {
		open: boolean;
		player?: any;
		fieldErrors: Record<string, string>;
	} = $props();

	const isEdit = $derived(!!player);
	let clientErrors = $state<Record<string, string>>({});
	let errors = $derived({ ...serverErrors, ...clientErrors });
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{isEdit ? 'Modifier le joueur' : 'Ajouter un joueur'}</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action={isEdit ? '?/update' : '?/create'}
			use:enhance={({ formData, cancel }) => {
				clientErrors = {};
				const data = Object.fromEntries(formData);

				const schema = isEdit ? updatePlayerSchema : createPlayerSchema;
				const result = schema.safeParse(data);

				if (!result.success) {
					const fieldErrors = result.error.flatten().fieldErrors;
					clientErrors = Object.fromEntries(
						Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] || ''])
					);
					cancel();
					return;
				}

				return async ({ update }) => {
					await update({ reset: false });
				};
			}}
		>
			{#if isEdit}
				<input type="hidden" name="id" value={player.id} />
			{/if}
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="lastName">Nom</Label>
					<Input
						id="lastName"
						name="lastName"
						value={player?.lastName ?? ''}
						required
						aria-invalid={!!errors.lastName}
					/>
					<FormError error={errors.lastName} />
				</div>
				<div class="grid gap-2">
					<Label for="firstName">Prénom</Label>
					<Input
						id="firstName"
						name="firstName"
						value={player?.firstName ?? ''}
						required
						aria-invalid={!!errors.firstName}
					/>
					<FormError error={errors.firstName} />
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						value={player?.email ?? ''}
						required
						disabled={isEdit}
						aria-invalid={!!errors.email}
					/>
					<FormError error={errors.email} />
				</div>
				<div class="grid gap-2">
					<Label for="company">Entreprise</Label>
					<Input
						id="company"
						name="company"
						value={player?.company ?? ''}
						required
						aria-invalid={!!errors.company}
					/>
					<FormError error={errors.company} />
				</div>
				<div class="grid gap-2">
					<Label for="licenseNumber">N° Licence</Label>
					<Input
						id="licenseNumber"
						name="licenseNumber"
						value={player?.licenseNumber ?? ''}
						required
						placeholder="L123456"
						aria-invalid={!!errors.licenseNumber}
						disabled={isEdit}
					/>
					<FormError error={errors.licenseNumber} />
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit">{isEdit ? 'Enregistrer' : 'Créer'}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
