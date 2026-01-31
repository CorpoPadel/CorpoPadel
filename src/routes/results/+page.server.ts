import type { PageServerLoad } from './$types';

/**
 * Loads ranking, all completed matches, and the current user's participation results.
 */
export const load: PageServerLoad = async ({ fetch, locals }) => {
	const [rankingRes, matchesRes, myResultsRes] = await Promise.all([
		fetch('/api/v1/results/rankings'),
		fetch('/api/v1/matches?status=COMPLETED'),
		// Only load personal results if the user is authenticated
		locals.user ? fetch('/api/v1/results/my-results') : Promise.resolve(null)
	]);

	const rankingData = await rankingRes.json();
	const matchesData = await matchesRes.json();
	const myResultsData = myResultsRes ? await myResultsRes.json() : null;

	const ranking = rankingData.success ? rankingData.data.ranking : [];
	const matches = matchesData.success ? matchesData.data.matches : [];
	const myMatches = myResultsData?.success ? myResultsData.data.matches : [];

	return {
		matches,
		ranking,
		myMatches
	};
};
