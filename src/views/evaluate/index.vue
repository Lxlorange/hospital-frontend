<template>
  <el-container class="main-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="searchParm" :inline="true" size="default">
        <el-form-item label="关键字">
          <el-input
            v-model="searchParm.name"
            placeholder="输入标题或内容"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="searchBtn">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <div class="toolbar">
        <el-button
          v-if="global.$hasPerm(['sys:suggest:add'])"
          type="primary"
          icon="Plus"
          @click="addBtn"
        >
          新增反馈
        </el-button>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableList" stripe height="100%" style="width: 100%">
          <el-table-column prop="title" label="标题" width="200" />
          <el-table-column
            prop="content"
            label="评价内容"
            show-overflow-tooltip
          />
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180"
          />
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
                link
                icon="Delete"
                size="small"
                @click="deleteBtn(scope.row.id)"
              >
                删除
              </el-button>

              </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
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
      </div>
    </el-card>
  </el-container>
</template>

<script setup lang="ts">
// 移除了 nextTick 和 ref (因为 tableHeight 不再需要)
import { onMounted, reactive, ref } from "vue"; 
import useInstance from "@/hooks/useInstance";
import { getListApi, deleteApi } from "@/api/suggest/index";
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
  const confirm = await global.$myconfirm("确定删除该数据吗？");
  if (confirm) {
    let res = await deleteApi(id);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
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
//重置 (您原来有这个函数，但模板里没有按钮，我加上了)
const resetBtn = () => {
  searchParm.name = "";
  searchParm.currentPage = 1;
  getList();
};

// 新增 (占位，您需要实现)
const addBtn = () => {
  ElMessage.info("点击了新增按钮");
  // router.push({ name: 'suggestAdd' });
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

// 移除了 tableHeight 和 nextTick 计算
// onMounted 只需要调用 getList
onMounted(() => {
  getList();
});
</script>

<style scoped>
/* * 核心布局样式 
 */
.main-container {
  /* 使用 flex 布局，方向为垂直 */
  display: flex;
  flex-direction: column;
  /* 设置一个高度，例如 calc(100vh - 100px)
    假设您的 100px 是顶部导航和标签栏的高度
    这需要您根据您的项目布局进行微调
  */
  height: calc(100vh - 100px); 
  padding: 15px;
  background-color: #f0f2f5; /* 设置一个浅灰色背景，衬托卡片 */
}

/* 搜索卡片 */
.search-card {
  flex-shrink: 0; /* 不缩小 */
  margin-bottom: 15px; /* 和下方的表格卡片拉开距离 */
}

/* * 表格卡片 
 * 这是布局的核心
 */
.table-card {
  flex-grow: 1; /* 占据所有剩余空间 */

  /* 内部也使用 flex 布局，垂直排列：工具栏、表格、分页 */
  display: flex;
  flex-direction: column;
  
  /* 确保卡片内容溢出时不会撑破布局 */
  overflow: hidden; 
}

/* 工具栏 */
.toolbar {
  flex-shrink: 0; /* 不缩小 */
  padding-bottom: 15px;
}

/* * 表格容器
 * 这是让表格高度自适应的关键
 */
.table-wrapper {
  flex-grow: 1; /* 占据卡片内所有剩余空间 */
  overflow: hidden; /* 必须，否则 el-table height="100%" 会失效 */
}

/* * 分页器容器 
 */
.pagination-container {
  flex-shrink: 0; /* 不缩小 */
  padding-top: 15px;
  display: flex;
  justify-content: flex-end; /* 分页器右对齐 */
}

/* * 深度选择器 (::v-deep 或 :deep()) 
 * 用于美化 Element Plus 内部样式 
 */

/* * 优化 el-card 的内部 padding 
 * (如果您觉得默认 padding 可以，这条可以删除) 
 */
.table-card :deep(.el-card__body) {
  padding: 20px;
  /* 让 el-card__body 也能撑满卡片
    这是为了配合 .table-card 的 flex 布局
  */
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box; /* 确保 padding 不会影响布局 */
}

/* 美化表格头部 */
:deep(.el-table th.el-table__cell) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

/* 修复搜索表单项的底部边距 (inline 模式下) */
:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>