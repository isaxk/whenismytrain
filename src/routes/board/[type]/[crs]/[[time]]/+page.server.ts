import { type definitions } from '$lib/types/api';
import dayjs from 'dayjs';
import type { PageServerLoad } from '../../../../dept/[crs]/[[time]]/$types';
import AllStationsJSON from 'uk-railway-stations';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const crs = params.crs;
	const time = params.time ?? null;
	const type = params.type ?? null;

	const date = time ? dayjs().format('YYYY-MM-DD') + 'T' + time?.replaceAll(':', '') : null;
	console.log(date);

	async function board() {
		const response = await fetch(
			type === 'dept' ? `/api/dept/${crs}/15/null/${date}` : `/api/arr/${crs}/15/null/${date}`
		);
		const board: definitions['StationBoard'] = await response.json();

		const trainServices = new Map(
			board.trainServices?.map((t: definitions['ServiceItem']) => [t.rid, t]) ?? []
		);
		return { board, trainServices };
	}

	if(AllStationsJSON.some(s => s.crsCode === crs)) {
		return { board: board(), date, type };
	}
	else {
		error(404,`Could not find station for crs code: ${crs}`)
	}

	
};
