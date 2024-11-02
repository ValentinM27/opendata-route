import { Point } from "ol/geom";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useRouteStore = defineStore("routeStore", () => {
  const points = ref<Point[]>([]);

  return { points };
});
