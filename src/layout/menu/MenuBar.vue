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
  border-right: none;
  background-color: #90ee90; /* 显式显示菜单背景色 */
}

:deep(.el-sub-menu .el-sub-menu__title) {
  color: #17dd4b !important; /* 子菜单标题颜色 */
}

:deep(.el-menu .el-menu-item) {
  color: #12e031 !important; /* 菜单项默认颜色 */
}

/* 菜单点中文字的颜色 */
:deep(.el-menu-item.is-active) {
  color: #000 !important; /* 激活时字体颜色 */
  background-color: #64dd17 !important; /* 调整选中项背景色 */
}

/* 当前打开菜单的所有子菜单颜色 */
:deep(.is-opened .el-menu-item) {
  background-color: #b9f6ca !important; /* 调整已打开子菜单的背景色 */
}

/* 鼠标移动菜单的颜色 */
:deep(.el-menu-item:hover) {
  background-color: #c8e6c9 !important; /* 调整鼠标悬停时的背景色 */
  outline: 0;
}
</style>
