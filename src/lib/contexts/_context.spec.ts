import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { singletonContext } from './_context.svelte';
import { setContext, getContext } from 'svelte';

vi.mock('svelte', () => ({
	setContext: vi.fn(),
	getContext: vi.fn()
}));

describe('contexts/_context', () => {
	class BaseClass {
		constructor(public value: number) {}
	}

	const SingletonClass = singletonContext(BaseClass);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should set context on initialization', () => {
		new SingletonClass(10);
		expect(setContext).toHaveBeenCalled();
	});

	it('should get context', () => {
		const instance = new BaseClass(5);
		vi.mocked(getContext).mockReturnValue(instance);

		const ctx = SingletonClass.get();
		expect(ctx).toBe(instance);
	});

	it('should throw if context not found', () => {
		vi.mocked(getContext).mockReturnValue(undefined);
		expect(() => SingletonClass.get()).toThrow('Context SingletonContext not found');
	});
});
