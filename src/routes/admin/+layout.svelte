<script lang="ts">
	import AppSidebar from '$lib/components/global/domain/admin/AppSidebar.svelte';
	import * as Sidebar from '$lib/components/shadcn/ui/sidebar/index.js';
	import * as Breadcrumb from '$lib/components/shadcn/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/shadcn/ui/separator/index.js';
	import { page } from '$app/state';
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte';
	import ModeSwitcher from '$lib/components/global/mode-switcher/ModeSwitcher.svelte';

	let { children } = $props();

	const breadcrumbs = $derived(page.url.pathname.split('/').filter(Boolean));

	const app = ApplicationContext.get();
</script>

<Sidebar.Provider>
	<AppSidebar variant="inset" />
	<Sidebar.Inset>
		<header
			class="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center gap-2">
					<Sidebar.Trigger class="-ml-1" />
					<Separator orientation="vertical" class="mr-2 h-4" />
					<Breadcrumb.Root>
						<Breadcrumb.List>
							{#each breadcrumbs as crumb, i}
								<Breadcrumb.Item class="hidden md:block">
									{#if i < breadcrumbs.length - 1}
										<Breadcrumb.Link
											href={`/${breadcrumbs.slice(0, i + 1).join('/')}`}
											class="capitalize"
										>
											{crumb}
										</Breadcrumb.Link>
									{:else}
										<Breadcrumb.Page class="font-semibold capitalize">{crumb}</Breadcrumb.Page>
									{/if}
								</Breadcrumb.Item>
								{#if i < breadcrumbs.length - 1}
									<Breadcrumb.Separator class="hidden md:block" />
								{/if}
							{/each}
						</Breadcrumb.List>
					</Breadcrumb.Root>
				</div>
				<ModeSwitcher />
			</div>
		</header>
		<main class="flex flex-1 flex-col gap-4 p-4 pt-4">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
