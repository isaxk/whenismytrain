import { PUBLIC_QUERY_SERVICES_KEY } from '$env/static/public';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { definitions } from '$lib/types/api';
import type { ServiceDetailsLocation } from '$lib/types/extentions';
import { Status } from '$lib/types';

export const GET: RequestHandler = async ({ params }) => {
	const { id, crs } = params;

	const response = await fetch(
		`https://api1.raildata.org.uk/1010-query-services-and-service-details1_0/LDBSVWS/api/20220120/GetServiceDetailsByRID/${id}`,
		{
			headers: {
				'x-apikey': PUBLIC_QUERY_SERVICES_KEY
			}
		}
	);

	const data: definitions['ServiceDetails'] = await response.json();

	if (data === null) {
		error(400, 'Could not fetch service');
	}

	function parse(locations: definitions['ServiceLocation'][], all: boolean) {
		let passedFocus = false;
		let currentLocation: number | null = null;
		const parsedLocations =
			locations?.map((l, i): ServiceDetailsLocation => {
				let order: 'previous' | 'focus' | 'subsequent' = 'previous';
				if (l.crs && l.crs === crs) {
					passedFocus = true;
					order = 'focus';
				} else if (passedFocus) {
					order = 'subsequent';
				}

				if (l.arrivalType === 'Actual' || l.departureType === 'Actual') {
					currentLocation = i;
				}

				let progress = 0;

				if (!all && l.departureType === 'Actual') {
					let passed = 0;
					let total = 0;
					const start = data.locations!.findIndex((x) => x.crs === l.crs);
					const end = data.locations!.findIndex((x) => x.crs === locations[i + 1].crs);
					const arr = data.locations!.slice(start, end + 1);
					if (arr.length === 2) {
						total = 2;
						passed = 1;
					} else {
						arr.forEach((i) => {
							if (i.arrivalType === 'Actual' || i.departureType === 'Actual') {
								passed++;
							}
							total++;
						});
					}
					progress = passed / total;
				}

				return {
					order,
					crs: l.crs ?? '',
					tiploc: l.tiploc ?? '',
					name: l.locationName ?? '',
					platform: l.platform ?? null,
					std: l.std,
					sta: l.sta,
					atd: l.atd,
					ata: l.ata,
					etd: l.etd,
					eta: l.eta,
					isPass: (l.isPass ?? false) || !l.crs,
					state: l.atdSpecified ? Status.DEPARTED : l.ataSpecified ? Status.ARRIVED : Status.AWAY,
					progress,
					isCancelled: l.isCancelled ?? false
				};
			}) ?? [];
		return { locations: parsedLocations, current: currentLocation };
	}

	if (!data.locations) {
		error(400, 'Request failed');
	}

	const { locations: all, current: currentAll } = parse(data.locations!, true);
	const { locations, current: currentLocation } = parse(
		data.locations!.filter((l) => !l.isPass && l.crs),
		false
	);

	const notCancelled = locations.filter((l) => !l.isCancelled);
	const destination = notCancelled[notCancelled.length - 1] ?? locations[locations.length - 1];
	const focus = locations.find((l) => l.crs === crs);

	return json({
		...data,
		serviceID: id,
		locations,
		all,
		currentLocation,
		currentAll,
		destination,
		focus
	});
};
