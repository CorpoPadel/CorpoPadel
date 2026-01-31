import { Config, defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

const { DATABASE_URL, DATABASE_AUTH_TOKEN } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const isTurso = !DATABASE_URL.startsWith('file:');

export default defineConfig({
	schema: ['./src/lib/server/db/schema.ts', './src/lib/server/db/app-schema.ts'],
	out: './drizzle',

	dialect: isTurso ? 'turso' : 'sqlite',

	dbCredentials: {
		url: DATABASE_URL,
		authToken: isTurso ? DATABASE_AUTH_TOKEN : undefined
	}
} satisfies Config);
