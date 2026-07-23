export default interface RouteLeg {
  lineId: number;
  lineName: string;
  fromStopId: number;
  fromStopName: string;
  toStopId: number;
  toStopName: string;
  departureTime: string; // "HH:mm:ss"
  arrivalTime: string;
}