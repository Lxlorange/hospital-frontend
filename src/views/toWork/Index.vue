<template>
  <el-main height="" class="main-container">
    <el-card shadow="never" class="content-card">
      <el-form :model="searchParm" :inline="true" size="default" class="search-form">
        <el-form-item>
          <el-input
            v-model="searchParm.doctorName"
            placeholder="输入医生姓名"
            class="search-input"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="custom-btn btn-query" icon="Search" @click="searchBtn">查询</el-button>
          <el-button
            v-if="global.$hasPerm(['sys:scheduleDetail:add'])"
            class="custom-btn btn-create"
            icon="Plus"
            @click="addBtn"
            >创建</el-button
          >
          <el-button
            class="custom-btn btn-batch-delete"
            icon="Delete"
            @click="handlerMuchDel"
            >删除</el-button
          >
        </el-form-item>
      </el-form>

      <el-table
        :height="tableHeight"
        :data="tableList"
        @selection-change="handleSelectionChange"
        border
        stripe
        class="data-table"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="doctorName" label="医生姓名"></el-table-column>
        <el-table-column prop="deptName" label="科室"></el-table-column>
        <el-table-column prop="week" label="星期"></el-table-column>
        <el-table-column prop="times" label="日期"></el-table-column>
        <el-table-column prop="amount" label="放号"></el-table-column>
        <el-table-column prop="type" label="是否出诊">
          <template #default="scope">
            <el-tag v-if="scope.row.type == '0'" type="danger" size="normal" effect="light"
              >否</el-tag
            >
            <el-tag v-if="scope.row.type == '1'" type="success" size="normal" effect="light"
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
              class="custom-btn btn-edit"
              icon="Edit"
              size="default"
              @click="editBtn(scope.row)"
              >修改</el-button
            >
            <el-button
              v-if="global.$hasPerm(['sys:scheduleDetail:delete'])"
              class="custom-btn btn-delete"
              icon="Delete"
              size="default"
              @click="deleteBtn(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination-container"
        @size-change="sizeChange"
        @current-change="currentChange"
        v-model:current-page="searchParm.currentPage"
        :page-sizes="[10, 20, 40, 80, 100]"
        v-model:page-size="searchParm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="searchParm.total"
        background
      >
      </el-pagination>
    </el-card>

    <SysDialog
      :title="dialog.title"
      :width="dialog.width"
      :height="dialog.height"
      :visible="dialog.visible"
      @on-close="onDialogClose"
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
    <addWork ref="addWorkRef" @onRefsh="onRefsh"></addWork>
  </el-main>
</template>

<script setup lang="ts">
// ---------- Script 部分完全没有改动，保持原样 ----------
import { ref, reactive, onMounted, nextTick } from "vue";
import addWork from "./addWork.vue";
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
import { ElMessage, FormInstance } from "element-plus";

const { dialog, onClose, onShow } = useDialog();
const { global } = useInstance();

//创建表单ref属性
const addForm = ref<FormInstance>();
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
      message: "请选择医生",
    },
  ],
  times: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "请选择日期",
    },
  ],
  week: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "请填写星期",
    },
  ],
  type: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "请选择是否出诊",
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

// 关键修改点 1: 重命名 ref
const addWorkRef = ref();

// 关键修改点 2: 更新 addBtn 函数以使用新名称
const addBtn = () => {
  console.log(addWorkRef.value);
  addWorkRef.value.show();
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
  if (ids.length === 0) {
    ElMessage.warning("请至少选择一条数据！");
    return;
  }
  const confirm = await global.$myconfirm("确定删除选中的排班吗？");
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
    label: row.doctorName,
    value: row.doctorId,
  };
  // 清空之前的医生列表并添加当前医生
  selectUser.value = [obj];

  onShow();
  // 使用 nextTick 确保 DOM 更新后再赋值
  nextTick(() => {
    Object.assign(addModel, row);
  });
};

const onDialogClose = () => {
  onClose(); // 调用 useDialog 的 onClose 关闭弹窗
  addForm.value?.resetFields(); // 重置表单验证和数据
};

//修改保存
const commot = async () => {
  await addForm.value?.validate();
  let res = await scheduleEditApi(addModel);
  if (res && res.code == 200) {
    ElMessage.success(res.msg);
    getList();
    onDialogClose();
  }
};

//医生选择事件
const docChange = (e: any) => {
  console.log(e);
  let res = selectUser.value.filter((item: any) => item.value == e);
  console.log(res);
  if (res.length > 0) {
    addModel.doctorName = res[0].label;
  }
  console.log(addModel);
};

//根据日期判断星期几
const getweekday = (dateString: string) => {
  if (!dateString) return "";
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
  if (e) {
    addModel.week = getweekday(e);
  } else {
    addModel.week = "";
  }
};
//表格高度
const tableHeight = ref(0);
onMounted(() => {
  getList();
  nextTick(() => {
    tableHeight.value = window.innerHeight - 250; // 调整了高度计算以适应新布局
  });
});
</script>

<style scoped>
/* ---------- 这是新增的 Style 部分 ---------- */

/* 主容器 */
.main-container {
  background-color: #f0f2f5;
  padding: 20px;
}

/* 内容卡片 */
.content-card {
  border-radius: 8px;
  border: none;
}

/* 搜索表单 */
.search-form {
  margin-bottom: 20px;
}
.search-input {
  width: 250px;
}
:deep(.search-input .el-input__wrapper) {
  border-radius: 6px;
}

/* --- 自定义按钮样式 --- */
.custom-btn {
  border: none;
  border-radius: 6px;
  color: #fff;
  padding: 8px 20px;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.custom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}
.custom-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.custom-btn .el-icon {
  vertical-align: middle;
  margin-right: 5px;
}

/* 查询按钮 */
.btn-query {
  background: linear-gradient(45deg, #409eff 30%, #66b1ff 90%);
}
/* 创建按钮 */
.btn-create {
  background: linear-gradient(45deg, #67c23a 30%, #85ce61 90%);
}
/* 批量删除按钮 */
.btn-batch-delete {
  background: linear-gradient(45deg, #f56c6c 30%, #f89898 90%);
}
/* 表格内修改按钮 */
.btn-edit {
  background: linear-gradient(45deg, #e6a23c 30%, #ebb563 90%);
}
/* 表格内删除按钮 */
.btn-delete {
  background: linear-gradient(45deg, #f56c6c 30%, #f89898 90%);
}

/* --- 数据表格样式 --- */
.data-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden; /* 确保圆角生效 */
}
/* 表头样式 */
:deep(.data-table th.el-table__cell) {
  background-color: #fafafa !important;
  color: #333;
  font-weight: 600;
}
/* 表格行悬停效果 */
:deep(.el-table__body tr:hover > td) {
  background-color: #ecf5ff !important;
}

/* 分页容器 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>