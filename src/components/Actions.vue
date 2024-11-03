<template>
  <el-col class="actions-container-top">
    <el-autocomplete
      v-model="search"
      ref="autocomplete"
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
  <el-col class="actions-container-right-top" v-if="useRouteStore().distance">
    {{ convertDurationToString(routeStore.duration!) }} (
    {{ formatNumber(routeStore.distance!, 2) }} km)
  </el-col>
  <el-col class="actions-container-right" :gutter="2">
    <el-row>
      <div class="zooms">
        <el-tooltip content="Zoomer" placement="left">
          <el-button @click="zoom">
            <el-icon>
              <el-icon><ZoomIn /></el-icon>
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="Dézoomer" placement="left">
          <el-button @click="unZoom">
            <el-icon>
              <el-icon><ZoomOut /></el-icon>
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </el-row>
    <el-row>
      <el-tooltip content="Centrer sur la position actuelle" placement="left">
        <el-button circle @click="centerOnCurrentPosition">
          <el-icon>
            <el-icon><Aim /></el-icon>
          </el-icon>
        </el-button>
      </el-tooltip>
    </el-row>
  </el-col>
</template>

<script setup lang="ts">
import { ArrowRight, Aim, ZoomIn, ZoomOut } from "@element-plus/icons-vue";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { ref } from "vue";
import { getAdresses } from "../services/geolocalisation";
import { fitExtend } from "../services/map";
import { useMapStore } from "../stores/MapStore";
import { useToolbarStore } from "../stores/ToolbarStore";
import { Feature } from "../types/geolocalisation";
import { AutocompleteInstance } from "element-plus";
import { useRouteStore } from "../stores/RouteStore";
import { convertDurationToString, formatNumber } from "../services/utils";

const toolbarStore = useToolbarStore();
const mapStore = useMapStore();
const routeStore = useRouteStore();

type AutoComplete = {
  value: string;
  feature: Feature;
};

const search = ref("");
const autocomplete = ref<AutocompleteInstance>();

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

  search.value = "";
  autocomplete.value?.blur();
};

const centerOnCurrentPosition = () => {
  if (mapStore.currentPosition) {
    const pointToFocus = new Point(mapStore.currentPosition);

    fitExtend(pointToFocus, "housenumber");
  }
};

const zoom = () => {
  const maxZoom = mapStore.map?.getView().getMaxZoom() ?? 1;
  let currentZoom = mapStore.map?.getView().getZoom() ?? 1;

  if (currentZoom < maxZoom) currentZoom++;

  mapStore.map?.getView().setZoom(currentZoom);
};

const unZoom = () => {
  const minZoom = mapStore.map?.getView().getMinZoom() ?? 1;
  let currentZoom = mapStore.map?.getView().getZoom() ?? 1;

  if (currentZoom > minZoom) currentZoom--;

  mapStore.map?.getView().setZoom(currentZoom);
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

.actions-container-right {
  position: absolute;
  z-index: 1000;
  right: 15px;
  bottom: 25px;

  transform: translate(-50%, 0);

  .el-input__wrapper {
    border-radius: 5px;
  }

  .el-row {
    margin-bottom: 10px;
    justify-content: center;
  }

  .zooms {
    .el-button {
      margin: 0;

      &:first-child {
        border-radius: 10px 10px 0px 0px;
      }

      &:last-child {
        border-radius: 0px 0px 10px 10px;
      }
    }

    display: flex;
    flex-direction: column;
  }
}

.actions-container-right-top {
  position: absolute;
  z-index: 1000;
  right: 15px;
  top: 15px;

  background: #fff;
  border-radius: 10px;

  height: 30px;
  padding: 5px;

  display: flex;
  align-items: center;
}
</style>
