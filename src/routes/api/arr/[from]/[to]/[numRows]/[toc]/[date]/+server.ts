import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import dayjs from 'dayjs';
import type { definitions } from '$lib/types/api';

export const GET: RequestHandler = async ({ params }) => {
	const { from, to, toc, date, numRows } = params;

	const day = date !== 'null' ? dayjs(date) : dayjs();
	const dateF = day.format('YYYYMMDDTHHmmss');

	const url = `https://api1.raildata.org.uk/1010-live-arrival-board---staff-version1_0/LDBSVWS/api/20220120/GetArrivalBoardByCRS/${from}/${dateF}?numRows=${numRows}${toc !== 'null' ? '&filterToc=' + toc : ''}${to !== 'null' ? '&filterCRS=' + to + '&filterType=from' : ''}`;
	const response = await fetch(url, {
		headers: {
			'x-apikey': 'T2dr5A7ABavuA5rpyoUemleRwRW8sOMRS5dAPE3xyGwbGddw'
		}
	});

	const data: definitions['StationBoard'] = await response.json();

	return json(data);
};
