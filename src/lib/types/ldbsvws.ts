export interface ServiceDetails {
  locations: ServiceLocation[];
  formation?: FormationItem[];
  rid: string;
  uid: string;
  sdd: string;
}

export interface FormationItem {
  tiploc: string;
  coaches?: CoachData[];
  serviceLoading?: {
    loadingPercentage?: {
      Value: number;
    };
  };
}

// Enums
export enum ArrivalDepartureType {
  Forecast = "Forecast",
  Actual = "Actual",
  NoLog = "NoLog",
  Delayed = "Delayed"
}

export enum FilterType {
  to = "to",
  from = "from"
}

export enum FutureChangeType {
  train = "train",
  bus = "bus",
  ferry = "ferry"
}

export enum UncertaintyStatus {
  Delay = "Delay",
  Cancellation = "Cancellation",
  Other = "Other"
}

// Interfaces
export interface StationBoard {
  trainServices?: ServiceItem[];
  busServices?: ServiceItem[];
  ferryServices?: ServiceItem[];
  qos?: number;
  qosSpecified?: boolean;
  isTruncated?: boolean;
  generatedAt?: string;
  locationName: string;
  crs: string;
  filterLocationName?: string;
  filtercrs?: string;
  filterType?: FilterType;
  stationManager?: string;
  stationManagerCode?: string;
  nrccMessages?: NRCCMessage[];
  platformsAreHidden?: boolean;
  servicesAreUnavailable?: boolean;
}

export interface ServiceItem {
  formation?: FormationData;
  origin: EndPointLocation[];
  destination: EndPointLocation[];
  currentOrigins?: EndPointLocation[];
  currentDestinations?: EndPointLocation[];
  cancelReason?: ReasonCodeWithLocation;
  delayReason?: ReasonCodeWithLocation;
  category?: string;
  activities?: string;
  length?: number;
  isReverseFormation?: boolean;
  detachFront?: boolean;
  futureDelay?: boolean;
  futureCancellation?: boolean;
  diversion?: BaseServiceItemDiversion;
  uncertainty?: UncertaintyType;
  affectedBy?: string;
  rid: string;
  uid: string;
  trainid?: string;
  rsid?: string;
  sdd: string;
  operator?: string;
  operatorCode: string;
  isPassengerService?: boolean;
  isCharter?: boolean;
  isCancelled?: boolean;
  isCircularRoute?: boolean;
  filterLocationCancelled?: boolean;
  filterLocationOperational?: boolean;
  isOperationalCall?: boolean;
  sta?: string;
  staSpecified?: boolean;
  ata?: string;
  ataSpecified?: boolean;
  eta?: string;
  etaSpecified?: boolean;
  arrivalType?: ArrivalDepartureType;
  arrivalTypeSpecified?: boolean;
  arrivalSource?: string;
  arrivalSourceInstance?: string;
  std?: string;
  stdSpecified?: boolean;
  atd?: string;
  atdSpecified?: boolean;
  etd?: string;
  etdSpecified?: boolean;
  departureType?: ArrivalDepartureType;
  departureTypeSpecified?: boolean;
  departureSource?: string;
  departureSourceInstance?: string;
  platform?: string;
  platformIsHidden?: boolean;
  serviceIsSuppressed?: boolean;
  adhocAlerts?: string[];
}

export interface EndPointLocation {
  isOperationalEndPoint?: boolean;
  locationName: string;
  crs: string;
  tiploc?: string;
  via?: string;
  futureChangeTo?: FutureChangeType;
  futureChangeToSpecified?: boolean;
}

export interface ReasonCodeWithLocation {
  tiploc?: string;
  near?: boolean;
  Value?: number;
}

export interface BaseServiceItemDiversion {
  reason?: ReasonCodeWithLocation;
  divertedVia?: BaseServiceItemDiversionDivertedVia;
  between?: BaseServiceItemDiversionBetween;
  rerouteDelay?: number;
}

export interface UncertaintyType {
  reason?: ReasonCodeWithLocation;
  status?: UncertaintyStatus;
}

export interface FormationData {
  serviceLoading?: FormationDataServiceLoading;
  coaches?: CoachData[];
  source?: string;
  sourceInstance?: string;
}

export interface FormationDataServiceLoading {
  loadingCategory?: FormationDataServiceLoadingLoadingCategory;
  loadingPercentage?: FormationDataServiceLoadingLoadingPercentage;
}

