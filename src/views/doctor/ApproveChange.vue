<template>
  <div class="review-page">
    <el-card shadow="hover">
      <template #header>
        <div class="flex justify-between items-center">
          <span>医生资料修改审核</span>
          <el-button style="margin-left: 10px;" type="primary" @click="fetchRequests">刷新</el-button>
        </div>
      </template>

      <el-table :data="requests" stripe style="width: 100%">
        <el-table-column prop="doctor_name" label="医生姓名" width="150" />
        <el-table-column prop="deptName" label="科室" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'pending' ? 'warning' : row.status === 'approved' ? 'success' : 'danger'"
            >
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">查看</el-button>
            <el-button
              size="small"
              type="success"
              @click="approve(row)"
              :disabled="row.status !== 'pending'"
            >批准</el-button>
            <el-button
              size="small"
              type="danger"
              @click="reject(row)"
              :disabled="row.status !== 'pending'"
            >驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 审核详情对话框 -->
    <el-dialog v-model="detailVisible" title="修改详情" width="700px">
      <el-descriptions title="信息对比" :column="2" border>
        <el-descriptions-item
          v-for="(val, key) in compareFields"
          :key="key"
          :label="key"
        >
          <div>
            <span class="old">原信息: {{ val.old || '无' }}</span><br />
            <span class="new">新信息: {{ val.new || '无' }}</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getUpdateRequestsApi, approveRequestApi, rejectRequestApi } from "@/api/doctor";

const requests = ref<any[]>([]);
const detailVisible = ref(false);
const compareFields = ref<any>({});

const fetchRequests = async () => {
  try {
    const res = await getUpdateRequestsApi();
    requests.value = [{"id":"LOCK-POSITION"}]/*res.data*/;
  } catch {
    ElMessage.error("获取请求失败");
  }
};

const statusText = (status: string) => {
  switch (status) {
    case "pending":
      return "待审核";
    case "approved":
      return "已通过";
    case "rejected":
      return "已驳回";
    default:
      return "未知";
  }
};

const viewDetail = (row: any) => {
  // 后端返回的数据中应包含 old_data 和 new_data 两部分
  compareFields.value = {};
  // const oldData = JSON.parse(row.old_data);
  // const newData = JSON.parse(row.new_data);
  /** Demo Data */
  const oldData = JSON.parse('{"id":"1","name":"a","gender":"male"}')
  const newData = JSON.parse('{"id":"1","name":"a","gender":"female"}')

  for (const key in newData) {
    compareFields.value[key] = {
      old: oldData[key],
      new: newData[key],
    };
  }

  detailVisible.value = true;
};

const approve = (row: any) => {
  ElMessageBox.confirm("确定批准该修改吗？", "提示", { type: "warning" }).then(async () => {
    await approveRequestApi(row.id);
    ElMessage.success("已批准");
    fetchRequests();
  });
};

const reject = (row: any) => {
  ElMessageBox.confirm("确定驳回该修改吗？", "提示", { type: "error" }).then(async () => {
    await rejectRequestApi(row.id);
    ElMessage.success("已驳回");
    fetchRequests();
  });
};

onMounted(fetchRequests);
</script>

<style scoped>
.review-page {
  padding: 24px;
  background: #f5f7fa;
}
.old {
  color: #999;
}
.new {
  color: #409EFF;
  font-weight: bold;
}
</style>
