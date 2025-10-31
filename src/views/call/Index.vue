<template>
  <div class="page-container">
    <el-card class="main-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>挂号列表</span>
          <div class="search-area">
            <el-form :model="searchParm" :inline="true" size="default" class="search-form">
              <el-form-item>
                <el-input
                  v-model="searchParm.name"
                  placeholder="输入就诊人/医生关键字"
                  clearable
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="searchBtn">查询</el-button>
                <el-button icon="Refresh" @click="resetBtn">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :height="tableHeight"
        :data="tableList"
        border
        stripe
        header-cell-class-name="custom-table-header"
      >
        <el-table-column prop="visitname" label="就诊人" width="100" />
        <el-table-column prop="nickName" label="挂号医生" width="100" />
        <el-table-column prop="deptName" label="挂号科室" />
        <el-table-column prop="times" label="挂号日期" />
        <el-table-column prop="timesArea" label="挂号时段">
          <template #default="scope">
            <el-tag
              v-if="scope.row.timesArea == '0'"
              type="primary"
              size="default"
              effect="dark"
            >
              上午
            </el-tag>
            <el-tag
              v-if="scope.row.timesArea == '1'"
              type="warning"
              size="default"
              effect="dark"
            >
              下午
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="week" label="星期" />
        <el-table-column prop="createTime" label="创建时间" width="150" />
        <el-table-column prop="price" label="挂号金额" />
        <el-table-column prop="address" label="就诊地址" show-overflow-tooltip />
        <el-table-column prop="status" label="挂号状态">
          <template #default="scope">
            <el-tag
              v-if="scope.row.status == '1'"
              type="success"
              size="default"
              effect="light"
            >
              已挂号
            </el-tag>
            <el-tag
              v-if="scope.row.status == '2'"
              type="info"
              size="default"
              effect="light"
            >
              已取消
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hasCall" label="是否叫号">
          <template #default="scope">
            <el-tag
              v-if="scope.row.hasCall == '0'"
              type="danger"
              size="default"
              effect="light"
            >
              未叫号
            </el-tag>
            <el-tag
              v-if="scope.row.hasCall == '1'"
              type="success"
              size="default"
              effect="light"
            >
              已叫号
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button
              class="call-button"
              icon="Bell"
              size="default"
              @click="callBtn(scope.row)"
              :disabled="scope.row.hasCall == '1' || scope.row.status == '2'"
            >
              叫号
            </el-button>
            <el-button
              type="danger"
              icon="Delete"
              size="default"
              text
              @click="deleteBtn(scope.row.makeId)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchParm.currentPage"
          v-model:page-size="searchParm.pageSize"
          :page-sizes="[10, 20, 40, 80, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="searchParm.total"
          background
          @update:current-page="getList()"
          @update:page-size="getList()"
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import useInstance from "@/hooks/useInstance";
import { getListApi, deleteApi, MakeOrder, callVisitApi } from "@/api/order/index";
import { ElMessage } from "element-plus";
import { userSotre } from "@/store/user/index";

const ustore = userSotre();
const { global } = useInstance();

// 搜索参数
const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  name: "",
  timesArea: "",
  doctorId: ustore.getUserId,
});

// 表格数据
const tableList = ref<MakeOrder[]>([]);
const loading = ref(false);

// 获取表格数据
const getList = async () => {
  loading.value = true;
  try {
    let res = await getListApi(searchParm);
    if (res && res.code == 200) {
      tableList.value = res.data.records;
      searchParm.total = res.data.total;
    }
  } catch (error) {
    console.error("Failed to fetch list:", error);
    ElMessage.error("获取列表失败");
  } finally {
    loading.value = false;
  }
};

// 删除按钮
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

// 叫号按钮
const callBtn = async (row: MakeOrder) => {
  const confirm = await global.$myconfirm("确定叫号吗?");
  if (confirm) {
    let res = await callVisitApi(row);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};

// 查询按钮
const searchBtn = () => {
  searchParm.currentPage = 1;
  getList();
};

// 重置按钮
const resetBtn = () => {
  searchParm.name = "";
  searchParm.currentPage = 1;
  getList();
};

// 表格高度
const tableHeight = ref(0);
const TABLE_BOTTOM_OFFSET = 280; // 定义一个常量来表示偏移量

const setTableHeight = () => {
  tableHeight.value = window.innerHeight - TABLE_BOTTOM_OFFSET;
};

onMounted(() => {
  getList();
  nextTick(() => {
    setTableHeight();
  });
  window.addEventListener('resize', setTableHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', setTableHeight);
});
</script>

<style scoped>
/* 整体页面容器 */
.page-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

/* 主卡片样式 */
.main-card {
  border: none;
  border-radius: 8px;
  transition: all 0.3s;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

/* 搜索表单 */
.search-form .el-form-item {
  margin-bottom: 0; /* 消除表单项的下边距，使其在同一行内对齐 */
}

/* 自定义表格头部样式 */
:deep(.custom-table-header th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
}

/* 分页器容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 叫号按钮自定义样式 */
.call-button {
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
}

.call-button:hover {
  opacity: 0.9;
}
</style>