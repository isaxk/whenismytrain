import type { PageServerLoad } from './$types';
import { type definitions } from '$lib/types/api';

export const ssr = false;

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id, crs } = params;

	const response = await fetch(`/api/service/${id}/${crs}`);
	const service = await response.json();
	const tiplocRes = await fetch(`/api/latlong/${service.all.map((s) => s.tiploc).join(',')}`);
	const tiplocs = await tiplocRes.json();

	return { ...service, crs, id, tiplocs };
};
