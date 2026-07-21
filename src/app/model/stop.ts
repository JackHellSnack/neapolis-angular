import { Line } from "./line";

export interface Stop {
  id: number;
  road: string;
  city: string;
  lat: number;
  lon: number;
  name: string;
  lines: Line[];
  lineIds: { [key: number]: number };
}