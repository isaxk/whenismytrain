import { PUBLIC_REFERENCE_DATA_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { uid, y, m, d, crs } = params;

	const response = await fetch(
		`https://api1.raildata.org.uk/1010-reference-data1_0/LDBSVWS/api/ref/20211101/GetStationList/1`,
		{
			headers: {
				'x-apikey': PUBLIC_REFERENCE_DATA_KEY
			}
		}
	);
	const data = await response.json();

	return json(data.StationList);
};
