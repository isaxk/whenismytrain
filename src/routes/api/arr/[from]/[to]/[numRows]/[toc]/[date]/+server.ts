import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import dayjs from 'dayjs';
import type { definitions } from '$lib/types/api';
import { PUBLIC_ARRIVALS_KEY } from '$env/static/public';
import { parseBoard } from '$lib/data/parse-board';

export const GET: RequestHandler = async ({ params }) => {
	const { from, to, toc, date, numRows } = params;

	const day = date !== 'null' ? dayjs(date) : dayjs();
	const dateF = day.format('YYYYMMDDTHHmmss');

	const url = `https://api1.raildata.org.uk/1010-live-arrival-board---staff-version1_0/LDBSVWS/api/20220120/GetArrivalBoardByCRS/${from}/${dateF}?numRows=${numRows}${toc !== 'null' ? '&filterToc=' + toc : ''}${to !== 'null' ? '&filterCRS=' + to + '&filterType=from' : ''}`;
	const response = await fetch(url, {
		headers: {
			'x-apikey': PUBLIC_ARRIVALS_KEY
		}
	});

	const data = parseBoard(await response.json(), 'arr');

	return json(data);
};
