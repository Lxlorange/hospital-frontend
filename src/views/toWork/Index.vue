<template>
  <el-main>
    <el-tabs v-model="activeTab" type="border-card" class="schedule-tabs">
      <el-tab-pane label="排班模板管理" name="template">
        <el-alert
          title="操作说明"
          type="info"
          description="请先选择科室和医生，然后点击“管理模板”按钮，为医生设置一个可复用的、周期性的出诊规律。此处的设置是“模板”，设置一次后，可用于未来任意时间段的排班生成。"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
        />
        <el-form :inline="true" :model="templateState.filter">
          <el-form-item label="科室">
            <el-select v-model="templateState.filter.deptId" placeholder="请选择科室" @change="handleDeptChange" clearable>
              <el-option v-for="item in commonState.departments" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="医生">
            <el-select v-model="templateState.filter.doctorId" placeholder="请选择医生" :disabled="!templateState.filter.deptId" clearable>
              <el-option v-for="item in commonState.doctors" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Edit" @click="handleManageTemplate" :disabled="!templateState.filter.doctorId">
              管理医生模板
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="排班日历视图" name="calendar">
        <el-alert
          title="操作说明"
          type="info"
          description="日历中展示了已生成的具体排班。您可以点击“按模板生成下月排班”按钮进行批量排班，也可以点击具体日期对当天的排班进行“停诊”等微调。"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
        />
        <el-form :inline="true">
           <el-form-item>
            <el-button type="success" :icon="Promotion" @click="handleGenerateSchedule">
              按模板生成下月排班
            </el-button>
          </el-form-item>
        </el-form>

        <el-calendar v-model="instanceState.calendarDate" ref="calendarRef">
            <template #header="{ date }">
                <span>{{ date }}</span>
                <el-button-group>
                    <el-button size="small" @click="selectDate('prev-month')">上个月</el-button>
                    <el-button size="small" @click="selectDate('today')">今天</el-button>
                    <el-button size="small" @click="selectDate('next-month')">下个月</el-button>
                </el-button-group>
            </template>
            <template #date-cell="{ data }">
                <div class="date-cell" @click="handleDateClick(data.day)">
                    <div class="solar-date">{{ data.day.split('-')[2] }}</div>
                    
                    <div class="schedule-summary">
                        <div 
                            v-for="item in getInstanceSummary(data.day).doctors" 
                            :key="item.doctorId" 
                            class="schedule-item"
                        >
                          <el-tag size="small" effect="plain">{{ item.doctorName }}</el-tag>
                        </div>
                    </div>
                    
                    <div class="status-dots">
                        <span v-if="getInstanceSummary(data.day).hasNormal" class="status-dot normal"></span>
                        <span v-if="getInstanceSummary(data.day).hasStopped" class="status-dot stopped"></span>
                    </div>
                </div>
            </template>
        </el-calendar>
      </el-tab-pane>
    </el-tabs>

    <SysDialog
      :visible="templateState.dialogVisible"
      title="编辑医生排班模板"
      :width="1000"
      :height="550"
      @onClose="closeTemplateDialog"
      @onConfirm="saveTemplate"
    >
      <template #content>
        <el-table :data="templateState.weeklyTemplate" border row-key="timeSlot">
          <el-table-column prop="timeSlotText" label="时间段" width="80" />
          <el-table-column v-for="day in 7" :key="day" :label="'星期' + '一二三四五六日'[day - 1]" align="center">
            <template #default="{ row }">
              <div v-if="getTemplateSlots(day, row.timeSlot).length > 0">
                <div v-for="(slot, index) in getTemplateSlots(day, row.timeSlot)" :key="index">
                   <el-tag type="success" size="small">{{ slot.slotType }}: {{ slot.totalAmount }}个</el-tag>
                </div>
                <el-button link type="primary" size="small" @click="editTemplateSlot(day, row.timeSlot)">编辑</el-button>
              </div>
              <el-button v-else link type="primary" size="small" @click="editTemplateSlot(day, row.timeSlot)">+ 添加排班</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </SysDialog>

    <el-dialog v-model="templateState.slotDialogVisible" title="配置号源" width="600px" append-to-body>
        <el-form label-width="80px">
            <div v-for="(slot, index) in templateState.editingSlots" :key="index" style="display: flex; align-items: center; margin-bottom: 10px;">
                
                <el-form-item label="号源类型" style="width: 180px; margin-right: 10px;">
                    <el-select v-model="slot.slotType" placeholder="请选择号别">
                        <el-option
                            v-for="item in slotTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            :disabled="isSlotTypeDisabled(item.value, slot.slotType)"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="总号量" style="width: 200px; margin-right: 10px;">
                    <el-input-number v-model="slot.totalAmount" :min="0" controls-position="right" />
                </el-form-item>
                <el-button type="danger" :icon="Delete"  @click="removeSlot(index)" style="margin-left: 20px; margin-bottom:20px; width: 32px; height: 32px;"/>
            </div>
        </el-form>
        
        
        <el-button 
            @click="addSlot" 
            :icon="Plus" 
            style="margin-top: 10px;" 
            :disabled="templateState.editingSlots.length >= slotTypeOptions.length"
        >
            添加号源
        </el-button>

        <template #footer>
            <el-button @click="templateState.slotDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmSlotEdit">确定</el-button>
        </template>
    </el-dialog>

    <SysDialog
        :visible="instanceState.detailDialogVisible"
        :title="`${instanceState.selectedDate} 排班详情`"
        :width="800"
        :height="400"
        @onClose="instanceState.detailDialogVisible = false"
        @onConfirm="instanceState.detailDialogVisible = false"
    >
        <template #content>
            <el-table :data="instanceState.selectedDayInstances" border>
                <el-table-column prop="doctorName" label="医生姓名" />
                <el-table-column label="时间段">
                    <template #default="{ row }">{{ row.timeSlot === 1 ? '上午' : '下午' }}</template>
                </el-table-column>
                <el-table-column label="号源详情">
                    <template #default="{ row }">
                        <div v-for="slot in row.slots" :key="slot.instanceSlotId">
                            <el-tag effect="dark" :type="slot.availableAmount > 0 ? 'success' : 'info'" size="small">
                                {{ slot.slotType }}: 剩余 {{ slot.availableAmount }} / 总 {{ slot.totalAmount }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="状态">
                     <template #default="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                            {{ row.status === 1 ? '正常' : '已停诊' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="{ row }">
                        <el-button
                            v-if="row.status === 1"
                            type="danger"
                            size="small"
                            @click="updateStatus(row.instanceId, 2)"
                        >停诊</el-button>
                        <el-button
                            v-else
                            type="success"
                            size="small"
                            @click="updateStatus(row.instanceId, 1)"
                        >恢复出诊</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </SysDialog>

  </el-main>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch,computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Plus, Delete, Promotion } from '@element-plus/icons-vue';
