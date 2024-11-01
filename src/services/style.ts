import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";

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

const redLineStyle = new Style({
  stroke: new Stroke({
    color: "red",
    width: 3,
    lineDash: [10, 5],
  }),
});

export { locationMarkerStyle, outerRingStyle, redLineStyle };
