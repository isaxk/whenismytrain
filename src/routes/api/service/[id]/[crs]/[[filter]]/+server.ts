import dayjs from 'dayjs';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import type { CallingPoint, Location, ServiceDetails } from '$lib/types/train';
import { PUBLIC_QUERY_SERVICES_KEY } from '$env/static/public';
import { Position } from '$lib/types';
import type { TrainFilter } from '$lib/types/board';
import { Divide } from 'lucide-svelte';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

async function fetchReason(code: string) {
	const response = await fetch(
		`https://api1.raildata.org.uk/1010-reference-data1_0/LDBSVWS/api/ref/20211101/GetReasonCode/${code}`
	);
	const data = await response.json();
	return {
		delay: data.lateReason,
		cancel: data.cancelReason
	};
}

export const GET: RequestHandler = async ({ params }) => {
	const { id, crs, filter: filterMaybe } = params;

	const url = `https://api1.raildata.org.uk/1010-query-services-and-service-details1_0/LDBSVWS/api/20220120/GetServiceDetailsByRID/${id}`;

	const response = await fetch(url, {
		headers: {
			'x-apikey': PUBLIC_QUERY_SERVICES_KEY
		}
	});
	const tiplocResponse = await fetch('https://json-993.pages.dev/tiploc.json');
	const tiplocData = (await tiplocResponse.json()).Tiplocs;

	const data = await response.json();
	if (!data) return error(404, 'Service not found');
	let filteredTiplocs = tiplocData
		.filter((t) => data.locations.some((l) => l.tiploc === t.Tiploc))
		.map((t) => ({
			tiploc: t.Tiploc,
			coords: [t.Longitude, t.Latitude]
		}));

	async function parseLocation(l: any, i: number): Promise<Location> {
		let trainRelativePosition = Position.AWAY;

		if (l.isCancelled) {
			trainRelativePosition = Position.CANCELLED;
		} else if (l.atdSpecified) {
			trainRelativePosition = Position.DEPARTED;
		} else if (l.ataSpecified) {
			trainRelativePosition = Position.ARRIVED;
		}

		let division = null;
		let formedFrom = null;

		if (l.associations) {
			const split = l.associations.find((a) => a.category === 'divide' || a.category === 'join');
			if (
				split &&
				((split.category === 'divide' && split.originCRS === l.crs) || split.category === 'join')
			) {
				const url = `https://api1.raildata.org.uk/1010-query-services-and-service-details1_0/LDBSVWS/api/20220120/GetServiceDetailsByRID/${split.rid}`;
				const response = await fetch(url, {
					headers: {
						'x-apikey': PUBLIC_QUERY_SERVICES_KEY
					}
				});
				const data = await response.json();
				const newFilteredTiplocs = tiplocData
					.filter((t) => data.locations.some((l) => l.tiploc === t.Tiploc))
					.map((t) => ({
						tiploc: t.Tiploc,
						coords: [t.Longitude, t.Latitude]
					}));
				filteredTiplocs = filteredTiplocs.concat(newFilteredTiplocs);
				const splitLocations = await Promise.all(data.locations.map(parseLocation));

				const splitCallingPoints = splitLocations.filter((l) => l.isCallingPoint);
				division = {
					locations: splitLocations,
					callingPoints: splitCallingPoints
				};
			} else if (split) {
				formedFrom = {
					id: split.rid,
					origin: {
						crs: split.originCRS,
						name: split.origin
					},
					destination: {
						crs: split.destinationCRS,
						name: split.destination
					}
				};
			}
		}

		const now = dayjs();
		const next = data.locations[i + 1] ?? null;
		const currentDeparture = l.atd ?? l.etd ?? l.std ?? null;
		const nextTime =
			next?.ata ?? next?.eta ?? next?.sta ?? next?.atd ?? next?.etd ?? next?.std ?? next;
		let progress = 0;

		if (nextTime && currentDeparture) {
			const nextDayjs = dayjs.tz(nextTime, 'Europe/London').utc(false);
			const currentDayjs = dayjs.tz(currentDeparture, 'Europe/London').utc(false);
			const diff = nextDayjs.diff(currentDayjs, 'second');
			const elapsed = now.diff(currentDayjs, 'second');
			progress = Math.max(0, Math.min(0.95, elapsed / diff));
		}

		return {
			name: l.locationName.replace('(Elizabeth line)', ''),
			crs: l.crs ?? null,
			tiploc: l.tiploc ?? null,
			coordinates: filteredTiplocs.find((t) => t.tiploc === l.tiploc)?.coords ?? [0, 50],
			platform: l.platform ?? null,
			trainRelativePosition,
			times: {
				estimated: {
					arrival: l.ata ?? l.eta ?? null,
					departure: l.atd ?? l.etd ?? null
				},
				scheduled: {
					arrival: l.sta ?? null,
					departure: l.std ?? null
				}
			},
			isCancelled: l.isCancelled,
			isCallingPoint: l.crs && !l.isPass,
			division,
			formedFrom,
			progress
		};
	}

	let locations: Location[] = await Promise.all(data.locations.map(parseLocation));
	let callingPoints: CallingPoint[] = [];
	locations.forEach((l) => {
		if (l.isCallingPoint && l.crs) {
			callingPoints.push(l as CallingPoint);
		}
	});

	const filterCrs =
		filterMaybe != 'null' && filterMaybe
			? filterMaybe
			: callingPoints[callingPoints.length - 1].crs;

	// Looping services are the bane of my existence :/
	// Find the index of the focus station
	let focusIndex = callingPoints.findIndex((l) => l.crs === crs);
	// Find the soonest filter station
	let filterIndex = callingPoints.findIndex((l, i) => l.crs === filterCrs && i > focusIndex);

	if (filterIndex < 0) {
		const divisionIndex = callingPoints.findIndex((l) => l.division);
		const division = callingPoints[divisionIndex].division ?? null;
		if (division && division.callingPoints.find((l) => l.crs === filterCrs)) {
			const divisionLocIndex = locations.findIndex(
				(l) => l.crs === callingPoints[divisionIndex].crs
			);
			const toSwitchLocations = locations.slice(divisionLocIndex);
			const toSwitchCallingPoints = callingPoints.slice(divisionIndex);
			const divLocations = [...division.locations];
			const divCallingPoints = [...division.callingPoints];
			locations = locations.slice(0, divisionLocIndex).concat(divLocations);
			callingPoints = callingPoints.slice(0, divisionIndex).concat(divCallingPoints);

			// Create new division object instead of modifying existing
			const newDivision = {
				locations: toSwitchLocations,
				callingPoints: toSwitchCallingPoints
			};

			// Update locations with new division
			locations = locations.map((loc) => {
				if (loc.division === division) {
					return { ...loc, division: newDivision };
				}
				return loc;
			});

			callingPoints[divisionIndex] = { ...callingPoints[divisionIndex], division: newDivision };
			locations[divisionLocIndex] = { ...locations[divisionLocIndex], division: newDivision };

			filterIndex = callingPoints.findIndex((l) => l.crs === filterCrs);
		}
	}

	// Check if the focus station is called at again, closer to the filter station
	const lastFocusIndex = callingPoints.findLastIndex((l, i) => l.crs === crs && i < filterIndex);
	focusIndex = lastFocusIndex;

	const focusLoc = focusIndex !== -1 ? callingPoints[focusIndex] : null;
	const filterLoc = filterIndex !== -1 ? callingPoints[filterIndex] : null;
	if (!focusLoc) error(500, { message: 'Focus Station not found' });
	if (!filterLoc) error(500, { message: 'Filter station not found' });

	const duration = dayjs(
		filterLoc.times.estimated.arrival ?? filterLoc.times.scheduled.arrival
	).diff(
		dayjs(focusLoc.times.estimated.departure ?? focusLoc.times.scheduled.departure),
		'minutes'
	);
	const hours = Math.floor(duration / 60);
	const minutes = duration % 60;

	const filterDetails: TrainFilter = {
		crs: filterCrs,
		name: filterLoc.name,
		stops: filterIndex - focusIndex - 1,
		duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
		time: filterLoc.times.estimated.arrival ?? filterLoc.times.scheduled.arrival
	};

	const previous = callingPoints.slice(0, focusIndex);
	// focusLoc
	const subsequent = callingPoints.slice(focusIndex + 1, filterIndex);
	// filterLoc
	const further = callingPoints.slice(filterIndex + 1, -1);
	const destination = callingPoints[callingPoints.length - 1];

	const returnData: ServiceDetails = {
		uid: data.uid,
		sdd: data.sdd,
		locations,
		allCallingPoints: callingPoints,
		filterDetails,
		operator: data.operatorCode,
		grouped: {
			previous,
			focus: focusLoc,
			subsequent,
			filter: filterLoc,
			further,
			destination
		},
		genAt: new Date().toISOString()
	};

	return json(returnData);
};
