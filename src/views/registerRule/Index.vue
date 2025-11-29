<template>
  <div class="register-rule-page">

    <el-card class="box-card" shadow="hover">
      <h2>挂号规则设置</h2>

      <!-- 可预约天数 -->
      <el-form :model="form" label-width="160px">

        <el-form-item label="可预约天数（1~60）">
          <el-input-number
            v-model="form.days"
            :min="1"
            :max="60"
            controls-position="right"
          />
          <el-button type="primary" @click="updateDays" style="margin-left: 10px">
            更新天数
          </el-button>
        </el-form-item>

        <el-divider />

        <!-- 放号时间 -->
        <el-form-item label="每日放号时间">
          <el-time-picker
            v-model="form.time"
            placeholder="选择放号时间"
            format="HH:mm"
            value-format="HH:mm"
          />
          <el-button type="primary" @click="updateTime" style="margin-left: 10px">
            更新时间
          </el-button>
        </el-form-item>

      </el-form>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  getScheduleQueryDaysApi,
  setScheduleQueryDaysApi,
  getScheduleQueryTimeApi,
  setScheduleQueryTimeApi
} from "@/api/registerRule";
import { ElMessage } from "element-plus";

const form = ref({
  days: 0,
  time: "06:00"
});

type SpecialErr = {
  code: number,// for start hour
  data: number,// for start minute
  msg: string,
}

const loadRules = async () => {
  try {
    const resDays = await getScheduleQueryDaysApi();
    form.value.days = resDays.data;
    await getScheduleQueryTimeApi();
  } catch (err: any){
    const spe_err = err as SpecialErr;
    const h = spe_err.code;
    const m = spe_err.data;
    form.value.time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
};

// 更新可预约天数
const updateDays = async () => {
  try {
    await setScheduleQueryDaysApi(form.value.days);
    ElMessage.success("预约天数更新成功");
  } catch {
    ElMessage.error("更新失败");
  }
};

// 更新时间
const updateTime = async () => {
  const [hours, minutes] = form.value.time.split(":").map(Number);

  try {
    await setScheduleQueryTimeApi(hours, minutes);
  } catch(err) {
    ElMessage.success("每日放号时间更新成功");
  }
};

onMounted(() => {
  loadRules();
});
</script>

<style scoped>
.register-rule-page {
  padding: 20px;
}

.box-card {
  padding: 20px;
}
</style>
