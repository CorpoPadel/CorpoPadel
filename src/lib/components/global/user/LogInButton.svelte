<script>
	import { resolve } from '$app/paths';
	import Button from '$lib/components/shadcn/ui/button/button.svelte';
</script>

<a href={resolve('/auth/sign-in')}>
	<Button>Se connecter</Button>
</a>
