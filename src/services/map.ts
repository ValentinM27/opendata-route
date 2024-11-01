import { Feature, View } from "ol";
import { Coordinate } from "ol/coordinate";
import { LineString, Point } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";

import BaseLayer from "ol/layer/Base";
import { Address, Route } from "../types/geolocalisation";
import {
  getAdresseReverse,
  getCurrentLongitudeLatitude,
  getRoute,
} from "./geolocalisation";
import { locationMarkerStyle, outerRingStyle, redLineStyle } from "./style";

import { useMapStore } from "../stores/MapStore";
import { useRouteStore } from "../stores/RouteStore";

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

  useMapStore().map = map;
  useMapStore().currentPosition = currentLongLat;

  setCurrentPosition(map, currentLongLat);
  handleRightClick(map);
};

const getOrCreateLayer = <T extends VectorLayer & BaseLayer>(
  name: string
): T => {
  const currentLayer = useMapStore()
    .map?.getLayers()
    .getArray()
    .find((layer) => layer.get("name") == name);

  if (currentLayer != null) return currentLayer as T;

  const newLayer = new VectorLayer({
    properties: {
      name: name,
    },
  }) as T;

  useMapStore().map?.addLayer(newLayer);

  return newLayer;
};

const handleRightClick = (map: Map) => {
  map.on("singleclick", (event) => {
    setPoint(event.coordinate);
  });
};

const setPoint = async (coordinates: Coordinate) => {
  const adresse: Address | null = await getAdresseReverse(coordinates);

  const point = new Point(coordinates);
  point.set("adresse-label", adresse?.label);

  const feature = new Feature(point);

  const layer = getOrCreateLayer("route-points-layer");

  let vectorSource = layer.getSource();

  if (!vectorSource) {
    vectorSource = new VectorSource();
    layer.setSource(vectorSource);
  }

  vectorSource.addFeature(feature);

  useRouteStore().points.push(point);

  drawRoute();
};

const drawRoute = async () => {
  const route: Route | null = await getRoute(useRouteStore().points as Point[]);

  if (!route) return;

  const lineString = new LineString(route.coordinates);

  const feature = new Feature(lineString);
  feature.setStyle([redLineStyle]);

  const layer = getOrCreateLayer("route-layer");

  let vectorSource = layer.getSource();

  if (!vectorSource) {
    vectorSource = new VectorSource();
    layer.setSource(vectorSource);
  }

  vectorSource.addFeature(feature);
};

const zoomLevels = {
  housenumber: 17,
  street: 15,
  locality: 13,
  municipality: 11,
};

export const fitExtend = (point: Point, type: string) => {
  const zoomLevel = zoomLevels[type as keyof typeof zoomLevels] || 12;
  const view = useMapStore().map?.getView();

  if (view && point) {
    view.fit(point, {
      maxZoom: zoomLevel,
    });
  }
};
