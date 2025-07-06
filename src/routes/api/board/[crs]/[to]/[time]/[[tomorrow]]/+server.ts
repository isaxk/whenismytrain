import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { paramUrl } from '$lib/utils/url';
import dayjs from 'dayjs';
import { env } from '$env/dynamic/private';
import { NoticeSeverity, type BoardItem, type Details, type TrainFilter } from '$lib/types/board';
import { Position } from '$lib/types';
import { operatorList } from '$lib/data/operators';
import type { StationBoard, ServiceItemWithLocations } from '$lib/types/ldbsvws';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { terminalGroups } from '$lib/data/terminal-groups';
import { destination } from '@turf/turf';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEPARTURES_KEY = env.DEPARTURES_KEY;

const londonTerminals = [
	'PAD',
	'LST',
	'KGX',
	'STP',
	'WAT',
	'EUS',
	'LDB',
	'BFR',
	'VIC',
	'FST',
	'CST',
	'CHX',
	'MYB',
	'MOG'
];

async function getBoard(
	crs: string,
	date: string,
	to: string,
	time: string,
	tomorrow: boolean | string,
	groupOrigin: string | null,
	groupDestination: string | null
) {
	console.log(crs, to);
	const reqUrl = paramUrl(
		`https://api1.raildata.org.uk/1010-live-departure-board---staff-version1_0/LDBSVWS/api/20220120/GetDepBoardWithDetails/${crs}/${date}`,
		{
			filterCrs: to,
			timeWindow: '480'
		}
	);

	const offset = dayjs(date).diff(dayjs(), 'minutes');

	let busServices = [];

	const busUrl = paramUrl(
		`https://huxley2.azurewebsites.net/staffdepartures/${crs}/${to != 'null' ? 'to/' + to : ''}`,
		{
			timeOffset: offset.toString(),
			timeWindow: '120'
		}
	);

	const response = await fetch(reqUrl.toString(), {
		headers: {
			'x-apikey': DEPARTURES_KEY
		}
	});

	console.log(busUrl.toString());

	// if (!(groupOrigin && groupDestination)) {
	const busResponse = await fetch(busUrl.toString());
	busServices = (await busResponse.json()).busServices ?? [];
	console.log(busServices);
	// }

	const data = (await response.json()) as StationBoard;

	function parseService(item: ServiceItemWithLocations, i: number): BoardItem {
		let position = Position.AWAY;
		let filter: TrainFilter | null = null;

		let filterCrs = to;
		let filterLocationName = data.filterLocationName;

		if (filterCrs === null || filterCrs === undefined || filterCrs === 'null') {
			filterCrs = item.destination[0].crs;
			filterLocationName = item.destination[0].locationName;
		}

		if (item.isCancelled) {
			position = Position.CANCELLED;
		} else if (item.atdSpecified) {
			position = Position.DEPARTED;
		} else if (item.ataSpecified) {
			position = Position.ARRIVED;
		} else if (item.origin[0].crs === crs) {
			position = Position.STARTS_HERE;
		}

		const callingPoints = (item.subsequentLocations ?? []).filter((p) => p.crs && !p.isPass);
		const filterIndex = callingPoints.findIndex((p) => p.crs === filterCrs);
		const filterLocation = filterIndex !== -1 ? callingPoints[filterIndex] : null;

		if (filterLocation && filterLocationName) {
			const durations = dayjs(filterLocation.ata ?? filterLocation.eta ?? filterLocation.sta).diff(
				item.atd ?? item.etd ?? item.std,
				'minute'
			);
			const hours = Math.floor(durations / 60);
			const minutes = durations % 60;
			filter = {
				crs: filterCrs,
				name: filterLocationName,
				stops: filterIndex,
				time: filterLocation.ata ?? filterLocation.eta ?? filterLocation.sta ?? '?',
				duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
			};
		}

		if (
			item.operatorCode === 'SE' &&
			(item.origin[0]?.crs === 'STP' || item.destination[0]?.crs === 'STP')
		) {
			item.operatorCode = 'SEH';
		}

		const originGroup = groupOrigin ? terminalGroups.find((t) => t.crs == groupOrigin) : null;
		const destGroup = groupDestination
			? terminalGroups.find((t) => t.crs == groupDestination)
			: null;

		let originsList = originGroup
			? [
					{ crs: crs, atdSpecified: item.atdSpecified ?? false },
					...(item.subsequentLocations ?? []).filter((l, i) => i < filterIndex && !l.atdSpecified)
				]
					?.filter((p, i) => originGroup?.stations?.some((s) => s == p.crs))
					.map((l) => l.crs ?? '')
			: null;

		if (originsList && originsList.length < 1) {
			originsList = [
				{ crs: crs, atdSpecified: item.atdSpecified ?? false },
				...(item.subsequentLocations ?? []).filter((l, i) => i < filterIndex)
			]
				?.filter((p, i) => originGroup?.stations?.some((s) => s == p.crs))
				.map((l) => l.crs ?? '');
		}

		return {
			id: item.rid,
			uid: item.uid,
			sdd: item.sdd,
			type: 'train',
			destination: {
				name: item.destination.map((d: any) => d.locationName).join(', '),
				crs: item.destination.map((d: any) => d.crs)
			},
			origin: {
				name: item.origin.map((d: any) => d.locationName).join(', '),
				crs: item.origin.map((d: any) => d.crs)
			},
			platform: item.platform ?? null,
			operator: item.operatorCode,
			operatorColor: operatorList[item.operatorCode].bg,
			operatorName: operatorList[item.operatorCode].name,
			operatorText: operatorList[item.operatorCode].text,
			filter,
			times: {
				estimated: {
					arrival: item.ata ?? item.eta ?? null,
					departure: item.atd ?? item.etd ?? null
				},
				scheduled: {
					arrival: item.sta ?? null,
					departure: item.std ?? null
				}
			},
			isCancelled: item.isCancelled ?? false,
			isCancelledAtFilter:
				item.subsequentLocations?.find((l) => l.crs === to)?.isCancelled ?? false,
			relativeTimes: {
				arrival: item.ata || item.eta ? dayjs(item.ata ?? item.eta).diff(dayjs(), 'minute') : null,
				departure: item.atd || item.etd ? dayjs(item.atd ?? item.etd).diff(dayjs(), 'minute') : null
			},
			position,
			terminal:
				originGroup || destGroup
					? {
							origin: originsList,
							destination: [...(item.subsequentLocations ?? [])]
								?.filter((p, i) => destGroup?.stations?.some((s) => s == p.crs))
								.map((l) => l.crs ?? '')
						}
					: null
		};
	}

	function parseBus(item: any): BoardItem {
		if (item.sta === '0001-01-01T00:00:00') {
			item.sta = null;
		}
		if (item.eta === '0001-01-01T00:00:00') {
			item.eta = null;
		}
		if (item.ata === '0001-01-01T00:00:00') {
			item.ata = null;
		}
		if (item.std === '0001-01-01T00:00:00') {
			item.std = null;
		}
		if (item.etd === '0001-01-01T00:00:00') {
			item.etd = null;
		}
		if (item.atd === '0001-01-01T00:00:00') {
			item.atd = null;
		}

		return {
			id: item.rid,
			type: 'bus',
			uid: item.uid,
			sdd: item.sdd,
			filter: null,
			operator: item.operator,
			operatorColor: operatorList[item.operatorCode].bg,
			operatorName: operatorList[item.operatorCode].name,
			operatorText: operatorList[item.operatorCode].text,
			platform: item.platform,
			destination: {
				name: item.destination.map((d: any) => d.locationName).join(', '),
				crs: item.destination.map((d: any) => d.crs)
			},
			origin: {
				name: item.origin.map((d: any) => d.locationName).join(', '),
				crs: item.origin.map((d: any) => d.crs)
			},
			times: {
				estimated: {
					arrival: item.ata ?? item.eta ?? null,
					departure: item.atd ?? item.etd ?? null
				},
				scheduled: {
					arrival: item.sta ?? null,
					departure: item.std ?? null
				}
			},
			isCancelled: item.isCancelled ?? false,
			isCancelledAtFilter:
				item.subsequentLocations?.find((l) => l.crs === to)?.isCancelled ?? false,
			relativeTimes: {
				arrival: null,
				departure: null
			},
			position: Position.UNKNOWN,
			terminal: null
		};
	}
	let trains = (data.trainServices ?? []).map(parseService);
	const buses = (busServices ?? []).map(parseBus);
	console.log(buses);

	const notices =
		data.nrccMessages?.map((m) => {
			return {
				severity: NoticeSeverity[m.severity ?? 'Normal'],
				html: m.xhtmlMessage
			};
		}) ?? [];

	notices.sort((a, b) => b.severity - a.severity);

	const details: Details = {
		name: data.locationName,
		notices,
		crs: crs,
		time: time && time != 'null' ? time.substring(0, 2) + ':' + time.substring(2, 4) : null,
		filterName: data.filterLocationName ?? null,
		filterCrs: to != null && to != 'null' ? to : null,
		manager: data.stationManager ?? 'NR',
		tomorrow: tomorrow == 'true' ? true : false
	};

	trains = trains.filter((t) => t.operator !== 'LT');

	const all = trains
		.concat(buses)
		.toSorted((a, b) =>
			dayjs(a.times.scheduled.departure ?? undefined).diff(
				dayjs(b.times.scheduled.departure ?? undefined),
				'minutes'
			)
		);

	return { trains: all, details };
}

