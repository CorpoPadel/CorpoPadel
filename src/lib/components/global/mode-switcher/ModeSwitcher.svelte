<script lang="ts">
	import SunIcon from '~icons/lucide/sun';
	import MoonIcon from '~icons/lucide/moon';

	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/shadcn/ui/button/index.js';

	/**
	 * Dark/Light mode toggle button component.
	 */
</script>

<Button onclick={toggleMode} variant="outline" size="icon">
	<!-- Display Sun icon in light mode, rotated out in dark -->
	<SunIcon
		class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
	/>
	<!-- Display Moon icon in dark mode, rotated out in light -->
	<MoonIcon
		class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
