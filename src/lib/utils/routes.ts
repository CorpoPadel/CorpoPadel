import { resolve } from '$app/paths';
import type { AppTypes, ResolvedPathname, RouteId } from '$app/types';
import { encodeState } from './state';

type DynamicRoutes = ReturnType<AppTypes['RouteParams']>;
export type ParameterfulRoutes = keyof DynamicRoutes;
export type ParameterlessRoutes = Exclude<RouteId, ParameterfulRoutes>;

/**
 * Options for generating a URL, including state parameters like redirects and toasts.
 */
export type CommonRouteOptions<T extends RouteId> = {
	redirectTo?: string;
	toast?: App.PageState['toast'];
	keepState?: boolean;
} & (T extends ParameterfulRoutes
	? {
			params: DynamicRoutes[T];
		}
	: { params?: never });

/**
 * Type-safe route helper to generate application URLs.
 * It automatically handles state encoding (Base64) for multi-page flow parameters like toasts.
 */
export function route<T extends RouteId>(
	routeName: T,
	options?: CommonRouteOptions<T>
): ResolvedPathname {
	let assembledRoute: string = routeName;

	const state: Record<string, any> = {};

	if (options?.keepState) state.keepState = options.keepState;
	if (options?.redirectTo) state.redirectTo = options.redirectTo;
	if (options?.toast) state.toast = options.toast;

	// Encode state into a single 'state' query parameter
	if (Object.keys(state).length > 0) {
		const encoded = encodeState(state);
		if (encoded) {
			assembledRoute += `?state=${encoded}`;
		}
	}

	if (options?.params === undefined) {
		// @ts-expect-error SvelteKit dynamic routes resolution
		return resolve(assembledRoute as ParameterlessRoutes);
	} else {
		// @ts-expect-error SvelteKit dynamic routes resolution
		return resolve(assembledRoute as ParameterfulRoutes, options.params);
	}
}

export { decodeState, encodeState } from './state';
