// routing
export interface RouteDefinitions {
  [sourcePath: string]: any;
}

export interface DefineReturn {
  path: string;
  value: any;
  location: Location;
}

// history stuffz
export type Path = string;
export type Search = string;
export type Query = Object;
export type LocationState = Object;
export type Action = 'PUSH' | 'REPLACE' | 'POP';
export type LocationKey = string;
export type Hash = string;
export type Pathname = string;

export interface Location {
  pathname?: Pathname;
  search?: Search;
  query?: Query;
  state?: LocationState;
  action?: Action;
  key?: LocationKey;
}

export type LocationDescriptor = LocationDescriptorObject | Path;

export interface LocationDescriptorObject {
  pathname?: Pathname;
  search?: Search;
  query?: Query;
  state?: LocationState;
}
