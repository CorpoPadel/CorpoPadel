import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { roleGuard } from '$lib/server/guards/roleGuard';

/**
 * Loads pools and teams for the administration panel.
 * Enforces ADMINISTRATEUR role.
 */
export const load: PageServerLoad = async ({ fetch }) => {
	await roleGuard('ADMINISTRATEUR');

	const [poolsRes, teamsRes] = await Promise.all([fetch('/api/v1/pools'), fetch('/api/v1/teams')]);

	const poolsResult = await poolsRes.json();
	const teamsResult = await teamsRes.json();

	return {
		pools: poolsResult.data?.pools || [],
		teams: teamsResult.data?.teams || []
	};
};

export const actions: Actions = {
	/** Creates a new tournament pool */
	create: async ({ request, fetch }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const teamIds = formData.getAll('teamIds').map((id) => parseInt(id as string));

		const payload = {
			name,
			team_ids: teamIds
		};

		const res = await fetch('/api/v1/pools', {
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

	/** Deletes a tournament pool by ID */
	delete: async ({ request, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		const res = await fetch(`/api/v1/pools/${id}`, {
			method: 'DELETE'
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, { error: result.error.message });
		}

		return { success: true };
	},

	/** Updates a tournament pool */
	update: async ({ request, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const name = formData.get('name') as string;
		const teamIds = formData.getAll('teamIds').map((id) => parseInt(id as string));

		const payload = {
			name,
			team_ids: teamIds
		};

		const res = await fetch(`/api/v1/pools/${id}`, {
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
