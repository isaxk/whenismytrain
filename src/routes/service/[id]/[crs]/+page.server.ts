import type { PageServerLoad } from './$types';
import { type definitions } from '$lib/types/api';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id, crs } = params;

	const response = await fetch(`/api/service/${id}/${crs}`);
	const service = await response.json();

	return { ...service, crs, id };
};
