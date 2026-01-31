import { toast } from 'svelte-sonner';

/** Available toast notification severity levels */
export type ToastSeverity = 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';

export interface ToastOptions {
	/** Message to display */
	content: string;
	/** Visual severity level */
	severity?: ToastSeverity;
	/** Additional Svelte-Sonner options */
	[key: string]: any;
}

/**
 * Higher-level wrapper around svelte-sonner to allow severity-based dynamic calls.
 */
export function displayToast({ content, severity = 'default', ...rest }: ToastOptions) {
	if (severity !== 'default' && severity in toast) {
		return toast[severity](content, rest);
	}

	return toast(content, rest);
}
