import Line from "./line";
import MapIdDelta from "./map-id-delta";


export default interface Stop {
  id: number;

  road: string;
  city: string;

  lat: number;
  lon: number;

  name: string;

  lines: Line[];

  lineIds: MapIdDelta[];
}