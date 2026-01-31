import auth from '$lib/server/auth';
import { changePasswordSchema } from '$lib/validations/auth';
import { fail, redirect } from '@sveltejs/kit';

import { ZodError } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { route } from '$lib/utils/routes';

/**
 * Loads the current user profile and player details.
 * Redirects to sign-in if no session is found.
 */
export const load: PageServerLoad = async ({ fetch, locals }) => {
	if (!locals.session) throw redirect(302, '/auth/sign-in');

	const res = await fetch('/api/v1/profile/me');
	const result = await res.json();

	// Fallback to basic user data if profile retrieval fails
	if (!result.success) {
		return { user: locals.user, player: null };
	}

	return {
		user: result.data.user,
		player: result.data.player
	};
};

export const actions: Actions = {
	/**
	 * Updates the user's personal information and profile photo.
	 * Photo upload is handled as a separate internal API call.
	 */
	updateProfile: async ({ request, fetch }) => {
		const formData = await request.formData();
		let newPhotoUrl = null;

		// Handle photo upload if a new file was provided
		const photoFile = formData.get('photo') as File;
		if (photoFile && photoFile.size > 0) {
			const photoForm = new FormData();
			photoForm.append('photo', photoFile);

			const photoRes = await fetch('/api/v1/profile/me/photo', {
				method: 'POST',
				body: photoForm
			});

			const photoResult = await photoRes.json();
			if (!photoResult.success) {
				return fail(photoRes.status, {
					error: photoResult.error.message,
					fieldErrors: undefined,
					passwordErrors: undefined
				});
			}
			newPhotoUrl = photoResult.data.photo_url;
		}

		// Update profile text fields
		const payload = {
			firstName: formData.get('firstName'),
			lastName: formData.get('lastName'),
			birthDate: formData.get('birthDate') ? formData.get('birthDate') : null,
			email: formData.get('email')
		};

		const res = await fetch('/api/v1/profile/me', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const result = await res.json();

		if (!result.success) {
			if (result.error.code === 'VALIDATION_ERROR') {
				const fieldErrors: Record<string, string[]> = result.error.details.fieldErrors || {};
				return fail(res.status, {
					error: 'Validation échouée',
					fieldErrors,
					passwordErrors: undefined
				});
			}

			return fail(res.status, {
				error: result.error.message,
				fieldErrors: undefined,
				passwordErrors: undefined
			});
		}

		return {
			success: true,
			message: 'Profil mis à jour avec succès',
			photoUrl: newPhotoUrl,
			fieldErrors: undefined,
			passwordErrors: undefined
		};
	},

	/**
	 * Securely changes the user password and invalidates other sessions for security.
	 * Redirects to login page on success.
	 */
	changePassword: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		try {
			const validated = changePasswordSchema.parse(data);

			await auth.api.changePassword({
				body: {
					currentPassword: validated.currentPassword,
					newPassword: validated.newPassword,
					revokeOtherSessions: true
				},
				headers: request.headers
			});

			// Redirect user back to login with success message
			throw redirect(
				303,
				route('/auth/sign-in', {
					toast: {
						content: 'Mot de passe modifié et autres sessions déconnectées.',
						severity: 'success'
					}
				})
			);
		} catch (err: any) {
			// Handle validation errors from Zod
			if (err instanceof ZodError) {
				const errors = err.flatten().fieldErrors;
				return fail(400, {
					error: 'Validation échouée',
					passwordErrors: errors,
					fieldErrors: undefined
				});
			}

			// Re-throw if it's already a SvelteKit redirect
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
				throw err;
			}

			// Handle business logic errors from authentication API
			if (err.body?.message) {
				const errorMessageMap: Record<string, string> = {
					'Invalid password': 'Ancien mot de passe invalide',
					'Password too short': 'Mot de passe trop court, 12 caractères minimum',
					'Password must be at least 12 characters':
						'Le mot de passe doit contenir au moins 12 caractères',
					'New password cannot be the same as the old password':
						"Le nouveau mot de passe ne peut pas être identique à l'ancien",
					'Too many requests': 'Trop de tentatives, veuillez réessayer plus tard'
				};

				const translatedMessage = errorMessageMap[err.body.message] || err.body.message;

				return fail(400, {
					error: translatedMessage,
					passwordErrors: undefined,
					fieldErrors: undefined
				});
			}
			return fail(500, {
				error: 'Erreur serveur',
				passwordErrors: undefined,
				fieldErrors: undefined
			});
		}
	},

	/**
	 * Deletes the user's profile photo.
	 */
	deletePhoto: async ({ fetch }) => {
		const res = await fetch('/api/v1/profile/me/photo', {
			method: 'DELETE'
		});

		const result = await res.json();

		if (!result.success) {
			return fail(res.status, {
				error: result.error.message,
				fieldErrors: undefined,
				passwordErrors: undefined
			});
		}

		return {
			success: true,
			message: 'Photo de profil supprimée',
			fieldErrors: undefined,
			passwordErrors: undefined
		};
	}
};
