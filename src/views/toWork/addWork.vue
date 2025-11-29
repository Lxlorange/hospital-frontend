<template>
  <SysDialog
    :title="dialog.title"
    :width="dialog.width"
    :height="dialog.height"
    :visible="dialog.visible"
    @onClose="onClose"
    @onConfirm="commit"
  >
    <template v-slot:content>
      <div class="schedule-container">
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>🗓️ 排班基础设置</span>
            </div>
          </template>
          <el-form
            :model="addModel"
            ref="addRef"
            :rules="rules"
            label-width="90px"
            :inline="false"
            size="default" 
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="选择周期：" prop="startTime">
                  <el-date-picker
                    style="width: 100%"
                    v-model="baseForm.startTime"
                    type="week"
                    placeholder="请选择任意一周"
                    :format="
                      baseForm.startTime
                        ? `${baseForm.startTime} 至 ${baseForm.endTime}`
                        : ''
                    "
                    @change="changeTime"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="放号数量：" prop="amount">
                  <el-input-number
                    style="width: 100%"
                    v-model="baseForm.amount"
                    :min="0"
                    placeholder="设置每个班次的放号数"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="选择科室：" prop="deptId">
                  <el-select
                    style="width: 100%"
                    v-model="addModel.deptId"
                    clearable
                    placeholder="请选择科室"
                    @change="deptChange"
                    filterable
                  >
                    <el-option
                      v-for="item in deptOptions"
                      :key="item['value']"
                      :label="item['label']"
                      :value="item['value']"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="选择医生：" prop="userId">
                  <el-select
                    style="width: 100%"
                    v-model="addModel.userId"
                    clearable
                    placeholder="可筛选特定医生"
                    @change="docChange"
                    filterable
                  >
                    <el-option
                      v-for="item in selectUser"
                      :key="item['value']"
                      :label="item['label']"
                      :value="item['value']"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <div class="table-actions">
           <el-alert title="勾选下方复选框，为医生安排对应日期的班次" type="info" :closable="false" show-icon />
          <el-checkbox
            v-model="isCheckAll"
            @change="checkAllBtn"
            border
            class="check-all-btn"
          >
            全选/全不选
          </el-checkbox>
        </div>

        <el-table
          :data="tableData"
          height="350"
          ref="multipleTable"
          tooltip-effect="dark"
          style="width: 100%"
          border
          stripe
          class="schedule-table"
        >
          <el-table-column
            prop="doctorName"
            label="医生姓名"
            width="120"
            fixed
          >
          </el-table-column>

          <el-table-column
            v-for="(day, index) in weekArr"
            :key="index"
            :label="day"
            width="130"
            align="center"
          >
            <template #default="scope">
              <el-checkbox
                v-model="scope.row[weekMapping[index]]"
                :true-label="1"
                :false-label="0"
                size="large"
              >
              </el-checkbox>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </SysDialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import SysDialog from "@/components/SysDialog.vue";
import useDialog from "@/hooks/useDialog";
import { getSelectDeptApi, SelectType } from "@/api/department/index";
import { getSelectUserApi } from "@/api/user/index";
import { addInstanceApi } from "@/api/schedule/index";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";

type ScheduleDetail = {
  detailId: string;
  scheduleId: string;
  doctorId: string;
  times: string;
  week: string;
  witchWeek: number;
  type: number;
  amount: number;
  lastAmount: number;
  doctorName: string;
}

type Schedule = {
  scheduleId: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  weekOneM: number;
  weekTwoM: number;
  weekThreeM: number;
  weekFourM: number;
  weekFiveM: number;
  weekSixM: number;
  weekZeroM: number;
  weekOne: string;
  weekTwo: string;
  weekThree: string;
  weekFour: string;
  weekFive: string;
  weekSix: string;
  weekZero: string;
  week: number;
  details: ScheduleDetail[];
}

const { dialog, onClose, onShow } = useDialog();

// 新增：星期字段映射，使模板更简洁
const weekMapping = [
  'weekOneM',
  'weekTwoM',
  'weekThreeM',
  'weekFourM',
  'weekFiveM',
  'weekSixM',
  'weekZeroM'
]

//表头日期
const weekArr = ref<Array<string>>([]);
//表格数据
const tableData = ref<Schedule[]>([]);
//全选
const isCheckAll = ref(false);
//全选按钮
const checkAllBtn = (val: boolean) => {
  const state = val ? 1 : 0;
  tableData.value.forEach((item: any) => {
    weekMapping.forEach(key => {
      item[key] = state;
    });
  });
};

