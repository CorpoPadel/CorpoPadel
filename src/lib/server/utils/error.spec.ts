import { describe, it, expect } from 'vitest';
import { AppError } from './error';

describe('server/utils/error', () => {
	describe('AppError', () => {
		it('should create an error with default values', () => {
			const err = new AppError('Error msg');
			expect(err.message).toBe('Error msg');
			expect(err.statusCode).toBe(500);
			expect(err.code).toBe('INTERNAL_ERROR');
		});

		it('should helper methods create correct errors', () => {
			const badRequest = AppError.badRequest('Bad');
			expect(badRequest.statusCode).toBe(400);
			expect(badRequest.code).toBe('BAD_REQUEST');

			const unauthorized = AppError.unauthorized();
			expect(unauthorized.statusCode).toBe(401);
			expect(unauthorized.message).toBe('Non autorisé');

			const forbidden = AppError.forbidden();
			expect(forbidden.statusCode).toBe(403);

			const notFound = AppError.notFound();
			expect(notFound.statusCode).toBe(404);

			const conflict = AppError.conflict('Conflict');
			expect(conflict.statusCode).toBe(409);
		});
	});
});
