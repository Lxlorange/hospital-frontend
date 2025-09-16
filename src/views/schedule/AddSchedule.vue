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
      <el-form
        :model="addModel"
        ref="addRef"
        :rules="rules"
        label-width="90px"
        :inline="false"
        size="normal"
      >
        <el-row>
          <el-col :span="12" :offset="0">
            <el-form-item label="时间：">
              <el-date-picker
                style="width: 100%"
                v-model="baseForm.startTime"
                type="week"
                placeholder="选择一星期"
                :format="baseForm.startTime + ' 至 ' + baseForm.endTime"
                @change="changeTime"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="科室：" prop="deptId">
              <el-select
                style="width: 100%"
                v-model="addModel.deptId"
                clearable
                placeholder="选择科室"
                @change="deptChange"
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
        </el-row>

        <el-row>
          <el-col :span="12" :offset="0">
            <el-form-item label="医生：" prop="userId">
              <el-select
                style="width: 100%"
                v-model="addModel.userId"
                clearable
                placeholder="选择医生"
                @change="docChange"
              >
                <el-option
                  v-for="item in selectUser"
                  :key="item['value']"
                  :label="item['label']"
                  :value="item['value']"
                />
              </el-select> </el-form-item
            ></el-col
          >
          <el-col :span="12" :offset="0">
            <el-form-item label="放号：" size="normal">
              <el-input
                type="number"
                v-model="baseForm.amount"
                placeholder="输入放号"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-form-item>
        <el-checkbox-button
          v-model="isCheckAll"
          @change="checkAllBtn"
          style="margin-left: 20px; --el-checkbox-button-checked-bg-color: #67c23a; --el-checkbox-button-checked-text-color: #ffffff; --el-checkbox-button-checked-border-color: #67c23a;"
          >全选
        </el-checkbox-button>
      </el-form-item>

      <el-table
        stripe
        :data="tableData"
        height="500"
        ref="multipleTable"
        tooltip-effect="dark"
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        :row-style="rowStyle"
        :cell-style="cellStyle"
      >
        <el-table-column width="120" prop="doctorName" label="医生">
        </el-table-column>

        <el-table-column width="120" :label="weekArr[0]">
          <template #default="scope">
            <el-checkbox
              v-model="scope.row.weekOneM"
              :true-label="1"
              :false-label="0"
            >
            </el-checkbox>
          </template>
        </el-table-column>
        <el-table-column width="120" :label="weekArr[1]">
          <template #default="scope">
            <el-checkbox
              v-model="scope.row.weekTwoM"
              :true-label="1"
              :false-label="0"
            >
            </el-checkbox>
          </template>
        </el-table-column>
        <el-table-column width="120" :label="weekArr[2]">
          <template #default="scope">
            <el-checkbox
              v-model="scope.row.weekThreeM"
              :true-label="1"
              :false-label="0"
            >
            </el-checkbox>
          </template>
        </el-table-column>
        <el-table-column width="120" :label="weekArr[3]">
          <template #default="scope">
            <el-checkbox
              v-model="scope.row.weekFourM"
              :true-label="1"
              :false-label="0"
            >
            </el-checkbox>
          </template>
        </el-table-column>
        <el-table-column width="120" :label="weekArr[4]">
          <template #default="scope">
            <el-checkbox
              v-model="scope.row.weekFiveM"
              :true-label="1"
              :false-label="0"
            >
            </el-checkbox>
          </template>
        </el-table-column>
        <el-table-column width="120" :label="weekArr[5]">
          <template #default="scope">
            <el-checkbox
              v-model="scope.row.weekSixM"
              :true-label="1"
              :false-label="0"
            >
            </el-checkbox>
          </template>
        </el-table-column>
        <el-table-column width="120" :label="weekArr[6]">
          <template #default="scope">
            <el-checkbox
              v-model="scope.row.weekZeroM"
              :true-label="1"
              :false-label="0"
            >
            </el-checkbox>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </SysDialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import SysDialog from "@/components/SysDialog.vue";
