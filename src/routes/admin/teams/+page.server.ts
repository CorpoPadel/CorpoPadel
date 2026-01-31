import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { roleGuard } from '$lib/server/guards/roleGuard';

/**
 * Loads teams, players, and pools for the team management panel.
 * Requires ADMINISTRATEUR role.
 */
export const load: PageServerLoad = async ({ fetch }) => {
	await roleGuard('ADMINISTRATEUR');

	const [teamsRes, playersRes] = await Promise.all([
		fetch('/api/v1/teams'),
		fetch('/api/v1/players')
	]);

	const teamsResult = await teamsRes.json();
	const playersResult = await playersRes.json();

	return {
		teams: teamsResult.data?.teams || [],
		players: playersResult.data?.players || []
	};
};

export const actions: Actions = {
	/** Creates a new team entry */
	create: async ({ request, fetch }) => {
		const formData = await request.formData();

		const payload = {
			company: formData.get('company'),
			player1Id: Number(formData.get('player1Id')),
			player2Id: Number(formData.get('player2Id'))
		};

		const res = await fetch('/api/v1/teams', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, { error: result.error.message });
		}

		return { success: true };
	},

	/** Deletes a team by ID */
	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		const res = await fetch(`/api/v1/teams/${id}`, {
			method: 'DELETE'
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, { error: result.error.message });
		}

		return { success: true };
	},

	/** Updates an existing team */
	update: async ({ request, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		const payload = {
			company: formData.get('company'),
			player1Id: Number(formData.get('player1Id')),
			player2Id: Number(formData.get('player2Id'))
		};

		const res = await fetch(`/api/v1/teams/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, { error: result.error.message });
		}

		return { success: true };
	}
};
