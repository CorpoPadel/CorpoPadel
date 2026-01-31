<script lang="ts">
	import { Button } from '$lib/components/shadcn/ui/button/index.js';
	import * as Command from '$lib/components/shadcn/ui/command/index.js';
	import * as Popover from '$lib/components/shadcn/ui/popover/index.js';
	import { cn } from '$lib/utils/utils';
	import CheckIcon from '~icons/lucide/check';
	import ChevronsUpDownIcon from '~icons/lucide/chevrons-up-down';
	import { tick } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/**
	 * A searchable selection component using a Popover and Command list.
	 */
	let {
		items = [],
		value = $bindable(),
		disabled = $bindable(false),
		onblur = () => {},
		placeholder = { button: 'Select a value...', input: 'Search...', empty: 'No value found.' },
		...buttonProps
	}: {
		/** List of selectable items */
		items?: { label: string; value: string }[];
		/** Selected value (bindable) */
		value?: string;
		/** Whether the component is interactive */
		disabled?: boolean;
		/** Blur event callback */
		onblur?: () => void;
		/** Customizable localized strings */
		placeholder?: { button: string; input: string; empty: string };
	} & Omit<HTMLAttributes<HTMLButtonElement>, 'placeholder'> = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	/** The label of the currently selected item */
	const selectedValue = $derived(items.find((f) => f.value === value)?.label);

	/**
	 * Closes the popover and returns focus to the trigger button.
	 */
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
			onblur();
		});
	}
</script>

<Popover.Root
	bind:open
	onOpenChange={(isOpen: boolean) => {
		if (!isOpen) {
			onblur();
		}
	}}
>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props }: { props: HTMLAttributes<HTMLButtonElement> })}
			<Button
				{...buttonProps as any}
				{...props}
				variant="outline"
				class={`w-full px-3 py-6 ${!items.some((item) => item.value === value) ? 'text-muted-foreground' : ''}`}
				role="combobox"
				{disabled}
				aria-expanded={open}
			>
				<div class="flex h-fit w-full items-center justify-between font-normal">
					{selectedValue || placeholder.button}
					<ChevronsUpDownIcon class="opacity-50" />
				</div>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-full p-0">
		<Command.Root style={`width: ${triggerRef.offsetWidth}px;`}>
			<Command.Input placeholder={placeholder.input} />
			<Command.List>
				<Command.Empty>{placeholder.empty}</Command.Empty>
				<Command.Group value="items">
					{#each items as item (item.value)}
						<Command.Item
							value={item.value}
							onSelect={() => {
								value = item.value;
								closeAndFocusTrigger();
							}}
						>
							<CheckIcon class={cn(value !== item.value && 'text-transparent')} />
							{item.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
