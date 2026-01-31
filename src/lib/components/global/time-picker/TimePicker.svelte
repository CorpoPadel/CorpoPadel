<script lang="ts">
	import { Label } from '$lib/components/shadcn/ui/label/index.js';
	import { Input } from '$lib/components/shadcn/ui/input/index.js';

	const id = $props.id();

	/**
	 * Simple HTML5 time picker component.
	 */
	let {
		placeholder,
		value = $bindable('00:00')
	}: {
		/** Optional label displayed above the input */
		placeholder?: string;
		/** Time string value in HH:MM format (bindable) */
		value?: string;
	} = $props();
</script>

<div class="flex flex-col gap-3">
	{#if placeholder}
		<Label for="{id}-time" class="px-1">{placeholder}</Label>
	{/if}
	<Input
		type="time"
		id="{id}-time"
		bind:value
		class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
	/>
</div>
