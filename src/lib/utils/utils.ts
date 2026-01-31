import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Combines Tailwind CSS classes safely with merge logic.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
	return format(date, 'yyyy-MM-dd');
}

/**
 * Formats a Date into a human-readable long format (French locale).
 */
export function formatLongDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return format(d, 'd MMMM yyyy', { locale: fr });
}

/**
 * Formats a time string (HH:MM:SS or HH:MM) to HH:MM.
 */
export function formatTime(time: string): string {
	return time.slice(0, 5);
}

// Helper types for Svelte components props manipulation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
