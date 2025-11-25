<template>
  <MenuLogo></MenuLogo>
  <el-menu
    id="mymenu"
    :default-active="defaultActive"
    class="el-menu-vertical-demo"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
    background-color="#90ee90"
    unique-opened
    router
  >
    <MenuItem :menuList="menuList"></MenuItem>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { menuStore } from "@/store/menu/index";
import { useRoute } from "vue-router";
import MenuItem from "./MenuItem.vue";
import MenuLogo from "./MenuLogo.vue";

//获取store
const store = menuStore();
//获取状态
const isCollapse = computed(() => {
  return store.getCollapse;
});
const route = useRoute();
//定义响应式数据
// const isCollapse = ref(false)
//当前激活的菜单:当前激活的菜单
const defaultActive = computed(() => {
  const { path } = route;
  console.log(path)
  return path;
});
//菜单数据
const menuList = computed(() => {
  return store.getMenu as any;
});

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
</script>

<style scoped lang="scss">
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 230px;
  min-height: 400px;
}
.el-menu {
  background-color: #f5f7fa;
}

:deep(.el-sub-menu__title) {
  color: #4a4a4a !important;
}

:deep(.el-menu-item) {
  color: #555 !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #4A90E2 !important;
  color: #fff !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #e8eef6 !important;
  color: #4A90E2 !important;
}
</style>
