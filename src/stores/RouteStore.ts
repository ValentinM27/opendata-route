import { Point } from "ol/geom";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useRouteStore = defineStore("routeStore", () => {
  const points = ref<Point[]>([]);
  const distance = ref<number | undefined>(undefined);
  const duration = ref<number | undefined>(undefined);

  const reset = () => {
    points.value = [];
    distance.value = undefined;
    duration.value = undefined;
  };

  return { points, distance, duration, reset };
});
