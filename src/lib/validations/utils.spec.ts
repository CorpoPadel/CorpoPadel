import { describe, it, expect } from 'vitest';
import { requiredErrorMap } from './utils';

describe('validations/utils', () => {
	describe('requiredErrorMap', () => {
		const errorMap = requiredErrorMap('Required msg', 'Invalid msg');

		it('should return required message when input is undefined', () => {
			const result = errorMap({ input: undefined, code: 'any_code' } as any);
			expect(result).toBe('Required msg');
		});

		it('should return invalid message when code is invalid_type', () => {
			const result = errorMap({ input: 'foo', code: 'invalid_type' } as any);
			expect(result).toBe('Invalid msg');
		});

		it('should return invalid message when code is invalid_date', () => {
			const result = errorMap({ input: 'foo', code: 'invalid_date' } as any);
			expect(result).toBe('Invalid msg');
		});

		it('should return invalid message when code is invalid_enum_value', () => {
			const result = errorMap({ input: 'foo', code: 'invalid_enum_value' } as any);
			expect(result).toBe('Invalid msg');
		});

		it('should return undefined for other error codes', () => {
			const result = errorMap({ input: 'foo', code: 'too_small' } as any);
			expect(result).toBeUndefined();
		});
	});
});
