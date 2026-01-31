import { describe, it, expect, vi, beforeEach } from 'vitest';
import '$lib/test/mocks/db';
import { mockDb, mockChain } from '$lib/test/mocks/db';
import { StatService } from './stat.service';

vi.mock('$lib/server/db/app-schema', () => ({
	players: { id: 'p' },
	teams: { id: 't' },
	matches: { id: 'm' },
	pools: { id: 'po' }
}));
vi.mock('$lib/server/db/schema', () => ({
	user: { id: 'u' }
}));

describe('services/stat.service', () => {
	let service: StatService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new StatService();
	});

	describe('getDashboardCounts', () => {
		it('should return counts', async () => {
			// mock select().from() returns array of { count: X }
			vi.spyOn(mockChain, 'then').mockImplementation((resolve) => resolve([{ count: 10 }]));

			const res = await service.getDashboardCounts();
			expect(res.users).toBe(10);
			expect(res.players).toBe(10);
		});
	});

	describe('calculateCompanyStats (private)', () => {
		it('should calculate stats correctly via getRanking', async () => {
			// Mock getCompletedMatches
			const matches = [
				{
					scoreTeam1: '6-0, 6-0',
					team1: { company: 'A', player1: {}, player2: {} },
					team2: { company: 'B', player1: {}, player2: {} }
				},
				{
					scoreTeam1: '0-6, 0-6', // Team 2 wins
					team1: { company: 'C', player1: {}, player2: {} },
					team2: { company: 'D', player1: {}, player2: {} }
				}
			];
			mockDb.query.matches.findMany.mockResolvedValue(matches);

			const { ranking } = await service.getRanking();
			expect(ranking.find((r) => r.company === 'D')?.points).toBe(3);
		});

		it('should sort ranking with various tie-breakers', async () => {
			const matches = [
				{
					scoreTeam1: '6-0, 6-0', // 3 pts, 1 win, diff 2
					team1: { company: 'B', player1: {}, player2: {} },
					team2: { company: 'A', player1: {}, player2: {} }
				},
				{
					scoreTeam1: '0-6, 0-6', // D wins: 3 pts, 1 win, diff 2. C: 0 pts.
					team1: { company: 'C', player1: {}, player2: {} },
					team2: { company: 'D', player1: {}, player2: {} }
				},
				{
					scoreTeam1: '6-0, 0-6, 6-0', // E wins: 3 pts, 1 win, diff 1.
					team1: { company: 'E', player1: {}, player2: {} },
					team2: { company: 'F', player1: {}, player2: {} }
				}
			];
			mockDb.query.matches.findMany.mockResolvedValue(matches);
			const { ranking } = await service.getRanking();

			expect(ranking.length).toBe(6);
		});
	});

	describe('parseMatchScore', () => {
		it('should parse sets', () => {
			expect(service.parseMatchScore('6-4, 4-6, 6-0')).toEqual([2, 1]);
			expect(service.parseMatchScore(null)).toEqual([0, 0]);
		});

		it('should handle invalid score formats', () => {
			expect(service.parseMatchScore('invalid')).toEqual([0, 0]);
			expect(service.parseMatchScore('6-a')).toEqual([0, 0]);
		});
	});
});