// data
const baseForm = reactive({
  startTime: "", //开始时间
  endTime: "", //结束时间
  amount: 0,
  lastAmount: 0,
});
//根据日期判断星期几
const getweekday = (dateString: string) => {
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return weekdays[new Date(dateString).getDay()];
};
const getWeeks = (dateString: string): number => {
  const targetDate = new Date(dateString);
  const yearStart = new Date(targetDate.getFullYear(), 0, 1);

  // 计算从年初到目标日期的毫秒数差
  const diffTime = targetDate.getTime() - yearStart.getTime();

  // 计算天数差
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 计算星期数
  const weekNumber = Math.ceil((diffDays + yearStart.getDay() + 1) / 7);

  return weekNumber;
};
//显示时间
const setTime = (index: number, times: string) => {
  const weekPropMapping = [
    'weekOne', 'weekTwo', 'weekThree', 'weekFour', 'weekFive', 'weekSix', 'weekZero'
  ];
  type WeekProp = 'weekOne' | 'weekTwo' | 'weekThree' | 'weekFour' | 'weekFive' | 'weekSix' | 'weekZero';
  if(index < weekPropMapping.length) {
    const prop = weekPropMapping[index] as WeekProp;
    tableData.value.forEach((dom: Schedule) => {
      dom[prop] = times;
    });
  }
};
//第几星期
const weekDay = ref();
const weekLists = ref<string[]>([]);
//生成表头的日期
const generateDates = (starts: string, ends: string) => {
  weekDay.value = getWeeks(starts);
  //清空表头日期
  weekArr.value = [];
  weekLists.value = [];
  //开始时间
  let current = new Date(starts);
  //结束时间
  let end = new Date(ends);
  while (current <= end) {
    let time = new Date(current);
    //生成日期
    let date = dayjs(time).format("YYYY-MM-DD");
    //生成星期几
    let week = getweekday(date);
    // \n 替换为 <br> 或者其他方式在CSS中处理换行
    weekArr.value.push(`${date.substring(5)}\n(${week})`);
    weekLists.value.push(`${date}(${week})`);
    current.setDate(current.getDate() + 1);
  }
};
// 将时间戳转为yy-mm-dd
const getCurrentTime = (data: Date, num: number) => {
  let date = new Date(data);
  date.setDate(date.getDate() + num); // 处理日期的增减
  return dayjs(date).format('YYYY-MM-DD');
};

// 选择星期时间的任意一天
const changeTime = (val: any) => {
  // 判断是否清空选择器,如果存在值则是选中操作
  if (val) {
    const date = new Date(val);
    const dayOfWeek = date.getDay(); // 0是周日, 1是周一
    // 将一周的开始设为周一
    const firstDayOfWeek = new Date(date);
    firstDayOfWeek.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    
    baseForm.startTime = getCurrentTime(firstDayOfWeek, 0);
    baseForm.endTime = getCurrentTime(lastDayOfWeek, 0);
  } else {
    // 如果开启选择器清空属性,则直接将其赋值null
    baseForm.startTime = "";
    baseForm.endTime = "";
  }
  //显示表头日期
  generateDates(baseForm.startTime, baseForm.endTime);
};
const deptOptions = ref<SelectType[]>([]);
//查询科室下拉数据
const getSelectDept = async () => {
  let res = await getSelectDeptApi();
  if (res && res.code == 200) {
    deptOptions.value = res.data;
  }
};
//科室选择的事件
const deptChange = (e: any) => {
    addModel.userId = ''; // 切换科室时清空已选医生
    tableData.value = [];
    if (e) {
        getSelectUser(e);
    }
};
//医生下拉数据

const selectUser = ref<any>([]);
//查询医生的数据
const getSelectUser = async (deptId: string) => {
  selectUser.value = [];
  tableData.value = [];
  let res = await getSelectUserApi(deptId);
  if (res && res.code == 200) {
    //显示医生下拉框数据
    selectUser.value = res.data;

    //生成表格数据
    if (res.data && res.data.length > 0) {
      tableData.value = res.data.map((user: SelectType) => ({
        scheduleId: "",
        doctorId: user.value,
        doctorName: user.label,
        departmentName: "",
        weekOneM: 0,
        weekTwoM: 0,
        weekThreeM: 0,
        weekFourM: 0,
        weekFiveM: 0,
        weekSixM: 0,
        weekZeroM: 0,
        weekOne: "",
        weekTwo: "",
        weekThree: "",
        weekFour: "",
        weekFive: "",
        weekSix: "",
        weekZero: "",
        week: 0,
        details: [],
      }));
    }
  }
};
//下拉选择医生的事件
const docChange = (e: string) => {
  tableData.value = [];
  // 如果清空了医生，则恢复显示该科室所有医生
  if (!e) {
      getSelectUser(addModel.deptId);
      return;
  }
  let select = selectUser.value.find((item: SelectType) => item.value == e);
  if (select) {
    let obj = {
      scheduleId: "",
      doctorId: select.value,
      doctorName: select.label,
      departmentName: "",
      weekOneM: 0,
      weekTwoM: 0,
      weekThreeM: 0,
      weekFourM: 0,
      weekFiveM: 0,
      weekSixM: 0,
      weekZeroM: 0,
      weekOne: "",
      weekTwo: "",
      weekThree: "",
      weekFour: "",
      weekFive: "",
      weekSix: "",
      weekZero: "",
      week: 0,
      details: [],
    };
    tableData.value.push(obj);
  }
};
//创建表单ref属性
const addRef = ref();
//表单验证规则
const rules = reactive({});
//创建表单绑定对象
const addModel = reactive({
  deptId: "",
  userId: "",
});
//排班按钮
const show = async () => {
  // 清空数据
  scheduleList.value = [];
  weekArr.value = [];
  weekLists.value = [];
  addModel.deptId = "";
  addModel.userId = "";
  baseForm.startTime = "";
  baseForm.endTime = "";
  baseForm.amount = 0;
  isCheckAll.value = false;
  selectUser.value = [];
  tableData.value = [];
  dialog.width = 1100; // 调整宽度以适应新布局
  dialog.height = 650; // 调整高度
  dialog.title = "新建医生排班计划";
  await getSelectDept();
  onShow();
};
defineExpose({
  show,
});
const getBwttwen = (str: string) => {
  if(!str) return '';
  let startIndex = str.indexOf("(") + 1;
  let endIndex = str.indexOf(")");
  return str.substring(startIndex, endIndex);
};

