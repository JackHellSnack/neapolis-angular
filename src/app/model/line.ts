import { RideData } from "./ride-data";

export interface Line {
  id: number;
  name: string;
  type: string;
  provider: string;
  stopInfo: string[];
  stopIds: { [key: number]: number };
  data: RideData[];
}