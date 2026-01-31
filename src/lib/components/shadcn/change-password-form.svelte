<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/shadcn/ui/button/index';
	import { Field, FieldGroup, FieldLabel } from '$lib/components/shadcn/ui/field/index';
	import { Input } from '$lib/components/shadcn/ui/input';
	import { cn, type WithElementRef } from '$lib/utils/utils';
	import { changePasswordSchema } from '$lib/validations/auth';
	import type { HTMLAttributes } from 'svelte/elements';
	import GalleryVerticalEndIcon from '~icons/lucide/gallery-vertical-end';
	import Loader2 from '~icons/lucide/loader-2';

	let {
		ref = $bindable(null),
		class: className,
		form,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & { form: any } = $props();

	let isLoading = $state(false);
	let clientErrors = $state<Record<string, string>>({});

	let errors = $derived({
		...form?.issues,
		...clientErrors
	});
</script>

<div class={cn('flex flex-col gap-6', className)} bind:this={ref} {...restProps}>
	<form
		method="POST"
		use:enhance={({ formData, cancel }) => {
			clientErrors = {};
			const currentPassword = formData.get('currentPassword') as string;
			const newPassword = formData.get('newPassword') as string;
			const confirmPassword = formData.get('confirmPassword') as string;

			const result = changePasswordSchema.safeParse({
				currentPassword,
				newPassword,
				confirmPassword
			});

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
			return async ({ update }) => {
				isLoading = false;
				update();
			};
		}}
	>
		<FieldGroup>
			<div class="flex flex-col items-center gap-2 text-center">
				<a href="##" class="flex flex-col items-center gap-2 font-medium">
					<div class="flex size-8 items-center justify-center rounded-md">
						<GalleryVerticalEndIcon class="size-6" />
					</div>
					<span class="sr-only">CorpoPadel</span>
				</a>
				<h1 class="text-xl font-bold">Changer votre mot de passe</h1>
				<p class="text-sm text-muted-foreground">
					Pour votre sécurité, vous devez changer votre mot de passe.
				</p>
			</div>

			{#if form?.error}
				<div
					class="animate-in rounded-md bg-destructive/15 p-3 text-center text-sm font-medium text-destructive fade-in slide-in-from-top-2"
				>
					{form.error}
				</div>
			{/if}

			<Field>
				<FieldLabel for="currentPassword">Mot de passe actuel</FieldLabel>
				<Input
					id="currentPassword"
					name="currentPassword"
					type="password"
					placeholder="Mot de passe actuel"
					disabled={isLoading}
					class={errors?.currentPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
				/>
				{#if errors?.currentPassword}
					<p class="mt-1 text-xs font-medium text-destructive">{errors.currentPassword}</p>
				{/if}
			</Field>

			<Field>
				<FieldLabel for="newPassword">Nouveau mot de passe</FieldLabel>
				<Input
					id="newPassword"
					name="newPassword"
					type="password"
					placeholder="Min. 12 caractères"
					disabled={isLoading}
					class={errors?.newPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
				/>
				{#if errors?.newPassword}
					<p class="mt-1 text-xs font-medium text-destructive">{errors.newPassword}</p>
				{/if}
			</Field>

			<Field>
				<FieldLabel for="confirmPassword">Confirmer le mot de passe</FieldLabel>
				<Input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					placeholder="Confirmez le mot de passe"
					disabled={isLoading}
					class={errors?.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
				/>
				{#if errors?.confirmPassword}
					<p class="mt-1 text-xs font-medium text-destructive">{errors.confirmPassword}</p>
				{/if}
			</Field>

			<Field>
				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<Loader2 class="mr-2 size-4 animate-spin" />
						Changement en cours...
					{:else}
						Changer le mot de passe
					{/if}
				</Button>
			</Field>
		</FieldGroup>
	</form>
</div>
