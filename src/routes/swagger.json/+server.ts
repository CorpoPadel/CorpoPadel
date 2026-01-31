import { json } from '@sveltejs/kit';
import { swaggerSpec } from '$lib/server/swagger';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json(swaggerSpec);
};
