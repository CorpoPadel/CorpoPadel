<script lang="ts">
	import { route } from '$lib/utils/routes';
	import * as Avatar from '$lib/components/shadcn/ui/avatar';
	import * as DropdownMenu from '$lib/components/shadcn/ui/dropdown-menu';
	import LogOut from '~icons/lucide/log-out';
	import Calendar from '~icons/lucide/calendar-1';
	import List from '~icons/lucide/list';
	import Medal from '~icons/lucide/medal';
	import User from '~icons/lucide/user';
	import LayoutDashboard from '~icons/lucide/layout-dashboard';
	import { ApplicationContext } from '$lib/contexts/applicationContext.svelte';

	/**
	 * User navigation and profile dropdown component.
	 */
	let { class: className }: { class?: string } = $props();

	/** Global application context access */
	const app = ApplicationContext.get();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="cursor-pointer">
		<!-- User avatar with fallback to initials -->
		<Avatar.Root class={className}>
			{#if app.data.player?.photoUrl}
				<Avatar.Image src={app.data.player.photoUrl} alt="User Avatar" />
			{:else if app.data.user?.image}
				<Avatar.Image src={app.data.user.image} alt="User Avatar" />
			{/if}
			<Avatar.Fallback>
				{#if app.data.player}
					{app.data.player.firstName.charAt(0)}{app.data.player.lastName.charAt(0)}
				{:else if app.data.user?.name}
					{app.data.user.name
						.split(' ')
						.map((n) => n[0])
						.join('')
						.toUpperCase()}
				{:else}
					U
				{/if}
			</Avatar.Fallback>
		</Avatar.Root>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end">
		<DropdownMenu.Label class="cursor-default"
			>{app.data.player?.firstName} {app.data.player?.lastName}</DropdownMenu.Label
		>
		<DropdownMenu.Label class="cursor-default font-normal"
			>{app.data.user?.email}</DropdownMenu.Label
		>
		<DropdownMenu.Separator />

		<!-- Navigation links -->
		<a href={route('/planning')}>
			<DropdownMenu.Item>
				<Calendar />
				Planning
			</DropdownMenu.Item>
		</a>
		<a href={route('/matches')}>
			<DropdownMenu.Item>
				<List />
				Matchs
			</DropdownMenu.Item>
		</a>
		<a href={route('/results')}>
			<DropdownMenu.Item>
				<Medal />
				Classement
			</DropdownMenu.Item>
		</a>

		<!-- Administrator specific link -->
		{#if app.data.permissions.roles.includes('ADMINISTRATEUR')}
			<a href={route('/admin')}>
				<DropdownMenu.Item>
					<LayoutDashboard />
					Tableau de bord
				</DropdownMenu.Item>
			</a>
		{/if}

		<DropdownMenu.Separator />
		<a href={route('/profile')}>
			<DropdownMenu.Item>
				<User />
				Profile
			</DropdownMenu.Item>
		</a>

		<DropdownMenu.Separator />
		<!-- Destructive action: sign out -->
		<a href={route('/auth/sign-out')}>
			<DropdownMenu.Item variant="destructive">
				<LogOut />
				Se déconnecter
			</DropdownMenu.Item>
		</a>
	</DropdownMenu.Content>
</DropdownMenu.Root>
