import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import dayjs from 'dayjs';
import { PUBLIC_DEPARTURES_KEY } from '$env/static/public';
import { Status, type Train } from '$lib/types/train';
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

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
		operator: item.operatorCode,
		estimated: item.atd ?? item.etd ?? null,
		scheduled: item.std,
		isCancelled: item.isCancelled ?? false,
		status
	};
}

export const GET: RequestHandler = async ({ params, url }) => {
	const { crs, to, time, toc } = params;

	const urlParams = new URLSearchParams(url.searchParams);

	console.log(time);
 const hour = parseInt(time.split('')[0]+time.split('')[1])
 const minute = parseInt(time.split('')[2]+time.split('' )[3])
	const date =
		time !== 'null'
			? dayjs().tz('Europe/London').set('hour', hour).set('minute', minute).format('YYYYMMDDTHHmmss')
			: dayjs().tz('Europe/London').format('YYYYMMDDTHHmmss');

	const reqUrl = new URL(
		`https://api1.raildata.org.uk/1010-live-departure-board---staff-version1_0/LDBSVWS/api/20220120/GetDepartureBoardByCRS/${crs}/${date}?numRows=15${to !== 'null' ? `&filterCRS=${to}` : ''}${toc !== 'null' ? `&filterTOC=${toc}` : ''}`
	);
	console.log(reqUrl.toString());

	const response = await fetch(reqUrl, {
		headers: {
			'x-apikey': PUBLIC_DEPARTURES_KEY
		}
	});
	const data = await response.json();
	const trains: Train[] = data.trainServices?.map((item) => parseItem(item, crs)) ?? [];

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
		trains
	});
};
