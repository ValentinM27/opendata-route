import { Feature, View } from "ol";
import { Coordinate } from "ol/coordinate";
import { Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";

import { getCurrentLongitudeLatitude, getAdresse } from "./geolocalisation";
import { locationMarkerStyle, outerRingStyle } from "./style";
import { Address } from "../types/geolocalisation";
import { useMapStore } from "../stores/MapStore";
import BaseLayer from "ol/layer/Base";
import { useRouteStore } from "../stores/RouteStore";

const mapStore = useMapStore();
const routeStore = useRouteStore();

export const setCurrentPosition = async (map: Map, position: Coordinate) => {
  const point = new Point(position);
  const features = new Feature(point);

  features.setStyle([outerRingStyle, locationMarkerStyle]);

  const vectorSource = new VectorSource({
    features: [features],
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    properties: {
      name: "current-location-layer",
    },
  });

  map.addLayer(vectorLayer);
};

export const initMap = async () => {
  const currentLongLat = fromLonLat(await getCurrentLongitudeLatitude());

  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    target: "map",
    view: new View({
      center: currentLongLat,
      zoom: 14,
      projection: "EPSG:3857",
    }),
    controls: [],
  });

  mapStore.map = map;

  setCurrentPosition(map, currentLongLat);
  handleRightClick(map);
};

const getOrCreateLayer = <T extends VectorLayer & BaseLayer>(
  name: string
): T => {
  const currentLayer = mapStore.map
    ?.getLayers()
    .getArray()
    .find((layer) => layer.get("name") == name);

  if (currentLayer != null) return currentLayer as T;

  const newLayer = new VectorLayer({
    properties: {
      name: name,
    },
  }) as T;

  mapStore.map?.addLayer(newLayer);

  return newLayer;
};

const handleRightClick = (map: Map) => {
  map.on("singleclick", (event) => {
    setPoint(event.coordinate);
  });
};

const setPoint = async (coordinates: Coordinate) => {
  const adresse: Address | null = await getAdresse(coordinates);

  const point = new Point(coordinates);
  point.set("adresse-label", adresse?.label);

  const feature = new Feature(point);

  const layer = getOrCreateLayer("route-layer");

  let vectorSource = layer.getSource();

  if (!vectorSource) {
    vectorSource = new VectorSource();
    layer.setSource(vectorSource);
  }

  vectorSource.addFeature(feature);

  routeStore.points.push(point);
};
