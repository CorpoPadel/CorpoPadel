import { page } from '$app/state';
import type { RouteId } from '$app/types';
import { decodeState, type CommonRouteOptions } from '$lib/utils/routes';
import { watch } from 'runed';
import { singletonContext } from './_context.svelte';
import type { Player } from '$lib/models/player';
import { displayToast } from '$lib/utils/toast';

/**
 * Common data structure shared across the entire application context
 */
export interface IApplicationCommonData {
	user: import('better-auth').User | null;
	permissions: {
		roles: string[];
		privileges: string[];
	};
	player: Player | null;
}

/**
 * Main application state controller using Svelte 5 runes.
 * Handles reactive user data and URL-based state (like toasts after redirects).
 */
class ApplicationContextImpl<DataType extends IApplicationCommonData = IApplicationCommonData> {
	/** Reactive route options parsed from the URL state */
	public state = $state<CommonRouteOptions<RouteId>>({});
	declare protected _data: DataType;

	constructor(data: DataType) {
		this._data = $state(data);

		// Listen for 'state' search parameter changes to trigger UI side-effects (toasts, etc.)
		watch(
			() => page.url.searchParams.get('state'),
			(stateParam) => {
				if (!stateParam) return;

				const decoded = decodeState<CommonRouteOptions<RouteId>>(stateParam);
				if (!decoded) return;

				this.state = decoded;
				this.handleState(this.state);

				// Automatically clean up the URL unless specified otherwise
				if (!this.state.keepState) {
					this.clearStateFromHistory();
				}
			}
		);
	}

	/** Updates the internal global data */
	public update(data: DataType) {
		this._data = data;
	}

	/** Processes incoming state options, such as displaying a toast message */
	protected handleState(state: CommonRouteOptions<RouteId>) {
		if (state.toast) {
			displayToast(state.toast);
		}
	}

	/** Removes the 'state' parameter from browser history to keep URLs clean */
	private clearStateFromHistory() {
		if (typeof window === 'undefined') return;

		const url = new URL(window.location.href);
		url.searchParams.delete('state');

		window.history.replaceState(window.history.state, document.title, url.pathname + url.search);
	}

	/** Returns the current reactive application data */
	public get data(): DataType {
		return this._data;
	}
}

export const ApplicationContext = singletonContext(ApplicationContextImpl);
export type ApplicationContext<DataType extends IApplicationCommonData = IApplicationCommonData> =
	ApplicationContextImpl<DataType>;
