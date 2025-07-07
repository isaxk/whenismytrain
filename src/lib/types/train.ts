import type { DestinationOrigin, Position, TimeObject } from '.';
import type { TrainFilter } from './board';

export type Location = {
	name: string;
	crs: string | null;
	tiploc: string;
	platform: string | null;
	trainRelativePosition: Position;
	coordinates: [number, number];
	times: TimeObject;
	isCancelled: boolean;
	isCallingPoint: boolean;
	division: {
		locations: Location[];
		callingPoints: CallingPoint[];
	} | null;
	divisionType: 'join' | 'divide' | null; // Added this property
	divisionCallingPoints: CallingPoint[] | null; // Added this property
	formedFrom: {
		id: string;
		origin: DestinationOrigin;
		destination: DestinationOrigin;
	} | null;
	progress: number;
	loading: number | null;
};

export type CallingPoint = Omit<Location, 'crs'> & {
	crs: string;
};

export type GroupedCallingPoints = {
	previous: CallingPoint[];
	focus: CallingPoint;
	subsequent: CallingPoint[];
	filter: CallingPoint;
	further: CallingPoint[];
	destination: CallingPoint;
};

export type Formation = {
	number: string;
	coachClass: string;
	toilet: boolean;
	toiletIsAccessible: boolean;
	loading: number | null;
	toiletStatus: 'Unknown' | 'InService' | 'NotInService';
}[];

export type ServiceDetails = {
	uid: string;
	sdd: string;
	locations: Location[];
	allCallingPoints: CallingPoint[];
	grouped: GroupedCallingPoints;
	filterDetails: TrainFilter;
	operator: string;
	operatorColor: string;
	operatorName: string;
	operatorText: string;
	genAt: string;
	lateReason: string | null;
	cancelReason: string | null;
	formation: Formation;
};
