/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
	'/api/ref/20211101/GetReasonCode/{reasonCode}': {
		get: operations['_20211101Ref_GetReasonCode'];
	};
	'/api/ref/20211101/GetReasonCodeList': {
		get: operations['_20211101Ref_GetReasonCodeList'];
	};
	'/api/ref/20211101/GetSourceInstanceNames': {
		get: operations['_20211101Ref_GetSourceInstanceNames'];
	};
	'/api/ref/20211101/GetTOCList/{currentVersion}': {
		get: operations['_20211101Ref_GetTOCList'];
	};
	'/api/ref/20211101/GetStationList/{currentVersion}': {
		get: operations['_20211101Ref_GetStationList'];
	};
	'/api/ref/20211101/GetLoadingCategoryData/{currentVersion}': {
		get: operations['_20211101Ref_GetLoadingCategoryList'];
	};
	'/api/20220120/GetArrivalDepartureBoardByCRS/{crs}/{time}': {
		get: operations['_20220120_GetArrivalDepartureBoardByCRS'];
	};
	'/api/20220120/GetArrivalDepartureBoardByTIPLOC/{tiploc}/{time}': {
		get: operations['_20220120_GetArrivalDepartureBoardByTIPLOC'];
	};
	'/api/20220120/GetArrivalBoardByCRS/{crs}/{time}': {
		get: operations['_20220120_GetArrivalBoardByCRS'];
	};
	'/api/20220120/GetArrivalBoardByTIPLOC/{tiploc}/{time}': {
		get: operations['_20220120_GetArrivalBoardByTIPLOC'];
	};
	'/api/20220120/GetDepartureBoardByCRS/{crs}/{time}': {
		get: operations['_20220120_GetDepartureBoardByCRS'];
	};
	'/api/20220120/GetDepartureBoardByTIPLOC/{tiploc}/{time}': {
		get: operations['_20220120_GetDepartureBoardByTIPLOC'];
	};
	'/api/20220120/GetArrBoardWithDetails/{crs}/{time}': {
		get: operations['_20220120_GetArrBoardWithDetails'];
	};
	'/api/20220120/GetDepBoardWithDetails/{crs}/{time}': {
		get: operations['_20220120_GetDepBoardWithDetails'];
	};
	'/api/20220120/GetArrDepBoardWithDetails/{crs}/{time}': {
		get: operations['_20220120_GetArrDepBoardWithDetails'];
	};
	'/api/20220120/GetFastestDepartures/{crs}/{filterList}/{time}': {
		get: operations['_20220120_GetFastestDepartures'];
	};
	'/api/20220120/GetFastestDeparturesWithDetails/{crs}/{filterList}/{time}': {
		get: operations['_20220120_GetFastestDeparturesWithDetails'];
	};
	'/api/20220120/GetNextDepartures/{crs}/{filterList}/{time}': {
		get: operations['_20220120_GetNextDepartures'];
	};
	'/api/20220120/GetNextDeparturesWithDetails/{crs}/{filterList}/{time}': {
		get: operations['_20220120_GetNextDeparturesWithDetails'];
	};
	'/api/20220120/GetServiceDetailsByRID/{rid}': {
		get: operations['_20220120_GetServiceDetailsByRID'];
	};
	'/api/20220120/QueryServices/{serviceID}/{sdd}': {
		get: operations['_20220120_QueryServices'];
	};
	'/api/20220120/GetReasonCode/{reasonCode}': {
		get: operations['_20220120_GetReasonCode'];
	};
	'/api/20220120/GetReasonCodeList': {
		get: operations['_20220120_GetReasonCodeList'];
	};
	'/api/20220120/GetDisruptionList/{CRSList}': {
		get: operations['_20220120_GetDisruptionList'];
	};
	'/api/20220120/GetSourceInstanceNames': {
		get: operations['_20220120_GetSourceInstanceNames'];
	};
}

