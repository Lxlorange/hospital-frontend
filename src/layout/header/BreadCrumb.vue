<template>
  <el-breadcrumb class="bred" separator="/">
    <el-breadcrumb-item v-for="item in tabs">{{
      item.meta.title
    }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, Ref, watch } from "vue";
import { useRoute, RouteLocationMatched } from "vue-router";
const route = useRoute();
//定义面包屑导航数据
const tabs: Ref<RouteLocationMatched[]> = ref([]);
//获取面包屑数据
const getBredcrumb = () => {
  let mached = route.matched.filter((item) => item.meta && item.meta.title);
  //获取第一个数据
  const first = mached[0];
  //判断是否是数据中台，不是，自己构造
  if (first.path !== "/dataPlat") {
    mached = [{ path: "/dataPlat", meta: { title: "数据中台" } } as any].concat(
      mached
    );
  }
  let mac = filters(mached);
  tabs.value = mac;
};
//过滤重复的数据
const filters = (arr: any) => {
  return arr.filter(
    (obj: any, index: any) =>
      arr.findIndex((item: any) => item.meta.title === obj.meta.title) === index
  );
};
getBredcrumb();
//监听当前路由
watch(
  () => route.path,
  () => getBredcrumb()
);
</script>

<style scoped lang="scss">
.bred {
  margin-left: 20px;
}
//修改字体颜色
:deep(.el-breadcrumb__inner) {
  color: var(--el-text-color-bred) !important;
}
:deep(.el-breadcrumb__inner a) {
  color: var(--el-text-color-bred) !important;
}
//分割线颜色
:deep(.el-breadcrumb__separator) {
  color: var(--el-text-color-separator) !important;
}
// 修改字体大小
:deep(.el-breadcrumb__item) {
  font-size: var(--el-text-bred-font-size) !important;
}
</style>