import SysDialog from '@/components/SysDialog.vue';
import { getSelectDeptApi, SelectType } from '@/api/department';
import { getSelectUserApi } from '@/api/user'; // 从 @/api/user 导入
import {
  ScheduleTemplate,
  TemplateSlot,
  ScheduleInstance,
  saveTemplateApi,
  getTemplateApi,
  generateInstancesApi,
  getInstancesApi,
  updateInstanceStatusApi,
  InstanceSlot
} from '@/api/schedule';
import dayjs from 'dayjs';

const activeTab = ref('template');
const commonState = reactive({
  departments: [] as SelectType[],
  doctors: [] as SelectType[],
});

// 获取科室列表
const getDeptList = async () => {
  const res = await getSelectDeptApi();
  if (res && res.code === 200) {
    commonState.departments = res.data;
  }
};
// 获取医生列表
const getDoctorList = async (deptId: string) => {
  const res = await getSelectUserApi(deptId);
  if (res && res.code === 200) {
    commonState.doctors = res.data;
  }
};

onMounted(() => {
  getDeptList();
  fetchCurrentMonthInstances();
});


const templateState = reactive({
  filter: {
    deptId: '',
    doctorId: '',
  },
  dialogVisible: false,
  slotDialogVisible: false,
  weeklyTemplate: [
      { timeSlot: 1, timeSlotText: '上午' },
      { timeSlot: 2, timeSlotText: '下午' },
  ],
  templates: [] as ScheduleTemplate[],
  editingSlots: [] as TemplateSlot[],
  editingCoordinates: { day: 0, timeSlot: 0 },
});
/**
 * @description 定义固定的号源类型选项
 */
const slotTypeOptions = [
  { value: '普通号', label: '普通号' },
  { value: '专家号', label: '专家号' },
  { value: '特需号', label: '特需号' },
  { value: '国际医疗', label: '国际医疗' }
];

/**
 * @description 计算当前已使用的号源类型，用于禁用重复选项
 */
const usedSlotTypes = computed(() => {
    return new Set(templateState.editingSlots.map(slot => slot.slotType));
});

/**
 * @description 判断某个选项是否应该被禁用
 * @param optionValue 当前遍历到的选项值，如 "普通号"
 * @param currentSlotValue 当前下拉框绑定的值，如 "专家号"
 */
