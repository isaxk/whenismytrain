import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { paramUrl } from '$lib/utils/url';
import dayjs from 'dayjs';
import { PUBLIC_DEPARTURES_KEY } from '$env/static/public';
import { NoticeSeverity, type BoardItem, type Details, type TrainFilter } from '$lib/types/board';
import { Position } from '$lib/types';

export const GET: RequestHandler = async ({ params, request }) => {
	const { crs, to, time, toc } = params;

	const date = dayjs().format('YYYYMMDDTHHmmss');
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

		if (item.isCancelled) {
			position = Position.CANCELLED;
		} else if (item.atdSpecified) {
			position = Position.DEPARTED;
		} else if (item.ataSpecified) {
			position = Position.ARRIVED;
		} else if (item.origin[0].crs === crs) {
			position = Position.STARTS_HERE;
		}

		if (to && to != null && to != 'null') {
			const callingPoints = item.subsequentLocations.filter((p) => p.crs && !p.isPass);
			const filterIndex = callingPoints.findIndex((p) => p.crs === to);
			const filterLocation = filterIndex !== -1 ? callingPoints[filterIndex] : null;

			if (filterLocation) {
				const durations = dayjs(
					filterLocation.ata ?? filterLocation.eta ?? filterLocation.sta
				).diff(item.atd ?? item.etd ?? item.std, 'minute');
				const hours = Math.floor(durations / 60);
				const minutes = durations % 60;
				filter = {
					crs: to,
					name: data.filterLocationName,
					stops: filterIndex,
					time: filterLocation.ata ?? filterLocation.eta ?? filterLocation.sta,
					duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
				};
			}
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

	const details: Details = {
		name: data.locationName,
		notices,
		crs: crs,
		filterName: data.filterLocationName ?? null,
		filterCrs: to != null || to != 'null' ? to : null,
		manager: data.stationManager
	};

	return json({
		details,
		trains
	});
};
