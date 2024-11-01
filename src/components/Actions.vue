<template>
  <el-col class="actions-container">
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

const toolbarStore = useToolbarStore();

const openToolbar = () => {
  toolbarStore.openToolbar = true;
};
</script>

<style scoped lang="scss">
.actions-container {
  position: absolute;
  z-index: 1000;
  left: 0;
  top: 50dvh;

  background: #f5f7fa;
  border-radius: 0 15px 15px 0;
  padding: 1rem 0.5rem;
  width: fit-content;
}
</style>
