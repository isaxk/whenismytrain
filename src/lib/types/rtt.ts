export interface RTTServiceResponse {
  serviceUid: string;
  runDate: string;
  serviceType: string;
  isPassenger: boolean;
  trainIdentity?: string;
  powerType?: string;
  trainClass?: string | null;
  sleeper?: string | null;
  atocCode: string;
  atocName: string;
  performanceMonitored: boolean;
  origin: RTTPair[];
  destination: RTTPair[];
  locations: RTTLocation[];
  realtimeActivated: boolean;
  runningIdentity?: string;
}

export interface RTTPair {
  tiploc?: string;
  description: string;
  workingTime?: string;
  publicTime: string;
}

export interface RTTLocation {
  realtimeActivated: boolean;
  tiploc: string;
  crs?: string;
  platform?: string;
  platformConfirmed?: boolean;
}