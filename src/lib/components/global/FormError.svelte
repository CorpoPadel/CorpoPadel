<script lang="ts">
	interface Props {
		/** Error message or array of messages to display */
		error?: string | string[];
		/** Additional CSS classes */
		class?: string;
		[key: string]: any;
	}

	/**
	 * Reusable component for displaying form validation errors in a consistent style.
	 */
	let { error, class: className, ...restProps }: Props = $props();

	/** Extracts the first error message if an array is provided */
	const errorMessage = $derived(Array.isArray(error) ? error[0] : error);
</script>

{#if errorMessage}
	<p class="text-xs font-medium text-destructive {className}" {...restProps}>
		{errorMessage}
	</p>
{/if}
