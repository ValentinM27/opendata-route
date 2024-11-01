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
      name: "current-location",
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

  setCurrentPosition(map, currentLongLat);
  handleRightClick(map);
};

const handleRightClick = (map: Map) => {
  map.on("singleclick", (event) => {
    setPoint(event.coordinate);
  });
};

const setPoint = (coordinates: Coordinate) => {
  getAdresse(coordinates);
};
