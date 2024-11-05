import { Point } from "ol/geom";
import { defineStore } from "pinia";
import { ref } from "vue";
import { Elevation } from "../types/altrimetrie";

export const useRouteStore = defineStore("routeStore", () => {
  const points = ref<Point[]>([]);
  const distance = ref<number | undefined>(undefined);
  const duration = ref<number | undefined>(undefined);

  const altimetryLine = ref<Array<Elevation>>([]);
  const samplePointsDistance = ref<Map<string, number>>(new Map());

  const profile = ref<"pedestrian" | "car">("car");

  const reset = () => {
    points.value = [];
    distance.value = undefined;
    duration.value = undefined;
    profile.value = "car";
    altimetryLine.value = [];
    samplePointsDistance.value = new Map();
  };

  return {
    points,
    distance,
    duration,
    profile,
    altimetryLine,
    samplePointsDistance,
    reset,
  };
});
