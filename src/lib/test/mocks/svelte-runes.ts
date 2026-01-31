import { vi } from 'vitest';

// Mock Svelte 5 runes
const $stateMock = ((initial: any) => initial) as any;
$stateMock.raw = (val: any) => val;
$stateMock.snapshot = (val: any) => val;

vi.stubGlobal('$state', $stateMock);
vi.stubGlobal('$derived', (fn: any) => (typeof fn === 'function' ? fn() : fn));
vi.stubGlobal('$effect', vi.fn());
vi.stubGlobal('$props', () => ({}));
