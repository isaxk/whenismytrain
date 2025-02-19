import type { PageServerLoad } from './$types';
import { type definitions } from '$lib/types/api';

export const ssr = false;

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id, crs } = params;

	const response = await fetch(`/api/service/${id}/${crs}`);
	const tiplocRes = await fetch(`https://json-993.pages.dev/tiploc.json`);
	const tiplocs = (await tiplocRes.json()).Tiplocs;
	const service = await response.json();

	return { ...service, crs, id, tiplocs };
};
