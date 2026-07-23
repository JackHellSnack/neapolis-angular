export default interface PoiSearchRequest {
  lat: number;
  lon: number;
  poiId: number;
  time?: string; // "HH:mm:ss" - se omesso il backend usa l'ora corrente
  searchByArrival: boolean;
}