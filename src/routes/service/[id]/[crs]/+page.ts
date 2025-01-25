import type { PageLoad } from '../$types';
import { type definitions } from '$lib/types/api';
import type ServiceDetailsLocation from '$lib/types/extensions';

export const load: PageLoad = async ({ params, fetch }) => {
	const { id, crs } = params;

	const response = await fetch(`/api/service/${id}`);
	const service: definitions['ServiceDetails'] = await response.json();

	let passedFocus = false;
	let lastToBePast: number | null = null;

	console.log(service)

	service.locations = service.locations?.filter((l) => !l.isPass && l.crs) ?? [];
	const locations: ServiceDetailsLocation[] = service.locations.map((l, i) => {
		let order = 'previous';
		if (l.crs && l.crs === crs) {
			passedFocus = true;
			order = 'focus';
		} else if (passedFocus) {
			order = 'subsequent';
		}

		if (l.departureType === 'Actual') {
			lastToBePast = i;
		}

		return {
			order,
			crs: l.crs,
			name: l.locationName,
			platform: l.platform,
			st: l.std ?? l.sta,
			at: l.atd ?? l.ata,
			et: l.etd ?? l.eta,
			isCancelled: l.isCancelled
		};
	});

	const notCancelled = locations.filter((l) => !l.isCancelled);
	const destination = notCancelled[notCancelled.length - 1] ?? locations[locations.length-1];
	const focus = locations.find((l) => l.crs === crs);

	return { ...service, serviceID: id, locations, lastToBePast, destination, focus };
};
