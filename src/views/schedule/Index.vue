<template>
  <el-main height="">
    <!-- 查询栏 -->
    <el-form :model="searchParm" :inline="true" size="default">
      <el-form-item>
        <el-input
          v-model="searchParm.doctorName"
          placeholder="输入医生姓名"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" @click="searchBtn">查询</el-button>
        
        <el-button
          v-if="global.$hasPerm(['sys:scheduleDetail:add'])"
          type="primary"
          icon="Plus"
          @click="addBtn"
          >创建</el-button
        >
        <el-button icon="Delete" @click="handlerMuchDel" type="danger"
          >删除</el-button
        >
      </el-form-item>
    </el-form>
    <!-- 表格数据 -->
    <el-table
      :height="tableHeight"
      :data="tableList"
      @selection-change="handleSelectionChange"
      border
      stripe
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="doctorName" label="医生姓名"></el-table-column>
      <el-table-column prop="deptName" label="科室"></el-table-column>
      <el-table-column prop="week" label="星期"></el-table-column>
      <el-table-column prop="times" label="日期"></el-table-column>
      <el-table-column prop="witchWeek" label="星期数"></el-table-column>
      <el-table-column prop="amount" label="放号"></el-table-column>
      <el-table-column prop="type" label="是否出诊">
        <template #default="scope">
          <el-tag v-if="scope.row.type == '0'" type="danger" size="normal"
            >否</el-tag
          >
          <el-tag v-if="scope.row.type == '1'" type="success" size="normal"
            >出诊</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        v-if="
          global.$hasPerm([
            'sys:scheduleDetail:edit',
            'sys:scheduleDetail:delete',
          ])
        "
        label="操作"
        align="center"
        width="220"
      >
        <template #default="scope">
          <el-button
            v-if="global.$hasPerm(['sys:scheduleDetail:edit'])"
            type="primary"
            icon="Edit"
            size="default"
            @click="editBtn(scope.row)"
            >修改</el-button
          >
          <el-button
            v-if="global.$hasPerm(['sys:scheduleDetail:delete'])"
            type="danger"
            icon="Delete"
            size="default"
            @click="deleteBtn(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="sizeChange"
      @current-change="currentChange"
      :current-page.sync="searchParm.currentPage"
      :page-sizes="[10, 20, 40, 80, 100]"
      :page-size="searchParm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="searchParm.total"
      background
    >
    </el-pagination>
    <!-- 修改：只能修改 放号 和 是否出诊 -->
    <SysDialog
      :title="dialog.title"
      :width="dialog.width"
      :height="dialog.height"
      :visible="dialog.visible"
      @on-close="onClose"
      @on-confirm="commot"
    >
      <template v-slot:content>
        <el-form
          :model="addModel"
          ref="addForm"
          :rules="rules"
          label-width="90px"
          :inline="false"
          size="normal"
        >
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
          <el-form-item label="医生：" prop="doctorId">
            <el-select
              style="width: 100%"
              v-model="addModel.doctorId"
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
            </el-select>
          </el-form-item>
          <el-form-item prop="times" label="出诊时间:">
            <el-date-picker
              style="width: 100%"
              @change="timesChange"
              v-model="addModel.times"
              type="date"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              placeholder="选择出诊时间"
              size="default"
            />
          </el-form-item>
          <el-form-item prop="week" label="出诊星期:">
            <el-input readonly v-model="addModel.week"></el-input>
          </el-form-item>
          <el-form-item prop="amount" label="放号:">
            <el-input v-model="addModel.amount"></el-input>
          </el-form-item>
          <el-form-item prop="type" label="是否出诊:">
            <el-radio-group v-model="addModel.type">
              <el-radio :label="'0'">否</el-radio>
              <el-radio :label="'1'">出诊</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
    </SysDialog>
    <AddSchedule ref="addSchedule" @onRefsh="onRefsh"></AddSchedule>
  </el-main>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import AddSchedule from "./AddSchedule.vue";
import useInstance from "@/hooks/useInstance";
import {
  getListApi,
  ScheduleDetail,
  scheduleEditApi,
  scheduleDeleteApi,
  delListApi,
} from "@/api/schedule/index";
import SysDialog from "@/components/SysDialog.vue";
import useDialog from "@/hooks/useDialog";
import { getSelectDeptApi } from "@/api/department/index";
import { getSelectUserApi } from "@/api/user/index";
import { ElMessage } from "element-plus";