export const GET: RequestHandler = async ({ params }) => {
	const { crs, to, time, tomorrow } = params;

	const date = (
		time != 'null'
			? dayjs()
					.tz('Europe/London')
					.set('hour', parseInt(time.substring(0, 2)))
					.set('minute', parseInt(time.substring(2, 4)))
					.add(tomorrow == 'true' ? 1 : 0, 'day')
			: dayjs().tz('Europe/London')
	).format('YYYYMMDDTHHmmss');

	let details: Details | null = null;
	let trains: BoardItem[];

	if (terminalGroups.some((g) => g.crs === to || g.crs === crs)) {
		const iterator: { origin: string; destination: string }[] = [];
		if (terminalGroups.some((g) => g.crs === to) && terminalGroups.some((g) => g.crs === crs)) {
			const origin = terminalGroups.find((g) => g.crs === crs);
			const destination = terminalGroups.find((g) => g.crs === to);
			origin?.stations.forEach((o) => {
				destination?.stations.forEach((d) => {
					iterator.push({ origin: o, destination: d });
				});
			});
		} else if (terminalGroups.some((g) => g.crs === to)) {
			const destination = terminalGroups.find((g) => g.crs === to);
			destination?.stations.forEach((d) => {
				iterator.push({ origin: crs, destination: d });
			});
		} else if (terminalGroups.some((g) => g.crs === crs)) {
			const origin = terminalGroups.find((g) => g.crs === crs);
			origin?.stations.forEach((o) => {
				iterator.push({ origin: o, destination: to });
			});
		}

		const trainsMap = new Map<string, BoardItem>();
		let detailsTemp: Details | null = null;
		const fns = iterator.map(({ origin, destination }) =>
			getBoard(
				origin,
				date,
				destination,
				time,
				tomorrow ?? false,
				terminalGroups.some((g) => g.crs == crs) ? crs : null,
				terminalGroups.some((g) => g.crs == to) ? to : null
			).then(async (r) => {
				(r.trains ?? []).forEach((train: BoardItem) => {
					const existing = trainsMap.get(train.id);
					if (!existing) {
						trainsMap.set(train.id, train);
					} else {
						let longestOriginTerminals: string[] | null =
							train.terminal?.origin ?? existing.terminal?.origin ?? null;
						let longestDestinationTerminals: string[] | null =
							train.terminal?.destination ?? existing.terminal?.destination ?? null;

						if (
							train.terminal &&
							train.terminal.origin &&
							existing.terminal &&
							existing.terminal.origin
						) {
							longestOriginTerminals =
								train.terminal.origin.length > existing.terminal.origin.length
									? train.terminal.origin
									: existing.terminal.origin;
						}
						if (
							train.terminal &&
							train.terminal.destination &&
							existing.terminal &&
							existing.terminal.destination
						) {
							longestDestinationTerminals =
								train.terminal.destination.length > existing.terminal.destination.length
									? train.terminal.destination
									: existing.terminal.destination;
						}
						trainsMap.set(train.id, {
							...(dayjs(train.times.scheduled.departure ?? undefined).isBefore(
								dayjs(existing.times.scheduled.departure ?? undefined)
							)
								? train
								: existing),
							terminal: {
								origin: longestOriginTerminals,
								destination: longestDestinationTerminals
							}
						});
					}
				});
				detailsTemp = r.details as Details;
			})
		);
		await Promise.all(fns);
		detailsTemp = detailsTemp as Details | null;
		if (detailsTemp) {
			details = {
				...(detailsTemp as Details),
				name: terminalGroups.find((g) => g.crs === crs)?.name ?? detailsTemp.name,
				crs: crs,
				filterName: terminalGroups.find((g) => g.crs === to)?.name ?? detailsTemp.filterName,
				filterCrs: to,
				notices: []
			};
		}
		trains = Array.from(trainsMap.values())
			.toSorted((a, b) =>
				dayjs(a.times.scheduled.departure).diff(b.times.scheduled.departure, 'second')
			)
			.slice(0, 15);
	} else {
		const r = await getBoard(crs, date, to, time, tomorrow ?? false, null, null);
		details = r.details;
		trains = r.trains;
	}

	if (!details) {
		error(500, 'An error occurred');
	}

	return json({
		details,
		trains: trains
			.filter((l) => l.position === Position.DEPARTED)
			.concat(trains.filter((l) => l.position !== Position.DEPARTED))
	});
};
