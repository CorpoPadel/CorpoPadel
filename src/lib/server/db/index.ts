import { drizzle } from 'drizzle-orm/libsql';
import dotenv from 'dotenv';
import * as authSchema from './schema';
import * as appSchema from './app-schema';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL!;
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

/** Combined schema for both authentication and application domain */
const schema = { ...authSchema, ...appSchema };

/**
 * Drizzle database client initialized with LibSQL (Turso)
 */
export const db = drizzle({
	connection: {
		url: DATABASE_URL,
		authToken: DATABASE_AUTH_TOKEN
	},
	schema
});
