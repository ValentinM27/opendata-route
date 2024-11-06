import { Coordinate } from "ol/coordinate";
import { transform } from "ol/proj";
import { ElevationData, LocationConfig } from "../types/altrimetrie";
import { post } from "./api";
import { useRouteStore } from "../stores/RouteStore";
import * as olSphere from "ol/sphere";
import { SAMPLE_SIZE } from "../const";

type AltimetryReduce = {
  lon: Array<number>;
  lat: Array<number>;
  previousPoint: Coordinate | null;
  currentDistance: number;
  samplePointsDistance: Map<string, number>;
};

export const getAltimetryLine = async (coordinates: Coordinate[]) => {
  // Par défaut, on prend tout les points
  let sampleRate = 1;

  // Si le nombre de points est supérieur au maximum admis alors on calcul un taux de sample ajusté
  if (coordinates.length > SAMPLE_SIZE) {
    sampleRate = Math.floor(coordinates.length / SAMPLE_SIZE);
  }

  const lonLat = coordinates.reduce<AltimetryReduce>(
    (acc, curr, index) => {
      const [lon, lat] = transform(curr, "EPSG:3857", "EPSG:4326");

      // On calcule la distance du point courrant par rapport au précédent
      // pour pouvoir lié les points du sample altimétrique à leur distance donnée
      if (acc.previousPoint) {
        const [prevLon, prevLat] = transform(
          acc.previousPoint,
          "EPSG:3857",
          "EPSG:4326"
        );

        const distance =
          olSphere.getDistance([prevLon, prevLat], [lon, lat]) / 1000;

        acc.currentDistance += distance;
      }

      acc.previousPoint = curr;

      // On retient les points tout n points en fonction du sampleRate
      // et on conserve également le dernier point
      if (index % sampleRate === 0 || index === coordinates.length - 1) {
        acc.lon.push(lon);
        acc.lat.push(lat);

        const lonLatKey = lon.toString().concat(";").concat(lat.toString());

        acc.samplePointsDistance.set(lonLatKey, acc.currentDistance);
      }

      return acc;
    },
    {
      lon: Array<number>(),
      lat: Array<number>(),
      previousPoint: null,
      currentDistance: 0,
      samplePointsDistance: new Map(),
    }
  );

  const joinedLon = lonLat.lon.join("|");
  const joinedLat = lonLat.lat.join("|");

  const locationConfig: LocationConfig = {
    lon: joinedLon,
    lat: joinedLat,
    indent: "false",
    measures: "false",
    resource: "ign_rge_alti_wld",
    profile_mode: "simple",
    delimiter: "|",
    sampling: 2,
  };

  const elevationData = await post<ElevationData>(
    "https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevationLine.json",
    locationConfig
  );

  const elevations = elevationData.elevations.flatMap((elevation) => elevation);

  useRouteStore().altimetryLine = elevations;
  useRouteStore().samplePointsDistance = lonLat.samplePointsDistance;
};
