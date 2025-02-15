import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import dayjs from 'dayjs';
import type { definitions } from '$lib/types/api';
import { PUBLIC_DEPARTURES_KEY } from '$env/static/public';
import { parseBoard } from '$lib/data/parse-board';
import type { Board } from '$lib/types';

export const GET: RequestHandler = async ({ params }) => {
	const { from, to, toc, date, numRows } = params;

	const day = date !== 'null' ? dayjs(date) : dayjs();
	const dateF = day.format('YYYYMMDDTHHmmss');

	const url = `https://api1.raildata.org.uk/1010-live-departure-board---staff-version1_0/LDBSVWS/api/20220120/GetDepartureBoardByCRS/${from}/${dateF}?numRows=${numRows}${toc !== 'null' ? '&filterToc=' + toc : ''}${to !== 'null' ? '&filterCRS=' + to : ''}`;

	const response = await fetch(url, {
		headers: {
			'x-apikey': PUBLIC_DEPARTURES_KEY
		}
	});

	const data: Board = parseBoard(await response.json(), 'dept');

	return json(data);
};
