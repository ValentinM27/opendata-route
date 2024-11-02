<template>
  <el-drawer
    v-model="toolbarStore.openToolbar"
    :withHeader="false"
    direction="ltr"
  >
    <span>Points</span>

    <ul>
      <li v-for="(point, index) in routeStore.points" :key="index">
        Point {{ index + 1 }} {{ point?.get("adresse-label") }}
      </li>
    </ul>

    <el-button
      type="danger"
      :icon="Delete"
      @click="handleClearRoute"
      v-if="routeStore.points.length > 0"
    >
      Réinitialiser
    </el-button>
  </el-drawer>
</template>

<script setup lang="ts">
import { useToolbarStore } from "../stores/ToolbarStore";
import { useRouteStore } from "../stores/RouteStore";
import { clearRoute } from "../services/map";

import { Delete } from "@element-plus/icons-vue";

const toolbarStore = useToolbarStore();
const routeStore = useRouteStore();

const handleClearRoute = () => {
  clearRoute();
};
</script>
