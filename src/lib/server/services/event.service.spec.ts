import { describe, it, expect, vi, beforeEach } from 'vitest';
import '$lib/test/mocks/db';
import { mockDb, mockChain } from '$lib/test/mocks/db';
import { EventService } from './event.service';
import { AppError } from '../utils/error';

vi.mock('$lib/server/db/app-schema', () => ({
	events: { id: 'events', eventDate: 'eventDate', eventTime: 'eventTime' },
	matches: { id: 'matches' }
}));

describe('services/event.service', () => {
	let service: EventService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new EventService();
	});

	describe('create', () => {
		it('should create event if no conflict', async () => {
			const input = {
				eventDate: new Date('2024-01-01'),
				eventTime: '14:00',
				matches: []
			};

			mockDb.query.events.findMany.mockResolvedValue([]);
			const createdEvent = { id: 1, ...input };
			vi.spyOn(mockChain, 'returning').mockResolvedValue([createdEvent]);
			mockDb.query.events.findFirst.mockResolvedValue(createdEvent);

			const result = await service.create(input);
			expect(result).toEqual(createdEvent);
		});

		it('should throw conflict if event exists within 1 hour', async () => {
			const input = {
				eventDate: new Date('2024-01-01'),
				eventTime: '14:30',
				matches: []
			};

			mockDb.query.events.findMany.mockResolvedValue([
				{ id: 1, eventDate: new Date('2024-01-01'), eventTime: '14:00' }
			]);

			await expect(service.create(input)).rejects.toThrow('intervalle');
		});

		it('should throw conflict if another event exists 30 mins later', async () => {
			const input = {
				eventDate: new Date('2024-01-01'),
				eventTime: '14:00',
				matches: []
			};

			mockDb.query.events.findMany.mockResolvedValue([
				{ id: 1, eventDate: new Date('2024-01-01'), eventTime: '14:30' }
			]);

			await expect(service.create(input)).rejects.toThrow('intervalle');
		});
	});

	describe('getByDateRange', () => {
		it('should fetch events in range', async () => {
			const events = [{ id: 1, matches: [] }];
			mockDb.query.events.findMany.mockResolvedValue(events);
			const result = await service.getByDateRange(new Date(), new Date());
			expect(result).toEqual(events);
		});

		it('should filter by userId', async () => {
			const events = [
				{
					id: 1,
					matches: [
						{
							team1: { player1: { userId: 'u1' }, player2: {} },
							team2: { player1: {}, player2: {} }
						}
					]
				},
				{
					id: 2,
					matches: [
						{
							team1: { player1: {}, player2: { userId: 'u1' } },
							team2: { player1: {}, player2: {} }
						}
					]
				},
				{
					id: 3,
					matches: [
						{
							team1: { player1: {}, player2: {} },
							team2: { player1: { userId: 'u1' }, player2: {} }
						}
					]
				},
				{
					id: 4,
					matches: [
						{
							team1: { player1: {}, player2: {} },
							team2: { player1: {}, player2: { userId: 'u1' } }
						}
					]
				}
			];
			mockDb.query.events.findMany.mockResolvedValue(events);
			const result = await service.getByDateRange(new Date(), new Date(), 'u1');
			expect(result.length).toBe(4);
		});
	});

	describe('checkDuplicate', () => {
		it('should find duplicate event', async () => {
			mockDb.query.events.findFirst.mockResolvedValue({ id: 1 });
			const result = await service.checkDuplicate(new Date(), '14:00');
			expect(result).toBeDefined();
		});
	});

	describe('update', () => {
		it('should update event successfully', async () => {
			const input = { eventDate: new Date(), eventTime: '15:00', matches: [] };
			mockDb.query.events.findMany.mockResolvedValue([]); // No conflicts
			vi.spyOn(mockChain, 'returning').mockResolvedValue([{ id: 1 }]);
			mockDb.query.events.findFirst.mockResolvedValue({ id: 1, ...input });

			const result = await service.update(1, input);
			expect(result.id).toBe(1);
			expect(mockDb.update).toHaveBeenCalled();
		});

		it('should throw conflict if update causes scheduling clash', async () => {
			mockDb.query.events.findMany.mockResolvedValue([{ id: 2, eventTime: '15:00' }]);
			await expect(
				service.update(1, { eventDate: new Date(), eventTime: '15:10', matches: [] })
			).rejects.toThrow('intervalle');
		});
	});

	describe('delete', () => {
		it('should delete event', async () => {
			mockDb.query.events.findFirst.mockResolvedValue({ id: 1 });
			await service.delete(1);
			expect(mockDb.delete).toHaveBeenCalled();
		});

		it('should throw if delete target not found', async () => {
			mockDb.query.events.findFirst.mockResolvedValue(null);
			await expect(service.delete(99)).rejects.toThrow('introuvable');
		});
	});

	describe('getById', () => {
		it('should return event', async () => {
			const ev = { id: 1 };
			mockDb.query.events.findFirst.mockResolvedValue(ev);
			expect(await service.getById(1)).toEqual(ev);
		});

		it('should throw if not found', async () => {
			mockDb.query.events.findFirst.mockResolvedValue(null);
			await expect(service.getById(1)).rejects.toThrow('introuvable');
		});
	});
});
