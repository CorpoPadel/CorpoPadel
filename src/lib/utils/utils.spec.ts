import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatLongDate, formatTime } from './utils';

describe('utils/utils', () => {
	describe('cn', () => {
		it('should merge classes correctly', () => {
			expect(cn('p-4', 'p-2')).toBe('p-2');
			expect(cn('text-red-500', null, undefined, 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
			expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
		});
	});

	describe('formatDate', () => {
		it('should format date to YYYY-MM-DD', () => {
			const date = new Date(2023, 0, 1); // Jan 1 2023
			expect(formatDate(date)).toBe('2023-01-01');
		});
	});

	describe('formatLongDate', () => {
		it('should format date to long French format', () => {
			const date = new Date(2023, 0, 1);
			expect(formatLongDate(date)).toBe('1 janvier 2023');
		});

		it('should handle string input', () => {
			expect(formatLongDate('2023-01-01')).toBe('1 janvier 2023');
		});
	});

	describe('formatTime', () => {
		it('should format time string', () => {
			expect(formatTime('14:30:00')).toBe('14:30');
			expect(formatTime('09:05')).toBe('09:05');
		});
	});
});
