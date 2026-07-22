export default interface RideSearch{
  startTime: string;      // formato HH:mm:ss
  arrivalTime: string;    // formato HH:mm:ss

  startStopId?: number;
  arrivalStopId?: number;
  lineId?: number;

  startStopInfo?: string;
  arrivaStopInfo?: string;
}