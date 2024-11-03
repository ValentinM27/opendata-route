import { Feature, View } from "ol";
import { Coordinate } from "ol/coordinate";
import { getWidth } from "ol/extent";
import { LineString, Point } from "ol/geom";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import WMTS from "ol/source/WMTS.js";
import { Fill, Style, Text } from "ol/style";
import WMTSTileGrid from "ol/tilegrid/WMTS";

import { Address, Route } from "../types/geolocalisation";
import {
  getAdresseReverse,
  getCurrentLongitudeLatitude,
  getRoute,
} from "./geolocalisation";

import {
  combinedLineStyle,
  locationMarkerStyle,
  locationMarkerStylePoint,
  outerRingStyle,
  outerRingStylePoint,
} from "./style";

import { useMapStore } from "../stores/MapStore";
import { useRouteStore } from "../stores/RouteStore";
import { MapStyle } from "../types/map";

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
    zIndex: 2,
  });

  map.addLayer(vectorLayer);
};

export const initMap = async () => {
  const currentLongLat = fromLonLat(await getCurrentLongitudeLatitude());

  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
        properties: {
          name: "map-layer",
        },
        zIndex: 1,
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

export const changeMapLayer = (type: MapStyle) => {
  deleteLayer("map-layer");

  switch (type) {
    case "ortho":
      switchToOrtho();
      break;
    case "osm":
    default:
      switchToOsm();
      break;
  }
};

const switchToOrtho = () => {
  const resolutions = [];
  const matrixIds = [];

  const maxResolution =
    getWidth(useMapStore().map!.getView().getProjection().getExtent()) / 256;

  for (let i = 0; i < 20; i++) {
    matrixIds[i] = i.toString();
    resolutions[i] = maxResolution / Math.pow(2, i);
  }

  const tileGrid = new WMTSTileGrid({
    origin: [-20037508, 20037508],
    resolutions: resolutions,
    matrixIds: matrixIds,
  });

  const source = new WMTS({
    url: "https://data.geopf.fr/wmts",
    layer: "HR.ORTHOIMAGERY.ORTHOPHOTOS",
    matrixSet: "PM",
    format: "image/jpeg",
    projection: "EPSG:2154",
    tileGrid: tileGrid,
    style: "normal",
  });

  const ign = new TileLayer({
    source: source,
    properties: {
      name: "map-layer",
    },
    zIndex: 1,
  });

  useMapStore().map?.addLayer(ign);
  useMapStore().currentMapLayer = "ortho";
};

const switchToOsm = () => {
  const newLayer = new TileLayer({
    source: new OSM(),
    properties: {
      name: "map-layer",
    },
    zIndex: 1,
  });

  useMapStore().map?.addLayer(newLayer);
  useMapStore().currentMapLayer = "osm";
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

const deleteLayer = (name: string) => {
  const currentLayer = useMapStore()
    .map?.getLayers()
    .getArray()
    .find((layer) => layer.get("name") == name);

  if (currentLayer) {
    useMapStore().map?.removeLayer(currentLayer);
  }
};

const handleRightClick = (map: Map) => {
  map.on("singleclick", (event) => {
    setPoint(event.coordinate).then(() => drawRoute());
  });
};

const setPoint = async (coordinates: Coordinate) => {
  const adresse: Address | null = await getAdresseReverse(coordinates);

  const point = new Point(coordinates);

  point.set("adresse-label", adresse?.label);

  const layer = getOrCreateLayer("route-points-layer");

  drawPoint(point, layer);

  useRouteStore().points.push(point);
};

const drawPoint = (
  point: Point,
  layer: VectorLayer,
  currentIndex: number = useRouteStore().points.length + 1
) => {
  const feature = new Feature(point);

  const labelStyle = new Style({
    text: new Text({
      font: "10px Verdana",
      text: currentIndex.toString(),
      fill: new Fill({ color: "#fff" }),
    }),
    zIndex: 10,
  });

  feature.setStyle([outerRingStylePoint, locationMarkerStylePoint, labelStyle]);

  layer.setZIndex(4);

  let vectorSource = layer.getSource();

  if (!vectorSource) {
    vectorSource = new VectorSource();
    layer.setSource(vectorSource);
  }

  vectorSource.addFeature(feature);
};

export const drawPoints = () => {
  const layer = getOrCreateLayer("route-points-layer");

  useRouteStore().points.forEach((point, index) => {
    drawPoint(point as Point, layer, index + 1);
  });
};

export const drawRoute = async () => {
  const route: Route | null = await getRoute(useRouteStore().points as Point[]);

  if (!route) return;

  const lineString = new LineString(route.coordinates);

  const feature = new Feature(lineString);

  feature.setStyle(combinedLineStyle);

  const layer = getOrCreateLayer("route-layer");

  layer.setZIndex(2);

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

export const fullClearRoute = () => {
  useRouteStore().reset();
  clearRoute();
};

export const clearRoute = () => {
  deleteLayer("route-layer");
  deleteLayer("route-points-layer");
};

export const redrawRoute = () => {
  clearRoute();
  drawPoints();
  drawRoute();
};

export const deletePoint = (index: number) => {
  useRouteStore().points.splice(index, 1);
  redrawRoute();
};
