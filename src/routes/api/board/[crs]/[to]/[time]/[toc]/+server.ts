import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import dayjs from 'dayjs';
import { PUBLIC_DEPARTURES_KEY } from '$env/static/public';
import { Status, type Train } from '$lib/types/train';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { NoticeSeverity } from '$lib/types';

dayjs.extend(utc);
dayjs.extend(timezone);

function parseItem(item: any, crs: string): Train {
	let status = Status.AWAY;
	if (item.atd) {
		status = Status.DEPARTED;
	} else if (item.ata) {
		status = Status.ARRIVED;
	} else if (item.origin[0].crs === crs) {
		status = Status.STARTS_HERE;
	}
	return {
		id: item.rid,
		platform: item.platform ?? null,
		destination: {
			name: item.destination.map((d) => d.locationName).join(', '),
			crs: item.destination.map((d) => d.crs).join('')
		},
		oldDestination: null,
		operator: item.operatorCode,
		estimated: item.atd ?? item.etd ?? null,
		scheduled: item.std,
		times: {
			estimated: {
				arrival: item.atd ?? item.etd ?? null,
				departure: item.atd ?? item.etd ?? null
			},
			scheduled: {
				arrival: item.std ?? null,
				departure: item.std ?? null
			}
		},
		isCancelled: item.isCancelled ?? false,
		status
	};
}

export const GET: RequestHandler = async ({ params, url }) => {
	const { crs, to, time, toc } = params;

	const urlParams = new URLSearchParams(url.searchParams);
	const hour = parseInt(time.split('')[0] + time.split('')[1]);
	const minute = parseInt(time.split('')[2] + time.split('')[3]);
	const date =
		time !== 'null'
			? dayjs()
					.tz('Europe/London')
					.set('hour', hour)
					.set('minute', minute)
					.format('YYYYMMDDTHHmmss')
			: dayjs().tz('Europe/London').format('YYYYMMDDTHHmmss');

	const reqUrl = new URL(
		`https://api1.raildata.org.uk/1010-live-departure-board---staff-version1_0/LDBSVWS/api/20220120/GetDepartureBoardByCRS/${crs}/${date}?numRows=15${to !== 'null' ? `&filterCRS=${to}` : ''}${toc !== 'null' ? `&filterTOC=${toc}` : ''}`
	);

	const response = await fetch(reqUrl, {
		headers: {
			'x-apikey': PUBLIC_DEPARTURES_KEY
		}
	});
	const data = await response.json();
	console.log(data.nrccMessages);
	const notices =
		data.nrccMessages?.map((m) => {
			return {
				severity: NoticeSeverity[m.severity],
				html: m.xhtmlMessage
			};
		}) ?? [];

	notices.sort((a, b) => b.severity - a.severity);
	let trains: Train[] = data.trainServices?.map((item) => parseItem(item, crs)) ?? [];

	trains = trains.toSorted((a, b) => {
		if ((a.estimated ?? a.scheduled) < (b.estimated ?? b.scheduled)) return -1;
		if ((a.estimated ?? a.scheduled) > (b.estimated ?? b.scheduled)) return 1;
		return 0;
	});

	const operators = new Set<string>([]);

	trains.forEach((t) => {
		operators.add(t.operator);
	});

	return json({
		details: {
			name: data.locationName,
			to: data.filterLocationName ?? null,
			crs,
			date: urlParams.get('date') ?? null,
			operators: Array.from(operators)
		},
		notices,
		trains
	});
};
