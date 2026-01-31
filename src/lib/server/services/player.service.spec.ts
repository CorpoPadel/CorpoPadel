import { describe, it, expect, vi, beforeEach } from 'vitest';
import '$lib/test/mocks/db';
import { mockDb, mockChain } from '$lib/test/mocks/db';
import { PlayerService } from './player.service';
import { AppError } from '../utils/error';

vi.mock('$lib/server/db/app-schema', () => ({
	players: { id: 'id', createdAt: 'createdAt' }
}));
vi.mock('$lib/server/db/schema', () => ({
	user: { id: 'id' }
}));

// Mock team service to prevent circular dependency issues or integration logic
vi.mock('./team.service', () => ({
	teamService: {
		isPlayerInTeam: vi.fn()
	}
}));
import { teamService } from './team.service';

describe('services/player.service', () => {
	let service: PlayerService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new PlayerService();
	});

	describe('getAll', () => {
		it('should return all players', async () => {
			mockDb.query.players.findMany.mockResolvedValue([{ id: 1 }]);
			const res = await service.getAll();
			expect(res.length).toBe(1);
		});
	});

	describe('count', () => {
		it('should return total players', async () => {
			vi.spyOn(mockChain, 'then').mockImplementation((resolve) => resolve([{ count: 5 }]));
			const count = await service.count();
			expect(count).toBe(5);
		});
	});

	describe('fetchers', () => {
		it('getByIdWithUser should return player with user', async () => {
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1, user: {} });
			const res = await service.getByIdWithUser(1);
			expect(res?.user).toBeDefined();
		});

		it('getByLicense should return player', async () => {
			vi.spyOn(mockChain, 'get').mockResolvedValue({ id: 1, licenseNumber: 'L123456' });
			const res = await service.getByLicense('L123456');
			expect(res?.id).toBe(1);
		});

		it('getByUserId should return player', async () => {
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1 });
			const res = await service.getByUserId('u1');
			expect(res?.id).toBe(1);
		});
	});

	describe('create', () => {
		it('should create player', async () => {
			const p = { id: 1, firstName: 'John' };
			// Ensure no existing email/license
			vi.spyOn(mockChain, 'get').mockResolvedValue(null);
			// Mock insert...returning
			vi.spyOn(mockChain, 'returning').mockResolvedValue([p]);

			const result = await service.create({ firstName: 'John' } as any);
			expect(result).toEqual(p);
		});

		it('should throw conflict on constraint error', async () => {
			const error = new Error('UNIQUE constraint failed: players.email');
			(error as any).code = 'SQLITE_CONSTRAINT';

			// Ensure no existing email/license found via SELECT check
			vi.spyOn(mockChain, 'get').mockResolvedValue(null);
			vi.spyOn(mockChain, 'returning').mockRejectedValue(error);

			await expect(service.create({} as any)).rejects.toThrow('email est déjà utilisée');
		});
	});

	describe('update', () => {
		it('should update player', async () => {
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1 });
			vi.spyOn(mockChain, 'returning').mockResolvedValue([{ id: 1, firstName: 'Updated' }]);
			const res = await service.update(1, { firstName: 'Updated' });
			expect(res).toBeDefined();
		});

		it('should handle conflict on update (email)', async () => {
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1 });
			const error = new Error('UNIQUE constraint failed: players.email');
			(error as any).code = 'SQLITE_CONSTRAINT';
			vi.spyOn(mockChain, 'returning').mockRejectedValue(error);
			await expect(service.update(1, { email: 'x@x.com' })).rejects.toThrow(
				'adresse email est déjà utilisée'
			);
		});

		it('should handle conflict on update (license)', async () => {
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1 });
			const error = new Error('UNIQUE constraint failed: players.license_number');
			(error as any).code = 'SQLITE_CONSTRAINT';
			vi.spyOn(mockChain, 'returning').mockRejectedValue(error);
			await expect(service.update(1, { licenseNumber: 'L000' })).rejects.toThrow(
				'licence est déjà utilisé'
			);
		});

		it('should handle generic UNIQUE constraint error', async () => {
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1 });
			const error = new Error('UNIQUE constraint failed: something.else');
			(error as any).code = 'SQLITE_CONSTRAINT';
			vi.spyOn(mockChain, 'returning').mockRejectedValue(error);
			await expect(service.update(1, {})).rejects.toThrow('conflit');
		});

		it('should rethrow unknown errors on update', async () => {
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1 });
			vi.spyOn(mockChain, 'returning').mockRejectedValue(new Error('Unknown'));
			await expect(service.update(1, {})).rejects.toThrow('Unknown');
		});
	});

	describe('delete', () => {
		it('should delete player if not in team', async () => {
			vi.mocked(teamService.isPlayerInTeam).mockResolvedValue(false);
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1, userId: 'u1' });

			await service.delete(1);
			expect(mockDb.delete).toHaveBeenCalled();
		});

		it('should delete player without user record', async () => {
			vi.mocked(teamService.isPlayerInTeam).mockResolvedValue(false);
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1, userId: null });

			await service.delete(1);
			expect(mockDb.delete).toHaveBeenCalledTimes(1);
		});

		it('should throw if player in team', async () => {
			vi.mocked(teamService.isPlayerInTeam).mockResolvedValue(true);
			await expect(service.delete(1)).rejects.toThrow(/impossible/i);
		});
	});
});
