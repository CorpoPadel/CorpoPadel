<script lang="ts">
	import { Button } from '$lib/components/shadcn/ui/button';
	import { Input } from '$lib/components/shadcn/ui/input';
	import { Label } from '$lib/components/shadcn/ui/label';
	import * as Card from '$lib/components/shadcn/ui/card';
	import * as Avatar from '$lib/components/shadcn/ui/avatar';
	import CameraIcon from '~icons/lucide/camera';
	import TrashIcon from '~icons/lucide/trash-2';
	import Loader2 from '~icons/lucide/loader-2';
	import XIcon from '~icons/lucide/x';
	import FormError from '$lib/components/global/FormError.svelte';
	import { enhance } from '$app/forms';
	import DatePicker from '$lib/components/global/date-picker/DatePicker.svelte';
	import { CalendarDate } from '@internationalized/date';
	import { updateProfileSchema } from '$lib/validations/profile';

	let {
		data = $bindable(),
		fieldErrors: serverErrors,
		isLoading = $bindable()
	}: {
		data: any;
		fieldErrors: Record<string, string>;
		isLoading: boolean;
	} = $props();

	let localPreviewUrl = $state<string | null>(null);
	let previewUrl = $derived(localPreviewUrl || data.player?.photoUrl || '');

	let dateValue = $state<CalendarDate | undefined>(undefined);
	let clientErrors = $state<Record<string, string>>({});

	let errors = $derived({ ...serverErrors, ...clientErrors });

	$effect(() => {
		if (data.player?.birthDate) {
			const d = new Date(data.player.birthDate);
			if (!isNaN(d.getTime())) {
				dateValue = new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
			}
		}
	});

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];

			const reader = new FileReader();
			reader.onload = (e) => {
				localPreviewUrl = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Informations personnelles</Card.Title>
		<Card.Description>Mettez à jour vos informations de joueur.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="POST"
			action="?/updateProfile"
			enctype="multipart/form-data"
			use:enhance={({ formData, cancel, submitter }) => {
				clientErrors = {};

				const isDeleteAction = submitter?.getAttribute('formaction')?.includes('deletePhoto');

				if (!isDeleteAction) {
					const firstName = formData.get('firstName');
					const lastName = formData.get('lastName');
					const email = formData.get('email');
					const birthDateStr = formData.get('birthDate');
					const photo = formData.get('photo');

					const validationData = {
						firstName,
						lastName,
						email,
						birthDate: birthDateStr ? new Date(birthDateStr as string) : null,
						photo: photo instanceof File && photo.size > 0 ? photo : undefined
					};

					const result = updateProfileSchema.safeParse(validationData);

					if (!result.success) {
						const fieldErrors = result.error.flatten().fieldErrors;
						clientErrors = {
							firstName: fieldErrors.firstName?.[0] || '',
							lastName: fieldErrors.lastName?.[0] || '',
							email: fieldErrors.email?.[0] || '',
							birthDate: fieldErrors.birthDate?.[0] || '',
							photo: fieldErrors.photo?.[0] || ''
						};
						cancel();
						return;
					}
				}

				isLoading = true;
				return async ({ result, update }) => {
					await update({ reset: false });
					if (result.type === 'success') {
						if (isDeleteAction) {
							data.player.photoUrl = null;
						} else if (result.data?.photoUrl) {
							data.player.photoUrl = result.data.photoUrl;
						}
					}
					localPreviewUrl = null;
					isLoading = false;
				};
			}}
		>
			<div class="flex flex-col gap-8 md:flex-row">
				<div class="flex flex-col items-center gap-4">
					<div class="group relative">
						{#key previewUrl}
							<Avatar.Root
								class="h-32 w-32 cursor-pointer overflow-hidden border-4 border-muted transition-colors group-hover:border-primary/50"
							>
								{#if previewUrl}
									<img
										src={previewUrl}
										alt={data.user?.name}
										class="aspect-square size-full object-cover"
									/>
								{:else}
									<Avatar.Fallback class="text-2xl">{data.user?.name?.charAt(0)}</Avatar.Fallback>
								{/if}
							</Avatar.Root>
						{/key}
						<label
							for="photo"
							class="absolute right-0 bottom-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-background text-primary-foreground shadow-lg transition-transform hover:scale-110"
						>
							<CameraIcon class="h-5 w-5" />
						</label>
						<input
							id="photo"
							name="photo"
							type="file"
							accept="image/*"
							class="hidden"
							onchange={handleFileChange}
						/>
						{#if data.player?.photoUrl}
							<button
								formaction="?/deletePhoto"
								class="absolute top-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-background text-destructive shadow-lg transition-transform hover:scale-110"
								title="Supprimer la photo"
							>
								<TrashIcon class="h-5 w-5" />
							</button>
						{/if}
					</div>
					<p class="text-xs text-muted-foreground">JPG, PNG ou WebP. Max 2MB.</p>
					<FormError error={errors.photo} />
				</div>

				<div class="grid flex-1 gap-4">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="grid gap-2">
							<Label for="firstName">Prénom</Label>
							<Input id="firstName" name="firstName" value={data.player?.firstName} required />
							<FormError error={errors.firstName} />
						</div>
						<div class="grid gap-2">
							<Label for="lastName">Nom</Label>
							<Input id="lastName" name="lastName" value={data.player?.lastName} required />
							<FormError error={errors.lastName} />
						</div>
					</div>

					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input id="email" name="email" type="email" value={data.user?.email} required />
						<FormError error={errors.email} />
					</div>

					<div class="grid gap-2">
						<Label for="birthDate">Date de naissance</Label>
						<div class="flex items-center gap-2">
							<DatePicker bind:value={dateValue} />
							{#if dateValue}
								<Button
									variant="ghost"
									size="icon"
									type="button"
									class="text-muted-foreground hover:text-destructive"
									title="Effacer la date"
									onclick={() => (dateValue = undefined)}
								>
									<XIcon class="h-4 w-4 text-destructive" />
								</Button>
							{/if}
						</div>
						<input type="hidden" name="birthDate" value={dateValue?.toString() ?? ''} />
						<FormError error={errors.birthDate} />
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="grid gap-2">
							<Label for="company">Entreprise</Label>
							<Input
								id="company"
								name="company"
								value={data.player?.company}
								disabled
								class="bg-muted opacity-100"
							/>
						</div>
						<div class="grid gap-2">
							<Label for="licenseNumber">Numéro de licence</Label>
							<Input
								id="licenseNumber"
								name="licenseNumber"
								value={data.player?.licenseNumber}
								disabled
								class="bg-muted opacity-100"
							/>
						</div>
					</div>

					<div class="pt-2">
						<Button type="submit" disabled={isLoading} class="w-full sm:w-auto">
							{#if isLoading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							Enregistrer les modifications
						</Button>
					</div>
				</div>
			</div>
		</form>
	</Card.Content>
</Card.Root>
