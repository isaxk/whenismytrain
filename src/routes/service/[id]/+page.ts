import type { PageLoad } from './$types';
import { type definitions } from '$lib/types/api';

export const load: PageLoad = async ({ params, fetch }) => {
	const id = params.id;

	const response = await fetch(`/api/service/${id}`);
	const service: definitions['ServiceDetails'] = await response.json();

	return { ...service, serviceID: id };
};
