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
    <el-select
      v-model="routeStore.profile"
      style="width: 250px"
      @change="handleChangeProfile"
    >
      <template #label="{ value }: { value: ProfilOption }">
        <div class="select-label-wrapper">
          <img :src="icon[value].icon" class="select-icons" />
          {{ icon[value].label }}
        </div>
      </template>
      <el-option
        v-for="item in profileOptions"
        :key="item"
        :label="item"
        :value="item"
      >
        <div class="select-label-wrapper">
          <el-icon>
            <img :src="icon[item].icon" class="select-icons" />
          </el-icon>
          {{ icon[item].label }}
        </div>
      </el-option>
    </el-select>
  </el-col>
  <el-col class="actions-container-left">
    <el-button circle @click="openToolbar">
      <el-icon>
        <el-icon><ArrowRight /></el-icon>
      </el-icon>
    </el-button>
  </el-col>
  <el-col class="actions-container-left-bottom">
    <div>
      <a
        href="https://github.com/ValentinM27/opendata-route"
        rel="noreferrer"
        target="_blank"
      >
        GitHub
      </a>

      - © IGN 2023
    </div>
  </el-col>
  <el-col class="actions-container-right-top" v-if="useRouteStore().distance">
    {{ convertDurationToString(routeStore.duration!) }} (
    {{ formatNumber(routeStore.distance!, 2) }} km)
  </el-col>
  <el-col class="actions-container-bottom-center">
    <div v-if="lineData">
      <Line :data="lineData" :options="options" :key="lineKey" />
    </div>
  </el-col>
  <el-col class="actions-container-right">
    <el-popover placement="top" trigger="hover" effect="dark">
      <template #reference>
        <div class="maptype-selector">
          <img :src="maptypeIcon[mapStore.currentMapLayer]" />
        </div>
      </template>
      <div
        class="maptype-selector alternate"
        v-for="mapStyle in MapStyleArray.filter(
          (mapStyle) => mapStyle !== mapStore.currentMapLayer
        )"
      >
        <el-button @click="() => changeMapLayer(mapStyle)">
          <img :src="maptypeIcon[mapStyle]" />
        </el-button>
      </div>
    </el-popover>
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
import { Point as OlPoint } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { ref, watch } from "vue";
import { getAdresses } from "../services/geolocalisation";
import { changeMapLayer, fitExtend, redrawRoute } from "../services/map";
import { useMapStore } from "../stores/MapStore";
import { useToolbarStore } from "../stores/ToolbarStore";
import { Feature } from "../types/geolocalisation";
import { AutocompleteInstance } from "element-plus";
import { useRouteStore } from "../stores/RouteStore";
import { convertDurationToString, formatNumber } from "../services/utils";
import { MapStyleArray } from "../types/map";

// Imports pour ChartJS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScaleOptions,
  LinearScaleOptions,
} from "chart.js";
import { Line } from "vue-chartjs";
import { Elevation } from "../types/altrimetrie";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const toolbarStore = useToolbarStore();
const mapStore = useMapStore();
const routeStore = useRouteStore();

const Car = new URL("../assets/car.png", import.meta.url).href;
const Walk = new URL("../assets/walk.png", import.meta.url).href;

const Ortho = new URL("../assets/ortho.png", import.meta.url).href;
const Osm = new URL("../assets/osm.png", import.meta.url).href;

type AutoComplete = {
  value: string;
  feature: Feature;
};

type LineDataset = {
  label: string;
  backgroundColor: string;
  borderColor: string;
  data: number[];
};

type LineData = {
  labels: string[];
  datasets: LineDataset[];
};

