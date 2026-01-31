import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { roleGuard } from '$lib/server/guards/roleGuard';

export const load: PageServerLoad = async ({ fetch }) => {
	await roleGuard('ADMINISTRATEUR');

	const response = await fetch('/api/v1/players');
	if (!response.ok) {
		return { players: [] };
	}
	const result = await response.json();

	const players = result.data?.players || [];

	return { players };
};

export const actions: Actions = {
	createAccount: async ({ request, fetch }) => {
		const formData = await request.formData();
		const playerId = parseInt(formData.get('playerId') as string);

		const res = await fetch('/api/v1/admin/accounts/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				playerId: playerId
			})
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, {
				error: result.error.message,
				issues: result.error.details?.fieldErrors
			});
		}

		return {
			success: true,
			tempPassword: result.data.tempPassword,
			email: result.data.user.email
		};
	},

	resetPassword: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) return fail(400, { error: 'User ID manquant' });

		const res = await fetch(`/api/v1/admin/accounts/${userId}/reset-password`, {
			method: 'POST'
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, { error: result.error.message });
		}

		return {
			successReset: true,
			tempPassword: result.data.tempPassword
		};
	},

	changeRole: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const role = formData.get('role') as string;

		if (!userId || !role) return fail(400, { error: 'Données manquantes' });

		const res = await fetch(`/api/v1/admin/accounts/${userId}/role`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role })
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, { error: result.error.message });
		}

		return { successRoleChange: true };
	},

	deleteAccount: async ({ request, fetch }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) return fail(400, { error: 'User ID manquant' });

		const res = await fetch(`/api/v1/admin/accounts/${userId}`, {
			method: 'DELETE'
		});

		const result = await res.json();
		if (!result.success) {
			return fail(res.status, { error: result.error.message });
		}

		return { successDelete: true };
	}
};
