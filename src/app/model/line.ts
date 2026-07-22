import MapIdDelta from "./map-id-delta";
import RideData from "./ride-data";


export default interface Line {
  id: number;
  name: string;
  type: string;
  provider: string;

  stopInfo: string[];
  stopIds: MapIdDelta[];

  data: RideData[];
}