const options = ref({
  maintainAspectRatio: false,
  elements: {
    point: {
      radius: 0,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: <Partial<LinearScaleOptions>>{
      type: "linear",
      beginAtZero: true,
    },
    y: <Partial<LinearScaleOptions>>{
      type: "linear" as ScaleOptions<any>,
      beginAtZero: true,
    },
  },
});

const lineKey = ref(0);

type ProfilOption = keyof typeof icon;
type ProfileOptions = Array<ProfilOption>;

const search = ref("");
const autocomplete = ref<AutocompleteInstance>();

const lineData = ref<LineData | undefined>(undefined);

const profileOptions: ProfileOptions = ["car", "pedestrian"];

const icon = {
  car: {
    icon: Car,
    label: "En voiture",
  },
  pedestrian: {
    icon: Walk,
    label: "À pied",
  },
};

const maptypeIcon = {
  osm: Osm,
  ortho: Ortho,
};

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
  const pointToFocus = new OlPoint(
    fromLonLat(selectedPosition.feature.geometry.coordinates)
  );

  fitExtend(pointToFocus, selectedPosition.feature.properties.type);

  search.value = "";
  autocomplete.value?.blur();
};

const centerOnCurrentPosition = () => {
  if (mapStore.currentPosition) {
    const pointToFocus = new OlPoint(mapStore.currentPosition);

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

const handleChangeProfile = () => {
  redrawRoute();
};

const handleAltimetryData = (altimetryLine: Elevation[]) => {
  let newLineData: LineData = {
    labels: [],
    datasets: [],
  };

  let newDataSet: LineDataset = {
    backgroundColor: "#ff5733",
    borderColor: "#ff5733",
    label: "Profil altimétrique",
    data: [],
  };

  altimetryLine.forEach((altimetryPoint) => {
    const altimetryPointKey = altimetryPoint.lon
      .toString()
      .concat(";")
      .concat(altimetryPoint.lat.toString());

    const pointDistance =
      routeStore.samplePointsDistance.get(altimetryPointKey);

    if (pointDistance) {
      newLineData.labels.push(pointDistance.toString());
      newDataSet.data.push(altimetryPoint.z);
    }
  });

  newLineData.datasets.push(newDataSet);

  options.value.scales.x = {
    ...options.value.scales.x,
    max: routeStore.distance,
  };

  lineData.value = newLineData;

  // Permet de rafraichir le graphiques
  lineKey.value++;
};

watch(
  () => routeStore.altimetryLine,
  (altimetryLine) => {
    if (altimetryLine.length === 0) {
      lineData.value = undefined;
      return;
    }

    handleAltimetryData(altimetryLine);
  }
);
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

.actions-container-left-bottom {
  position: absolute;
  z-index: 1000;
  left: 0;
  bottom: 0;

  div {
    width: fit-content;
    padding: 0 1rem;
    background: #f5f7fa;
  }
}

.actions-container-top {
  position: absolute;
  z-index: 1000;
  left: 50dvw;
  top: 15px;

  transform: translate(-50%, 0);
  width: fit-content;

  padding: 0.5rem;

  display: flex;
  gap: 1rem;

  .el-input__wrapper {
    border-radius: 5px;
  }
}

.actions-container-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  position: absolute;
  z-index: 1000;
  right: 15px;
  bottom: 25px;

  transform: translate(-50%, 0);

  .el-input__wrapper {
    border-radius: 5px;
  }

  .el-row {
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

.maptype-selector {
  border: 2px solid #fff;

  &.alternate {
    border: none;
  }

  height: 46px;
  width: 46px;

  margin-left: auto;
  margin-right: auto;

  border-radius: 10px;
  overflow: hidden;

  .el-button {
    height: 100%;
    width: 100%;
  }

  img {
    cursor: pointer;
    height: 46px;
    width: 46px;
  }
}

.actions-container-right-top {
  position: absolute;
  z-index: 1000;
  right: 15px;
  top: 25px;

  background: #fff;
  border-radius: 5px;
  border: 1px solid #dcdfe6;

  color: #606266;

  height: 30px;
  padding: 5px;

  display: flex;
  align-items: center;
}

.actions-container-bottom-center {
  position: absolute;
  z-index: 1000;

  bottom: 2.5rem;
  left: 50%;
  transform: translate(-50%, 0);

  height: 250px;
  width: fit-content;

  div {
    padding: 1rem;
    height: 250px;
    width: 75dvw;
    border-radius: 15px;
    bottom: 0;
    background: #fff;
  }
}

.select-label-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;

  .select-icons {
    height: auto;
    width: 20px;
  }
}
</style>
