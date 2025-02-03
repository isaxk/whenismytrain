import type { PageServerLoad } from './$types';
import { type definitions } from '$lib/types/api';
import type ServiceDetailsLocation from '$lib/types/extensions.ts';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id, crs } = params;

	const response = await fetch(`/api/service/${id}/${crs}`);
	const service = await response.json();

	return { ...service, crs, id };
};
