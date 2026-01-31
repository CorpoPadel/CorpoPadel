<script lang="ts">
	import Calendar from '$lib/components/shadcn/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/shadcn/ui/popover/index.js';
	import { Button } from '$lib/components/shadcn/ui/button/index.js';
	import { Label } from '$lib/components/shadcn/ui/label/index.js';
	import ChevronDownIcon from '~icons/lucide/chevron-down';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { CalendarDate } from '@internationalized/date';
	import CalendarDay from '$lib/components/shadcn/ui/calendar-2/calendar-day.svelte';

	interface Props {
		/** Optional label displayed above the picker */
		placeholder?: string;
		/** The selected date (bindable) */
		value?: CalendarDate | undefined;
		/** Optional minimum selectable date */
		minValue?: CalendarDate;
		/** Optional maximum selectable date */
		maxValue?: CalendarDate;
	}

	/**
	 * A user-friendly date selection component using a calendar within a popover.
	 */
	let {
		placeholder,
		value = $bindable<CalendarDate | undefined>(),
		minValue,
		maxValue
	}: Props = $props();

	const id = $props.id();

	let open = $state(false);
</script>

<div class="flex flex-col gap-3">
	{#if placeholder}
		<Label for="{id}-date" class="px-1">{placeholder}</Label>
	{/if}

	<Popover.Root bind:open>
		<Popover.Trigger id="{id}-date">
			{#snippet child({ props })}
				<Button {...props} variant="outline" class="w-48 justify-between font-normal">
					{value
						? (() => {
								// Format date as YYYY-MM-DD for display
								const date = value.toDate('Europe/Paris');
								const year = date.getFullYear();
								const month = String(date.getMonth() + 1).padStart(2, '0');
								const day = String(date.getDate()).padStart(2, '0');
								return `${year}-${month}-${day}`;
							})()
						: 'Sélectionner une date'}
					<ChevronDownIcon />
				</Button>
			{/snippet}
		</Popover.Trigger>

		<Popover.Content class="w-auto overflow-hidden p-0" align="start">
			<Calendar
				type="single"
				bind:value
				captionLayout="dropdown"
				onValueChange={() => {
					// Close picker immediately after selection
					open = false;
				}}
				fixedWeeks
				class="test"
				{minValue}
				{maxValue}
			>
				{#snippet day({ day })}
					<CalendarDay
						class="not([data-selected])]:border! size-8 border border-border bg-accent/30 data-selected:border-2 data-selected:border-dashed data-selected:border-primary data-selected:bg-primary/20! data-selected:hover:bg-primary/20! [&[data-outside-month]:not([data-selected])]:bg-background/10"
					>
						{day.day}
					</CalendarDay>
				{/snippet}
			</Calendar>
		</Popover.Content>
	</Popover.Root>
</div>
