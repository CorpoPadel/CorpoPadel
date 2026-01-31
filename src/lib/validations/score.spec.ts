import { describe, it, expect } from 'vitest';
import { validateSet, validateMatchScore, type MatchScore } from './score';

describe('validations/score', () => {
	describe('validateSet', () => {
		it('should validate standard sets', () => {
			expect(validateSet(6, 0)).toBe(true);
			expect(validateSet(6, 4)).toBe(true);
			expect(validateSet(0, 6)).toBe(true);
		});

		it('should validate 7-5 and 7-6', () => {
			expect(validateSet(7, 5)).toBe(true);
			expect(validateSet(5, 7)).toBe(true);
			expect(validateSet(7, 6)).toBe(true);
			expect(validateSet(6, 7)).toBe(true);
		});

		it('should invalidate unfinished sets', () => {
			expect(validateSet(5, 4)).toBe(false);
			expect(validateSet(6, 6)).toBe(false); // Tie-break needed
			expect(validateSet(6, 5)).toBe(false); // Needs 7-5 or 6-6 -> 7-6
		});

		it('should invalidate impossible scores', () => {
			expect(validateSet(8, 6)).toBe(false);
			expect(validateSet(-1, 6)).toBe(false);
		});
	});

	describe('validateMatchScore', () => {
		const emptySet = { team1: null, team2: null };

		it('should validate 2-set winner', () => {
			const score: MatchScore = {
				set1: { team1: 6, team2: 4 },
				set2: { team1: 6, team2: 4 },
				set3: emptySet
			};
			expect(validateMatchScore(score).isValid).toBe(true);
		});

		it('should validate 3-set match', () => {
			const score: MatchScore = {
				set1: { team1: 6, team2: 4 },
				set2: { team1: 4, team2: 6 },
				set3: { team1: 6, team2: 4 }
			};
			expect(validateMatchScore(score).isValid).toBe(true);
		});

		it('should validate match where team 2 wins in 2 sets', () => {
			const score: MatchScore = {
				set1: { team1: 0, team2: 6 },
				set2: { team1: 0, team2: 6 },
				set3: emptySet
			};
			expect(validateMatchScore(score).isValid).toBe(true);
		});

		it('should fail if 3rd set provided when match won in 2', () => {
			const score: MatchScore = {
				set1: { team1: 6, team2: 4 },
				set2: { team1: 6, team2: 4 },
				set3: { team1: 6, team2: 0 }
			};
			const res = validateMatchScore(score);
			expect(res.isValid).toBe(false);
			expect(res.error).toContain('pas besoin de 3ème set');
		});

		it('should fail if 3rd set missing when tied', () => {
			const score: MatchScore = {
				set1: { team1: 6, team2: 4 },
				set2: { team1: 4, team2: 6 },
				set3: emptySet
			};
			const res = validateMatchScore(score);
			expect(res.isValid).toBe(false);
			expect(res.error).toContain('3ème set est requis');
		});

		it('should fail if set 1 is invalid', () => {
			const score: MatchScore = {
				set1: { team1: 5, team2: 5 },
				set2: { team1: 6, team2: 4 },
				set3: emptySet
			};
			expect(validateMatchScore(score).isValid).toBe(false);
		});

		it('should fail if set 1 is incomplete', () => {
			const score: MatchScore = {
				set1: { team1: 6, team2: null },
				set2: emptySet,
				set3: emptySet
			};
			expect(validateMatchScore(score).isValid).toBe(false);
		});

		it('should fail if set 2 is incomplete', () => {
			const score: MatchScore = {
				set1: { team1: 6, team2: 4 },
				set2: { team1: 6, team2: null },
				set3: emptySet
			};
			expect(validateMatchScore(score).isValid).toBe(false);
		});

		it('should fail if set 2 is invalid', () => {
			const score: MatchScore = {
				set1: { team1: 6, team2: 4 },
				set2: { team1: 5, team2: 5 },
				set3: emptySet
			};
			expect(validateMatchScore(score).isValid).toBe(false);
		});

		it('should fail if 3rd set is invalid', () => {
			const score: MatchScore = {
				set1: { team1: 6, team2: 4 }, // Winner 1
				set2: { team1: 4, team2: 6 }, // Winner 2 -> Tied
				set3: { team1: 5, team2: 4 } // Invalid set score
			};
			const res = validateMatchScore(score);
			expect(res.isValid).toBe(false);
			expect(res.error).toContain('score du set 3 est invalide');
		});
	});
});
