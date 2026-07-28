import RouteLeg from './route-leg';

export default interface JourneyStatus {
  status: string;
  finished: boolean;
  currentLegIndex: number | null;
  currentLeg: RouteLeg | null;
  legs: RouteLeg[] | null;
  currentPositionDescription: string | null;
  nextActionDescription: string | null;
}