const buildWeekdayObjects = (schedule: any) => {
  const dayMap = {
    weekOne: 0, weekTwo: 1, weekThree: 2, weekFour: 3, weekFive: 4, weekSix: 5, weekZero: 6,
  };

  for (const dayKey in dayMap) {
      const typeKey = `${dayKey}M`;
      // 只为已勾选的班次创建详情
      if (schedule[typeKey] === 1) {
            const weekdayObject: ScheduleDetail = {
                detailId: "",
                scheduleId: "",
                doctorId: schedule.doctorId,
                times: schedule[dayKey].split("(")[0], // 获取日期部分
                week: getBwttwen(schedule[dayKey]),    // 获取星期部分
                witchWeek: schedule.week,
                type: schedule[typeKey],
                amount: baseForm.amount,
                lastAmount: baseForm.amount,
                doctorName: schedule.doctorName,
            };
            scheduleList.value.push(weekdayObject);
      }
  }
};
//注册事件
const emits = defineEmits(["onRefsh"]);
//排班信息
const scheduleList = ref<any>([]);
//生成排班
const commit = async () => {
  if (tableData.value.length === 0) {
    ElMessage.warning("请至少选择一个科室并确保有医生数据显示！");
    return;
  }
  if (!baseForm.startTime) {
    ElMessage.warning("请选择排班周期！");
    return;
  }
  if (baseForm.amount <= 0) {
    ElMessage.warning("放号数量必须大于0！");
    return;
  }

  // 重置排班列表
  scheduleList.value = [];

  weekLists.value.forEach((date, index) => {
    setTime(index, date);
  });
  
  for (let i = 0; i < tableData.value.length; i++) {
    tableData.value[i].week = weekDay.value;
    buildWeekdayObjects(tableData.value[i]);
  }

  if(scheduleList.value.length === 0){
    ElMessage.warning("没有选择任何班次，无法提交！");
    return;
  }

  try {
    await Promise.all(
      scheduleList.value.map((detail: ScheduleDetail) =>
        addInstanceApi({
          doctorId: detail.doctorId,
          doctorName: detail.doctorName,
          departmentName: "",
          scheduleDate: detail.times,
          timeSlot: 1,
          status: 1,
          slots: [
            {
              slotType: "普通号",
              totalAmount: detail.amount,
              availableAmount: detail.lastAmount,
            },
          ],
        } as any)
      )
    );
    ElMessage.success("排班创建成功！");
    emits("onRefsh");
    onClose();
  } catch (e) {
    ElMessage.error("排班创建失败");
  }
};
</script>

<style scoped>
/* 整体容器样式 */
.schedule-container {
  padding: 10px;
  background-color: #f9fafb;
}

/* 卡片样式 */
.form-card {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
/* 表单项美化 */
:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
    width: 100%;
}

/* 表格操作区域 */
.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 5px;
}

.check-all-btn {
  transition: all 0.3s ease;
}

/* 表格整体样式 */
.schedule-table {
  border-radius: 8px;
  overflow: hidden; /* 确保圆角生效 */
  border: 1px solid #ebeef5;
}

/* 表头样式穿透 */
:deep(.el-table__header-wrapper th) {
  background-color: #007b83 !important; /* 新的主题色 */
  color: #ffffff;
  font-weight: 600;
  text-align: center;
  white-space: pre-wrap; /* 支持label中的\n换行 */
  line-height: 1.4;
  padding: 12px 0;
}

/* 表格单元格样式 */
:deep(.el-table__cell) {
  text-align: center;
  padding: 10px 0;
}

/* 表格行悬停效果 */
:deep(.el-table__body tr:hover > td) {
  background-color: #e8f3f3 !important; /* 淡青色悬停背景 */
}

/* 固定列的样式调整 */
:deep(.el-table__fixed) {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
}

/* 斑马纹颜色 */
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
    background-color: #f2f9f9;
}
</style>
