<template>
  <el-dialog
    v-model="localVisible"
    title="申请请假"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="100px" style="margin-top: 10px;">
      
      <el-form-item label="开始日期">
        <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="开始时间段">
        <el-select v-model="form.startTime" placeholder="选择时间段">
          <el-option label="上午" value="0" />
          <el-option label="下午" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item label="结束日期">
        <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间段">
        <el-select v-model="form.endTime" placeholder="选择时间段">
          <el-option label="上午" value="0" />
          <el-option label="下午" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item label="请假原因">
        <el-input v-model="form.reason" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { LeaveType } from "@/api/leave/LeaveModel";
import { requestLeave } from "@/api/leave";
import { getScheduleIdApi } from "@/api/home";

const props = defineProps<{
  modelValue: boolean;
  leave: LeaveType,
  doctor: any
}>();

const emits = defineEmits(["update:modelValue", "updated"]);

const localVisible = ref(false);

watch(
  () => props.modelValue,
  (val) => (localVisible.value = val)
);

watch(localVisible, (val) => emits("update:modelValue", val));

const form = ref<LeaveType>({...props.leave});

watch(
  () => props.leave,
  (newVal) => {
    form.value = { ...newVal }; // 生成新的副本，保证表单更新
  },
  { immediate: true }
);

const close = () => {
  localVisible.value = false;
};

const submit = async () => {
  try {
    const doctorId = String(props.doctor.doctorId);
    const nickName = props.doctor.nickName;
    const startDate = form.value.startDate;
    const endDate = form.value.endDate;
    const startTime = form.value.startTime;
    const endTime = form.value.endTime;
    
    const startSchedule = (await getScheduleIdApi(startDate,startTime,doctorId)).data;
    const endSchedule = (await getScheduleIdApi(endDate,endTime,doctorId)).data;
    
    const leave: LeaveType = {...form.value, doctorId, nickName,startScheduleId: startSchedule,endScheduleId: endSchedule};
    await requestLeave(leave);
    emits("updated");
    close();
  } catch (err) {
    console.log("获取失败")
    ElMessage.error("更新失败");
  }
};

</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
