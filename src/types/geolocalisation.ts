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

export type ApiAdressResponse = {
  features: {
    properties: Address;
  }[];
};

export type Route = {
  coordinates: Coordinate[];
};

export type GeoportailRouteResponse = {
  geometry: Route;
};
