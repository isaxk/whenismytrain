import { PUBLIC_RDM_API_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import dayjs from 'dayjs';
import type { definitions } from '$lib/types/api';

export const GET: RequestHandler = async ({ params }) => {
	const { crs, numRows, toc, date } = params;

	const day = date !== 'null' ? dayjs(date) : dayjs();
	const dateF = day.format('YYYYMMDDTHHmmss');
	console.log(toc);

	const url = `https://api1.raildata.org.uk/1010-live-departure-board---staff-version1_0/LDBSVWS/api/20220120/GetDepartureBoardByCRS/${crs}/${dateF}?numRows=20${toc !== 'null' ? '&filterToc=' + toc : ''}`;
	console.log(url);

	const response = await fetch(url, {
		headers: {
			'x-apikey': 'NBN9o15uI8cGHkxFNTMOtS4ebhdoaG62P362QRcjVABdBCLt'
		}
	});

	const data: definitions['StationBoard'] = await response.json();

	return json(data);
};
