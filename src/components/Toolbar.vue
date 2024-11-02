<template>
  <el-drawer
    v-model="toolbarStore.openToolbar"
    :withHeader="false"
    direction="ltr"
  >
    <span>Points</span>

    <VueDraggableNext
      class="dragArea list-group w-full"
      :list="routeStore.points"
      @change="handleOrderChange"
    >
      <div
        class="list-group-item bg-gray-300 m-1 p-3 rounded-md text-center"
        v-for="(point, index) in routeStore.points"
        :key="index"
      >
        {{ point.get("adresse-label") }}
      </div>
    </VueDraggableNext>

    <el-button
      type="danger"
      :icon="Delete"
      @click="handlefullClearRoute"
      v-if="routeStore.points.length > 0"
    >
      Réinitialiser
    </el-button>
  </el-drawer>
</template>

<script setup lang="ts">
import { useToolbarStore } from "../stores/ToolbarStore";
import { useRouteStore } from "../stores/RouteStore";
import { fullClearRoute, redrawRoute } from "../services/map";
import { VueDraggableNext } from "vue-draggable-next";

import { Delete } from "@element-plus/icons-vue";

const toolbarStore = useToolbarStore();
const routeStore = useRouteStore();

const handlefullClearRoute = () => {
  fullClearRoute();
};

const handleOrderChange = () => {
  redrawRoute();
};
</script>
