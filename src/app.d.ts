import 'unplugin-icons/types/svelte';

import type { Player } from '$lib/models/player';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: (import('better-auth').User & { mustChangePassword?: boolean }) | null;
			session: import('better-auth').Session | null;
			permissions?: {
				roles: string[];
				privileges: string[];
			};
			player: Player | undefined;
		}
		// interface PageData {}
		interface PageState {
			toast?: CustomToastOptions;
		}
		// interface Platform {}
	}
}

export {};
