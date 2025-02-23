import { type definitions } from '$lib/types/api';
import dayjs from 'dayjs';
import type { PageServerLoad } from './$types';
import AllStationsJSON from 'uk-railway-stations';
import { error } from '@sveltejs/kit';
import type { Board, TrainService } from '$lib/types';

export const ssr = false;

export const load: PageServerLoad = async ({ params, fetch, url }) => {
	const list = params.crs;
	const time = params.time ?? null;
	const type = params.type ?? null;
	const toc = url.searchParams.get('toc') ?? null;

	const [from, to] = list.includes('-') ? list.split('-') : [list, null];
	console.log(from, to);

	const date = time ? dayjs().format('YYYY-MM-DD') + 'T' + time?.replace(':', '') : null;
	console.log(date);

	async function board() {
		const response = await fetch(
			type === 'dept'
				? `/api/dept/${from}/${to}/15/${toc}/${date}`
				: `/api/arr/${from}/${to}/15/${toc}/${date}`
		);
		const board: Board = await response.json();

		const operators = new Set<string>();

		board.trains.forEach((t) => {
			if (!operators.has(t.operator!)) {
				operators.add(t.operator!);
			}
		});

		const trains = new Map<string, TrainService>(board.trains.map((t) => [t.id, t]) ?? []);
		return { board, trains, operators: Array.from(operators) };
	}
	if (['dept', 'arr'].includes(type)) {
		if (
			AllStationsJSON.some((s) => s.crsCode === from) &&
			(to ? AllStationsJSON.some((s) => s.crsCode === to) : true)
		) {
			return { board: board(), date, time, type: type as 'dept' | 'arr', from, to, toc };
		} else {
			error(404, `Could not find station for crs either code: '${from}' or '${to}'`);
		}
	} else {
		error(400, `Invalid board type: '${type}'`);
	}
};
