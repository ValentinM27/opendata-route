<template>
  <el-drawer
    v-model="toolbarStore.openToolbar"
    :withHeader="false"
    direction="ltr"
  >
    <span>Points</span>

    <ul>
      <li v-for="(point, index) in routeStore.points" :key="index">
        {{ point }}
      </li>
    </ul>
  </el-drawer>
</template>

<script setup lang="ts">
import { useToolbarStore } from "../stores/ToolbarStore";
import { useRouteStore } from "../stores/RouteStore";

const toolbarStore = useToolbarStore();
const routeStore = useRouteStore();
</script>
