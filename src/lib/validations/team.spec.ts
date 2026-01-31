import { describe, it, expect } from 'vitest';
import { createTeamSchema, updateTeamSchema } from './team';

describe('validations/team', () => {
	describe('createTeamSchema', () => {
		const validTeam = {
			company: 'Acme Corp',
			player1Id: 1,
			player2Id: 2
		};

		it('should validate valid team', () => {
			expect(createTeamSchema.safeParse(validTeam).success).toBe(true);
		});

		it('should fail if players are same', () => {
			expect(createTeamSchema.safeParse({ ...validTeam, player2Id: 1 }).success).toBe(false);
		});

		it('should fail short company name', () => {
			expect(createTeamSchema.safeParse({ ...validTeam, company: 'A' }).success).toBe(false);
		});
	});

	describe('updateTeamSchema', () => {
		it('should validate partial update', () => {
			expect(updateTeamSchema.safeParse({ company: 'New Corp' }).success).toBe(true);
		});

		it('should fail same players if both provided', () => {
			expect(updateTeamSchema.safeParse({ player1Id: 1, player2Id: 1 }).success).toBe(false);
		});

		it('should allow single player update', () => {
			// Logic in schema: if (p1 && p2) check; else true.
			expect(updateTeamSchema.safeParse({ player1Id: 1 }).success).toBe(true);
		});
	});
});
