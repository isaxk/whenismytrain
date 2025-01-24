
import { type definitions } from '$lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const crs = params.crs;

	async function board() {
		const response = await fetch(`/api/dept/${crs}/15/null/null`);
		const board: definitions['StationBoard'] = await response.json();

		const trainServices = new Map(
			board.trainServices!.map((t: definitions['ServiceItem']) => [t.rid, t])
		);
		return { board, trainServices };
	}

	return { board: board() };
};
