import Map from "ol/Map";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useMapStore = defineStore("mapStore", () => {
  const map = ref<Map | undefined>();

  return { map };
});
