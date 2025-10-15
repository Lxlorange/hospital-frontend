<template>
  <el-dialog
    v-model="localVisible"
    title="编辑医生资料"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="100px" style="margin-top: 10px;">
      <el-form-item label="姓名">
        <el-input v-model="form.nick_name" />
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="form.sex" placeholder="选择性别">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="职称">
        <el-input v-model="form.job_title" />
      </el-form-item>
      <el-form-item label="科室">
        <el-input v-model="form.deptName" />
      </el-form-item>
      <el-form-item label="学历">
        <el-input v-model="form.education" />
      </el-form-item>
      <el-form-item label="简介">
        <el-input type="textarea" v-model="form.introduction" rows="3" />
      </el-form-item>
      <el-form-item label="专业">
        <el-input type="textarea" v-model="form.good_at" rows="2" />
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
import { updateDoctorInfoApi } from "@/api/doctor";

interface Doctor {
  nick_name: string;
  sex: string;
  job_title: string;
  deptName: string;
  education: string;
  price: number;
  introduction: string;
  good_at: string;
}

const props = defineProps<{
  modelValue: boolean;
  doctor: any;
}>();

const emits = defineEmits(["update:modelValue", "updated"]);

const localVisible = ref(false);

watch(
  () => props.modelValue,
  (val) => (localVisible.value = val)
);

watch(localVisible, (val) => emits("update:modelValue", val));

const form = ref<Doctor>({
  nick_name: "",
  sex: "",
  job_title: "",
  deptName: "",
  education: "",
  price: 0,
  introduction: "",
  good_at: "",
});

watch(
  () => props.doctor,
  (val) => {
    if (val) form.value = { ...val };
  },
  { immediate: true }
);

const close = () => {
  localVisible.value = false;
};

const submit = async () => {
  try {
    await updateDoctorInfoApi();
    ElMessage.success("资料已更新");
    emits("updated");
    close();
  } catch (err) {
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
