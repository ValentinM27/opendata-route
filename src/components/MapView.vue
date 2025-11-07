<template>
  <div id="map" class="map"></div>
</template>

<script setup lang="ts">
  import { initMap } from "../services/map";
  import { onMounted } from "vue";

  onMounted(() => {
    initMap();
  });
</script>

<style scoped lang="scss">
  #map {
    height: 100dvh;
    width: 100dvw;
  }
</style>
