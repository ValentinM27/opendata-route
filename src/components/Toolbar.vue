<template>
  <el-drawer
    v-model="toolbarStore.openToolbar"
    :withHeader="false"
    direction="ltr"
    size="400px"
  >
    <div v-if="routeStore.points.length > 0" class="point-list-container">
      <span>Points</span>

      <VueDraggableNext :list="routeStore.points" @change="handleOrderChange">
        <div
          v-for="(point, index) in routeStore.points"
          :key="index"
          class="draggable-element"
        >
          <el-col :span="2">
            <el-tooltip content="Déplacer le point">
              <el-icon><Grid /></el-icon>
            </el-tooltip>
          </el-col>
          <el-col :span="18" class="label-container">
            {{ point.get("adresse-label") ?? `Point ${index + 1}` }}
          </el-col>
          <el-col :span="4" class="delete-container">
            <el-tooltip content="Supprimer le point">
              <el-button
                type="danger"
                :icon="Delete"
                @click="() => handleDeletePoint(index)"
              />
            </el-tooltip>
          </el-col>
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
import { deletePoint, fullClearRoute, redrawRoute } from "../services/map";
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

const handleDeletePoint = (index: number) => {
  deletePoint(index);
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
  border-radius: 5px;
  border: 1px solid #dcdfe6;

  color: #606266;

  display: flex;
  align-items: center;

  margin: 10px 0px;
  height: 45px;

  .el-col {
    display: flex;
    align-items: center;
  }

  .label-container {
    width: 100%;
    height: 45px;
  }

  .delete-container {
    justify-content: end;
  }
}

.point-list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
