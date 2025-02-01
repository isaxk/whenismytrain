
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import dayjs from 'dayjs';
import type { definitions } from '$lib/types/api';

export const GET: RequestHandler = async ({ params }) => {
	const { from, to, toc, date, numRows } = params;

	const day = date !== 'null' ? dayjs(date) : dayjs();
	const dateF = day.format('YYYYMMDDTHHmmss');

	const url = `https://api1.raildata.org.uk/1010-live-departure-board---staff-version1_0/LDBSVWS/api/20220120/GetDepartureBoardByCRS/${from}/${dateF}?numRows=${numRows}${toc !== 'null' ? '&filterToc=' + toc : ''}${to !== 'null' ? '&filterCRS=' + to : ''}`;

	const response = await fetch(url, {
		headers: {
			'x-apikey': 'NBN9o15uI8cGHkxFNTMOtS4ebhdoaG62P362QRcjVABdBCLt'
		}
	});

	const data: definitions['StationBoard'] = await response.json();

	return json(data);
};
