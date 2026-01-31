<script lang="ts">
	import Navbar from '$lib/components/global/navbar/Navbar.svelte';
	import { toast } from 'svelte-sonner';
	import type { ActionData, PageData } from './$types';
	import ProfileForm from '$lib/components/global/domain/profile/ProfileForm.svelte';
	import PasswordForm from '$lib/components/global/domain/profile/PasswordForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isLoading = $state(false);
	let fieldErrors = $state<Record<string, string>>({});

	$effect(() => {
		if (form?.success) {
			toast.success(form.message || 'Action effectuée');
			if (form?.success && form?.photoUrl) {
				data.player.photoUrl = form.photoUrl;
			}
			fieldErrors = {};
		} else if (form?.fieldErrors) {
			const newErrors: Record<string, string> = {};
			Object.entries(form.fieldErrors).forEach(([key, messages]) => {
				if (Array.isArray(messages)) {
					newErrors[key] = messages[0];
				}
			});
			fieldErrors = newErrors;
		} else if (form?.passwordErrors) {
			const newErrors: Record<string, string> = {};
			if (typeof form.passwordErrors === 'object') {
				Object.entries(form.passwordErrors).forEach(([key, value]) => {
					if (Array.isArray(value)) newErrors[key] = value[0];
					else if (typeof value === 'string') newErrors[key] = value;
				});
			}
			fieldErrors = newErrors;
		} else if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<div
	class="flex w-full flex-col items-center gap-6 px-4 pb-12 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-64"
>
	<Navbar />

	<div class="flex w-full flex-col gap-6">
		<div>
			<h1 class="text-3xl font-bold">Mon Profil</h1>
			<p class="text-muted-foreground">
				Gérez vos informations personnelles et vos paramètres de sécurité.
			</p>
		</div>

		<ProfileForm {data} {fieldErrors} bind:isLoading />

		<PasswordForm {fieldErrors} bind:isLoading />
	</div>
</div>
