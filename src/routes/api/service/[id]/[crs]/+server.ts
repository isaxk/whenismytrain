import { PUBLIC_QUERY_SERVICES_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	Order,
	Status,
	type CallingPoint,
	type ServiceDetails,
	type ServiceLocation,
	type Train
} from '$lib/types/train';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const GET: RequestHandler = async ({ params, url }) => {
	const { id, crs } = params;

	const reqUrl = new URL(
		`https://api1.raildata.org.uk/1010-query-services-and-service-details1_0/LDBSVWS/api/20220120/GetServiceDetailsByRID/${id}`
	);

	const response = await fetch(reqUrl, {
		headers: {
			'x-apikey': PUBLIC_QUERY_SERVICES_KEY
		}
	});
	const data = await response.json();

	// Fetch a list of all tiplocs and their coordinates
	const tiplocResponse = await fetch('https://json-993.pages.dev/tiploc.json');
	const tiplocData = (await tiplocResponse.json()).Tiplocs;

	// Abstract for only tiplocs on this service
	const filteredTiplocs = tiplocData
		.filter((t) => data.locations.some((l) => l.tiploc === t.Tiploc))
		.map((t) => ({
			tiploc: t.Tiploc,
			coords: [t.Latitude, t.Longitude]
		}));

	// Find the index of the focused station
	const focusIndex = data.locations.findIndex((l) => l.crs === crs);

	function parseLocation(location: any, i: number): ServiceLocation {
		// Determine train position relative to location
		let status = Status.AWAY;
		if (location.atdSpecified) status = Status.DEPARTED;
		else if (location.ataSpecified) status = Status.ARRIVED;
		else if (location.departureType === 'NoLog') status = Status.UNKNOWN;

		// Determine train division
		let divideTo = null;
		let divideFrom = null;

		if (
			location.associations?.length > 0 &&
			location.associations?.some((a) => a.category === 'divide')
		) {
			const ass = location.associations.find((a) => a.category === 'divide');
			if (ass.originCRS !== location.crs) {
				// If the origin of the association is not the current location, we can assume the current service has divided from another service
				// The current service is a dependent service
				divideFrom = {
					id: ass.rid,
					destination: ass.destination,
					crs: ass.destCRS,
					origin: ass.origin
				};
			} else {
				// Otherwise, we can assume the current service is the primary service.
				// The train divides from this service at the current location
				divideTo = {
					id: ass.rid,
					destination: ass.destination,
					crs: ass.destCrs
				};
			}
		}

		const next = data.locations[i + 1];
		const lastDeptTime = dayjs.tz(
			location.ata ?? location.atd ?? location.atd ?? location.etd ?? location.sta ?? location.std,
			'Europe/London'
		);

		const nextTime = dayjs.tz(
			next ? (next.ata ?? next.atd ?? next.atd ?? next.etd ?? next.sta ?? next.std) : undefined,
			'Europe/London'
		);

		// Calculate the progress of the train between the two timing point locations
		const diff = nextTime.diff(lastDeptTime, 'seconds');
		const time = dayjs();
		const now = dayjs().diff(lastDeptTime, 'seconds');
		const timeProgress = now / diff;

		return {
			time,
			lastDeptTime,
			nextTime,
			now,
			diff,
			isCallingPoint: !location.isPass && location.crs,
			order: focusIndex === i ? Order.FOCUS : focusIndex < i ? Order.SUBSEQUENT : Order.PREVIOUS,
			platform: location.platform ?? null,
			name: location.locationName,
			crs: location.crs,
			tiploc: location.tiploc,
			status,
			isCancelled: location.isCancelled ?? false,
			times: {
				estimated: {
					arrival: location.ata ?? location.eta ?? null,
					departure: location.atd ?? location.etd ?? null
				},
				scheduled: {
					arrival: location.sta ?? null,
					departure: location.std ?? null
				}
			},
			divideFrom,
			divideTo,
			coords: filteredTiplocs.find((t) => t.tiploc === location.tiploc)?.coords ?? null,
			progress: timeProgress
		};
	}

	// Parse Locations
	const locations: ServiceLocation[] = data.locations.map(parseLocation);

	function parseCallingPoint(location: ServiceLocation): CallingPoint {
		// Find the index of the current / most recent, as a timing point location
		const start = locations.findIndex((l) => l.tiploc === location.tiploc);
		// Find the next calling point as a timing point location
		const end = locations.findIndex((l, i) => l.isCallingPoint && i > start);

		if (!end && end !== 0) {
			// Last calling point (train terminates, no next calling point)
			return {
				...location,
				progress: 0
			};
		} else if (location.status === Status.DEPARTED) {
			if (locations[end].status === Status.DEPARTED || locations[end].status === Status.ARRIVED) {
				// Train has already left/arrived the station
				return { ...location, progress: 1 };
			} else {
				// Calculate the last Timing Point the train has departed
				const lastDeparted = locations.findLastIndex(
					(l, i) => l.status === Status.DEPARTED && i >= start && i < end
				);

				// Calculate the progress between the two calling points, including the progress between timing points
				const tiplocProgress =
					(lastDeparted - start + locations[lastDeparted].progress) / (end - start);

				return { ...location, progress: tiplocProgress };
			}
		} else if (location.status === Status.ARRIVED) {
			return { ...location, progress: 0 };
		} else {
			return { ...location, progress: 0 };
		}
	}

	// Parse the calling Points
	let callingPoints: CallingPoint[] = locations
		.filter((l) => l.isCallingPoint)
		.map(parseCallingPoint);

	const notCancelled = locations.filter((l) => !l.isCancelled);
	const cancelled = callingPoints.filter((l) => l.isCancelled);
	const focus = locations[focusIndex];

	const destination =
		notCancelled.length > 0 && notCancelled[notCancelled.length - 1].crs !== focus.crs
			? // If the service has an alteration and the new destination is not the same as the focus
				{
					name: notCancelled[notCancelled.length - 1].name,
					crs: notCancelled[notCancelled.length - 1].crs
				}
			: // If the service runs as normal
				{
					name: callingPoints[callingPoints.length - 1].name,
					crs: callingPoints[callingPoints.length - 1].crs
				};

	// Find out the old destination before the alteration
	let oldDestination: { name: string; crs: string } | null =
		cancelled.length > 0
			? {
					name: cancelled[cancelled.length - 1].name,
					crs: cancelled[cancelled.length - 1].crs
				}
			: null;

	// If the new and old destinations are the same
	// or if the old destination is before the new destination
	// (the service is either not cancelled or the destination is the same)
	if (
		oldDestination?.crs === destination.crs ||
		locations.findIndex((l) => l.crs === oldDestination?.crs) <
			locations.findIndex((l) => l.crs === destination?.crs)
	)
		oldDestination = null;

	const trainCard: Train = {
		id: data.id,
		platform: focus.platform,
		destination,
		oldDestination,
		estimated: focus.times.estimated.departure ?? focus.times.estimated.arrival ?? null,
		scheduled: focus.times.scheduled.departure ?? focus.times.scheduled.arrival ?? null,
		times: focus.times,
		status: focus.status,
		operator: data.operatorCode,
		isCancelled: focus.isCancelled
	};

	// Fix data issues where trains appear to have "teleported"
	// (the train has arrived at the station but never departed, but also appears later down the route)
	const active = callingPoints.findLastIndex(
		(c) => c.status === Status.ARRIVED || c.status === Status.DEPARTED
	);

	callingPoints = callingPoints.map((c, i) => {
		if (c.status === Status.ARRIVED) {
			if (i === active) {
				return c;
			} else {
				return { ...c, status: Status.DEPARTED, progress: 1 };
			}
		} else {
			return c;
		}
	});

	const returnData: ServiceDetails = {
		destination,
		generatedAt: data.generatedAt,
		focus,
		cancelReason: data.cancelReason?.Value ?? null,
		delayReason: data.delayReason?.Value ?? null,
		callingPoints,
		locations,
		trainCard
	};

	return json(returnData);
};
