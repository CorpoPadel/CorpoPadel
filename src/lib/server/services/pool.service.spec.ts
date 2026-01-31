import { describe, it, expect, vi, beforeEach } from 'vitest';
import '$lib/test/mocks/db';
import { mockDb, mockChain } from '$lib/test/mocks/db';
import { PoolService } from './pool.service';

vi.mock('$lib/server/db/app-schema', () => ({
	pools: { id: 'id' },
	teams: { id: 'id', poolId: 'poolId' },
	matches: { id: 'id' }
}));

describe('services/pool.service', () => {
	let service: PoolService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new PoolService();
	});

	describe('getAll/getByName/count', () => {
		it('should return all pools', async () => {
			mockDb.query.pools.findMany.mockResolvedValue([{ id: 1, teams: [] }]);
			const res = await service.getAll();
			expect(res.length).toBe(1);
		});

		it('should return pool by name', async () => {
			mockDb.query.pools.findFirst.mockResolvedValue({ id: 1, name: 'A' });
			const res = await service.getByName('A');
			expect(res?.name).toBe('A');
		});

		it('should count pools', async () => {
			vi.spyOn(mockChain, 'then').mockImplementation((resolve) => resolve([{ count: 3 }]));
			expect(await service.count()).toBe(3);
		});
	});

	describe('createWithTeams', () => {
		it('should create pool and assign teams', async () => {
			const teamIds = [1, 2, 3, 4, 5, 6];

			// Mock where return for teams check
			vi.spyOn(mockChain, 'then').mockImplementation((resolve) => {
				return resolve([
					{ id: 1, poolId: null },
					{ id: 2, poolId: null },
					{ id: 3, poolId: null },
					{ id: 4, poolId: null },
					{ id: 5, poolId: null },
					{ id: 6, poolId: null }
				]);
			});

			// Mock returning for pool creation
			vi.spyOn(mockChain, 'returning').mockResolvedValue([{ id: 100 }]);

			const res = await service.createWithTeams('Pool A', teamIds);
			expect(res.id).toBe(100);
		});

		it('should throw if not 6 teams', async () => {
			await expect(service.createWithTeams('A', [1])).rejects.toThrow('exactement 6');
		});

		it('should throw if teams already in pool', async () => {
			vi.spyOn(mockChain, 'then').mockImplementation((resolve) => {
				return resolve([{ id: 1, poolId: 99, company: 'BadTeam' }]);
			});
			await expect(service.createWithTeams('A', [1, 2, 3, 4, 5, 6])).rejects.toThrow(
				'déjà assignées'
			);
		});
	});

	describe('update/delete', () => {
		beforeEach(() => {
			// Mock checkMatches success (no completed matches)
			vi.spyOn(mockChain, 'then').mockImplementationOnce((resolve) => resolve([{ id: 1 }])); // get pool teams
			vi.spyOn(mockChain, 'then').mockImplementationOnce((resolve) => resolve([])); // check completed matches
		});

		it('should update pool', async () => {
			await service.update(1, 'New Name', [1, 2, 3, 4, 5, 6]);
			expect(mockDb.update).toHaveBeenCalled();
		});

		it('should delete pool', async () => {
			await service.delete(1);
			expect(mockDb.delete).toHaveBeenCalled();
		});

		it('should throw if update has completed matches', async () => {
			// Override checkMatches mock for this test
			vi.spyOn(mockChain, 'then').mockReset();
			vi.spyOn(mockChain, 'then').mockImplementationOnce((resolve) => resolve([{ id: 1 }]));
			vi.spyOn(mockChain, 'then').mockImplementationOnce((resolve) => resolve([{ id: 1 }])); // Found completed match

			await expect(service.update(1, 'A')).rejects.toThrow('Impossible');
		});
	});
});
