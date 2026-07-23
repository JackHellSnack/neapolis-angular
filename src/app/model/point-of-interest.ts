export default interface PointOfInterest {
  id?: number;
  name: string;
  category: string;
  lat: number;
  lon: number;
  stopId: number;
}