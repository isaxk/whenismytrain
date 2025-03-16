export enum Status {
	AWAY,
	ARRIVED,
	DEPARTED,
	STARTS_HERE,
	UNKNOWN
}
export enum Order {
	PREVIOUS,
	FOCUS,
	SUBSEQUENT
}

export type Train = {
	id: string;
	platform: string | null;
	destination: {
		name: string;
		crs: string;
	};
	estimated: string;
	scheduled: string;
	status: Status;
	operator: string;
	isCancelled: boolean;
};

export type LocationTime = {
	arrival: string;
	departure: string;
};

export type ServiceLocation = {
	isCallingPoint: boolean;
	order: Order;
	platform: string | null;
	name: string;
	crs: string;
	tiploc: string;
	status: Status;
	isCancelled: boolean;
	times: {
		scheduled: LocationTime;
		estimated: LocationTime;
	};
	coords: [number, number];
	divideFrom: {
		id: string;
		destination: string;
		crs: string;
		origin: string;
	} | null;
	divideTo: {
		id: string;
		destination: string;
		crs: string;
	} | null;
};

export type CallingPoint = ServiceLocation & {
	progress: number;
};
