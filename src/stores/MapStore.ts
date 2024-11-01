import { Coordinate } from "ol/coordinate";
import Map from "ol/Map";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useMapStore = defineStore("mapStore", () => {
  const map = ref<Map | undefined>();
  const currentPosition = ref<Coordinate | undefined>();

  return { map, currentPosition };
});
