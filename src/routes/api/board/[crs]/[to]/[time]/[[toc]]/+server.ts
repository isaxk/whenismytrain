import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { paramUrl } from '$lib/utils/url';
import dayjs from 'dayjs';
import { PUBLIC_DEPARTURES_KEY } from '$env/static/public';
import { NoticeSeverity, type BoardItem, type Details, type TrainFilter } from '$lib/types/board';
import { Position } from '$lib/types';
import tiplocsData from '$lib/data/tiplocs.json';
import { operatorList } from '$lib/data/operators';

export const GET: RequestHandler = async ({ params, request }) => {
	const { crs, to, time, toc } = params;

	const date = (
		time != 'null'
			? dayjs()
					.set('hour', parseInt(time.substring(0, 2)))
					.set('minute', parseInt(time.substring(2, 4)))
			: dayjs()
	).format('YYYYMMDDTHHmmss');
	const reqUrl = paramUrl(
		`https://api1.raildata.org.uk/1010-live-departure-board---staff-version1_0/LDBSVWS/api/20220120/GetDepBoardWithDetails/${crs}/${date}`,
		{
			filterCrs: to,
			filterToc: toc ?? null
		}
	);
	const response = await fetch(reqUrl.toString(), {
		headers: {
			'x-apikey': PUBLIC_DEPARTURES_KEY
		}
	});
	const data = await response.json();

	function parseService(item: any, i: number): BoardItem {
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

		const callingPoints = item.subsequentLocations.filter((p) => p.crs && !p.isPass);
		const filterIndex = callingPoints.findIndex((p) => p.crs === filterCrs);
		const filterLocation = filterIndex !== -1 ? callingPoints[filterIndex] : null;

		if (filterLocation) {
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
				time: filterLocation.ata ?? filterLocation.eta ?? filterLocation.sta,
				duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
			};
		}

		return {
			id: item.rid,
			uid: item.uid,
			sdd: item.sdd,
			destination: {
				name: item.destination.map((d: any) => d.locationName).join(', '),
				crs: item.destination.map((d: any) => d.crs)
			},
			origin: {
				name: item.origin.map((d: any) => d.locationName).join(', '),
				crs: item.origin.map((d: any) => d.crs)
			},
			platform: item.platform,
			operator: item.operatorCode,
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
			relativeTimes: {
				arrival: item.ata || item.eta ? dayjs(item.ata ?? item.eta).diff(dayjs(), 'minute') : null,
				departure: item.atd || item.etd ? dayjs(item.atd ?? item.etd).diff(dayjs(), 'minute') : null
			},
			position
		};
	}
	const trains = (data.trainServices ?? []).map(parseService);

	const notices =
		data.nrccMessages?.map((m) => {
			return {
				severity: NoticeSeverity[m.severity],
				html: m.xhtmlMessage
			};
		}) ?? [];

	notices.sort((a, b) => b.severity - a.severity);

	const coords = tiplocsData.find((tp) => tp.crs === data.crs);

	console.log(data);

	const current = {
		crs: crs,
		name: data.locationName,
		coords: [coords?.longitude, coords?.latitude]
	};

	const spiderMap = (data.trainServices ?? []).map((t) => {
		const coordsList = [
			current,
			...(t.subsequentLocations ?? []).map((l) => {
				const tiploc = tiplocsData.find((tp) => tp.tiploc === l.tiploc);
				return {
					crs: l.crs,
					name: l.name,
					coords: [tiploc?.longitude, tiploc?.latitude]
				};
			})
		];
		return {
			color: operatorList[t.operatorCode].bg,
			coordsList
		};
	});

	const details: Details = {
		name: data.locationName,
		notices,
		crs: crs,
		filterName: data.filterLocationName ?? null,
		filterCrs: to != null && to != 'null' ? to : null,
		manager: data.stationManager,
		spiderMap
	};

	return json({
		details,
		trains
	});
};
