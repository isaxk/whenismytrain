import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { RTTLocation, RTTServiceResponse } from '$lib/types/rtt';

const { RTT_USERNAME, RTT_PASSWORD } = env;

export const GET: RequestHandler = async ({ params }) => {
    const { uid, y, m, d, crs } = params;

    const response = await fetch(`https://api.rtt.io/api/v1/json/service/${uid}/${y}/${m}/${d}`, {
        headers: {
            Authorization: 'Basic ' + btoa(`${RTT_USERNAME}:${RTT_PASSWORD}`)
        }
    });
    const data = await response.json() as RTTServiceResponse;

    const location = data.locations.find((location: RTTLocation) => location.crs === crs);
    if (!location) {
        return json({ platform: null, isConfirmed: false });
    }
    return json({ platform: location.platform, isConfirmed: location.platformConfirmed ?? false });
};
