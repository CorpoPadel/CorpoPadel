<script lang="ts">
	import * as Card from '$lib/components/shadcn/ui/card';
	import Users from '~icons/lucide/users';
	import Trophy from '~icons/lucide/trophy';
	import Grid from '~icons/lucide/grid';
	import UserCog from '~icons/lucide/user-cog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const stats = [
		{
			title: 'Comptes Utilisateurs',
			value: data.counts.users,
			description: 'Utilisateurs enregistrés',
			icon: UserCog,
			href: '/admin/accounts',
			color: 'text-blue-500'
		},
		{
			title: 'Joueurs',
			value: data.counts.players,
			description: 'Joueurs inscrits',
			icon: Users,
			href: '/admin/players',
			color: 'text-green-500'
		},
		{
			title: 'Équipes',
			value: data.counts.teams,
			description: 'Équipes formées',
			icon: Trophy,
			href: '/admin/teams',
			color: 'text-yellow-500'
		},
		{
			title: 'Poules',
			value: data.counts.pools,
			description: 'Poules actives',
			icon: Grid,
			href: '/admin/pools',
			color: 'text-purple-500'
		}
	];
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
	{#each stats as stat}
		<a href={stat.href} class="block transition-transform hover:scale-[1.02]">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">
						{stat.title}
					</Card.Title>
					<stat.icon class="h-4 w-4 {stat.color}" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{stat.value}</div>
					<p class="text-xs text-muted-foreground">
						{stat.description}
					</p>
				</Card.Content>
			</Card.Root>
		</a>
	{/each}
</div>

<div class="mt-8">
	<h2 class="mb-4 text-lg font-semibold">Actions Rapides</h2>
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<a href="/planning" class="block">
			<Card.Root class="bg-secondary/50 transition-colors hover:bg-secondary/80">
				<Card.Header>
					<Card.Title class="text-base">Gérer le Planning</Card.Title>
					<Card.Description>Accéder au calendrier des matchs</Card.Description>
				</Card.Header>
			</Card.Root>
		</a>
		<a href="/admin/players" class="block">
			<Card.Root class="bg-secondary/50 transition-colors hover:bg-secondary/80">
				<Card.Header>
					<Card.Title class="text-base">Ajouter un joueur</Card.Title>
					<Card.Description>Créer une nouvelle fiche joueur</Card.Description>
				</Card.Header>
			</Card.Root>
		</a>
	</div>
</div>
