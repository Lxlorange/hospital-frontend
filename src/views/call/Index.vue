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
        <el-table-column prop="visitname" label="就诊人" width="100" align="center">
            <template #default="scope">
                <span class="patient-name">{{ scope.row.visitname }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="nickName" label="挂号医生" width="100" />
        <el-table-column prop="deptName" label="挂号科室" />
        <el-table-column prop="times" label="挂号日期" width="110" />
        <el-table-column prop="timesArea" label="时段" width="80" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.timesArea == '0'" type="primary" effect="plain">上午</el-tag>
            <el-tag v-if="scope.row.timesArea == '1'" type="warning" effect="plain">下午</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="week" label="星期" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="price" label="费用" width="80">
             <template #default="scope">￥{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status == '1'" type="success">已挂号</el-tag>
            <el-tag v-if="scope.row.status == '2'" type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hasCall" label="叫号情况" width="90" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.hasCall == '0'" type="danger" effect="light">未叫号</el-tag>
            <el-tag v-if="scope.row.hasCall == '1'" type="success" effect="light">已叫号</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              icon="Bell"
              @click="callBtn(scope.row)"
              :disabled="scope.row.hasCall == '1' || scope.row.status == '2'"
            >
              叫号
            </el-button>
            
            <el-button
              type="info"
              link
              icon="Document"
              @click="toHistory(scope.row)"
            >
              病历
            </el-button>

            <el-button
              type="danger"
              link
              icon="Delete"
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
import { useRouter } from "vue-router";
import useInstance from "@/hooks/useInstance";
import { getListApi, deleteApi, MakeOrder, callVisitApi } from "@/api/order/index";
import { ElMessage } from "element-plus";
import { userSotre } from "@/store/user/index";

const ustore = userSotre();
const { global } = useInstance();
const router = useRouter();

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

// 跳转到历史记录页面
const toHistory = (row: MakeOrder) => {
  router.push({
    name: "PatientHistory", // 请确保路由中配置了这个name
    query: {
      visitUserId: row.visitUserId,
      visitName: row.visitname // 将名字带过去，提升体验
    }
  });
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

// 表格高度处理
const tableHeight = ref(0);
const TABLE_BOTTOM_OFFSET = 240; 

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
.page-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.main-card {
  border: none;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.search-form .el-form-item {
  margin-bottom: 0; 
}

:deep(.custom-table-header th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
  height: 50px;
}

.patient-name {
    font-weight: 600;
    color: #303133;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>