<template>
  <el-col id="map-layout">
    <MapView />
    <Toolbar />
    <Actions />
  </el-col>
</template>

<script setup lang="ts">
  import Actions from "../components/Actions.vue";
  import MapView from "../components/MapView.vue";
  import Toolbar from "../components/Toolbar.vue";
</script>

<style scoped lang="scss">
  #map-layout {
    position: relative;
  }
</style>
