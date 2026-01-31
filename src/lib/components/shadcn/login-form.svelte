<script lang="ts">
	import { authClient } from '$lib/auth/authClient';
	import { Button } from '$lib/components/shadcn/ui/button/index';
	import {
		Field,
		FieldDescription,
		FieldGroup,
		FieldLabel
	} from '$lib/components/shadcn/ui/field/index';
	import { Input } from '$lib/components/shadcn/ui/input';
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte';
	import { cn, type WithElementRef } from '$lib/utils/utils';
	import { loginSchema } from '$lib/validations/auth';
	import type { HTMLAttributes } from 'svelte/elements';
	import GalleryVerticalEndIcon from '~icons/lucide/gallery-vertical-end';
	import Loader2 from '~icons/lucide/loader-2';

	interface AuthErrorBody {
		message?: string;
		remainingAttempts?: number;
		status?: number;
	}

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const app = ApplicationContext.get();
	const id = $props.id();

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);

	let fieldErrors = $state<Record<string, string[]>>({});
	let generalError = $state('');
	let remainingAttempts = $state<number | undefined>(undefined);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;

		fieldErrors = {};
		generalError = '';
		remainingAttempts = undefined;

		const result = loginSchema.safeParse({ email, password });

		if (!result.success) {
			const errors: Record<string, string[]> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				if (!errors[field]) errors[field] = [];
				errors[field].push(issue.message);
			}
			fieldErrors = errors;
			isLoading = false;
			return;
		}

		const shouldRedirectTo = (app.state.redirectTo as string) ?? '/';

		await authClient.signIn.email(
			{
				email,
				password,
				callbackURL: shouldRedirectTo
			},
			{
				onSuccess: async () => {
					window.location.href = shouldRedirectTo;
				},
				onError: (ctx) => {
					isLoading = false;

					const errorData = ctx.error as unknown as AuthErrorBody;

					generalError = errorData.message || ctx.error.message || 'Une erreur est survenue.';

					if (errorData.remainingAttempts !== undefined) {
						remainingAttempts = errorData.remainingAttempts;
					}
				}
			}
		);
	}
</script>

<div class={cn('flex flex-col gap-6', className)} bind:this={ref} {...restProps}>
	<form onsubmit={handleSubmit}>
		<FieldGroup>
			<div class="flex flex-col items-center gap-2 text-center">
				<a href="##" class="flex flex-col items-center gap-2 font-medium">
					<div class="flex size-8 items-center justify-center rounded-md">
						<GalleryVerticalEndIcon class="size-6" />
					</div>
					<span class="sr-only">CorpoPadel</span>
				</a>
				<h1 class="text-xl font-bold">Bienvenue sur CorpoPadel</h1>
			</div>

			{#if generalError}
				<div
					class="flex animate-in flex-col gap-1 rounded-md bg-destructive/15 p-3 text-center text-sm font-medium text-destructive fade-in slide-in-from-top-2"
				>
					<span>{generalError}</span>

					{#if remainingAttempts !== undefined}
						<span class="text-xs opacity-90">
							Il vous reste <strong>{remainingAttempts}</strong> tentative{remainingAttempts > 1
								? 's'
								: ''}.
						</span>
					{/if}
				</div>
			{/if}

			<Field>
				<FieldLabel for="email-{id}">Email</FieldLabel>
				<Input
					id="email-{id}"
					type="email"
					placeholder="m@example.com"
					bind:value={email}
					disabled={isLoading}
					class={fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
				/>
				{#if fieldErrors.email}
					<p class="mt-1 text-xs font-medium text-destructive">{fieldErrors.email[0]}</p>
				{/if}
			</Field>

			<Field>
				<FieldLabel for="password-{id}">Mot de passe</FieldLabel>
				<Input
					id="password-{id}"
					type="password"
					bind:value={password}
					disabled={isLoading}
					class={fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
				/>
				{#if fieldErrors.password}
					<p class="mt-1 text-xs font-medium text-destructive">{fieldErrors.password[0]}</p>
				{/if}
			</Field>

			<Field>
				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<Loader2 class="mr-2 size-4 animate-spin" />
						Connexion en cours...
					{:else}
						Connexion
					{/if}
				</Button>
			</Field>
		</FieldGroup>
	</form>

	<FieldDescription class="px-6 text-center">
		En cliquant sur continuer, vous acceptez nos <a href="##" class="underline hover:text-primary"
			>Conditions d'utilisation</a
		>
		et
		<a href="##" class="underline hover:text-primary">Politique de confidentialité</a>.
	</FieldDescription>
</div>
