<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/shadcn/ui/sonner';
	import type { IApplicationCommonData } from '$lib/contexts/applicationContext.svelte.js';
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte.js';
	import { ModeWatcher } from 'mode-watcher';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import './layout.css';

	let { children, data } = $props();

	// svelte-ignore state_referenced_locally
	const app = new ApplicationContext(data as IApplicationCommonData);

	$effect(() => {
		app.update(data as IApplicationCommonData);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />
<Toaster richColors />

{@render children()}
