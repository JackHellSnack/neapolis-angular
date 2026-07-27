export default interface PoiSearchRequest {
  lat: number;   // user latitudine
  lon: number;   // user longitudine
  poiId: number;
  time?: string; // "HH:mm:ss" - se omesso il backend usa l'ora corrente
  searchByArrival?: boolean;
}