export interface FormationDataServiceLoadingLoadingCategory {
  type?: "Typical" | "Expected";
  src?: string;
  srcInst?: string;
  Value?: string;
}

export interface FormationDataServiceLoadingLoadingPercentage {
  type?: "Typical" | "Expected";
  src?: string;
  srcInst?: string;
  Value?: number;
}

export interface CoachData {
  coachClass?: string;
  toilet?: ToiletAvailabilityType;
  loading?: CoachDataLoading;
  number?: string;
}

export interface BaseServiceItemDiversionDivertedVia {
  tiploc?: string;
  Value?: string;
}

export interface BaseServiceItemDiversionBetween {
  start?: string;
  end?: string;
}

export interface NRCCMessage {
  category?: "Trainservice" | "Station" | "Connectingservices" | "Systemrelated" | "Miscellaneous" | "Priortrains" | "Priorother";
  severity: "Normal" | "Minor" | "Major" | "Severe";
  xhtmlMessage: string;
}

// Note: ToiletAvailabilityType and CoachDataLoading interfaces need to be defined based on their schema
// which wasn't visible in the provided swagger excerpt
export interface ToiletAvailabilityType {
  status?: "Unknown"| "InService" |"NotInService";
  Value?: "Unknown" | "None" | "Standard" | "Accessible"
}

export interface CoachDataLoading {
  source?: string;
  sourceInstance?: string;
  Value?: number;
}

export interface ServiceLocation {
  locationName: string;
  tiploc: string;
  crs?: string;
  associations?: any[]; // Type can be refined based on associations structure
  adhocAlerts?: string[];
  activities?: string[];
  length?: number;
  detachFront?: string;
  isOperational?: boolean;
  isPass?: boolean;
  isCancelled?: boolean;
  falseDest?: string;
  fdTiploc?: string;
  platform?: string;
  platformIsHidden?: boolean;
  serviceIsSupressed?: boolean;
  sta?: string;
  staSpecified?: boolean;
  ata?: string;
  ataSpecified?: boolean;
  eta?: string;
  etaSpecified?: boolean;
  arrivalType?: string;
  arrivalTypeSpecified?: boolean;
  arrivalSource?: string;
  arrivalSourceInstance?: string;
  std?: string;
  stdSpecified?: boolean;
  atd?: string;
  atdSpecified?: boolean;
  etd?: string;
  etdSpecified?: boolean;
  departureType?: string;
  departureTypeSpecified?: boolean;
  departureSource?: string;
  departureSourceInstance?: string;
  lateness?: string;
  uncertainty?: string; // Can be refined to enum if UncertaintyType values are known
  affectedBy?: string;
  via?: string; // Keeping existing field
  futureChangeTo?: string; // Keeping existing field
}

export interface ServiceItemLocation {
  name: string;
  tiploc: string;
  crs?: string;
  associations?: any[];
  adhocAlerts?: string[];
  activities?: string[];
  length?: number;
  detachFront?: boolean;
  isOperational?: boolean;
  isPass?: boolean;
  isCancelled?: boolean;
  falseDest?: string;
  fdTiploc?: string;
  platform?: string;
  platformIsHidden?: boolean;
  serviceIsSupressed?: boolean;
  sta?: string;
  staSpecified?: boolean;
  ata?: string;
  ataSpecified?: boolean;
  eta?: string;
  etaSpecified?: boolean;
  arrivalType?: ArrivalDepartureType;
  arrivalTypeSpecified?: boolean;
  arrivalSource?: string;
  arrivalSourceInstance?: string;
  std?: string;
  stdSpecified?: boolean;
  atd?: string;
  atdSpecified?: boolean;
  etd?: string;
  etdSpecified?: boolean;
  departureType?: ArrivalDepartureType;
  departureTypeSpecified?: boolean;
  departureSource?: string;
  departureSourceInstance?: string;
  lateness?: number;
  uncertainty?: UncertaintyType;
  affectedBy?: string;
  via?: string;
  futureChangeTo?: FutureChangeType;
}

export interface ServiceItemWithLocations extends ServiceItem {
  previousLocations?: ServiceItemLocation[];
  subsequentLocations?: ServiceItemLocation[];
}

export interface NRCCMessage {
  severity: "Normal" | "Minor" | "Major" | "Severe";
  xhtmlMessage: string;
}

export interface StationList {
  StationList: Station[];
}

export interface Station {
  crs: string;
  locationName: string;
  sixteenCharLocationName?: string;
}