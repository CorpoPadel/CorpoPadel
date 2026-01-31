import { describe, it, expect } from 'vitest';
import { displayToast } from './toast';
import { toast } from 'svelte-sonner';

describe('utils/toast', () => {
	it('should call default toast when no severity provided', () => {
		displayToast({ content: 'Hello' });
		expect(toast).toHaveBeenCalledWith('Hello', {});
	});

	it('should call specific toast method for valid severity', () => {
		displayToast({ content: 'Success!', severity: 'success' });
		expect(toast.success).toHaveBeenCalledWith('Success!', {});
	});

	it('should pass additional options', () => {
		displayToast({ content: 'Info', severity: 'info', duration: 3000 });
		expect(toast.info).toHaveBeenCalledWith('Info', { duration: 3000 });
	});

	it('should fallback to default for unknown severity or default', () => {
		displayToast({ content: 'Default', severity: 'default' });
		expect(toast).toHaveBeenCalledWith('Default', {});
	});
});
