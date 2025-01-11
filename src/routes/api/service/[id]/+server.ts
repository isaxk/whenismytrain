import { PUBLIC_SERVICE_DETAILS_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	const response = await fetch(
		`https://api1.raildata.org.uk/1010-service-details1_2/LDBWS/api/20220120/GetServiceDetails/${id}`,
		{
			headers: {
				'x-apikey': PUBLIC_SERVICE_DETAILS_KEY
			}
		}
	);

	return json(await response.json());
};
