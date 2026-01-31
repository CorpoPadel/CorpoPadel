import { describe, it, expect, vi, beforeEach } from 'vitest';
import '$lib/test/mocks/db';
import { mockDb, mockChain } from '$lib/test/mocks/db';
import { MatchService } from './match.service';
import { AppError } from '../utils/error';

vi.mock('$lib/server/db/app-schema', () => ({
	matches: { id: 'id', eventId: 'eventId' },
	events: { id: 'id', eventDate: 'eventDate' }
}));

describe('services/match.service', () => {
	let service: MatchService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new MatchService();
	});

	describe('getById', () => {
		it('should return match', async () => {
			const m = { id: 1 };
			mockDb.query.matches.findFirst.mockResolvedValue(m);
			expect(await service.getById(1)).toEqual(m);
		});

		it('should throw if missing', async () => {
			mockDb.query.matches.findFirst.mockResolvedValue(null);
			await expect(service.getById(1)).rejects.toThrow(AppError);
		});
	});

	describe('getAll', () => {
		it('should return all matches', async () => {
			mockDb.query.matches.findMany.mockResolvedValue([{ id: 1 }]);
			const res = await service.getAll();
			expect(res.length).toBe(1);
		});
	});

	describe('getFiltered', () => {
		it('should filter by date range', async () => {
			mockDb.query.events.findMany.mockResolvedValue([{ id: 10 }]);
			mockDb.query.matches.findMany.mockResolvedValue([
				{ eventId: 10, team1: { player1: {}, player2: {} }, team2: { player1: {}, player2: {} } }
			]);
			const res = await service.getFiltered({ startDate: new Date(), endDate: new Date() });
			expect(res.length).toBe(1);
		});

		it('should return empty if no events in range', async () => {
			mockDb.query.events.findMany.mockResolvedValue([]);
			const res = await service.getFiltered({ startDate: new Date() });
			expect(res.length).toBe(0);
		});

		it('should filter by userId', async () => {
			const matches = [
				{
					team1: { player1: { userId: 'u1' }, player2: { userId: 'u2' } },
					team2: { player1: { userId: 'u3' }, player2: { userId: 'u4' } }
				},
				{
					team1: { player1: { userId: 'other' }, player2: { userId: 'other' } },
					team2: { player1: { userId: 'other' }, player2: { userId: 'other' } }
				}
			];
			mockDb.query.matches.findMany.mockResolvedValue(matches);

			const res = await service.getFiltered({ userId: 'u1' });
			expect(res.length).toBe(1);
		});

		it('should filter by teamId', async () => {
			mockDb.query.matches.findMany.mockResolvedValue([
				{ team1Id: 1, team1: {}, team2: {} },
				{ team1Id: 2, team1: {}, team2: {} }
			]);
			const res = await service.getFiltered({ teamId: 1 });
			expect(res.length).toBe(1);
		});

		it('should filter by company', async () => {
			mockDb.query.matches.findMany.mockResolvedValue([
				{ team1: { company: 'Acme' }, team2: { company: 'Other' } },
				{ team1: { company: 'Corp' }, team2: { company: 'Other' } }
			]);
			const res = await service.getFiltered({ company: 'Acme' });
			expect(res.length).toBe(1);
		});

		it('should filter by poolId', async () => {
			mockDb.query.matches.findMany.mockResolvedValue([
				{ team1: { poolId: 1 }, team2: { poolId: 2 } },
				{ team1: { poolId: 3 }, team2: { poolId: 3 } }
			]);
			const res = await service.getFiltered({ poolId: 1 });
			expect(res.length).toBe(1);
		});

		it('should handle upcoming filter', async () => {
			mockDb.query.events.findMany.mockResolvedValue([{ id: 1 }]);
			mockDb.query.matches.findMany.mockResolvedValue([
				{ eventId: 1, team1: { player1: {} }, team2: { player1: {} } }
			]);
			const res = await service.getFiltered({ upcoming: true });
			expect(res.length).toBe(1);
		});

		it('should sort matches by date and time', async () => {
			const matches = [
				{ event: { eventDate: '2024-01-02', eventTime: '10:00' }, team1: {}, team2: {} },
				{ event: { eventDate: '2024-01-01', eventTime: '12:00' }, team1: {}, team2: {} },
				{ event: { eventDate: '2024-01-01', eventTime: '10:00' }, team1: {}, team2: {} }
			];
			mockDb.query.matches.findMany.mockResolvedValue(matches);
			const res = await service.getFiltered({});
			expect(res[0].event.eventDate).toBe('2024-01-01');
			expect(res[0].event.eventTime).toBe('10:00');
			expect(res[1].event.eventTime).toBe('12:00');
		});
	});

	describe('create/update/delete', () => {
		it('should create match', async () => {
			vi.spyOn(mockChain, 'returning').mockResolvedValue([{ id: 1 }]);
			const res = await service.create({ eventId: 1, team1Id: 1, team2Id: 2 } as any);
			expect(res).toBeDefined();
		});

		it('should update match', async () => {
			mockDb.query.matches.findFirst.mockResolvedValue({ id: 1 });
			vi.spyOn(mockChain, 'returning').mockResolvedValue([{ id: 1 }]);
			await service.update(1, { status: 'COMPLETED' } as any);
			expect(mockDb.update).toHaveBeenCalled();
		});

		it('should delete match', async () => {
			mockDb.query.matches.findFirst.mockResolvedValue({ id: 1 });
			await service.delete(1);
			expect(mockDb.delete).toHaveBeenCalled();
		});
	});

	describe('status checks', () => {
		it('hasTeamPlayed should return true if matches exist', async () => {
			vi.spyOn(mockChain, 'limit').mockResolvedValue([{ id: 1 }]);
			expect(await service.hasTeamPlayed(1)).toBe(true);
		});

		it('hasTeamCompletedMatch should return true if completed matches exist', async () => {
			vi.spyOn(mockChain, 'limit').mockResolvedValue([{ id: 1 }]);
			expect(await service.hasTeamCompletedMatch(1)).toBe(true);
		});
	});
});
