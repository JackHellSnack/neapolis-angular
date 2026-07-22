export default interface RideData {
  id: number;

  lineId: number;
  lineInfo: string;

  rideStart: string; // LocalTime -> formato "HH:mm:ss"

  fromOrigin: boolean;
  garanteed: boolean;
}