export interface definitions {
	ReasonDescription: {
		/** Format: int32 */
		code?: number;
		lateReason?: string;
		cancReason?: string;
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	XmlSerializerNamespaces: {
		/** Format: int32 */
		Count?: number;
	};
	SourceInstanceName: {
		id?: string;
		name?: string;
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	TOCRefData: {
		version?: string;
		TOCList?: definitions['TOCName'][];
	};
	TOCName: {
		toc?: string;
		Value?: string;
	};
	StationRefData: {
		version?: string;
		StationList?: definitions['StationName'][];
	};
	StationName: {
		crs?: string;
		Value?: string;
	};
	LoadingCategoryRefData: {
		version?: string;
		CategoryList?: definitions['LoadingCategoryRefDataCategory'][];
	};
	LoadingCategoryRefDataCategory: {
		data?: definitions['CategoryData'][];
		code?: string;
		name?: string;
	};
	CategoryData: {
		typicalDescription?: string;
		expectedDescription?: string;
		definition?: string;
		colour?: string;
		image?: string;
		toc?: string;
	};
	StationBoard: {
		trainServices?: definitions['ServiceItem'][];
		busServices?: definitions['ServiceItem'][];
		ferryServices?: definitions['ServiceItem'][];
		/** Format: float */
		qos?: number;
		qosSpecified?: boolean;
		isTruncated?: boolean;
		/** Format: date-time */
		generatedAt?: string;
		locationName?: string;
		crs?: string;
		filterLocationName?: string;
		filtercrs?: string;
		/** @enum {string} */
		filterType?: 'to' | 'from';
		stationManager?: string;
		stationManagerCode?: string;
		nrccMessages?: definitions['NRCCMessage'][];
		platformsAreHidden?: boolean;
		servicesAreUnavailable?: boolean;
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	ServiceItem: {
		formation?: definitions['FormationData'];
		origin?: definitions['EndPointLocation'][];
		destination?: definitions['EndPointLocation'][];
		currentOrigins?: definitions['EndPointLocation'][];
		currentDestinations?: definitions['EndPointLocation'][];
		cancelReason?: definitions['ReasonCodeWithLocation'];
		delayReason?: definitions['ReasonCodeWithLocation'];
		category?: string;
		activities?: string;
		/** Format: int32 */
		length?: number;
		isReverseFormation?: boolean;
		detachFront?: boolean;
		futureDelay?: boolean;
		futureCancellation?: boolean;
		diversion?: definitions['BaseServiceItemDiversion'];
		uncertainty?: definitions['UncertaintyType'];
		affectedBy?: string;
		rid: string;
		uid?: string;
		trainid?: string;
		rsid?: string;
		/** Format: date-time */
		sdd?: string;
		operator?: string;
		operatorCode?: string;
		isPassengerService?: boolean;
		isCharter?: boolean;
		isCancelled?: boolean;
		isCircularRoute?: boolean;
		filterLocationCancelled?: boolean;
		filterLocationOperational?: boolean;
		isOperationalCall?: boolean;
		/** Format: date-time */
		sta?: string;
		staSpecified?: boolean;
		/** Format: date-time */
		ata?: string;
		ataSpecified?: boolean;
		/** Format: date-time */
		eta?: string;
		etaSpecified?: boolean;
		/** @enum {string} */
		arrivalType?: 'Forecast' | 'Actual' | 'NoLog' | 'Delayed';
		arrivalTypeSpecified?: boolean;
		arrivalSource?: string;
		arrivalSourceInstance?: string;
		/** Format: date-time */
		std?: string;
		stdSpecified?: boolean;
		/** Format: date-time */
		atd?: string;
		atdSpecified?: boolean;
		/** Format: date-time */
		etd?: string;
		etdSpecified?: boolean;
		/** @enum {string} */
		departureType?: 'Forecast' | 'Actual' | 'NoLog' | 'Delayed';
		departureTypeSpecified?: boolean;
		departureSource?: string;
		departureSourceInstance?: string;
		platform?: string;
		platformIsHidden?: boolean;
		serviceIsSuppressed?: boolean;
		adhocAlerts?: string[];
	};
	NRCCMessage: {
		/** @enum {string} */
		category?:
			| 'Trainservice'
			| 'Station'
			| 'Connectingservices'
			| 'Systemrelated'
			| 'Miscellaneous'
			| 'Priortrains'
			| 'Priorother';
		/** @enum {string} */
		severity?: 'Normal' | 'Minor' | 'Major' | 'Severe';
		xhtmlMessage?: string;
	};
	FormationData: {
		serviceLoading?: definitions['FormationDataServiceLoading'];
		coaches?: definitions['CoachData'][];
		source?: string;
		sourceInstance?: string;
	};
	EndPointLocation: {
		isOperationalEndPoint?: boolean;
		locationName?: string;
		crs?: string;
		tiploc?: string;
		via?: string;
		/** @enum {string} */
		futureChangeTo?: 'train' | 'bus' | 'ferry';
		futureChangeToSpecified?: boolean;
	};
	ReasonCodeWithLocation: {
		tiploc?: string;
		near?: boolean;
		/** Format: int32 */
		Value?: number;
	};
	BaseServiceItemDiversion: {
		reason?: definitions['ReasonCodeWithLocation'];
		divertedVia?: definitions['BaseServiceItemDiversionDivertedVia'];
		between?: definitions['BaseServiceItemDiversionBetween'];
		/** Format: int32 */
		rerouteDelay?: number;
	};
	UncertaintyType: {
		reason?: definitions['ReasonCodeWithLocation'];
		/** @enum {string} */
		status?: 'Delay' | 'Cancellation' | 'Other';
	};
	FormationDataServiceLoading: {
		loadingCategory?: definitions['FormationDataServiceLoadingLoadingCategory'];
		loadingPercentage?: definitions['FormationDataServiceLoadingLoadingPercentage'];
	};
	CoachData: {
		coachClass?: string;
		toilet?: definitions['ToiletAvailabilityType'];
		loading?: definitions['CoachDataLoading'];
		number?: string;
	};
	BaseServiceItemDiversionDivertedVia: {
		tiploc?: string;
		Value?: string;
	};
	BaseServiceItemDiversionBetween: {
		start?: string;
		end?: string;
	};
	FormationDataServiceLoadingLoadingCategory: {
		/** @enum {string} */
		type?: 'Typical' | 'Expected';
		src?: string;
		srcInst?: string;
		Value?: string;
	};
	FormationDataServiceLoadingLoadingPercentage: {
		/** @enum {string} */
		type?: 'Typical' | 'Expected';
		src?: string;
		srcInst?: string;
		/** Format: int32 */
		Value?: number;
	};
	ToiletAvailabilityType: {
		/** @enum {string} */
		status?: 'Unknown' | 'InService' | 'NotInService';
		Value?: string;
	};
	CoachDataLoading: {
		source?: string;
		sourceInstance?: string;
		/** Format: int32 */
		Value?: number;
	};
	StationBoardWithDetails: {
		trainServices?: definitions['ServiceItemWithLocations'][];
		busServices?: definitions['ServiceItemWithLocations'][];
		ferryServices?: definitions['ServiceItemWithLocations'][];
		isTruncated?: boolean;
		/** Format: date-time */
		generatedAt?: string;
		locationName?: string;
		crs?: string;
		filterLocationName?: string;
		filtercrs?: string;
		/** @enum {string} */
		filterType?: 'to' | 'from';
		stationManager?: string;
		stationManagerCode?: string;
		nrccMessages?: definitions['NRCCMessage'][];
		platformsAreHidden?: boolean;
		servicesAreUnavailable?: boolean;
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	ServiceItemWithLocations: {
		previousLocations?: definitions['ServiceItemLocation'][];
		subsequentLocations?: definitions['ServiceItemLocation'][];
		formation?: definitions['FormationData'];
		origin?: definitions['EndPointLocation'][];
		destination?: definitions['EndPointLocation'][];
		currentOrigins?: definitions['EndPointLocation'][];
		currentDestinations?: definitions['EndPointLocation'][];
		cancelReason?: definitions['ReasonCodeWithLocation'];
		delayReason?: definitions['ReasonCodeWithLocation'];
		category?: string;
		activities?: string;
		/** Format: int32 */
		length?: number;
		isReverseFormation?: boolean;
		detachFront?: boolean;
		futureDelay?: boolean;
		futureCancellation?: boolean;
		diversion?: definitions['BaseServiceItemDiversion'];
		uncertainty?: definitions['UncertaintyType'];
		affectedBy?: string;
		rid?: string;
		uid?: string;
		trainid?: string;
		rsid?: string;
		/** Format: date-time */
		sdd?: string;
		operator?: string;
		operatorCode?: string;
		isPassengerService?: boolean;
		isCharter?: boolean;
		isCancelled?: boolean;
		isCircularRoute?: boolean;
		filterLocationCancelled?: boolean;
		filterLocationOperational?: boolean;
		isOperationalCall?: boolean;
		/** Format: date-time */
		sta?: string;
		staSpecified?: boolean;
		/** Format: date-time */
		ata?: string;
		ataSpecified?: boolean;
		/** Format: date-time */
		eta?: string;
		etaSpecified?: boolean;
		/** @enum {string} */
		arrivalType?: 'Forecast' | 'Actual' | 'NoLog' | 'Delayed';
		arrivalTypeSpecified?: boolean;
		arrivalSource?: string;
		arrivalSourceInstance?: string;
		/** Format: date-time */
		std?: string;
		stdSpecified?: boolean;
		/** Format: date-time */
		atd?: string;
		atdSpecified?: boolean;
		/** Format: date-time */
		etd?: string;
		etdSpecified?: boolean;
		/** @enum {string} */
		departureType?: 'Forecast' | 'Actual' | 'NoLog' | 'Delayed';
		departureTypeSpecified?: boolean;
		departureSource?: string;
		departureSourceInstance?: string;
		platform?: string;
		platformIsHidden?: boolean;
		serviceIsSuppressed?: boolean;
		adhocAlerts?: string[];
	};
	ServiceItemLocation: {
		cancelReason?: definitions['ReasonCodeWithLocation'];
		delayReason?: definitions['ReasonCodeWithLocation'];
		locationName?: string;
		tiploc?: string;
		crs?: string;
		isOperational?: boolean;
		isPass?: boolean;
		isCancelled?: boolean;
		platform?: string;
		platformIsHidden?: boolean;
		serviceIsSuppressed?: boolean;
		/** Format: date-time */
		sta?: string;
		staSpecified?: boolean;
		/** Format: date-time */
		ata?: string;
		ataSpecified?: boolean;
		/** Format: date-time */
		eta?: string;
		etaSpecified?: boolean;
		/** @enum {string} */
		arrivalType?: 'Forecast' | 'Actual' | 'NoLog' | 'Delayed';
		arrivalTypeSpecified?: boolean;
		arrivalSource?: string;
		arrivalSourceInstance?: string;
		/** Format: date-time */
		std?: string;
		stdSpecified?: boolean;
		/** Format: date-time */
		atd?: string;
		atdSpecified?: boolean;
		/** Format: date-time */
		etd?: string;
		etdSpecified?: boolean;
		/** @enum {string} */
		departureType?: 'Forecast' | 'Actual' | 'NoLog' | 'Delayed';
		departureTypeSpecified?: boolean;
		departureSource?: string;
		departureSourceInstance?: string;
		lateness?: string;
		associations?: definitions['Association'][];
		adhocAlerts?: string[];
	};
	Association: {
		/** @enum {string} */
		category?: 'join' | 'divide' | 'LinkFrom' | 'LinkTo' | 'next';
		rid?: string;
		uid?: string;
		trainid?: string;
		rsid?: string;
		/** Format: date-time */
		sdd?: string;
		origin?: string;
		originCRS?: string;
		originTiploc?: string;
		destination?: string;
		destCRS?: string;
		destTiploc?: string;
		isCancelled?: boolean;
	};
	DeparturesBoard: {
		departures?: definitions['DepartureItem'][];
		/** Format: date-time */
		generatedAt?: string;
		locationName?: string;
		crs?: string;
		filterLocationName?: string;
		filtercrs?: string;
		/** @enum {string} */
		filterType?: 'to' | 'from';
		stationManager?: string;
		stationManagerCode?: string;
		nrccMessages?: definitions['NRCCMessage'][];
		platformsAreHidden?: boolean;
		servicesAreUnavailable?: boolean;
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	DepartureItem: {
		service?: definitions['ServiceItem'];
		crs?: string;
	};
	DeparturesBoardWithDetails: {
		departures?: definitions['DepartureItemWithLocations'][];
		/** Format: date-time */
		generatedAt?: string;
		locationName?: string;
		crs?: string;
		filterLocationName?: string;
		filtercrs?: string;
		/** @enum {string} */
		filterType?: 'to' | 'from';
		stationManager?: string;
		stationManagerCode?: string;
		nrccMessages?: definitions['NRCCMessage'][];
		platformsAreHidden?: boolean;
		servicesAreUnavailable?: boolean;
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	DepartureItemWithLocations: {
		service?: definitions['ServiceItemWithLocations'];
		crs?: string;
	};
	ServiceDetails: {
		locations?: definitions['ServiceLocation'][];
		formation?: definitions['LocFormationData'][];
		cancelReason?: definitions['ReasonCodeWithLocation'];
		delayReason?: definitions['ReasonCodeWithLocation'];
		category?: string;
		isReverseFormation?: boolean;
		divertedVia?: definitions['BaseServiceDetailsDivertedVia'];
		diversionReason?: definitions['ReasonCodeWithLocation'];
		/** Format: date-time */
		generatedAt?: string;
		rid?: string;
		uid?: string;
		trainid?: string;
		rsid?: string;
		/** Format: date-time */
		sdd?: string;
		operator?: string;
		operatorCode?: string;
		/** @enum {string} */
		serviceType?: 'train' | 'bus' | 'ferry';
		isPassengerService?: boolean;
		isCharter?: boolean;
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	ServiceLocation: {
		cancelReason?: definitions['ReasonCodeWithLocation'];
		delayReason?: definitions['ReasonCodeWithLocation'];
		affectedByDiversion?: boolean;
		/** Format: int32 */
		rerouteDelay?: number;
		uncertainty?: definitions['UncertaintyType'];
		affectedBy?: string;
		locationName?: string;
		tiploc?: string;
		crs?: string;
		associations?: definitions['Association'][];
		adhocAlerts?: string[];
		activities?: string;
		/** Format: int32 */
		length?: number;
		detachFront?: boolean;
		isOperational?: boolean;
		isPass?: boolean;
		isCancelled?: boolean;
		falseDest?: string;
		fdTiploc?: string;
		platform?: string;
		platformIsHidden?: boolean;
		serviceIsSuppressed?: boolean;
		/** Format: date-time */
		sta?: string;
		staSpecified?: boolean;
		/** Format: date-time */
		ata?: string;
		ataSpecified?: boolean;
		/** Format: date-time */
		eta?: string;
		etaSpecified?: boolean;
		/** @enum {string} */
		arrivalType?: 'Forecast' | 'Actual' | 'NoLog' | 'Delayed';
		arrivalTypeSpecified?: boolean;
		arrivalSource?: string;
		arrivalSourceInstance?: string;
		/** Format: date-time */
		std?: string;
		stdSpecified?: boolean;
		/** Format: date-time */
		atd?: string;
		atdSpecified?: boolean;
		/** Format: date-time */
		etd?: string;
		etdSpecified?: boolean;
		/** @enum {string} */
		departureType?: 'Forecast' | 'Actual' | 'NoLog' | 'Delayed';
		departureTypeSpecified?: boolean;
		departureSource?: string;
		departureSourceInstance?: string;
		lateness?: string;
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	LocFormationData: {
		tiploc?: string;
		serviceLoading?: definitions['FormationDataServiceLoading'];
		coaches?: definitions['CoachData'][];
		source?: string;
		sourceInstance?: string;
	};
	BaseServiceDetailsDivertedVia: {
		tiploc?: string;
		Value?: string;
	};
	ServiceList: {
		/** Format: date-time */
		scheduleStartDate?: string;
		serviceList?: definitions['ServiceListItem'][];
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	ServiceListItem: {
		rid?: string;
		uid?: string;
		trainid?: string;
		rsid?: string;
		originName?: string;
		originCrs?: string;
		destinationName?: string;
		destinationCrs?: string;
		/** Format: date-time */
		scheduledDeparture?: string;
		/** Format: date-time */
		scheduledArrival?: string;
	};
	DisruptionItem: {
		/** Format: date-time */
		generatedAt?: string;
		crs?: string;
		disruptions?: definitions['DisruptionMessage'][];
		Xmlns?: definitions['XmlSerializerNamespaces'];
	};
	DisruptionMessage: {
		/** Format: int32 */
		id?: number;
		/** @enum {string} */
		category?:
			| 'Train service'
			| 'Station'
			| 'Connecting services'
			| 'System related'
			| 'Miscellaneous'
			| 'Prior (trains)'
			| 'Prior (other)';
		/** @enum {string} */
		severity?: 'Normal' | 'Minor' | 'Major' | 'Severe';
		isSuppressed?: boolean;
		xhtmlMessage?: string;
		description?: string;
	};
}

export interface operations {
	_20211101Ref_GetReasonCode: {
		parameters: {
			path: {
				reasonCode: number;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['ReasonDescription'];
			};
		};
	};
	_20211101Ref_GetReasonCodeList: {
		responses: {
			/** OK */
			200: {
				schema: definitions['ReasonDescription'][];
			};
		};
	};
	_20211101Ref_GetSourceInstanceNames: {
		responses: {
			/** OK */
			200: {
				schema: definitions['SourceInstanceName'][];
			};
		};
	};
	_20211101Ref_GetTOCList: {
		parameters: {
			path: {
				currentVersion: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['TOCRefData'];
			};
		};
	};
	_20211101Ref_GetStationList: {
		parameters: {
			path: {
				currentVersion: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationRefData'];
			};
		};
	};
	_20211101Ref_GetLoadingCategoryList: {
		parameters: {
			path: {
				currentVersion: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['LoadingCategoryRefData'];
			};
		};
	};
	_20220120_GetArrivalDepartureBoardByCRS: {
		parameters: {
			path: {
				crs: string;
				time: string;
			};
			query: {
				numRows?: number;
				timeWindow?: number;
				filterCRS?: string;
				filterType?: 'to' | 'from';
				filterTOC?: string;
				services?: string;
				getNonPassengerServices?: boolean;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationBoard'];
			};
		};
	};
	_20220120_GetArrivalDepartureBoardByTIPLOC: {
		parameters: {
			path: {
				tiploc: string;
				time: string;
			};
			query: {
				numRows?: number;
				timeWindow?: number;
				filterCRS?: string;
				filterType?: 'to' | 'from';
				filterTOC?: string;
				services?: string;
				getNonPassengerServices?: boolean;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationBoard'];
			};
		};
	};
	_20220120_GetArrivalBoardByCRS: {
		parameters: {
			path: {
				crs: string;
				time: string;
			};
			query: {
				numRows?: number;
				timeWindow?: number;
				filterCRS?: string;
				filterType?: 'to' | 'from';
				filterTOC?: string;
				services?: string;
				getNonPassengerServices?: boolean;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationBoard'];
			};
		};
	};
	_20220120_GetArrivalBoardByTIPLOC: {
		parameters: {
			path: {
				tiploc: string;
				time: string;
			};
			query: {
				numRows?: number;
				timeWindow?: number;
				filterCRS?: string;
				filterType?: 'to' | 'from';
				filterTOC?: string;
				services?: string;
				getNonPassengerServices?: boolean;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationBoard'];
			};
		};
	};
	_20220120_GetDepartureBoardByCRS: {
		parameters: {
			path: {
				crs: string;
				time: string;
			};
			query: {
				numRows?: number;
				timeWindow?: number;
				filterCRS?: string;
				filterType?: 'to' | 'from';
				filterTOC?: string;
				services?: string;
				getNonPassengerServices?: boolean;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationBoard'];
			};
		};
	};
	_20220120_GetDepartureBoardByTIPLOC: {
		parameters: {
			path: {
				tiploc: string;
				time: string;
			};
			query: {
				numRows?: number;
				timeWindow?: number;
				filterCRS?: string;
				filterType?: 'to' | 'from';
				filterTOC?: string;
				services?: string;
				getNonPassengerServices?: boolean;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationBoard'];
			};
		};
	};
	_20220120_GetArrBoardWithDetails: {
		parameters: {
			path: {
				crs: string;
				time: string;
			};
			query: {
				numRows?: number;
				timeWindow?: number;
				filterCRS?: string;
				filterType?: 'to' | 'from';
				filterTOC?: string;
				services?: string;
				getNonPassengerServices?: boolean;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationBoardWithDetails'];
			};
		};
	};
	_20220120_GetDepBoardWithDetails: {
		parameters: {
			path: {
				crs: string;
				time: string;
			};
			query: {
				numRows?: number;
				timeWindow?: number;
				filterCRS?: string;
				filterType?: 'to' | 'from';
				filterTOC?: string;
				services?: string;
				getNonPassengerServices?: boolean;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationBoardWithDetails'];
			};
		};
	};
	_20220120_GetArrDepBoardWithDetails: {
		parameters: {
			path: {
				crs: string;
				time: string;
			};
			query: {
				numRows?: number;
				timeWindow?: number;
				filterCRS?: string;
				filterType?: 'to' | 'from';
				filterTOC?: string;
				services?: string;
				getNonPassengerServices?: boolean;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['StationBoardWithDetails'];
			};
		};
	};
	_20220120_GetFastestDepartures: {
		parameters: {
			path: {
				crs: string;
				filterList: string;
				time: string;
			};
			query: {
				timeWindow?: number;
				filterTOC?: string;
				services?: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['DeparturesBoard'];
			};
		};
	};
	_20220120_GetFastestDeparturesWithDetails: {
		parameters: {
			path: {
				crs: string;
				filterList: string;
				time: string;
			};
			query: {
				timeWindow?: number;
				filterTOC?: string;
				services?: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['DeparturesBoardWithDetails'];
			};
		};
	};
	_20220120_GetNextDepartures: {
		parameters: {
			path: {
				crs: string;
				filterList: string;
				time: string;
			};
			query: {
				timeWindow?: number;
				filterTOC?: string;
				services?: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['DeparturesBoard'];
			};
		};
	};
	_20220120_GetNextDeparturesWithDetails: {
		parameters: {
			path: {
				crs: string;
				filterList: string;
				time: string;
			};
			query: {
				timeWindow?: number;
				filterTOC?: string;
				services?: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['DeparturesBoardWithDetails'];
			};
		};
	};
	_20220120_GetServiceDetailsByRID: {
		parameters: {
			path: {
				rid: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['ServiceDetails'];
			};
		};
	};
	_20220120_QueryServices: {
		parameters: {
			path: {
				serviceID: string;
				sdd: string;
			};
			query: {
				filterTime?: string;
				filterCRS?: string;
				filterTOC?: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['ServiceList'];
			};
		};
	};
	_20220120_GetReasonCode: {
		parameters: {
			path: {
				reasonCode: number;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['ReasonDescription'];
			};
		};
	};
	_20220120_GetReasonCodeList: {
		responses: {
			/** OK */
			200: {
				schema: definitions['ReasonDescription'][];
			};
		};
	};
	_20220120_GetDisruptionList: {
		parameters: {
			path: {
				CRSList: string;
			};
		};
		responses: {
			/** OK */
			200: {
				schema: definitions['DisruptionItem'][];
			};
		};
	};
	_20220120_GetSourceInstanceNames: {
		responses: {
			/** OK */
			200: {
				schema: definitions['SourceInstanceName'][];
			};
		};
	};
}
