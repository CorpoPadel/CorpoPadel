import { json } from '@sveltejs/kit';
import { AppError } from './error';
import { ZodError } from 'zod';

/** Standardized structure for all API responses */
type ApiResponse<T> = {
	success: boolean;
	data?: T;
	message?: string;
	error?: {
		code: string;
		message: string;
		details?: any;
	};
	meta?: any;
};

/**
 * Creates a standard JSON success response
 */
export function successResponse<T>(data: T, message?: string, meta?: any, status = 200) {
	return json(
		{
			success: true,
			data,
			message,
			meta
		} as ApiResponse<T>,
		{ status }
	);
}

/**
 * Standardizes error responses based on error type (AppError, ZodError, or generic)
 */
export function errorResponse(error: unknown) {
	console.error('API Error:', error);

	// Custom application errors
	if (error instanceof AppError) {
		return json(
			{
				success: false,
				error: {
					code: error.code,
					message: error.message,
					details: error.details
				}
			},
			{ status: error.statusCode }
		);
	}

	// Validation errors from Zod
	if (error instanceof ZodError) {
		return json(
			{
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Données invalides',
					details: error.flatten()
				}
			},
			{ status: 400 }
		);
	}

	// Default to internal server error
	return json(
		{
			success: false,
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Une erreur interne est survenue'
			}
		},
		{ status: 500 }
	);
}

/**
 * Higher-order function to wrap API route handlers.
 * Automatically catches errors and standardizes success payloads.
 */
export async function apiHandler(handler: () => Promise<any>) {
	try {
		const result = await handler();

		// If the handler already returned a raw Response (like a redirect), return it directly
		if (result instanceof Response) return result;
		return successResponse(result);
	} catch (err) {
		return errorResponse(err);
	}
}
