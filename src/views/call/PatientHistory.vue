<template>
  <div class="history-container">
    <el-card class="history-card" shadow="never">
      <template #header>
        <el-page-header @back="goBack">
          <template #content>
            <span class="header-title">
              {{ patientName }} 的就诊历史
            </span>
          </template>
          <template #extra>
             <el-tag type="primary" effect="dark">全院记录</el-tag>
          </template>
        </el-page-header>
      </template>

      <div class="table-area">
        <el-table
          v-loading="loading"
          :data="historyList"
          style="width: 100%"
          border
          stripe
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column type="expand">
            <template #default="props">
              <div class="detail-wrapper">
                <p><strong>就诊地址：</strong> {{ props.row.address }}</p>
                <p><strong>医生医嘱/诊断：</strong></p>
                <div class="advice-box">
                  {{ props.row.advice || '暂无详细医嘱记录' }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="formattedAppointmentTime" label="就诊时间" width="220" />
          <el-table-column prop="deptName" label="科室" width="120" />
          <el-table-column prop="nickName" label="接诊医生" width="120" />
          
          <el-table-column label="就诊状态" width="120" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.hasVisit == '1'" type="success">已就诊</el-tag>
              <el-tag v-else type="info">未就诊</el-tag>
            </template>
          </el-table-column>
          
           <el-table-column label="简要诊断" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.advice ? scope.row.advice : '点击左侧展开查看详情' }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-box">
          <el-pagination
            v-model:current-page="parm.currentPage"
            v-model:page-size="parm.pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="parm.total"
            background
            @update:current-page="getHistoryData"
            @update:page-size="getHistoryData"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllHistoryApi } from '@/api/order/index'; // 确保引入了第一步添加的API
import { ElMessage } from 'element-plus';

// 路由工具
const route = useRoute();
const router = useRouter();

// 状态定义
const loading = ref(false);
const patientName = ref('');
const historyList = ref([]);

// 查询参数
const parm = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  visitUserId: '',
});

// 返回上一页
const goBack = () => {
  router.go(-1); // 返回 Index.vue，保留之前的状态（如果使用了keep-alive）
};

// 获取历史数据
const getHistoryData = async () => {
  if (!parm.visitUserId) return;
  
  loading.value = true;
  try {
    // 这里的API调用对应 wxuserhistory.md 中的 /api/makeOrder/getAllHistory
    const res = await getAllHistoryApi(parm);
    if (res && res.code === 200) {
      historyList.value = res.data.records;
      parm.total = res.data.total;
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('获取历史记录失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // 从路由参数中获取 visitUserId 和 visitName
  if (route.query.visitUserId) {
    parm.visitUserId = route.query.visitUserId as string;
    patientName.value = (route.query.visitName as string) || '患者';
    getHistoryData();
  } else {
    ElMessage.warning('参数错误，无法获取患者ID');
  }
});
</script>

<style scoped>
.history-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.history-card {
  border: none;
  border-radius: 8px;
  min-height: 85vh;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.table-area {
  margin-top: 20px;
}

.pagination-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 详情展开区域样式 */
.detail-wrapper {
  padding: 10px 20px;
  background-color: #fafafa;
  border-radius: 4px;
}

.advice-box {
  margin-top: 8px;
  padding: 10px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  color: #555;
  line-height: 1.6;
}
</style>