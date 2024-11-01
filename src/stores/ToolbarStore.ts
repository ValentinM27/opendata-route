import { defineStore } from "pinia";
import { ref } from "vue";

export const useToolbarStore = defineStore("toolbarStore", () => {
  const openToolbar = ref<boolean>(false);

  return { openToolbar };
});
