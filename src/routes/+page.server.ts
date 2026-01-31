import { accountService } from '$lib/server/services/account.service';

/**
 * Root page loader to provide global statistics.
 */
export const load = async () => {
	const totalAccounts = await accountService.countAccounts();

	return {
		totalAccounts
	};
};
