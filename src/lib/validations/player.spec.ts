import { describe, it, expect } from 'vitest';
import { createPlayerSchema, updatePlayerSchema } from './player';

describe('validations/player', () => {
	const validPlayer = {
		firstName: 'Jean-Michel',
		lastName: 'Dupont',
		email: 'jean@example.com',
		company: 'Acme',
		licenseNumber: 'L123456'
	};

	describe('createPlayerSchema', () => {
		it('should validate valid player', () => {
			expect(createPlayerSchema.safeParse(validPlayer).success).toBe(true);
		});

		it('should fail invalid names', () => {
			expect(createPlayerSchema.safeParse({ ...validPlayer, firstName: 'Jean123' }).success).toBe(
				false
			);
		});

		it('should fail invalid email', () => {
			expect(createPlayerSchema.safeParse({ ...validPlayer, email: 'not-email' }).success).toBe(
				false
			);
		});

		it('should fail invalid license format', () => {
			expect(
				createPlayerSchema.safeParse({ ...validPlayer, licenseNumber: '123456' }).success
			).toBe(false);
			expect(
				createPlayerSchema.safeParse({ ...validPlayer, licenseNumber: 'L12345' }).success
			).toBe(false); // too short
			expect(
				createPlayerSchema.safeParse({ ...validPlayer, licenseNumber: 'A123456' }).success
			).toBe(false); // wrong prefix
		});
	});

	describe('updatePlayerSchema', () => {
		it('should validate partial update', () => {
			expect(updatePlayerSchema.safeParse({ firstName: 'Paul' }).success).toBe(true);
		});
	});
});