const { dialog, onClose, onShow } = useDialog();
const { global } = useInstance();

//创建表单ref属性
const addForm = ref();
// const addSchedule = ref();
//创建表单绑定事件
const addModel = reactive({
  deptId: "",
  scheduleId: "",
  doctorId: "",
  times: "",
  week: "",
  witchWeek: "",
  type: "",
  amount: "",
  doctorName: "",
});
//表单验证规则
const rules = reactive({
  doctorId: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "选择医生",
    },
  ],
  times: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "选择日期",
    },
  ],
  week: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "填写星期",
    },
  ],
  type: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "选择是否出诊",
    },
  ],
});
//查询参数
const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  doctorName: "",
  total: 0,
});

const addSchedule = ref();
const addBtn = () => {
  console.log(addSchedule.value);
  addSchedule.value.show();
};
//表格数据
const tableList = ref([]);
//查询列表数据
const getList = async () => {
  let res = await getListApi(searchParm);
  if (res && res.code == 200) {
    //显示表格的数据
    tableList.value = res.data.records;
    //显示分页总数
    searchParm.total = res.data.total;
  }
};
//页容量改变时触发
const sizeChange = (size: number) => {
  searchParm.pageSize = size;
  getList();
};
//页数改变时触发
const currentChange = (page: number) => {
  searchParm.currentPage = page;
  getList();
};
//查询
const searchBtn = () => {
  searchParm.currentPage = 1;
  getList();
};
//重置
const resetBtn = () => {
  searchParm.doctorName = "";
  searchParm.currentPage = 1;
  getList();
};
// //修改
// const editBtn = (row:ScheduleDetail)=>{

// }
//删除
const deleteBtn = async (row: ScheduleDetail) => {
  let confirm = await global.$myconfirm("确定删除该数据吗?");
  if (confirm) {
    let res = await scheduleDeleteApi(row.scheduleId);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};
const onRefsh = () => {
  searchParm.doctorName = "";
  searchParm.currentPage = 1;
  getList();
};
const mutipleSelection = ref([]); //定义空数组，临时存放数据
const handleSelectionChange = (val: any) => {
  console.log(val);
  mutipleSelection.value = val;
};
const handlerMuchDel = async () => {
  let ids = mutipleSelection.value.map((schedule: any) => schedule.scheduleId);
  const confirm = await global.$myconfirm("确定删除该排班吗？");
  if (confirm) {
    let res = await delListApi(ids);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};

const deptOptions = ref([]);
//查询科室下拉数据
const getSelectDept = async () => {
  let res = await getSelectDeptApi();
  if (res && res.code == 200) {
    deptOptions.value = res.data;
  }
};
//医生下拉数据
const selectUser = ref<any>([]);
//科室选择的事件
const deptChange = (e: any) => {
  //清空医生
  selectUser.value = [];
  getSelectUser(e);
};
const getSelectUser = async (deptId: string) => {
  //清空医生下拉数据
  selectUser.value = [];
  //解决下拉数据清空，但是下拉页面数据还存在问题
  addModel.doctorId = "";
  //查询医生下拉数据
  let res = await getSelectUserApi(deptId);
  if (res && res.code == 200) {
    //显示医生下拉框数据
    selectUser.value = res.data;
  }
};

//修改
const editBtn = async (row: ScheduleDetail) => {
  console.log(row);
  dialog.title = "修改排班";
  dialog.height = 300;
  dialog.width = 700;
  //查询科室
  await getSelectDept();
  let obj = {
    label: "",
    value: "",
  };
  obj.label = row.doctorName;
  obj.value = row.doctorId;
  selectUser.value.push(obj);
  Object.assign(addModel, row);
  onShow();
  //清空表单
  addForm.value?.resetFields();
};
//修改保存
const commot = async () => {
  let res = await scheduleEditApi(addModel);
  if (res && res.code == 200) {
    ElMessage.success(res.msg);
    getList();
    onClose();
  }
};
//医生选择事件
const docChange = (e: any) => {
  console.log(e);
  let res = selectUser.value.filter((item: any) => item.value == e);
  console.log(res);
  addModel.doctorName = res[0].label;
  console.log(addModel);
};

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
//日期选择
const timesChange = (e: any) => {
  addModel.week = getweekday(e);
};
//表格高度
const tableHeight = ref(0);
onMounted(() => {
  getList();
  nextTick(() => {
    tableHeight.value = window.innerHeight - 230;
  });
});
</script>

<style scoped></style>
