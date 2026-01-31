import { accountService } from '$lib/server/services/account.service';
import { changePasswordSchema } from '$lib/validations/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/sign-in');
	}

	if (!locals.user.mustChangePassword) {
		throw redirect(302, '/');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Non authentifié' });
		}

		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		const result = changePasswordSchema.safeParse({
			currentPassword,
			newPassword,
			confirmPassword
		});

		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			return fail(400, {
				error: 'Veuillez corriger les erreurs',
				issues: {
					currentPassword: fieldErrors.currentPassword?.[0],
					newPassword: fieldErrors.newPassword?.[0],
					confirmPassword: fieldErrors.confirmPassword?.[0]
				}
			});
		}

		try {
			await accountService.changePassword(locals.user.id, result.data.newPassword);
		} catch (e) {
			return fail(500, { error: 'Une erreur est survenue lors du changement de mot de passe.' });
		}

		throw redirect(303, '/');
	}
};
