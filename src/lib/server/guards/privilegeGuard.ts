import { hasPrivilege } from '../services/permission.service';
import { createGuard } from './utils';

export async function privilegeGuard(requiredPrivilege: string): Promise<boolean> {
	const guard = createGuard((userId) => hasPrivilege(userId, requiredPrivilege));
	return await guard();
}
