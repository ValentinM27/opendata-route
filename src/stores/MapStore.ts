import { Coordinate } from "ol/coordinate";
import Map from "ol/Map";
import { defineStore } from "pinia";
import { ref } from "vue";
import { MapStyle } from "../types/map";

export const useMapStore = defineStore("mapStore", () => {
  const map = ref<Map | undefined>();
  const currentPosition = ref<Coordinate | undefined>();

  const currentMapLayer = ref<MapStyle>("osm");

  return { map, currentPosition, currentMapLayer };
});
