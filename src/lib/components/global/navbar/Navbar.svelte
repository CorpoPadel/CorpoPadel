<script lang="ts">
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte';
	import { route } from '$lib/utils/routes';
	import LogInButton from '../user/LogInButton.svelte';
	import UserDropdown from '../user/UserDropdown.svelte';
	import ModeSwitcher from '../mode-switcher/ModeSwitcher.svelte';

	/** Global application context for user and navigation data */
	const app = ApplicationContext.get();
</script>

<header class="relative top-0 left-0 flex w-full items-center gap-2 py-6">
	<!-- Branding and Home link -->
	<a href={route('/')} class="font-medium">CorpoPadel</a>

	<div class="ml-auto flex flex-row items-center gap-6">
		<ModeSwitcher />

		{#if app.data.user}
			<!-- Authenticated user dropdown menu -->
			<UserDropdown class="size-10 border" />
		{:else}
			<!-- Non-authenticated login entry point -->
			<LogInButton />
		{/if}
	</div>
</header>
