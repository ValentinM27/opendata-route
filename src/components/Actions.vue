<template>
  <el-col class="actions-container-top">
    <el-autocomplete
      v-model="search"
      :fetch-suggestions="querySearch"
      clearable
      placeholder="Rechercher une adresse"
      @select="moveToPosition"
    />
  </el-col>
  <el-col class="actions-container-left">
    <el-button circle @click="openToolbar">
      <el-icon>
        <el-icon><ArrowRight /></el-icon>
      </el-icon>
    </el-button>
  </el-col>
</template>

<script setup lang="ts">
import { ArrowRight } from "@element-plus/icons-vue";
import { useToolbarStore } from "../stores/ToolbarStore";
import { useMapStore } from "../stores/MapStore";
import { ref } from "vue";
import { getAdresses } from "../services/geolocalisation";
import { Feature } from "../types/geolocalisation";
import { Point } from "ol/geom";
import { fitExtend } from "../services/map";
import { fromLonLat } from "ol/proj";

const toolbarStore = useToolbarStore();
const mapStore = useMapStore();

type AutoComplete = {
  value: string;
  feature: Feature;
};

const search = ref("");

const openToolbar = () => {
  toolbarStore.openToolbar = true;
};

const querySearch = async (q: string, cb: any) => {
  if (q.length > 3) {
    const features: Feature[] = await getAdresses(q, mapStore.currentPosition!);

    const autocompleteContent: AutoComplete[] = features.map((feature) => {
      return {
        value: feature.properties.label,
        feature: { ...feature },
      };
    });

    cb(autocompleteContent);
  } else {
    cb([]);
  }
};

const moveToPosition = (selectedPosition: AutoComplete) => {
  const pointToFocus = new Point(
    fromLonLat(selectedPosition.feature.geometry.coordinates)
  );

  fitExtend(pointToFocus, selectedPosition.feature.properties.type);
};
</script>

<style lang="scss">
.actions-container-left {
  position: absolute;
  z-index: 1000;
  left: 0;
  transform: translate(0, -50%);
  top: 50dvh;

  background: #f5f7fa;
  border-radius: 0 15px 15px 0;
  padding: 1rem 0.5rem;
  width: fit-content;
}

.actions-container-top {
  position: absolute;
  z-index: 1000;
  left: 50dvw;
  top: 15px;

  transform: translate(-50%, 0);
  width: 400px;

  .el-input__wrapper {
    border-radius: 5px;
  }
}
</style>
