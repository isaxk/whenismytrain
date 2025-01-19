import type { PageLoad } from './$types';
import { type definitions } from '$lib/types/api';

export const load: PageLoad = async ({ params, fetch }) => {
	const crs = params.crs;
	const toc = params.toc ?? null;

	const response = await fetch(`/api/dept/${crs}/15/${toc}/null`);
	const board: definitions['StationBoard'] = await response.json();

	const trainServices = new Map(
		board.trainServices!.map((t: definitions['ServiceItem']) => [t.rid, t])
	);

	return {
		board,
		trainServices
	};
};
