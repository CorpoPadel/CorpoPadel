import { describe, it, expect, vi, afterEach } from 'vitest';
import { updateProfileSchema } from './profile';

describe('validations/profile', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	const validProfile = {
		firstName: 'Jean',
		lastName: 'Dupont',
		email: 'jean@example.com',
		birthDate: '2000-01-01', // 24 years old in 2024
		photo: undefined
	};

	it('should validate valid profile', () => {
		expect(updateProfileSchema.safeParse(validProfile).success).toBe(true);
	});

	it('should fail if under 16', () => {
		// Mock time to 2024
		vi.setSystemTime(new Date('2024-01-01'));
		// Born 2010 -> 14 years old
		expect(
			updateProfileSchema.safeParse({ ...validProfile, birthDate: '2010-01-01' }).success
		).toBe(false);
	});

	it('should validate file', () => {
		const validFile = { size: 1024, type: 'image/png' };
		expect(updateProfileSchema.safeParse({ ...validProfile, photo: validFile }).success).toBe(true);
	});

	it('should fail huge file', () => {
		const hugeFile = { size: 5 * 1024 * 1024, type: 'image/png' }; // 5MB
		expect(updateProfileSchema.safeParse({ ...validProfile, photo: hugeFile }).success).toBe(false);
	});

	it('should fail invalid type', () => {
		const badFile = { size: 1024, type: 'application/pdf' };
		expect(updateProfileSchema.safeParse({ ...validProfile, photo: badFile }).success).toBe(false);
	});
});
