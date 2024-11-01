import { Point } from "ol/geom";
import { CENTRE_FRANCE_LAT_LONG } from "../const";
import { Coordinate } from "ol/coordinate";
import { get } from "./api";
import { transform } from "ol/proj";
import {
  Address,
  ApiAdressResponse,
  Feature,
  GeoportailRouteResponse,
  Route,
} from "../types/geolocalisation";
import { divideArray } from "./utils";

export const getCurrentLongitudeLatitude = (): Promise<number[]> => {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude]);
      },
      () => {
        resolve(CENTRE_FRANCE_LAT_LONG);
      }
    );
  });
};

export const getRoute = async (points: Point[]): Promise<Route | null> => {
  if (points.length < 2) return null;

  const {
    start: startPoint,
    body: intermediatesPoints,
    end: endPoint,
  } = divideArray(points);

  const start = encodeURIComponent(startPoint[0].getCoordinates().toString());

  const intermediates = encodeURIComponent(
    intermediatesPoints
      .map((intermediatePoint) => intermediatePoint.getCoordinates().toString())
      .join("|")
  );

  const end = encodeURIComponent(endPoint[0].getCoordinates().toString());

  const url = getGeoplateformeUrl(start, end, intermediates, "car", "fastest");

  return (await get<GeoportailRouteResponse>(url)).geometry;
};

/**
 *
 * @param start @param end doivent être exprimé EPSG:3857
 * @param intermediates liste sous forme de string avec les coordonnées des points intermédiaires séparées par un pipe
 */
const getGeoplateformeUrl = (
  start: string,
  end: string,
  intermediates: string,
  profile: "pedestrian" | "car",
  optimization: "shortest" | "fastest"
) => {
  return `https://data.geopf.fr/navigation/itineraire?resource=bdtopo-osrm&start=${start}&end=${end}&profile=${profile}&optimization=${optimization}&constraints=%7B%22constraintType%22%3A%22banned%22%2C%22key%22%3A%22wayType%22%2C%22operator%22%3A%22%3D%22%2C%22value%22%3A%22autoroute%22%7D&getSteps=true&getBbox=true&distanceUnit=kilometer&timeUnit=hour&crs=EPSG%3A3857&intermediates=${intermediates}`;
};

export const getAdresseReverse = async (
  coordinates: Coordinate
): Promise<Address | null> => {
  const [lon, lat] = transform(coordinates, "EPSG:3857", "EPSG:4326");

  const res = await get<ApiAdressResponse>(
    `https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}&limit=1`
  );

  if (res.features.length === 0) {
    return null;
  }

  const adresse: Address = res.features[0].properties;

  return adresse;
};

export const getAdresses = async (
  q: string,
  coordinates: Coordinate
): Promise<Feature[]> => {
  const [lon, lat] = transform(coordinates, "EPSG:3857", "EPSG:4326");

  const res = await get<ApiAdressResponse>(
    `https://api-adresse.data.gouv.fr/search/?q=${q}&lat=${lat}&lon=${lon}`
  );

  console.log(res);

  if (res.features.length === 0) {
    return Array<Feature>();
  }

  return res.features;
};
