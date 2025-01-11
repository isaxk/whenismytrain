import { PUBLIC_RDM_API_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { crs, numRows, timeOffset } = params;

	const response = await fetch(
		`https://api1.raildata.org.uk/1010-live-departure-board-dep1_2/LDBWS/api/20220120/GetDepartureBoard/${crs}?numRows=${numRows}&timeOffset=${timeOffset}`,
		{
			headers: {
				'x-apikey': PUBLIC_RDM_API_KEY
			}
		}
	);

	return json(await response.json());
};
