import { describe, it, expect, vi, beforeEach } from 'vitest';
import '$lib/test/mocks/db'; // Initializes DB mock
import { mockDb, mockChain } from '$lib/test/mocks/db';
import { AccountService } from './account.service';
import { AppError } from '../utils/error';

// Mock other dependencies
vi.mock('$lib/server/auth', () => ({
	default: {
		api: {
			signUpEmail: vi.fn()
		}
	}
}));
import auth from '$lib/server/auth';

// Mock schema
vi.mock('$lib/server/db/app-schema', () => ({
	players: { id: 'players' },
	userRoles: { id: 'userRoles' },
	roles: { id: 'roles', label: 'label' }
}));
vi.mock('$lib/server/db/schema', () => ({
	user: { id: 'user', email: 'email' },
	account: { id: 'account' }
}));
vi.mock('better-auth/crypto', () => ({
	hashPassword: vi.fn((pwd) => Promise.resolve(`hashed_${pwd}`))
}));

describe('services/account.service', () => {
	let service: AccountService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new AccountService();
	});

	describe('createAccountForPlayer', () => {
		it('should create account successfully', async () => {
			const player = {
				id: 1,
				email: 'test@example.com',
				firstName: 'John',
				lastName: 'Doe',
				userId: null
			};

			// Mocks
			mockDb.query.players.findFirst.mockResolvedValue(player);
			// Check existing user
			vi.spyOn(mockChain, 'get').mockResolvedValueOnce(null); // User not found (OK)
			// Check role
			vi.spyOn(mockChain, 'get').mockResolvedValueOnce({ id: 10, label: 'JOUEUR' }); // Role found

			const newUser = { user: { id: 'user_123', email: 'test@example.com' } };
			vi.mocked(auth.api.signUpEmail).mockResolvedValue(newUser as any);

			const result = await service.createAccountForPlayer(1);

			expect(result.user).toEqual(newUser.user);
			expect(result.tempPassword).toBeDefined();
			// Verify DB calls
			expect(mockDb.insert).toHaveBeenCalled(); // Role assignment
			expect(mockDb.update).toHaveBeenCalled(); // Update player with userId and update user mustChangePassword
		});

		it('should throw if player not found', async () => {
			mockDb.query.players.findFirst.mockResolvedValue(null);
			await expect(service.createAccountForPlayer(99)).rejects.toThrow(AppError);
		});

		it('should throw if player already has account', async () => {
			mockDb.query.players.findFirst.mockResolvedValue({ id: 1, userId: 'existing' });
			await expect(service.createAccountForPlayer(1)).rejects.toThrow('déjà un compte');
		});

		it('should throw if Auth system fails to create user', async () => {
			const player = {
				id: 1,
				email: 'test@example.com',
				firstName: 'J',
				lastName: 'D',
				userId: null
			};
			mockDb.query.players.findFirst.mockResolvedValue(player);
			vi.spyOn(mockChain, 'get').mockResolvedValue(null);
			vi.mocked(auth.api.signUpEmail).mockResolvedValue(null as any);

			await expect(service.createAccountForPlayer(1)).rejects.toThrow('Erreur lors de la création');
		});
	});
	describe('resetPassword', () => {
		it('should reset password', async () => {
			vi.spyOn(mockChain, 'get').mockResolvedValue({ id: 'u1' }); // User exists

			const res = await service.resetPassword('u1');
			expect(res.tempPassword).toBeDefined();
			expect(mockDb.update).toHaveBeenCalledTimes(2); // account + user
		});

		it('should throw if user not found', async () => {
			vi.spyOn(mockChain, 'get').mockResolvedValue(null);
			await expect(service.resetPassword('u1')).rejects.toThrow('introuvable');
		});
	});

	describe('updateUserEmail', () => {
		it('should update user email and reset verification', async () => {
			await service.updateUserEmail('u1', 'new@email.com');
			expect(mockDb.update).toHaveBeenCalled();
		});
	});

	describe('countAccounts', () => {
		it('should return number of users', async () => {
			vi.spyOn(mockChain, 'then').mockImplementation((resolve) => resolve([{ count: 5 }]));
			const count = await service.countAccounts();
			expect(count).toBe(5);
		});
	});

	describe('changeUserRole', () => {
		it('should change role successfully', async () => {
			vi.spyOn(mockChain, 'get').mockResolvedValue({ id: 2, label: 'ADMINISTRATEUR' });
			await service.changeUserRole('target_u', 'ADMINISTRATEUR', 'current_u');
			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.insert).toHaveBeenCalled();
		});

		it('should throw if trying to change own role', async () => {
			await expect(service.changeUserRole('u1', 'ADMIN', 'u1')).rejects.toThrow('propre rôle');
		});

		it('should throw if role not found', async () => {
			vi.spyOn(mockChain, 'get').mockResolvedValue(null);
			await expect(service.changeUserRole('u1', 'GHOST', 'u2')).rejects.toThrow('introuvable');
		});
	});

	describe('deleteAccount', () => {
		it('should delete account successfully', async () => {
			vi.spyOn(mockChain, 'get').mockResolvedValue({ id: 'u1' });
			await service.deleteAccount('u1', 'admin_u');
			expect(mockDb.delete).toHaveBeenCalled();
		});

		it('should throw if trying to delete self', async () => {
			await expect(service.deleteAccount('u1', 'u1')).rejects.toThrow('propre compte');
		});

		it('should throw if user not found', async () => {
			vi.spyOn(mockChain, 'get').mockResolvedValue(null);
			await expect(service.deleteAccount('u1', 'admin_u')).rejects.toThrow('introuvable');
		});
	});

	describe('changePassword', () => {
		it('should change password successfully', async () => {
			await service.changePassword('u1', 'NewPassword123!');
			expect(mockDb.update).toHaveBeenCalledTimes(2); // account + user
		});
	});

	describe('generatePassword', () => {
		it('should generate valid password', () => {
			const pwd = service.generatePassword();
			expect(pwd.length).toBe(12);
			expect(pwd).toMatch(/[a-z]/);
			expect(pwd).toMatch(/[A-Z]/);
			expect(pwd).toMatch(/[0-9]/);
		});
	});
});