import useDialog from "@/hooks/useDialog";
import { getSelectDeptApi } from "@/api/department/index";
import { getSelectUserApi } from "@/api/user/index";
import {
  SelectType,
  scheduleAddApi,
  ScheduleDetail,
  Schedule,
} from "@/api/schedule/index";
import dayjs from 'dayjs';
import { ElMessage } from "element-plus";

const { dialog, onClose, onShow } = useDialog();
//表头日期
const weekArr = ref<Array<string>>([]);
//表格数据
const tableData = ref<any>([]);
//全选
const isCheckAll = ref(false);
//全选按钮
const checkAllBtn = (val: boolean) => {
  if (val) {
    //全选
    tableData.value.map((item: any) => {
      item.weekOneM = 1;
      item.weekFiveM = 1;
      item.weekFourM = 1;
      item.weekSixM = 1;
      item.weekThreeM = 1;
      item.weekTwoM = 1;
      item.weekZeroM = 1;
    });
  } else {
    //取消
    tableData.value.map((item: any) => {
      item.weekFiveM = 0;
      item.weekFourM = 0;
      item.weekOneM = 0;
      item.weekSixM = 0;
      item.weekThreeM = 0;
      item.weekTwoM = 0;
      item.weekZeroM = 0;
    });
  }
};

const headerCellStyle = () => {
  return {
    "background-color": "#409eff",
    color: "#F9F9FAFF",
    "text-align": "center",
    "border-right": "1px solid #cbcae6",
    "border-bottom": "1px solid #cbcae6",
  };
};
const rowStyle = () => {
  return { height: "30", width: "500" };
};
const cellStyle = () => {
  return {
    height: "30",
    "border-right": "1px solid #cbcae6",
    "text-align": "center",
    "border-bottom": "1px solid #cbcae6",
  };
};
// data
const baseForm = reactive({
  startTime: "", //开始时间
  endTime: "", //结束时间
  amount: 0,
  lastAmount:0
});
//根据日期判断星期几
const getweekday = (dateString: string) => {
  const date = new Date(dateString);
  const weekdays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return weekdays[date.getDay()];
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
  switch (index) {
    case 0:
      tableData.value.forEach((dom: Schedule) => {
        dom.weekOne = times;
      });
      break;
    case 1:
      tableData.value.forEach((dom: Schedule) => {
        dom.weekTwo = times;
      });
      break;
    case 2:
      tableData.value.forEach((dom: Schedule) => {
        dom.weekThree = times;
      });
      break;
    case 3:
      tableData.value.forEach((dom: Schedule) => {
        dom.weekFour = times;
      });
      break;
    case 4:
      tableData.value.forEach((dom: Schedule) => {
        dom.weekFive = times;
      });
      break;
    case 5:
      tableData.value.forEach((dom: Schedule) => {
        dom.weekSix = times;
      });
      break;
    case 6:
      tableData.value.forEach((dom: Schedule) => {
        dom.weekZero = times;
      });
      break;
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
    weekArr.value.push(`${date}\n(${week})`);
    weekLists.value.push(`${date}(${week})`);
    current.setDate(current.getDate() + 1);
  }
};
// 将时间戳转为yy-mm-dd
const getCurrentTime = (data: Date, num: number) => {
  let date = new Date(data);
  const Y = date.getFullYear();
  const M =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const D =
    date.getDate() + num < 10
      ? "0" + (date.getDate() + num)
      : date.getDate() + num;
  let datestr = Y + "-" + M + "-" + D;

  return datestr;
};

