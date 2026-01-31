<script lang="ts">
	import { Button, buttonVariants, type ButtonProps } from '$lib/components/shadcn/ui/button';
	import { cn } from '$lib/utils/utils';

	let {
		class: className,
		variant = 'default',
		size = 'default',
		disabled,
		children,
		...restProps
	}: Omit<ButtonProps, 'ref' | 'href' | 'type'> = $props();
</script>

<Button
	type="button"
	href="/auth/sign-out"
	data-slot="button"
	class={cn(buttonVariants({ variant, size }), className)}
	{disabled}
	{...restProps}
>
	Se déconnecter
</Button>
