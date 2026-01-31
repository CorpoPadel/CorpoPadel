import { hasRole } from '../services/permission.service';
import { createGuard } from './utils';

/**
 * Server-side guard to enforce a specific role requirement for a route or action.
 * Automatically throws a redirect with an error toast if the requirement is not met.
 */
export async function roleGuard(requiredRole: string): Promise<boolean> {
	const guard = createGuard((userId) => hasRole(userId, requiredRole));
	return await guard();
}
