import { type definitions } from '$lib/types/api';
import dayjs from 'dayjs';
import type { PageServerLoad } from './$types';
import AllStationsJSON from 'uk-railway-stations';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const list = params.crs;
	const time = params.time ?? null;
	const type = params.type ?? null;

	const [from, to] = list.includes('-') ? list.split('-') : [list, null];
	console.log(from, to);

	const date = time ? dayjs().format('YYYY-MM-DD') + 'T' + time?.replace(':', '') : null;
	console.log(date);

	async function board() {
		const response = await fetch(
			type === 'dept'
				? `/api/dept/${from}/${to}/15/null/${date}`
				: `/api/arr/${from}/${to}/15/null/${date}`
		);
		const board: definitions['StationBoard'] = await response.json();

		const trainServices = new Map(
			board.trainServices?.map((t: definitions['ServiceItem']) => [t.rid, t]) ?? []
		);
		return { board, trainServices };
	}
	if (['dept', 'arr'].includes(type)) {
		if (
			AllStationsJSON.some((s) => s.crsCode === from) &&
			(to ? AllStationsJSON.some((s) => s.crsCode === to) : true)
		) {
			return { board: board(), date, time, type: type as 'dept' | 'arr', from, to };
		} else {
			error(404, `Could not find station for crs either code: '${from}' or '${to}'`);
		}
	} else {
		error(400, `Invalid board type: '${type}'`);
	}
};
