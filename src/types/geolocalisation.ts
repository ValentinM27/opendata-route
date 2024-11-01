import { Coordinate } from "ol/coordinate";

export type Address = {
  label: string;
  score: number;
  housenumber: string;
  id: string;
  name: string;
  postcode: string;
  citycode: string;
  x: number;
  y: number;
  city: string;
  context: string;
  type: string;
  importance: number;
  street: string;
  distance: number;
};

export type Geometry = {
  type: string;
  coordinates: Coordinate;
};

export type Feature = {
  geometry: Geometry;
  properties: Address;
};

export type ApiAdressResponse = {
  features: Feature[];
};

export type Route = {
  coordinates: Coordinate[];
};

export type GeoportailRouteResponse = {
  geometry: Route;
};
