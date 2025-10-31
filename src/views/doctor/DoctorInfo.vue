<template>
  
  <div class="doctor-info-page">
    <!-- 顶部信息卡 -->
    <el-card shadow="hover" class="doctor-card">
      <div class="doctor-header">
        <el-avatar :size="100" :src="doctor.image" />
        <div class="doctor-basic">
          <h2>{{ doctor.nickName }}</h2>
          <p class="doctor-title" style="font-weight: bold;"> {{ doctor.gender }}</p>
          <p class="doctor-title">{{ doctor.jobTitle }} · {{ doctor.deptName }}</p>
          <div class="doctor-tags">
            <el-tag type="success">{{ doctor.education }}</el-tag>
            <el-tag type="info">挂号费: ¥{{ doctor.price }}</el-tag>
          </div>
        </div>
        <div class="doctor-edit">
          <el-button type="primary" size="small" @click="editDoctorInfo">编辑资料</el-button>
          <el-button type="primary" size="small" @click="requestLeave">申请请假</el-button>
        </div>
      </div>
    </el-card>

    
    <el-card shadow="always" class="contact-card">
      <template #header>
        <span>联系方式</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="电话">{{ doctor.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ doctor.email }}</el-descriptions-item>
        <el-descriptions-item label="出诊地址">{{ doctor.visitAddress }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 个人简介 -->
    <el-card shadow="never" class="intro-card">
      <template #header>
        <span>个人简介</span>
      </template>
      <p>{{ doctor.introduction }}</p>
    </el-card>

    <!-- 专业方向 -->
    <el-card shadow="never" class="skills-card">
      <template #header>
        <span>专业领域</span>
      </template>
      <el-tag
        v-for="(item, index) in parseGoodAt(doctor.goodAt)"
        :key="index"
        type="primary"
      >
        {{ item }}
      </el-tag>
    </el-card>

    <EditDoctorDialog 
      v-model="editVisible" 
      :doctor="doctor"
      @updated="refreshDoctorInfo"
    />
    
    <LeaveRequestDialog
      v-model="leaveVisible"
      :leave="leave"
      :doctor="DoctorInfoForLeave"
      @updated="refreshDoctorInfo"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getDoctorInfoApi } from "@/api/doctor";
import EditDoctorDialog from "@/components/EditDoctorDialog.vue";
import { userSotre } from "@/store/user/index";
import LeaveRequestDialog from "@/components/LeaveRequestDialog.vue";

const store = userSotre();

const editVisible = ref<boolean>(false);
const leaveVisible = ref<boolean>(false);

const doctor = ref<any>({});
const leave = ref<any>({});
const DoctorInfoForLeave = {
  doctorId : store.getUserId,
  nickName : store.getNickName
}
const parseGoodAt = (str: string) => {
  if (!str) return [];
  return str.split(/[，,]/).map((s) => s.trim());
};

const editDoctorInfo = () => {
  editVisible.value = true;
}

const requestLeave = () => {
  leaveVisible.value = true;
}

const refreshDoctorInfo = async () => {
  const id: string = store.getUserId;
  try {
    const res = await getDoctorInfoApi(id);
    doctor.value = res.data;
    doctor.value.gender = res.data.sex == "1" ? "男" : "女"
    ElMessage.info("已提交更新申请")
  } catch (err) {
    ElMessage.error("提交失败，请检查网络");
  }
}

onMounted(async () => {
  const id: string = store.getUserId;
  try {
    const res = await getDoctorInfoApi(id);
    console.log(res)
    doctor.value = res.data;
    doctor.value.gender = res.data.sex == "1" ? "男" : "女"
  } catch (err) {
    ElMessage.error("获取医生信息失败");
  }
});
</script>

<style scoped>
.doctor-info-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: #f5f7fa;
}
.doctor-card {
  display: flex;
  align-items: center;
}
.doctor-header {
  display: flex;
  align-items: center;
  gap: 20px;
}
.doctor-basic h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}
.doctor-title {
  margin: 4px 0 8px;
  font-size: 14px;
  color: #666;
}
.doctor-edit {
  align-items:end;
}
.doctor-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
