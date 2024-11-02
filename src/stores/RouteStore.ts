import { Point } from "ol/geom";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { clearRoute, drawRoute } from "../services/map";

export const useRouteStore = defineStore("routeStore", () => {
  const points = ref<Point[]>([]);

  watch(
    () => points.value,
    () => {
      clearRoute();
      drawRoute();
    },
    { deep: true }
  );

  return { points };
});
