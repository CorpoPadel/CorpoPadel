import { describe, it, expect } from 'vitest';
import { createPoolSchema, updatePoolSchema } from './pool';

describe('validations/pool', () => {
	describe('createPoolSchema', () => {
		it('should validate valid pool', () => {
			expect(
				createPoolSchema.safeParse({
					name: 'Poule A',
					team_ids: [1, 2, 3, 4, 5, 6]
				}).success
			).toBe(true);
		});

		it('should fail if teams count != 6', () => {
			expect(
				createPoolSchema.safeParse({
					name: 'Poule A',
					team_ids: [1, 2, 3, 4, 5]
				}).success
			).toBe(false);
		});

		it('should fail short name', () => {
			expect(
				createPoolSchema.safeParse({
					name: 'A',
					team_ids: [1, 2, 3, 4, 5, 6]
				}).success
			).toBe(false);
		});
	});

	describe('updatePoolSchema', () => {
		it('should allow id in update', () => {
			expect(
				updatePoolSchema.safeParse({
					id: 1,
					name: 'Poule B',
					team_ids: [1, 2, 3, 4, 5, 6]
				}).success
			).toBe(true);
		});
	});
});
