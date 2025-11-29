<template>
  <el-main>
    <el-card shadow="never" class="search-card">
      <div class="search-wrapper">
        <el-form :model="searchParm" :inline="true" size="default">
          <el-form-item label="关键字">
            <el-input
              v-model="searchParm.name"
              placeholder="昵称"
              clearable
              style="width: 240px"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="searchBtn">查询</el-button>
          </el-form-item>
        </el-form>
        
        </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      
      <el-table :height="tableHeight" :data="tableList" stripe style="width: 100%">
        <el-table-column prop="image" label="照片" width="100" align="center">
          <template #default="scope">
            <el-avatar 
              v-if="scope.row.image"
              :size="60" 
              :src="imgbase + scope.row.image.split(',')[0]"
            >
              </el-avatar>
            <el-tag v-else type="info" size="small" effect="plain">暂无</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="120"></el-table-column>
        <el-table-column prop="phone" label="电话" min-width="150"></el-table-column>
        <el-table-column prop="nickName" label="微信昵称" min-width="150"></el-table-column>
        <el-table-column prop="userName" label="账号" min-width="150"></el-table-column>
        <el-table-column prop="sex" label="性别" width="80" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.sex == '0' ? 'primary' : 'danger'"
              size="default"
              effect="light" 
            >
              {{ scope.row.sex == "0" ? "男" : "女" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="global.$hasPerm(['sys:patient:delete'])"
          label="操作"
          align="center"
          width="280"
          fixed="right" >
          <template #default="scope">
            <el-button
              type="primary"
              icon="Edit"
              size="small"
              text
              @click="resetPasswordBtn(scope.row)"
            >
              重置密码
            </el-button>
            <el-button
              v-if="global.$hasPerm(['sys:patient:delete'])"
              type="danger"
              icon="Delete"
              size="small"
              text
              @click="deleteBtn(scope.row.userId)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          @size-change="sizeChange"
          @current-change="currentChange"
          :current-page.sync="searchParm.currentPage"
          :page-sizes="[10, 20, 40, 80, 100]"
          :page-size="searchParm.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="searchParm.total"
          background
        >
        </el-pagination>
      </div>
    </el-card>
  </el-main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, computed } from "vue";

import useInstance from "@/hooks/useInstance";
import {
  getListApi,
  deleteApi,
  resetPasswordApi,
  WxUser,
} from "@/api/wx_user/index";
import { ElMessage } from "element-plus";

const { global } = useInstance();
const imgbase = computed(() => {
  return process.env.BASE_API_IMG;
});
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
const tableList = ref<WxUser[]>([]);
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

//重置密码
const resetPasswordBtn = async (row: WxUser) => {
  let confirm = await global.$myconfirm("确定重置密码吗?重置后密码为 666666");
  if (confirm) {
    let res = await resetPasswordApi(row.userId);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      // 重置密码通常不需要刷新整个列表，可以减少API调用
      // getList();
    }
  }
};

// ================== 状态开关逻辑优化 ==================

//表格高度
const tableHeight = ref(0);
onMounted(() => {
  getList();
  nextTick(() => {
    // 240 这个值可能需要微调
    // 减去的高度 = 页面Header + el-main的padding + 搜索卡片高度 + 卡片间距 + 表格卡片padding + 分页组件高度
    tableHeight.value = window.innerHeight - 250; // 稍微增加一点减去的高度
  });
});
</script>

<style scoped>
/* 1. 搜索卡片 */
.search-card {
  margin-bottom: 15px; /* 用 margin-bottom 代替之前表格的 margin-top */
}

/* 优化搜索卡片的布局，使其内容垂直居中，左右分布 */
.search-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* 换行以适应小屏幕 */
}

/* 移除 inline 表单项默认的底部 margin，在 flex 布局下不需要 */
.search-card .el-form-item {
  margin-bottom: 0; 
}

/* 2. 表格卡片 */
/* .table-card { ... } (不需要额外样式) */


/* 3. 分页容器 */
.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

/* 移除原有的 .search-card .el-card__body 样式，保留 el-card 的默认 padding */
</style>