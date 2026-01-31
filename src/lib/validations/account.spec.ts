import { describe, it, expect } from 'vitest';
import { createAccountSchema, updateRoleSchema, resetPasswordSchema } from './account';

describe('validations/account', () => {
	describe('createAccountSchema', () => {
		it('should validate valid input', () => {
			const result = createAccountSchema.safeParse({ playerId: 1 });
			expect(result.success).toBe(true);
		});

		it('should fail if playerId is missing', () => {
			const result = createAccountSchema.safeParse({});
			expect(result.success).toBe(false);
		});

		it('should fail if playerId is not integer', () => {
			const result = createAccountSchema.safeParse({ playerId: 1.5 });
			expect(result.success).toBe(false);
		});

		it('should fail if playerId is negative', () => {
			const result = createAccountSchema.safeParse({ playerId: -1 });
			expect(result.success).toBe(false);
		});
	});

	describe('updateRoleSchema', () => {
		it('should validate valid roles', () => {
			expect(updateRoleSchema.safeParse({ role: 'ADMINISTRATEUR' }).success).toBe(true);
			expect(updateRoleSchema.safeParse({ role: 'JOUEUR' }).success).toBe(true);
		});

		it('should fail for invalid role', () => {
			const result = updateRoleSchema.safeParse({ role: 'INVALID' });
			expect(result.success).toBe(false);
		});

		it('should fail for missing role', () => {
			const result = updateRoleSchema.safeParse({});
			expect(result.success).toBe(false);
		});
	});

	describe('resetPasswordSchema', () => {
		it('should validate valid userId', () => {
			expect(resetPasswordSchema.safeParse({ userId: '123' }).success).toBe(true);
		});

		it('should fail empty userId', () => {
			expect(resetPasswordSchema.safeParse({ userId: '' }).success).toBe(false);
		});

		it('should fail missing userId', () => {
			expect(resetPasswordSchema.safeParse({}).success).toBe(false);
		});
	});
});
