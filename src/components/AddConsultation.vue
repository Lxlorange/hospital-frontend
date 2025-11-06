<template>
  <el-dialog
    v-model="localVisible"
    title="加号"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" label-width="100px" style="margin-top: 10px;">
      
        <el-form-item label="加号日期">
        <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="加号时间段">
        <el-select v-model="form.time" placeholder="选择时间段">
          <el-option label="上午" value="0" />
          <el-option label="下午" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item label="加号患者">
        <el-select
          v-model="form.user"
          placeholder="搜索并选择患者"
          filterable
          remote
          clearable
          remote-show-suffix
          :remote-method="fetchPatients"
          :loading="loadingPatients"
          style="width: 100%"
        >
          <el-option
            v-for="item in patientOptions"
            :key="item.userId"
            :label="`${item.name}（${item.phone}，${item.IdCard}）`"
            :value="item.sendValues"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="加号原因">
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
import { requestLeave } from "@/api/leave";
import { ConsultationType } from "@/api/home/ConsultationModel";
import { addConsultationApi, getPatientsApi, getScheduleIdApi } from "@/api/home";
import { userSotre } from "@/store/user";

const props = defineProps<{
  modelValue: boolean;
  consultation: ConsultationType
}>();

const emits = defineEmits(["update:modelValue", "updated"]);

const localVisible = ref(false);

watch(
  () => props.modelValue,
  (val) => (localVisible.value = val)
);

watch(localVisible, (val) => emits("update:modelValue", val));

const store = userSotre();
const form = ref<ConsultationType>({...props.consultation});

watch(
  () => props.consultation,
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
    const consultation: ConsultationType = {...form.value};
    console.log("consultation:")
    console.log(consultation)
    const scheduleId = (await getScheduleIdApi(consultation.date,consultation.time,store.getUserId)).data.data;
    await addConsultationApi(scheduleId, consultation.user.visitUserId, consultation.user.userId, consultation.reason);
    emits("updated");
    close();
  } catch (err) {
    ElMessage.error("更新失败");
  }
};

const loadingPatients = ref(false);
const patientOptions = ref<
  {
    userId: string
    name: string; 
    phone: string; 
    IdCard: string; 
    sendValues: { // constrcut this item form response
      userId: string,
      visitUserId: string
    }
  }[]>([]);

const fetchPatients = async (query: string) => {
  if (!query) {
    patientOptions.value = [];
    return;
  }

  loadingPatients.value = true;
  try {
    const res = await getPatientsApi(query);

    /** 
     *  res.data 结构示例：
     *  [
     *    {
     *      userId: "U123",
     *      userMaskedPhone: "138****8888",
     *      visitOptions: [
     *        {
     *          visitUserId: "V999",
     *          visitname: "张三",
     *          maskedIdCard: "110***********1234",
     *          maskedPhone: "138****8888"
     *        }
     *      ]
     *    },
     *    ...
     *  ]
     */

    patientOptions.value = (res.data || [])
      .filter((u: any) => u.visitOptions && u.visitOptions.length > 0)
      .map((u: any) => {
        const firstVisit = u.visitOptions[0];
        return {
          userId: u.userId,
          name: firstVisit.visitname,
          phone: firstVisit.maskedPhone || u.userMaskedPhone || "未知号码",
          IdCard: firstVisit.maskedIdCard || "未知身份证",
          sendValues: {
            userId: u.userId,
            visitUserId: firstVisit.visitUserId
          }
        };
      });
  } catch (err) {
    console.error("获取患者信息失败:", err);
    patientOptions.value = [];
  } finally {
    loadingPatients.value = false;
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
