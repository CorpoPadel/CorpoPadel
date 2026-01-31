<script lang="ts">
	type Status = 'ONGOING' | 'COMPLETED' | 'CANCELED';

	interface Props {
		status: Status;
		class?: string;
		[key: string]: any;
	}

	let { status, class: className, ...restProps }: Props = $props();

	const statusConfig = {
		ONGOING: {
			label: 'Programmé',
			class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
		},
		COMPLETED: {
			label: 'Terminé',
			class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
		},
		CANCELED: {
			label: 'Annulé',
			class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
		}
	};

	const config = $derived(statusConfig[status] || statusConfig.ONGOING);
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {config.class} {className}"
	{...restProps}
>
	{config.label}
</span>
