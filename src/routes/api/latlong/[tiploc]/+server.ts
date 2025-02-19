import { PUBLIC_REFERENCE_DATA_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { definitions } from '$lib/types/api';

export const GET: RequestHandler = async ({ params }) => {
	const { tiploc } = params;

	const tiplocs = tiploc.split(',');

	const response = await fetch(`https://json-993.pages.dev/tiploc.json`);
	const allTiplocs = (await response.json()).Tiplocs;

	const filteredTiplocs = allTiplocs.filter((tiploc: any) => tiplocs.includes(tiploc.Tiploc));

	return json(filteredTiplocs);
};
