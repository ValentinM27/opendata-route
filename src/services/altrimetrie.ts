import { Coordinate } from "ol/coordinate";
import { transform } from "ol/proj";
import { ElevationData, LocationConfig } from "../types/altrimetrie";
import { post } from "./api";
import { SAMPLE_RATE } from "../const";
import { useRouteStore } from "../stores/RouteStore";

export const getAltimetryLine = async (coordinates: Coordinate[]) => {
  const lonLat = coordinates.reduce(
    (acc, curr, index) => {
      if (index % SAMPLE_RATE === 0) {
        const [lon, lat] = transform(curr, "EPSG:3857", "EPSG:4326");

        acc.lon.push(lon);
        acc.lat.push(lat);
      }

      return acc;
    },
    { lon: Array<number>(), lat: Array<number>() }
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

  const z = elevationData.elevations.flatMap((elevation) => elevation.z);

  useRouteStore().altimetryLine = z;
};
