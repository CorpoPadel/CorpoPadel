import { describe, it, expect } from 'vitest';
import { encodeState, decodeState } from './state';

describe('utils/state', () => {
	const testObj = { foo: 'bar', num: 123 };

	describe('encodeState', () => {
		it('should encode object to base64url string', () => {
			const encoded = encodeState(testObj);
			expect(encoded).toBeTypeOf('string');
			expect(encoded).not.toContain('+');
			expect(encoded).not.toContain('/');
			expect(encoded).not.toContain('=');
		});

		it('should return empty string on error (e.g. circular)', () => {
			const circular: any = {};
			circular.self = circular;
			const encoded = encodeState(circular);
			expect(encoded).toBe('');
		});
	});

	describe('decodeState', () => {
		it('should decode valid string back to object', () => {
			const encoded = encodeState(testObj);
			const decoded = decodeState(encoded);
			expect(decoded).toEqual(testObj);
		});

		it('should return null for invalid base64', () => {
			expect(decodeState('invalid-base64')).toBeNull();
		});
	});
});
