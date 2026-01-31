import { getContext, setContext } from 'svelte';

export function singletonContext<TBase extends new (...args: any[]) => {}>(Base: TBase) {
	const contextKey = Symbol();

	class SingletonContext extends Base {
		constructor(...args: any[]) {
			super(...args);
			setContext(contextKey, this);
		}

		static get<T>(this: new (...args: any[]) => T): T {
			const ctx = getContext<T>(contextKey);

			if (!ctx) {
				throw new Error(
					`Context ${this.name} not found in this tree. Make sure it is initialized in a parent component.`
				);
			}

			return ctx;
		}
	}

	return SingletonContext;
}
