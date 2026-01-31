export type Base64URLString = string;

/**
 * Encodes an object into a URL-safe Base64 string.
 * Used for maintaining UI state (like toasts or redirects) across page transitions.
 */
export function encodeState<T = any>(state: T): Base64URLString {
	try {
		const json = JSON.stringify(state);
		const base64 = btoa(json);
		// Replace characters to make it URL-safe
		return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
	} catch (error) {
		console.error('Failed to encode state:', error);
		return '';
	}
}

/**
 * Decodes a URL-safe Base64 string back into an object.
 */
export function decodeState<T = any>(stringifiedState: Base64URLString): T | null {
	try {
		const base64 = stringifiedState.replaceAll('-', '+').replaceAll('_', '/');
		const json = atob(base64);
		return JSON.parse(json);
	} catch (error) {
		console.error('Failed to decode state:', error);
		return null;
	}
}
