import { PUBLIC_QUERY_SERVICES_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	Order,
	Status,
	type CallingPoint,
	type ServiceLocation,
	type Train
} from '$lib/types/train';
import dayjs from 'dayjs';

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

	const tiplocResponse = await fetch('https://json-993.pages.dev/tiploc.json');
	const tiplocData = (await tiplocResponse.json()).Tiplocs;

	const filteredTiplocs = tiplocData
		.filter((t) => data.locations.some((l) => l.tiploc === t.Tiploc))
		.map((t) => ({
			tiploc: t.Tiploc,
			coords: [t.Latitude, t.Longitude]
		}));

	const focusIndex = data.locations.findIndex((l) => l.crs === crs);

	function parseLocation(location: any, i: number): ServiceLocation {
		let status = Status.AWAY;
		if (location.atdSpecified) status = Status.DEPARTED;
		else if (location.ataSpecified) status = Status.ARRIVED;
		else if (location.departureType === 'NoLog') status = Status.UNKNOWN;

		let divideTo = null;
		let divideFrom = null;

		if (
			location.associations?.length > 0 &&
			location.associations?.some((a) => a.category === 'divide')
		) {
			const ass = location.associations.find((a) => a.category === 'divide');
			if (ass.originCRS !== location.crs) {
				divideFrom = {
					id: ass.rid,
					destination: ass.destination,
					crs: ass.destCRS,
					origin: ass.origin
				};
			} else {
				divideTo = {
					id: ass.rid,
					destination: ass.destination,
					crs: ass.destCrs
				};
			}
		}

		return {
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
			coords: filteredTiplocs.find((t) => t.tiploc === location.tiploc)?.coords ?? null
		};
	}
	const locations: ServiceLocation[] = data.locations.map(parseLocation);

	function parseCallingPoint(location: ServiceLocation): CallingPoint {
		const start = locations.findIndex((l) => l.tiploc === location.tiploc);

		const end = locations.findIndex((l, i) => l.isCallingPoint && i > start);
		console.log(location.name, start, end);
		if (!end && end !== 0) {
			return {
				...location,
				progress: 0
			};
		} else if (location.status === Status.DEPARTED) {
			if (locations[end].status === Status.DEPARTED || locations[end].status === Status.ARRIVED) {
				return { ...location, progress: 1 };
			} else {
				const lastDeparted = locations.findLastIndex(
					(l, i) => l.status === Status.DEPARTED && i >= start && i < end
				);
				const next = locations[lastDeparted + 1];
				const lastDeptTime = dayjs(
					locations[lastDeparted].times.estimated.departure ?? location.times.scheduled.departure
				);
				const nextTime = dayjs(
					next.times.estimated.arrival ??
						next.times.estimated.departure ??
						next.times.scheduled.arrival ??
						next.times.scheduled.departure
				);

				console.log(lastDeptTime.format('HH:mm:ss'), nextTime.format('HH:mm:ss'));

				const diff = nextTime.diff(lastDeptTime, 'seconds');
				console.log(diff);
				const now = dayjs().diff(lastDeptTime, 'seconds');
				const timeProgress = Math.min(0.9, now / diff);

				console.log(
					`(${lastDeparted - start} + ${timeProgress}) / ${end - start}  = ${(lastDeparted - start + timeProgress) / (end - start)}`
				);
				return { ...location, progress: (lastDeparted - start + timeProgress) / (end - start) };
			}
		} else if (location.status === Status.ARRIVED) {
			return { ...location, progress: 0 };
		} else {
			return { ...location, progress: 0 };
		}
	}

	const callingPoints: CallingPoint[] = locations
		.filter((l) => l.isCallingPoint)
		.map(parseCallingPoint);
	const notCancelled = locations.filter((l) => !l.isCancelled);
	const destination =
		notCancelled.length > 0
			? {
					name: notCancelled[notCancelled.length - 1].name,
					crs: notCancelled[notCancelled.length - 1].crs
				}
			: {
					name: callingPoints[callingPoints.length - 1].name,
					crs: callingPoints[callingPoints.length - 1].crs
				};
	const focus = locations[focusIndex];
	const trainCard: Train = {
		id: data.id,
		platform: focus.platform,
		destination,
		estimated: focus.times.estimated.departure ?? focus.times.estimated.arrival ?? null,
		scheduled: focus.times.scheduled.departure ?? focus.times.scheduled.arrival ?? null,
		status: focus.status,
		operator: data.operatorCode,
		isCancelled: focus.isCancelled
	};

	return json({
		destination,
		generatedAt: data.generatedAt,
		focus,
		cancelReason: data.cancelReason?.Value ?? null,
		delayReason: data.delayReason?.Value ?? null,
		callingPoints,
		locations,
		trainCard
	});
};