// 选择星期时间的任意一天
const changeTime = (val: any) => {
  // 判断是否清空选择器,如果存在值则是选中操作
  if (val) {
    const date = new Date(val);
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    const week = date.getDay();
    const start = new Date(y, m, d - week + 1);
    const end = new Date(y, m, d - week + 7);
    baseForm.startTime = getCurrentTime(start, 0);
    baseForm.endTime = getCurrentTime(end, 0);
  } else {
    // 如果开启选择器清空属性,则直接将其赋值null
    baseForm.startTime = "";
    baseForm.endTime = "";
  }
  //显示表头日期
  generateDates(baseForm.startTime, baseForm.endTime);
};
const deptOptions = ref([]);
//查询科室下拉数据
const getSelectDept = async () => {
  let res = await getSelectDeptApi();
  if (res && res.code == 200) {
    deptOptions.value = res.data;
  }
};
//科室选择的事件
const deptChange = (e: any) => {
  getSelectUser(e);
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
      for (let i = 0; i < res.data.length; i++) {
        let obj = {
          scheduleId: "",
          doctorId: "",
          doctorName: "",
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
        obj.doctorId = res.data[i].value;
        obj.doctorName = res.data[i].label;
        tableData.value.push(obj);
      }
    }
  }
};
//下拉选择医生的事件
const docChange = (e: number) => {
  console.log(e);
  console.log(selectUser.value);
  tableData.value = [];
  let select = selectUser.value.find((item: SelectType) => item.value == e);
  if (select) {
    let obj = {
      scheduleId: "",
      doctorId: "",
      doctorName: "",
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
    obj.doctorId = select.value;
    obj.doctorName = select.label;
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
  addModel.deptId = '';
  addModel.userId = '';
  baseForm.startTime = '';
  baseForm.endTime = '';
  baseForm.amount = 0;
  baseForm
  isCheckAll.value = false;
  selectUser.value = [];
  tableData.value = [];
  weekArr.value = [];
  dialog.width = 1000;
  dialog.height = 500;
  dialog.title = "创建排班";
  await getSelectDept();
  onShow();
};
defineExpose({
  show,
});
const getBwttwen = (str: string) => {
  let startIndex = str.indexOf("(") + 1;
  let endIndex = str.indexOf(")");
  return str.substring(startIndex, endIndex);
};

const buildWeekdayObjects = (schedule: any) => {
  console.log("00000");
  console.log(schedule);
  // const weekdaysObjects: ScheduleDetail[] = [];
  const dayMap = {
    weekOne: 0,
    weekTwo: 1,
    weekThree: 2,
    weekFour: 3,
    weekFive: 4,
    weekSix: 5,
    weekZero: 6,
  };

  for (const dayKey in dayMap) {
    // const weekdayIndex = dayMap[dayKey];
    const weekdayObject: ScheduleDetail = {
      detailId:"",
      scheduleId: "",
      doctorId: "",
      times: "",
      week: "",
      witchWeek: "",
      type: "",
      amount: 0,
      lastAmount:0,
      doctorName: "",
    };
    weekdayObject.amount = baseForm.amount;
    weekdayObject.lastAmount = baseForm.amount;
    weekdayObject.doctorId = schedule.doctorId;
    weekdayObject.doctorName = schedule.doctorName;
    weekdayObject.witchWeek = schedule.week;
    weekdayObject.week = getBwttwen(schedule[dayKey]);
    console.log(dayKey);
    // Add the date string (e.g., "weekOne")
    //截取字符2024-04-23(星期二)中的日期
    weekdayObject.times = schedule[dayKey].split("(")[0];
    //截取字符2024-04-23(星期二)中的星期

    // Add the corresponding number (e.g., "weekOneM")
    const numberKey = `${dayKey}M`;
    if (schedule.hasOwnProperty(numberKey)) {
      weekdayObject.type = schedule[numberKey];
    }
    scheduleList.value.push(weekdayObject);
    // weekdaysObjects[weekdayIndex] = weekdayObject;
  }
};
//注册事件
const emits = defineEmits(['onRefsh'])
//排班信息
const scheduleList = ref<any>([]);
//生成排班
const commit = async () => {
  // console.log(tableData.value);
  //显示对应的日期和星期数
  if (tableData.value.length == 0) {
    ElMessage.warning("选择要排班的医生！");
    return;
  }
  if(baseForm.amount < 1){
    ElMessage.warning("填写放号！");
    return;
  }
  weekLists.value.forEach((date, index) => {
    console.log("99999");
    console.log(index);
    console.log(weekLists.value);
    setTime(index, date);
  });
  //显示第几星期
  for (let i = 0; i < tableData.value.length; i++) {
    tableData.value[i].week = weekDay.value;
    buildWeekdayObjects(tableData.value[i]);
  }
  console.log(scheduleList.value);
  let res = await scheduleAddApi(scheduleList.value);
  if (res && res.code == 200) {
    emits('onRefsh')
    onClose();
  }
};
</script>

<style scoped></style>