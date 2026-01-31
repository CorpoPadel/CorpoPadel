import { db } from '$lib/server/db';
import { count, eq, desc } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';
import { players, teams, matches, pools } from '$lib/server/db/app-schema';

export type RankingStats = {
	company: string;
	played: number;
	wins: number;
	losses: number;
	points: number;
	setsWon: number;
	setsLost: number;
};

export interface DashboardCounts {
	users: number;
	players: number;
	teams: number;
	matches: number;
	pools: number;
}

export class StatService {
	async getDashboardCounts(): Promise<DashboardCounts> {
		const [userCount] = await db.select({ count: count() }).from(user);
		const [playerCount] = await db.select({ count: count() }).from(players);
		const [teamCount] = await db.select({ count: count() }).from(teams);
		const [matchCount] = await db.select({ count: count() }).from(matches);
		const [poolCount] = await db.select({ count: count() }).from(pools);

		return {
			users: userCount?.count ?? 0,
			players: playerCount?.count ?? 0,
			teams: teamCount?.count ?? 0,
			matches: matchCount?.count ?? 0,
			pools: poolCount?.count ?? 0
		};
	}

	async getRanking(): Promise<{ matches: any[]; ranking: RankingStats[] }> {
		const completedMatches = await this.getCompletedMatches();
		const companyStats = this.calculateCompanyStats(completedMatches);
		const ranking = this.sortRanking(Array.from(companyStats.values()));

		return {
			matches: completedMatches,
			ranking
		};
	}

	private async getCompletedMatches() {
		return await db.query.matches.findMany({
			where: eq(matches.status, 'COMPLETED'),
			with: {
				event: true,
				team1: { with: { player1: true, player2: true } },
				team2: { with: { player1: true, player2: true } }
			},
			orderBy: desc(matches.updatedAt)
		});
	}

	private calculateCompanyStats(completedMatches: any[]): Map<string, RankingStats> {
		const companyStats = new Map<string, RankingStats>();

		const getOrCreateCompany = (name: string) => {
			let stats = companyStats.get(name);
			if (!stats) {
				stats = {
					company: name,
					played: 0,
					wins: 0,
					losses: 0,
					points: 0,
					setsWon: 0,
					setsLost: 0
				};
				companyStats.set(name, stats);
			}
			return stats;
		};

		for (const match of completedMatches) {
			const c1 = getOrCreateCompany(match.team1.company);
			const c2 = getOrCreateCompany(match.team2.company);

			const [sets1, sets2] = this.parseMatchScore(match.scoreTeam1);

			c1.played++;
			c2.played++;
			c1.setsWon += sets1;
			c1.setsLost += sets2;
			c2.setsWon += sets2;
			c2.setsLost += sets1;

			if (sets1 > sets2) {
				c1.wins++;
				c1.points += 3;
				c2.losses++;
			} else if (sets2 > sets1) {
				c2.wins++;
				c2.points += 3;
				c1.losses++;
			}
		}

		return companyStats;
	}

	private sortRanking(stats: RankingStats[]): RankingStats[] {
		return stats.sort((a, b) => {
			if (b.points !== a.points) return b.points - a.points;
			if (b.wins !== a.wins) return b.wins - a.wins;

			const diffA = a.setsWon - a.setsLost;
			const diffB = b.setsWon - b.setsLost;
			if (diffA !== diffB) return diffB - diffA;

			return a.company.localeCompare(b.company);
		});
	}

	public parseMatchScore(score: string | null): [number, number] {
		if (!score) return [0, 0];

		const sets = score.split(',').map((s) => s.trim());
		let t1Sets = 0;
		let t2Sets = 0;

		for (const set of sets) {
			const parts = set.split('-');
			if (parts.length !== 2) continue;

			const g1 = parseInt(parts[0]);
			const g2 = parseInt(parts[1]);

			if (isNaN(g1) || isNaN(g2)) continue;

			if (g1 > g2) t1Sets++;
			else if (g2 > g1) t2Sets++;
		}

		return [t1Sets, t2Sets];
	}
}

export const statService = new StatService();
