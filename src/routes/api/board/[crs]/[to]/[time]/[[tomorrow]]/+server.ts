import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { paramUrl } from '$lib/utils/url';
import dayjs from 'dayjs';
import { env } from '$env/dynamic/private';
import { NoticeSeverity, type BoardItem, type Details, type TrainFilter } from '$lib/types/board';
import { Position } from '$lib/types';
import tiplocsData from '$lib/data/tiplocs.json';
import { operatorList } from '$lib/data/operators';
import type { StationBoard, ServiceItem, ServiceItemWithLocations } from '$lib/types/ldbsvws';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEPARTURES_KEY = env.DEPARTURES_KEY;

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

    const reqUrl = paramUrl(
        `https://api1.raildata.org.uk/1010-live-departure-board---staff-version1_0/LDBSVWS/api/20220120/GetDepBoardWithDetails/${crs}/${date}`,
        {
            filterCrs: to,
            timeWindow: '480'
        }
    );

    const response = await fetch(reqUrl.toString(), {
        headers: {
            'x-apikey': DEPARTURES_KEY
        }
    });
    const data = await response.json() as StationBoard;

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

        const callingPoints = (item.subsequentLocations??[]).filter((p) => p.crs && !p.isPass);
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
            relativeTimes: {
                arrival: item.ata || item.eta ? dayjs(item.ata ?? item.eta).diff(dayjs(), 'minute') : null,
                departure: item.atd || item.etd ? dayjs(item.atd ?? item.etd).diff(dayjs(), 'minute') : null
            },
            position
        };
    }
    let trains = (data.trainServices ?? []).map(parseService);

    const notices =
        data.nrccMessages?.map((m) => {
            return {
                severity: NoticeSeverity[m.severity ?? "Normal"],
                html: m.xhtmlMessage
            };
        }) ?? [];

    notices.sort((a, b) => b.severity - a.severity);

    const coords = tiplocsData.find((tp) => tp.crs === data.crs);

    const current = {
        crs: crs,
        name: data.locationName,
        coords: [coords?.longitude, coords?.latitude]
    };

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

    return json({
        details,
        trains: trains
            .filter((l) => l.position === Position.DEPARTED)
            .concat(trains.filter((l) => l.position !== Position.DEPARTED))
    });
};
