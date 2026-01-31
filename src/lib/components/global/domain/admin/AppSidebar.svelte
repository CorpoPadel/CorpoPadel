<script lang="ts">
	import * as Sidebar from '$lib/components/shadcn/ui/sidebar/index.js';
	import UsersIcon from '~icons/lucide/users';
	import ShirtIcon from '~icons/lucide/shirt';
	import GridIcon from '~icons/lucide/grid-3x3';
	import KeyIcon from '~icons/lucide/key-round';
	import HomeIcon from '~icons/lucide/house';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	/**
	 * Navigation sidebar for the administration panel.
	 */
	let { ...rest } = $props();

	/** Structured navigation groups and items */
	const data = {
		navMain: [
			{
				title: 'Gestion Sportive',
				url: '#',
				items: [
					{ title: 'Joueurs', url: '/admin/players', icon: UsersIcon },
					{ title: 'Équipes', url: '/admin/teams', icon: ShirtIcon },
					{ title: 'Poules', url: '/admin/pools', icon: GridIcon }
				]
			},
			{
				title: 'Système',
				url: '#',
				items: [{ title: 'Comptes & Accès', url: '/admin/accounts', icon: KeyIcon }]
			}
		]
	};
</script>

<Sidebar.Root collapsible="icon" {...rest}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<!-- Administrative portal branding -->
				<Sidebar.MenuButton
					size="lg"
					class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					onclick={() => {
						goto('/admin');
					}}
				>
					<div
						class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
					>
						<GridIcon class="size-4" />
					</div>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">CorpoPadel</span>
						<span class="truncate text-xs">Administration</span>
					</div>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		{#each data.navMain as group}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item}
							<Sidebar.MenuItem>
								<!-- Highlight the active menu item based on current URL path -->
								<Sidebar.MenuButton isActive={page.url.pathname.startsWith(item.url)}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}

		<!-- Bottom navigation to return to the public site -->
		<Sidebar.Group class="mt-auto">
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href="/" {...props}>
									<HomeIcon />
									<span>Retour au site</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
