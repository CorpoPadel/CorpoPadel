<script lang="ts">
	import ChangePasswordForm from '$lib/components/shadcn/change-password-form.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
	<div class="w-full max-w-sm">
		<ChangePasswordForm {form} />
	</div>
</div>
