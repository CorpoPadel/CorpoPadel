import { describe, it, expect, vi, afterEach } from 'vitest';
import { AppError } from './error';
import { successResponse, errorResponse, apiHandler } from './response';
import { ZodError } from 'zod';

// Mock console.error to keep test output clean
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('server/utils/response', () => {
	afterEach(() => {
		consoleSpy.mockClear();
	});

	describe('successResponse', () => {
		it('should return json response with data', async () => {
			const res = successResponse({ foo: 'bar' });
			expect(await res.json()).toEqual({
				success: true,
				data: { foo: 'bar' },
				message: undefined,
				meta: undefined
			});
			expect(res.status).toBe(200);
		});
	});

	describe('errorResponse', () => {
		it('should handle AppError', async () => {
			const err = new AppError('My Error', 418, 'I_AM_A_TEAPOT');
			const res = errorResponse(err);
			expect(await res.json()).toEqual({
				success: false,
				error: {
					code: 'I_AM_A_TEAPOT',
					message: 'My Error',
					details: undefined
				}
			});
			expect(res.status).toBe(418);
		});

		it('should handle ZodError', async () => {
			// Create a real ZodError via safeParse or manual
			const zodErr = new ZodError([{ code: 'custom', path: ['field'], message: 'Invalid' }]);
			const res = errorResponse(zodErr);

			const body = await res.json();
			expect(body.success).toBe(false);
			expect(body.error.code).toBe('VALIDATION_ERROR');
			expect(res.status).toBe(400);
		});

		it('should handle generic Error', async () => {
			const err = new Error('Boom');
			const res = errorResponse(err);

			const body = await res.json();
			expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
			expect(res.status).toBe(500);
		});
	});

	describe('apiHandler', () => {
		it('should return success response on resolution', async () => {
			const handler = async () => ({ id: 1 });
			const res = await apiHandler(handler);

			expect(await res.json()).toEqual(expect.objectContaining({ success: true, data: { id: 1 } }));
		});

		it('should catch errors and return error response', async () => {
			const handler = async () => {
				throw new AppError('Fail', 400);
			};
			const res = await apiHandler(handler);
			expect(res.status).toBe(400);
		});

		it('should pass through Response objects', async () => {
			const realResponse = new Response('redirect', { status: 302 });
			const handler = async () => realResponse;
			const res = await apiHandler(handler);
			expect(res).toBe(realResponse);
		});
	});
});
