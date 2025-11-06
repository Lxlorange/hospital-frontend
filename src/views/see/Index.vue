<template>
  <el-main>
    <el-card shadow="never">
      <el-form :model="searchParm" :inline="true" size="default">
        <el-form-item label="关键字">
          <el-input
            placeholder="请输入就诊人姓名"
            v-model="searchParm.name"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="searchBtn"
            >查询</el-button
          >
        </el-form-item>
      </el-form>

      <div class="table-container">
        <el-table :height="tableHeight" :data="tableList" border stripe>
          <el-table-column prop="visitname" label="就诊人" align="center" />
          <el-table-column prop="nickName" label="医生" align="center" />
          <el-table-column prop="times" label="挂号时间" align="center" />
          <el-table-column prop="timesArea" label="挂号时段" align="center">
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
          <el-table-column prop="week" label="星期" align="center" />
          <el-table-column prop="hasVisit" label="是否就诊" align="center">
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
          <el-table-column prop="advice" label="医嘱" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                link
                icon="View"
                size="default"
                @click="lookBtn(scope.row)"
                >查看医嘱</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="visitTime"
            label="就诊时间"
            align="center"
            width="180"
          />
          <el-table-column
            label="操作"
            width="120"
            align="center"
            fixed="right"
          >
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
      </div>

      <div class="pagination-container">
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
      </div>
    </el-card>

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
          <el-form-item prop="advice" label="诊断详情">
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
        </el-form>
      </template>
    </SysDialog>

    <el-dialog
      v-model="dialogVisible"
      title="医嘱详情"
      width="35%"
      :before-close="handleClose"
    >
      <div
        v-html="looks"
        style="min-height: 200px; padding: 10px; word-break: break-all"
      ></div>
      <template #footer>
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </template>
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
  name: "", // 对应“关键字”输入框
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
  advice: [ // 对应 el-form-item 的 prop
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

// 修复：重置按钮逻辑
const resetBtn = () => {
  searchParm.name = ""; // 清空搜索词
  searchParm.currentPage = 1; // 重置到第一页
  getList();
};

// 就诊按钮
const makeBtn = (row: MakeOrderVisit) => {
  // 清空表单，防止数据残留（如果 useDialog 没有处理）
  addRef.value?.resetFields();

  addModel.visitId = row.visitId;
  addModel.hasLive = row.hasLive || "0"; // 默认给一个'0'，防止 prop 验证失败
  valueHtml.value = row.advice || ""; // 清空或设置富文本内容
  addModel.makeId = row.makeId;

  dialog.title = "诊断医嘱";
  dialog.width = 850;
  dialog.height = 480;
  onShow();
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
  searchParm.currentPage = 1; // 切换页容量时重置到第一页
  getList();
};

//页数改变时触发
const currentChange = (page: number) => {
  searchParm.currentPage = page;
  getList();
};

//查看医嘱
const dialogVisible = ref(false);
const looks = ref("");
const lookBtn = (row: MakeOrderVisit) => {
  looks.value = row.advice || "暂无医嘱"; // 提供一个默认值
  dialogVisible.value = true;
};
const handleClose = () => {
  dialogVisible.value = false;
};

// 提交就诊表单
const commit = () => {
  addModel.advice = valueHtml.value;
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
};

onMounted(() => {
  getList();
  nextTick(() => {
    // 动态计算表格高度，减去el-card的padding和搜索/分页区域的大致高度
    tableHeight.value = window.innerHeight - 250;
  });
});
</script>

<style scoped>
/* 为表格和分页器添加上边距 */
.table-container {
  margin-top: 15px;
}

/* 分页器样式，使其右对齐并添加上边距 */
.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

/* 确保行内表单项垂直居中对齐 */
.el-form--inline .el-form-item {
  vertical-align: middle;
}
</style>