<template>
  <el-button type="primary" size="default" @click="addBtn">创建</el-button>
  <div>
    {{ count }}
  </div>
</template>

<script setup lang="ts">
import { testSotre } from "@/store/test/index";
import { computed } from "vue";
//获取store
const store = testSotre();
//cont展示到页面
const count = computed(() => {
  return store.getCount;
});
//点击按钮改变count值
const addBtn = ()=>{
  //方式1
  // store.count++
  //方式2
  store.setCount(++store.count)
  //方式3
  // store.$patch({
  //   count:++store.count
  // })
  //方式4
  // store.$patch((state)=>{
  //   state.count = ++store.count
  // })
}
</script>

<style scoped></style>
