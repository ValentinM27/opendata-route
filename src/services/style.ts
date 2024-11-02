import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";

// Position actuelle
const innerCircleFill = new Fill({
  color: "rgba(66, 133, 244, 1)",
});

const innerCircle = new CircleStyle({
  radius: 5,
  fill: innerCircleFill,
});

const outerRingStroke = new Stroke({
  color: "rgba(66, 133, 244, 0.4)",
  width: 4,
});

const outerRing = new CircleStyle({
  radius: 7,
  stroke: outerRingStroke,
});

const locationMarkerStyle = new Style({
  image: innerCircle,
  zIndex: 10,
});

const outerRingStyle = new Style({
  image: outerRing,
  zIndex: 9,
});

// Ligne de l'itinéraire
const redLineStyle = new Style({
  stroke: new Stroke({
    color: "rgba(252, 82, 0, 1)",
    width: 3,
  }),
  zIndex: 4,
});

const outerLineStyle = new Style({
  stroke: new Stroke({
    color: "rgba(255, 255, 255, 1)",
    width: 7,
  }),
  zIndex: 3,
});

const combinedLineStyle = [outerLineStyle, redLineStyle];

// Point de passage
const innerCircleFillPoint = new Fill({
  color: "rgba(99 ,98, 92, 1)",
});

const innerCirclePoint = new CircleStyle({
  radius: 5,
  fill: innerCircleFillPoint,
});

const outerRingStrokePoint = new Stroke({
  color: "rgba(255, 255, 255, 1)",
  width: 4,
});

const outerRingPoint = new CircleStyle({
  radius: 5,
  stroke: outerRingStrokePoint,
});

const locationMarkerStylePoint = new Style({
  image: innerCirclePoint,
  zIndex: 10,
});

const outerRingStylePoint = new Style({
  image: outerRingPoint,
  zIndex: 9,
});

export {
  locationMarkerStyle,
  outerRingStyle,
  combinedLineStyle,
  locationMarkerStylePoint,
  outerRingStylePoint,
};
