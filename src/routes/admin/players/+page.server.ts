import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { roleGuard } from '$lib/server/guards/roleGuard';

/**
 * Loads the list of all players for the administration panel.
 * Enforces ADMINISTRATEUR role.
 */
export const load: PageServerLoad = async ({ fetch, locals }) => {
	await roleGuard('ADMINISTRATEUR');

	const response = await fetch('/api/v1/players');
	if (!response.ok) {
		return { players: [], currentPlayerId: locals.player?.id };
	}
	const result = await response.json();

	const players = result.data.players || [];

	return { players, currentPlayerId: locals.player?.id };
};

export const actions: Actions = {
	/** Creates a new player entry */
	create: async ({ request, fetch }) => {
		const formData = await request.formData();

		const payload = {
			firstName: formData.get('firstName'),
			lastName: formData.get('lastName'),
			company: formData.get('company'),
			email: formData.get('email'),
			licenseNumber: formData.get('licenseNumber')
		};

		const res = await fetch('/api/v1/players', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, {
				error: result.error.message,
				issues: result.error.details?.fieldErrors
			});
		}

		return { success: true };
	},

	/** Updates an existing player's details */
	update: async ({ request, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) return fail(400, { error: 'ID manquant' });

		const payload = {
			firstName: formData.get('firstName'),
			lastName: formData.get('lastName'),
			company: formData.get('company')
		};

		const res = await fetch(`/api/v1/players/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, {
				error: result.error.message,
				issues: result.error.details?.fieldErrors
			});
		}

		return { success: true };
	},

	/** Deletes a player. Prevents administrators from deleting their own linked player profile. */
	delete: async ({ request, fetch, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) return fail(400, { error: 'ID manquant' });

		if (Number(id) === locals.player?.id) {
			return fail(400, { error: 'Vous ne pouvez pas supprimer votre propre profil de joueur.' });
		}

		const res = await fetch(`/api/v1/players/${id}`, {
			method: 'DELETE'
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, { error: result.error.message });
		}

		return { success: true };
	}
};
