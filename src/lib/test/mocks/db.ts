import { vi } from 'vitest';

// Shared chainable mock object
export const mockChain = {
	from: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	set: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	limit: vi.fn().mockReturnThis(),
	orderBy: vi.fn().mockReturnThis(),
	leftJoin: vi.fn().mockReturnThis(),
	returning: vi.fn().mockResolvedValue([]),
	get: vi.fn().mockResolvedValue(null),
	all: vi.fn().mockResolvedValue([]),
	then: (resolve: any) => Promise.resolve([]).then(resolve)
};

export const mockDb = {
	query: {
		players: {
			findFirst: vi.fn(),
			findMany: vi.fn()
		},
		users: {
			findFirst: vi.fn(),
			findMany: vi.fn()
		},
		events: {
			findFirst: vi.fn(),
			findMany: vi.fn()
		},
		matches: {
			findFirst: vi.fn(),
			findMany: vi.fn()
		},
		teams: {
			findFirst: vi.fn(),
			findMany: vi.fn()
		},
		pools: {
			findFirst: vi.fn(),
			findMany: vi.fn()
		},
		userRoles: {
			findFirst: vi.fn(),
			findMany: vi.fn()
		},
		loginAttempts: {
			findFirst: vi.fn(),
			findMany: vi.fn()
		}
	},
	select: vi.fn(() => mockChain),
	insert: vi.fn(() => mockChain),
	update: vi.fn(() => mockChain),
	delete: vi.fn(() => mockChain),
	transaction: vi.fn((callback) => callback(mockDb))
};

// Mocking the module
vi.mock('$lib/server/db', () => ({
	db: mockDb
}));
