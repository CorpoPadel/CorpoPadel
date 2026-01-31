import { describe, it, expect } from 'vitest';
import { matchFormSchema, patchScoreSchema } from './match';

describe('validations/match', () => {
	describe('matchFormSchema', () => {
		const validBase = {
			date: new Date(),
			time: '14:00',
			courtNumber: 1,
			team1Id: 1,
			team2Id: 2,
			status: 'ONGOING'
		};

		it('should validate valid match', () => {
			expect(matchFormSchema.safeParse(validBase).success).toBe(true);
		});

		it('should fail same teams', () => {
			expect(matchFormSchema.safeParse({ ...validBase, team2Id: 1 }).success).toBe(false);
		});

		it('should fail invalid time format', () => {
			expect(matchFormSchema.safeParse({ ...validBase, time: '14h00' }).success).toBe(false);
		});

		it('should fail invalid court number', () => {
			expect(matchFormSchema.safeParse({ ...validBase, courtNumber: 11 }).success).toBe(false);
			expect(matchFormSchema.safeParse({ ...validBase, courtNumber: 0 }).success).toBe(false);
		});

		it('should require scores if COMPLETED', () => {
			expect(
				matchFormSchema.safeParse({
					...validBase,
					status: 'COMPLETED',
					scoreTeam1: null,
					scoreTeam2: null
				}).success
			).toBe(false);
		});

		it('should validate COMPLETED with scores', () => {
			expect(
				matchFormSchema.safeParse({
					...validBase,
					status: 'COMPLETED',
					scoreTeam1: '6-0',
					scoreTeam2: '0-6'
				}).success
			).toBe(true);
		});
	});

	describe('patchScoreSchema', () => {
		it('should validate correct patch', () => {
			expect(
				patchScoreSchema.safeParse({
					scoreTeam1: '6-0',
					scoreTeam2: '0-6',
					status: 'COMPLETED'
				}).success
			).toBe(true);
		});

		it('should fail if status is not COMPLETED', () => {
			expect(
				patchScoreSchema.safeParse({
					scoreTeam1: '6-0',
					scoreTeam2: '0-6',
					status: 'ONGOING'
				}).success
			).toBe(false);
		});

		it('should fail missing scores', () => {
			expect(
				patchScoreSchema.safeParse({
					status: 'COMPLETED'
				}).success
			).toBe(false);
		});
	});
});
