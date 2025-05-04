import { PUBLIC_RTT_PASSWORD, PUBLIC_RTT_USERNAME } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { uid, y, m, d, crs } = params;

	const response = await fetch(`https://api.rtt.io/api/v1/json/service/${uid}/${y}/${m}/${d}`, {
		headers: {
			Authorization: 'Basic ' + btoa(`${PUBLIC_RTT_USERNAME}:${PUBLIC_RTT_PASSWORD}`)
		}
	});
	const data = await response.json();

	const location = data.locations.find((location) => location.crs === crs);
	return json({ platform: location.platform, isConfirmed: location.platformConfirmed ?? false });
};
