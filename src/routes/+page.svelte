<script lang="ts">
	import PadelBall from '$lib/assets/padelBall.svelte';
	import Navbar from '$lib/components/global/navbar/Navbar.svelte';
	import { Button } from '$lib/components/shadcn/ui/button';
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte';
	import { route } from '$lib/utils/routes';
	import ArrowRight from '~icons/lucide/arrow-right';

	const { data }: { data: { totalAccounts: number } } = $props();

	const app = ApplicationContext.get();
</script>

<div
	class="flex min-h-screen w-full flex-col items-center px-4 pb-12 sm:px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-64"
>
	<Navbar />

	<main
		class="flex w-full flex-1 flex-col items-center justify-center gap-12 py-6 lg:flex-row lg:py-10"
	>
		<div class="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
			{#if !app.data.user}
				<div
					class="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm font-medium"
				>
					<span class="mr-2 flex h-2 w-2 rounded-full bg-primary"></span>
					Nouvelle saison disponible
				</div>

				<h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
					Le Padel <span class="text-primary">Corporatif</span> Réinventé
				</h1>
			{:else}
				<h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
					Bienvenue <span class="text-primary">{app.data.player?.firstName} !</span>
				</h1>
			{/if}

			<p class="max-w-150 text-lg text-muted-foreground md:text-xl">
				Organisez vos tournois, suivez vos matchs en direct et progressez avec vos collègues. La
				plateforme ultime pour la compétition de padel en entreprise.
			</p>

			<div class="flex flex-col gap-4 sm:flex-row">
				{#if app.data.user}
					<Button href={route('/matches')} size="lg" class="gap-2">
						Voir mes matchs <ArrowRight class="size-4" />
					</Button>
					<Button href={route('/planning')} variant="outline" size="lg">Planning complet</Button>
				{:else}
					<Button href={route('/auth/sign-in')} size="lg" class="gap-2">
						Se connecter pour commencer <ArrowRight class="size-4" />
					</Button>
					<Button href={route('/results')} variant="outline" size="lg">
						Consulter les classements
					</Button>
				{/if}
			</div>

			<div class="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
				<div class="flex -space-x-2">
					{#each Array(4) as _, i}
						<div
							class="flex size-8 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted"
						>
							<img
								src={`https://i.pravatar.cc/150?img=${i + 1}`}
								alt="User Avatar"
								class="size-full object-cover"
							/>
						</div>
					{/each}
				</div>
				<p>Rejoignez plus de {data.totalAccounts} joueurs déjà inscrits</p>
			</div>
		</div>

		<div class="relative flex flex-1 items-center justify-center lg:justify-end">
			<div class="relative flex size-64 items-center justify-center sm:size-80 md:size-96">
				<div class="absolute -inset-4 animate-pulse rounded-full bg-primary/10 blur-3xl"></div>
				<div
					class="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border-2 border-dashed border-primary/20"
				></div>

				<PadelBall class="relative z-10 size-full drop-shadow-2xl" />

				<div class="absolute top-10 -right-4 z-20 rounded-lg border bg-card p-3 shadow-lg">
					<div class="flex items-center gap-2">
						<div class="size-2 rounded-full bg-green-500"></div>
						<span class="text-xs font-bold">Match en cours</span>
					</div>
				</div>

				<div class="absolute bottom-20 -left-8 z-20 rounded-lg border bg-card p-3 shadow-lg">
					<div class="flex flex-col gap-1">
						<span class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
							>Top Equipe</span
						>
						<span class="text-sm font-bold">CorpoPadel</span>
					</div>
				</div>
			</div>
		</div>
	</main>

	<footer
		class="mt-auto flex w-full flex-col items-center justify-between gap-4 border-t pt-8 text-center sm:flex-row sm:text-left"
	>
		<p class="text-sm text-muted-foreground">
			&copy; {new Date().getFullYear()} CorpoPadel. Tous droits réservés.
		</p>
		<div class="flex gap-6 text-sm text-muted-foreground">
			<a href={route('/results')} class="hover:text-foreground">Résultats</a>
			<a href={route('/planning')} class="hover:text-foreground">Planning</a>
			<a href={route('/matches')} class="hover:text-foreground">Matchs</a>
		</div>
	</footer>
</div>
