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
        <el-table-column prop="nickName" label="医生姓名" width="150" />
        <el-table-column prop="createTime" label="时间" width="150" >
          <template #default="{ row }">
            {{ row.createTime ? row.createTime.split('T')[0] : '' }}
          </template>
        </el-table-column>
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
              :disabled="row.status !== '0'"
            >批准</el-button>
            <el-button
              size="small"
              type="danger"
              @click="reject(row)"
              :disabled="row.status !== '0'"
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
          :label="fieldLabels[key]"
        >
          <div>
            <span class="new">{{ val || '无' }}</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getUpdateRequestsApi, approveRequestApi } from "@/api/doctor";
import { userSotre } from "@/store/user/index";

const store = userSotre();
const requests = ref<any[]>([]);
const detailVisible = ref(false);
const compareFields = ref<any>({});

const fetchRequests = async () => {
  try {
    const res = await getUpdateRequestsApi();
    console.log(res.data);
    requests.value = res.data.records/*res.data*/;
  } catch {
    ElMessage.error("获取请求失败");
  }
};

const statusText = (status: string) => {
  switch (status) {
    case "0":
      return "待审核";
    case "1":
      return "已通过";
    case "2":
      return "已驳回";
    default:
      return "未知";
  }
};

const viewDetail = (row: any) => {
  compareFields.value = row
  detailVisible.value = true;
};

const approve = (row: any) => {
  ElMessageBox.prompt("请输入审核意见：", "批准修改", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPlaceholder: "例如：信息有效，予以通过",
    type: "warning"
  })
    .then(async ({ value }) => {
      const reviewComment = value || "信息有效，予以通过"; // 默认内容
      await approveRequestApi(row.requestId, 1, reviewComment);
      ElMessage.success("已批准");
      fetchRequests();
    })
    .catch(() => {
      ElMessage.info("已取消操作");
    });
};

const fieldLabels: Record<string, string> = {
  requestId: "请求编号",
  doctorId: "医生编号",
  username: "用户名",
  nickName: "医生姓名",
  introduction: "个人简介",
  visitAddress: "坐诊地址",
  goodAt: "擅长领域",
  price: "挂号价格",
  status: "审核状态",
  reviewComment: "审核意见",
  reviewerId: "审核人编号",
  reviewTime: "审核时间",
  createTime: "申请时间",
  updateTime: "最后更新时间",
};

const reject = (row: any) => {
  ElMessageBox.prompt("请输入驳回原因", "驳回修改", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPlaceholder: "请输入审核意见",
    inputValidator: (value) => {
      if (!value || value.trim() === "") {
        return "审核意见不能为空";
      }
      return true;
    },
    type: "warning",
  })
    .then(async ({ value }) => {
      await approveRequestApi(row.requestId, 2, value); // 传入 reviewComment
      ElMessage.success("已驳回");
      fetchRequests();
    })
    .catch(() => {
      ElMessage.info("已取消驳回");
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