const isSlotTypeDisabled = (optionValue: string, currentSlotValue: string) => {
    // 如果这个选项已经被使用了，并且它不是当前下拉框已经选中的那个值，就禁用它
    return usedSlotTypes.value.has(optionValue) && optionValue !== currentSlotValue;
}
const handleDeptChange = (deptId: string) => {
  templateState.filter.doctorId = '';
  commonState.doctors = [];
  if (deptId) {
    getDoctorList(deptId);
  }
};

const handleManageTemplate = async () => {
  if (!templateState.filter.doctorId) return;
  const doctorId = templateState.filter.doctorId;
  const res = await getTemplateApi(doctorId);
  if (res && res.code === 200) {
    templateState.templates = res.data;
    templateState.dialogVisible = true;
  }
};

const getTemplateSlots = (dayOfWeek: number, timeSlot: number) => {
  const template = templateState.templates.find(
    t => t.dayOfWeek === dayOfWeek && t.timeSlot === timeSlot
  );
  return template ? template.slots : [];
};

/**
 * @description 打开号源编辑子弹窗
 * @param day 星期几 (1-7)
 * @param timeSlot 时间段 (1-2)
 */
const editTemplateSlot = (day: number, timeSlot: number) => {
    templateState.editingCoordinates = { day, timeSlot };
    const existingSlots = getTemplateSlots(day, timeSlot);

    templateState.editingSlots.length = 0; 
    JSON.parse(JSON.stringify(existingSlots)).forEach((slot: TemplateSlot) => {
        templateState.editingSlots.push(slot);
    });

    templateState.slotDialogVisible = true;
}

const addSlot = () => {
    if (templateState.editingSlots.length >= slotTypeOptions.length) {
        ElMessage.warning('已添加所有可用的号源类型');
        return;
    }
    const defaultType = slotTypeOptions.find(opt => !usedSlotTypes.value.has(opt.value))?.value || '';
    templateState.editingSlots.push({ 
        slotType: defaultType,
        totalAmount: 10,
    });
}

const removeSlot = (index: number) => {
    templateState.editingSlots.splice(index, 1);
}

const confirmSlotEdit = () => {
    const { day, timeSlot } = templateState.editingCoordinates;
    const doctorId = templateState.filter.doctorId;
    
    let template = templateState.templates.find(
        t => t.dayOfWeek === day && t.timeSlot === timeSlot
    );
    const newSlots = JSON.parse(JSON.stringify(templateState.editingSlots));

    if (template) {
        if(newSlots.length > 0) {
            template.slots = newSlots;
        } else { 
            templateState.templates = templateState.templates.filter(t => t !== template);
        }
    } else if (newSlots.length > 0) {
        templateState.templates.push({
            doctorId,
            dayOfWeek: day,
            timeSlot: timeSlot,
            slots: newSlots,
        });
    }
    templateState.slotDialogVisible = false;
}

const saveTemplate = async () => {
  const doctorId = templateState.filter.doctorId;
  const res = await saveTemplateApi(doctorId, templateState.templates);
  if (res && res.code === 200) {
    ElMessage.success('模板保存成功');
    closeTemplateDialog();
  }
};

const closeTemplateDialog = () => {
  templateState.dialogVisible = false;
  templateState.templates = [];
};

const calendarRef = ref();
const instanceState = reactive({
    calendarDate: new Date(),
    instances: [] as ScheduleInstance[],
    detailDialogVisible: false,
    selectedDate: '',
    selectedDayInstances: [] as ScheduleInstance[],
});

const selectDate = (val: 'prev-month' | 'next-month' | 'today') => {
  if (calendarRef.value) {
    calendarRef.value.selectDate(val);
  }
};

/**
 * @description 获取某天的排班概要（用于在日历格子上显示）
 * @param date 日期字符串 "YYYY-MM-DD"
 * @returns 返回一个包含医生列表和状态汇总的对象
 */
const getInstanceSummary = (date: string) => {
    const dailyInstances = instanceState.instances.filter(i => i.scheduleDate === date);
    
    if (dailyInstances.length === 0) {
        return { doctors: [], hasNormal: false, hasStopped: false };
    }

    const doctors = dailyInstances.map(i => ({ doctorId: i.doctorId, doctorName: i.doctorName }));
    const uniqueDoctors = [...new Map(doctors.map(item => [item['doctorId'], item])).values()];
    
    const hasNormal = dailyInstances.some(i => i.status === 1);
    const hasStopped = dailyInstances.some(i => i.status === 2);

    return {
        doctors: uniqueDoctors,
        hasNormal,
        hasStopped
    };
}

const handleDateClick = (date: string) => {
    instanceState.selectedDate = date;
    instanceState.selectedDayInstances = instanceState.instances.filter(i => i.scheduleDate === date);
    if(instanceState.selectedDayInstances.length > 0){
        instanceState.detailDialogVisible = true;
    } else {
        ElMessage.info('当天没有排班');
    }
}

