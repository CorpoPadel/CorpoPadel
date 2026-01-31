import { describe, it, expect } from 'vitest';
import * as dbIndex from '../server/db/index';
import * as schema from '../server/db/schema';
import * as appSchema from '../server/db/app-schema';

describe('database boilerplate coverage', () => {
	it('should import database modules successfully', () => {
		expect(dbIndex).toBeDefined();
		expect(schema).toBeDefined();
		expect(appSchema).toBeDefined();
	});
});
