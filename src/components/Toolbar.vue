<template>
  <el-drawer
    v-model="toolbarStore.openToolbar"
    :withHeader="false"
    direction="ltr"
  >
    <div v-if="routeStore.points.length > 0">
      <span>Points</span>

      <VueDraggableNext :list="routeStore.points" @change="handleOrderChange">
        <div
          v-for="(point, index) in routeStore.points"
          :key="index"
          class="draggable-element"
        >
          <el-tooltip content="Déplacer le point">
            <el-icon><Grid /></el-icon>
          </el-tooltip>
          {{ point.get("adresse-label") ?? `Point ${index + 1}` }}
        </div>
      </VueDraggableNext>

      <el-button type="danger" :icon="Delete" @click="handlefullClearRoute">
        Réinitialiser
      </el-button>
    </div>
    <div v-else>
      <i>La liste des points apparaîtra ici lorsque vous en aurez placé</i>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { useToolbarStore } from "../stores/ToolbarStore";
import { useRouteStore } from "../stores/RouteStore";
import { fullClearRoute, redrawRoute } from "../services/map";
import { VueDraggableNext } from "vue-draggable-next";

import { Delete, Grid } from "@element-plus/icons-vue";

const toolbarStore = useToolbarStore();
const routeStore = useRouteStore();

const handlefullClearRoute = () => {
  fullClearRoute();
};

const handleOrderChange = () => {
  redrawRoute();
};
</script>

<style scoped lang="scss">
.draggable-element {
  .el-icon {
    margin-right: 1rem;
    cursor: grab;
  }

  background: #ecf2fa;

  padding: 15px;
  border-radius: 10px;

  display: flex;
  align-items: center;

  margin: 10px 0px;
  height: 25px;
}
</style>