const getCalendarRange = () => {
    const date = dayjs(instanceState.calendarDate);
    const startDate = date.startOf('month').startOf('week').format('YYYY-MM-DD');
    const endDate = date.endOf('month').endOf('week').format('YYYY-MM-DD');
    return { startDate, endDate };
}

const transformApiData = (apiData: any[]): ScheduleInstance[] => {
    const instanceMap = new Map<string, ScheduleInstance>();

    for (const item of apiData) {
        const key = `${item.doctorId}-${item.times}-${item.timeSlot}`;

        const newSlot: InstanceSlot = {
            instanceSlotId: item.scheduleId,
            slotType: item.levelName,
            totalAmount: item.amount,
            availableAmount: item.lastAmount
        };

        if (!instanceMap.has(key)) {
            instanceMap.set(key, {
                instanceId: key,
                doctorId: item.doctorId,
                doctorName: item.doctorName,
                departmentName: item.deptName,
                scheduleDate: item.times,
                timeSlot: item.timeSlot,
                status: Number(item.type),
                slots: [newSlot]
            });
        } else {
            instanceMap.get(key)!.slots.push(newSlot);
        }
    }

    return Array.from(instanceMap.values());
};

const fetchCurrentMonthInstances = async () => {
    const { startDate, endDate } = getCalendarRange();
    const res = await getInstancesApi({ startDate, endDate });
    if (res && res.code === 200) {
        const transformedData = transformApiData(res.data);
        instanceState.instances = transformedData;
    }
}

watch(() => instanceState.calendarDate, fetchCurrentMonthInstances, { immediate: true });

const handleGenerateSchedule = () => {
    ElMessageBox.confirm(
        '此操作将根据所有医生的模板，为下个月生成排班。已存在的排班不会被覆盖。是否继续？',
        '确认生成排班',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        const nextMonth = dayjs().add(1, 'month');
        const startDate = nextMonth.startOf('month').format('YYYY-MM-DD');
        const endDate = nextMonth.endOf('month').format('YYYY-MM-DD');
        const res = await generateInstancesApi({ startDate, endDate });
        if(res && res.code === 200) {
            ElMessage.success('下月排班已成功生成');
            instanceState.calendarDate = nextMonth.toDate();
            await fetchCurrentMonthInstances();
        }
    }).catch(() => {
        ElMessage.info('操作已取消');
    });
}

const updateStatus = async (instanceId: string, status: number) => {
    const res = await updateInstanceStatusApi(instanceId, status);
    if(res && res.code === 200) {
        ElMessage.success('状态更新成功');
        const instance = instanceState.selectedDayInstances.find(i => i.instanceId === instanceId);
        if(instance) instance.status = status;
    }
}

</script>

<style lang="scss" scoped>
.schedule-tabs {
  height: calc(100vh - 110px); 
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: auto;
  }
}

.date-cell {
    height: 100%;
    padding: 4px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    cursor: pointer;
}
.solar-date {
    font-size: 14px;
    text-align: center;
}
.schedule-summary {
    flex: 1;
    overflow-y: auto;
    font-size: 12px;
    margin-top: 5px;
}
.schedule-item {
    margin-bottom: 2px;
    .el-tag {
      width: 100%;
      text-align: center;
    }
}

:deep(.el-calendar-table .el-calendar-day) {
    height: 100px;
}

:deep(.el-calendar-table .el-calendar-day) {
    height: 110px; // 增加格子高度以容纳更多信息
    padding: 0;
}

/* 非本月日期置灰，降低视觉干扰 */
:deep(.el-calendar-table .next),
:deep(.el-calendar-table .prev) {
    .date-cell {
        opacity: 0.5;
    }
}
.date-cell {
    width: 100%;
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    position: relative; /* 为状态点的绝对定位提供容器 */
    transition: background-color 0.2s; /* 增加Hover过渡效果 */
}

/* 增加鼠标悬浮效果 */
.date-cell:hover {
    background-color: #f5f7fa;
}

.solar-date {
    font-size: 14px;
    text-align: center;
    font-weight: 500;
}

.schedule-summary {
    flex: 1;
    overflow-y: auto;
    font-size: 12px;
    margin-top: 5px;
}

.schedule-item {
    margin-bottom: 3px;
    .el-tag {
      width: 100%;
      text-align: center;
      display: block; /* 确保 el-tag 占满一行 */
    }
}

/* --- ✅ 状态点样式 --- */
.status-dots {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.status-dot.normal {
    background-color: #67c23a; /* 绿色 - 正常 */
}

.status-dot.stopped {
    background-color: #f56c6c; /* 红色 - 停诊 */
}
</style>