<template>
  <el-main>
    <!-- 查询栏 -->
    <el-form :model="searchParm" :inline="true" size="default">
      <el-form-item>
        <el-input
          placeholder="输入关键字"
          v-model="searchParm.name"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" @click="searchBtn">查询</el-button>
        
      </el-form-item>
    </el-form>
    <!-- 表格数据 -->
    <el-table :height="tableHeight" :data="tableList" border stripe>
      <el-table-column prop="visitname" label="就诊人" />
      <el-table-column prop="nickName" label="医生" />
      <el-table-column prop="times" label="挂号时间" />
      <el-table-column prop="timesArea" label="挂号时段">
        <template #default="scope">
          <el-tag
            v-if="scope.row.timesArea == '0'"
            type="primary"
            size="default"
            effect="dark"
            >上午</el-tag
          >
          <el-tag
            v-if="scope.row.timesArea == '1'"
            type="warning"
            size="default"
            effect="dark"
            >下午</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="week" label="星期" />
      <el-table-column prop="hasVisit" label="是否就诊">
        <template #default="scope">
          <el-tag
            v-if="scope.row.hasVisit == '0'"
            type="warning"
            size="default"
            effect="dark"
            >未就诊</el-tag
          >
          <el-tag
            v-if="scope.row.hasVisit == '1'"
            type="primary"
            size="default"
            effect="dark"
            >已就诊</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="hasLive" label="是否需要住院">
        <template #default="scope">
          <el-tag
            v-if="scope.row.hasLive == '0'"
            type="warning"
            size="default"
            effect="dark"
            >否</el-tag
          >
          <el-tag
            v-if="scope.row.hasLive == '1'"
            type="primary"
            size="default"
            effect="dark"
            >是</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="advice" label="医嘱、诊断说明">
        <template #default="scope">
          <el-button type="success" size="default" @click="lookBtn(scope.row)"
            >查看医嘱</el-button
          >
        </template>
      </el-table-column>
      <el-table-column prop="visitTime" label="就诊时间" />
      <el-table-column label="操作" width="220" align="center">
        <template #default="scope">
          <el-button
            type="primary"
            icon="Edit"
            size="default"
            @click="makeBtn(scope.row)"
            >就诊</el-button
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
     <!-- 医嘱、诊断说明 -->
     <SysDialog
      :title="dialog.title"
      :visible="dialog.visible"
      :width="dialog.width"
      :height="dialog.height"
      @onClose="onClose"
      @onConfirm="commit"
    >
      <template v-slot:content>
        <el-form
          :model="addModel"
          ref="addRef"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item prop="textContent" label="诊断详情">
            <div v-if="dialog.visible" style="border: 1px solid #ccc">
              <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                style="height: 300px; overflow-y: hidden"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
              />
            </div>
          </el-form-item>
          <el-form-item prop="hasLive" label="是否住院：">
            <el-radio-group v-model="addModel.hasLive">
              <el-radio :label="'0'">否</el-radio>
              <el-radio :label="'1'">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
    </SysDialog>
    <!-- 查看医嘱 -->
    <el-dialog
      v-model="dialogVisible"
      title="医嘱详情"
      width="35%"
      :before-close="handleClose"
    >
      <div v-html="looks" style="height: 300px;"></div>
    </el-dialog>
  </el-main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { userSotre } from "@/store/user/index";
import { getListApi, MakeOrderVisit, editApi } from "@/api/order_visit/index";
import SysDialog from "@/components/SysDialog.vue";
import useDialog from "@/hooks/useDialog";
import useEditor from "@/hooks/useEditor";
import { ElMessage } from "element-plus";
//文本修改器
const {
  editorRef,
  handleCreated,
  mode,
  editorConfig,
  valueHtml,
  toolbarConfig,
} = useEditor();
const { dialog, onClose, onShow } = useDialog();
const ustore = userSotre();
const addRef = ref();
//列表查询参数
const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  name: "",
  timesArea: "",
  doctorId: ustore.getUserId,
});
//表单绑定的对象
const addModel = reactive({
  visitId: "",
  advice: "",
  hasLive: "",
  hasVisit: "1",
  makeId: "",
});
//表单验证规则
const rules = reactive({
  advice: [
    {
      required: true,
      message: "诊断详情不能为空",
      trigger: ["blur", "change"],
    },
  ],
  hasLive: [
    {
      required: true,
      message: "选择是否需要住院",
      trigger: ["blur", "change"],
    },
  ],
});
//查询按钮
const searchBtn = () => {
  searchParm.currentPage = 1;
  getList();
};
//重置按钮
const resetBtn = () => {
  getList();
};
const makeBtn = (row: MakeOrderVisit) => {
  addModel.visitId = row.visitId;
  addModel.hasLive = row.hasLive;
  valueHtml.value = row.advice;
  addModel.makeId = row.makeId;
  dialog.title = "诊断医嘱";
  dialog.width = 850;
  dialog.height = 480;
  onShow();
  //表单清空
  addRef.value?.resetFields();
};
//表格数据
const tableList = ref([]);
//表格高度
const tableHeight = ref(0);
//列表查询
const getList = async () => {
  let res = await getListApi(searchParm);
  if (res && res.code == 200) {
    tableList.value = res.data.records;
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
//查看医嘱
const dialogVisible = ref(false)
const looks = ref('')
const lookBtn = (row:MakeOrderVisit)=>{
  looks.value = row.advice;
  dialogVisible.value = true;
}
const handleClose = ()=>{
  dialogVisible.value = false;
}
const commit = ()=>{
    addModel.advice = valueHtml.value
    addRef.value.validate(async (valid: boolean) => {
    if (valid) {
      let res = await editApi(addModel);
      if (res && res.code == 200) {
        getList();
        ElMessage.success(res.msg);
        onClose();
      }
    }
  });
}
onMounted(() => {
  getList();
  nextTick(() => {
    tableHeight.value = window.innerHeight - 230;
  });
});
</script>

<style scoped></style>
