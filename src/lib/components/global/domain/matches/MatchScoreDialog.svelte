<script lang="ts">
	import { Button } from '$lib/components/shadcn/ui/button';
	import * as Dialog from '$lib/components/shadcn/ui/dialog';
	import * as InputOTP from '$lib/components/shadcn/ui/input-otp';
	import { Label } from '$lib/components/shadcn/ui/label';
	import type { Match } from '$lib/models/match';
	import { validateMatchScore, type MatchScore } from '$lib/validations/score';
	import { toast } from 'svelte-sonner';
	import Loader2 from '~icons/lucide/loader-2';

	let {
		open = $bindable(false),
		match,
		onScoreSaved
	}: { open: boolean; match: Match; onScoreSaved: () => void } = $props();

	let isLoading = $state(false);
	let error = $state<string | undefined>();

	let scores = $state({
		set1: { team1: '', team2: '' },
		set2: { team1: '', team2: '' },
		set3: { team1: '', team2: '' }
	});

	const isSet3Visible = $derived.by(() => {
		const s1 = scores.set1;
		const s2 = scores.set2;
		if (!s1.team1 || !s1.team2 || !s2.team1 || !s2.team2) return false;

		const w1 = parseInt(s1.team1) > parseInt(s1.team2) ? 1 : 2;
		const w2 = parseInt(s2.team1) > parseInt(s2.team2) ? 1 : 2;
		return w1 !== w2;
	});

	async function handleSubmit() {
		error = undefined;

		const matchScore: MatchScore = {
			set1: {
				team1: scores.set1.team1 !== '' ? parseInt(scores.set1.team1) : null,
				team2: scores.set1.team2 !== '' ? parseInt(scores.set1.team2) : null
			},
			set2: {
				team1: scores.set2.team1 !== '' ? parseInt(scores.set2.team1) : null,
				team2: scores.set2.team2 !== '' ? parseInt(scores.set2.team2) : null
			},
			set3: {
				team1: scores.set3.team1 !== '' ? parseInt(scores.set3.team1) : null,
				team2: scores.set3.team2 !== '' ? parseInt(scores.set3.team2) : null
			}
		};

		const validation = validateMatchScore(matchScore);

		if (!validation.isValid) {
			error = validation.error;
			return;
		}

		isLoading = true;
		try {
			const setsT1 = [];
			const setsT2 = [];

			setsT1.push(`${matchScore.set1.team1}-${matchScore.set1.team2}`);
			setsT2.push(`${matchScore.set1.team2}-${matchScore.set1.team1}`);

			setsT1.push(`${matchScore.set2.team1}-${matchScore.set2.team2}`);
			setsT2.push(`${matchScore.set2.team2}-${matchScore.set2.team1}`);

			if (isSet3Visible) {
				setsT1.push(`${matchScore.set3.team1}-${matchScore.set3.team2}`);
				setsT2.push(`${matchScore.set3.team2}-${matchScore.set3.team1}`);
			}

			const scoreStringT1 = setsT1.join(', ');
			const scoreStringT2 = setsT2.join(', ');

			const res = await fetch(`/api/v1/matches/${match.id}/score`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					scoreTeam1: scoreStringT1,
					scoreTeam2: scoreStringT2,
					status: 'COMPLETED'
				})
			});

			const result = await res.json();

			if (!result.success) {
				throw new Error(result.error?.message || 'Erreur lors de la sauvegarde');
			}

			toast.success('Score enregistré !');
			open = false;
			onScoreSaved();
		} catch (e: any) {
			error = e.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Saisir le score</Dialog.Title>
			<Dialog.Description>
				{match.team1.company} vs {match.team2.company}
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-6 py-4">
			{#if error}
				<div class="rounded-md bg-destructive/10 p-2 text-sm font-medium text-destructive">
					{error}
				</div>
			{/if}

			<div
				class="grid grid-cols-3 gap-4 text-center text-xs font-bold tracking-wider text-muted-foreground uppercase"
			>
				<div></div>
				<div class="truncate px-1">{match.team1.company}</div>
				<div class="truncate px-1">{match.team2.company}</div>
			</div>

			<div class="grid grid-cols-3 items-center gap-4">
				<Label class="text-right font-semibold">Set 1</Label>
				<div class="flex justify-center">
					<InputOTP.Root maxlength={1} bind:value={scores.set1.team1}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								<InputOTP.Slot cell={cells[0]} class="h-10 w-10 text-lg font-bold" />
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				</div>
				<div class="flex justify-center">
					<InputOTP.Root maxlength={1} bind:value={scores.set1.team2}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								<InputOTP.Slot cell={cells[0]} class="h-10 w-10 text-lg font-bold" />
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				</div>
			</div>

			<div class="grid grid-cols-3 items-center gap-4">
				<Label class="text-right font-semibold">Set 2</Label>
				<div class="flex justify-center">
					<InputOTP.Root maxlength={1} bind:value={scores.set2.team1}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								<InputOTP.Slot cell={cells[0]} class="h-10 w-10 text-lg font-bold" />
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				</div>
				<div class="flex justify-center">
					<InputOTP.Root maxlength={1} bind:value={scores.set2.team2}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								<InputOTP.Slot cell={cells[0]} class="h-10 w-10 text-lg font-bold" />
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				</div>
			</div>

			{#if isSet3Visible}
				<div class="grid animate-in grid-cols-3 items-center gap-4 fade-in slide-in-from-top-2">
					<Label class="text-right font-semibold text-primary">Set 3</Label>
					<div class="flex justify-center">
						<InputOTP.Root maxlength={1} bind:value={scores.set3.team1}>
							{#snippet children({ cells })}
								<InputOTP.Group>
									<InputOTP.Slot
										cell={cells[0]}
										class="h-10 w-10 border-primary/50 text-lg font-bold"
									/>
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
					</div>
					<div class="flex justify-center">
						<InputOTP.Root maxlength={1} bind:value={scores.set3.team2}>
							{#snippet children({ cells })}
								<InputOTP.Group>
									<InputOTP.Slot
										cell={cells[0]}
										class="h-10 w-10 border-primary/50 text-lg font-bold"
									/>
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
					</div>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
			<Button onclick={handleSubmit} disabled={isLoading}>
				{#if isLoading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Confirmer le score
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
