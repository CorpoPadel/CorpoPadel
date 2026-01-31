import { describe, it, expect, vi, beforeEach } from 'vitest';
import '$lib/test/mocks/db';
import { mockDb, mockChain } from '$lib/test/mocks/db';
import { TeamService } from './team.service';
import { AppError } from '../utils/error';
import { matchService } from './match.service';

vi.mock('$lib/server/db/app-schema', () => ({
	players: { id: 'id' },
	teams: { id: 'id', player1Id: 'p1', player2Id: 'p2' }
}));

// Mock match service
vi.mock('./match.service', () => ({
	matchService: {
		hasTeamCompletedMatch: vi.fn(),
		hasTeamPlayed: vi.fn()
	}
}));

describe('services/team.service', () => {
	let service: TeamService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new TeamService();
	});

	describe('fetchers', () => {
		it('should return all teams', async () => {
			mockDb.query.teams.findMany.mockResolvedValue([{ id: 1 }]);
			const res = await service.getAll();
			expect(res.length).toBe(1);
		});

		it('should return team by id', async () => {
			mockDb.query.teams.findFirst.mockResolvedValue({ id: 1 });
			const res = await service.getById(1);
			expect(res.id).toBe(1);
		});

		it('should throw if team not found', async () => {
			mockDb.query.teams.findFirst.mockResolvedValue(null);
			await expect(service.getById(1)).rejects.toThrow(AppError);
		});

		it('should filter teams', async () => {
			mockDb.query.teams.findMany.mockResolvedValue([{ id: 1, company: 'Acme' }]);
			const res = await service.getFiltered({ company: 'Acme' });
			expect(res.length).toBe(1);
		});

		it('should count teams', async () => {
			vi.spyOn(mockChain, 'then').mockImplementation((resolve) => resolve([{ count: 3 }]));
			expect(await service.count()).toBe(3);
		});
	});

	describe('create', () => {
		it('should create team if valid', async () => {
			const data = { company: 'Acme', player1Id: 1, player2Id: 2 };

			// Mock players fetch
			mockDb.query.players.findFirst
				.mockResolvedValueOnce({ id: 1, company: 'Acme' })
				.mockResolvedValueOnce({ id: 2, company: 'Acme' });

			// Mock existing team check (none)
			mockDb.query.teams.findFirst.mockResolvedValue(null);

			// Mock insert
			const created = { id: 10, ...data };
			vi.spyOn(mockChain, 'returning').mockResolvedValue([created]);

			const result = await service.create(data);
			expect(result).toEqual([created]);
		});

		it('should throw if different companies', async () => {
			const data = { company: 'Acme', player1Id: 1, player2Id: 2 };
			mockDb.query.players.findFirst
				.mockResolvedValueOnce({ id: 1, company: 'Acme' })
				.mockResolvedValueOnce({ id: 2, company: 'Other' });

			await expect(service.create(data)).rejects.toThrow(/doivent appartenir à/i);
		});

		it('should throw if players belong to same company but not the one selected', async () => {
			const data = { company: 'Acme', player1Id: 1, player2Id: 2 };
			mockDb.query.players.findFirst
				.mockResolvedValueOnce({ id: 1, company: 'Other' })
				.mockResolvedValueOnce({ id: 2, company: 'Other' });

			await expect(service.create(data)).rejects.toThrow(/doivent appartenir à/i);
		});

		it('should throw if player already in team', async () => {
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1, company: 'Acme' });
			mockDb.query.teams.findFirst.mockResolvedValue({ id: 99 }); // Found existing team
			await expect(service.create({ company: 'Acme', player1Id: 1, player2Id: 2 })).rejects.toThrow(
				'déjà dans une équipe'
			);
		});
	});

	describe('update/delete/utility', () => {
		it('should update team if no completed matches', async () => {
			vi.mocked(matchService.hasTeamCompletedMatch).mockResolvedValue(false);
			await service.update(1, { company: 'New' });
			expect(mockDb.update).toHaveBeenCalled();
		});

		it('should throw if updating team with completed matches', async () => {
			vi.mocked(matchService.hasTeamCompletedMatch).mockResolvedValue(true);
			await expect(service.update(1, { company: 'X' })).rejects.toThrow('Impossible');
		});

		it('should delete team if no matches played', async () => {
			vi.mocked(matchService.hasTeamPlayed).mockResolvedValue(false);
			await service.delete(1);
			expect(mockDb.delete).toHaveBeenCalled();
		});

		it('should throw if deleting team with played matches', async () => {
			vi.mocked(matchService.hasTeamPlayed).mockResolvedValue(true);
			await expect(service.delete(1)).rejects.toThrow('Impossible');
		});

		it('should check if player is in team', async () => {
			mockDb.query.teams.findFirst.mockResolvedValue({ id: 1 });
			expect(await service.isPlayerInTeam(1)).toBe(true);

			mockDb.query.teams.findFirst.mockResolvedValue(null);
			expect(await service.isPlayerInTeam(2)).toBe(false);
		});
	});
});
