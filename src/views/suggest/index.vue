<template>
    <el-main>
      <!-- 查询栏 -->
      <el-form :model="searchParm" :inline="true" size="default">
        <el-form-item>
          <el-input
            v-model="searchParm.name"
            placeholder="输入关键字"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" @click="searchBtn">查询</el-button>
          
        </el-form-item>
      </el-form>
      <!-- 表格数据 -->
      <el-table :height="tableHeight" :data="tableList" border stripe>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="content" label="反馈内容"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column
          v-if="global.$hasPerm(['sys:suggest:delete'])"
          label="操作"
          align="center"
          width="120"
        >
          <template #default="scope">
            <el-button
              v-if="global.$hasPerm(['sys:suggest:delete'])"
              type="danger"
              icon="Delete"
              size="default"
              @click="deleteBtn(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="sizeChange"
        @current-change="currentChange"
        :current-page.sync="searchParm.currentPage"
        :page-sizes="[10, 20, 40, 80, 100]"
        :page-size="searchParm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="searchParm.total"
        background
      >
      </el-pagination>
    </el-main>
  </template>
  
  <script setup lang="ts">
  import { nextTick, onMounted, reactive, ref } from "vue";
  
  import useInstance from "@/hooks/useInstance";
  import {
    getListApi,
    deleteApi,
  } from "@/api/suggest/index";
  import { ElMessage } from "element-plus";
  const { global } = useInstance();

  const searchParm = reactive({
    currentPage: 1,
    pageSize: 10,
    name: "",
    total: 0,
  });
 
  //删除
  const deleteBtn = async (id: string) => {
    //信息确定
    const confirm = await global.$myconfirm("确定删除该数据吗？");
    console.log(confirm);
    if (confirm) {
      let res = await deleteApi(id);
      if (res && res.code == 200) {
        ElMessage.success(res.msg);
        //刷新列表
        getList();
      }
    }
  };
  
  //表格数据
  const tableList = ref([]);
  //获取表格数据
  const getList = async () => {
    let res = await getListApi(searchParm);
    if (res && res.code == 200) {
      tableList.value = res.data.records;
      searchParm.total = res.data.total;
    }
  };
  //查询
  const searchBtn = () => {
    searchParm.currentPage = 1;
    getList();
  };
  //重置
  const resetBtn = () => {
    searchParm.name = "";
    searchParm.currentPage = 1;
    getList();
  };
  //页容量改变时触发
  const sizeChange = (size: number) => {
    searchParm.pageSize = size;
    getList();
  };
  //页数改变时触发
  const currentChange = (page: number) => {
    searchParm.currentPage = page;
    getList();
  };
  //表格高度
  const tableHeight = ref(0);
  onMounted(() => {
    getList();
    nextTick(() => {
      tableHeight.value = window.innerHeight - 230;
    });
  });
  </script>
  
  <style scoped></style>
  