/**
 * Represents the full score structure of a padel match (up to 3 sets)
 */
export interface MatchScore {
	set1: { team1: number | null; team2: number | null };
	set2: { team1: number | null; team2: number | null };
	set3: { team1: number | null; team2: number | null };
}

export interface ScoreValidationResult {
	isValid: boolean;
	error?: string;
}

/**
 * Validates if a single set score is legal in padel (6-x or 7-x cases)
 */
export function validateSet(s1: number, s2: number): boolean {
	if (s1 < 0 || s2 < 0) return false;

	// Standard set win (6-0 to 6-4)
	if (s1 === 6 && s2 <= 4) return true;
	if (s2 === 6 && s1 <= 4) return true;

	// Overtime / Tie-break win (7-5 or 7-6)
	if (s1 === 7 && (s2 === 5 || s2 === 6)) return true;
	if (s2 === 7 && (s1 === 5 || s1 === 6)) return true;

	return false;
}

/**
 * Validates the full match score logic:
 * - Each played set must be valid
 * - Matches end after 2 sets won by the same team
 * - 3rd set is required only if there is a tie after 2 sets
 */
export function validateMatchScore(score: MatchScore): ScoreValidationResult {
	const { set1, set2, set3 } = score;

	// Validate Set 1
	if (set1.team1 === null || set1.team2 === null) {
		return { isValid: false, error: 'Le score du set 1 est incomplet (ex: 6-4, 7-5).' };
	}
	if (!validateSet(set1.team1, set1.team2)) {
		return { isValid: false, error: 'Le score du set 1 est invalide (ex: 6-4, 7-5).' };
	}

	const set1Winner = set1.team1 > set1.team2 ? 1 : 2;

	// Validate Set 2
	if (set2.team1 === null || set2.team2 === null) {
		return { isValid: false, error: 'Le score du set 2 est incomplet (ex: 6-4, 7-5).' };
	}
	if (!validateSet(set2.team1, set2.team2)) {
		return { isValid: false, error: 'Le score du set 2 est invalide (ex: 6-4, 7-5).' };
	}

	const set2Winner = set2.team1 > set2.team2 ? 1 : 2;

	// Check if match is already decided
	if (set1Winner === set2Winner) {
		if (set3.team1 !== null || set3.team2 !== null) {
			return { isValid: false, error: 'Le match est fini en 2 sets, pas besoin de 3ème set.' };
		}
		return { isValid: true };
	}

	// Validate required Set 3
	if (set3.team1 === null || set3.team2 === null) {
		return { isValid: false, error: 'Un 3ème set est requis (1 set partout).' };
	}
	if (!validateSet(set3.team1, set3.team2)) {
		return { isValid: false, error: 'Le score du set 3 est invalide.' };
	}

	return { isValid: true };
}
