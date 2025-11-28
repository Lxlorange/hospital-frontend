<template>
  <el-main class="beautified-main">
    <div class="content-card">
      <el-form :model="searchParm" :inline="true" size="default">
        <el-form-item>
          <el-input
            v-model="searchParm.noticeTitle"
            placeholder="输入信息主题"
            class="custom-input"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="searchBtn">查询</el-button>
          <el-button
            v-if="global.$hasPerm(['sys:notice:add'])"
            type="primary"
            icon="Plus"
            @click="addBtn"
            class="create-btn"
            >创建</el-button
          >
        </el-form-item>
      </el-form>

      <el-table :height="tableHeight" :data="tableList" class="custom-table">
        <el-table-column prop="noticeTitle" label="信息主题"></el-table-column>
        <el-table-column prop="noticeText" label="信息内容"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column
          v-if="global.$hasPerm(['sys:notice:edit', 'sys:notice:delete'])"
          label="操作"
          align="center"
          width="220"
        >
          <template #default="scope">
            <el-button
              v-if="global.$hasPerm(['sys:notice:edit'])"
              type="warning"
              icon="Edit"
              size="default"
              circle
              @click="editBtn(scope.row)"
            ></el-button>
            <el-button
              v-if="global.$hasPerm(['sys:notice:delete'])"
              type="danger"
              icon="Delete"
              size="default"
              circle
              plain
              @click="deleteBtn(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="custom-pagination"
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

    <SysDialog
      class="dialog-beautify"
      :title="dialog.title"
      :width="dialog.width"
      :height="dialog.height"
      :visible="dialog.visible"
      @on-close="onClose"
      @on-confirm="commit"
    >
      <template v-slot:content>
        <el-form
          :model="addModel"
          ref="addRef"
          :rules="rules"
          label-width="80px"
          :inline="false"
          size="default"
          label-position="top"
        >
          <el-form-item prop="noticeTitle" label="信息主题">
            <el-input
              placeholder="请输入信息主题"
              v-model="addModel.noticeTitle"
            ></el-input>
          </el-form-item>
          <el-form-item prop="noticeText" label="信息内容">
            <el-input
              placeholder="请输入信息内容"
              type="textarea"
              :rows="5"
              v-model="addModel.noticeText"
            ></el-input>
          </el-form-item>
        </el-form>
      </template>
    </SysDialog>
  </el-main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";
import SysDialog from "@/components/SysDialog.vue";
import useDialog from "@/hooks/useDialog";
import useInstance from "@/hooks/useInstance";
import {
  addApi,
  getListApi,
  SysNotice,
  editApi,
  deleteApi,
} from "@/api/sys_notice/index";
import { ElMessage } from "element-plus";

const { global } = useInstance();
//表单ref属性
const addRef = ref();
//弹框属性
const { dialog, onClose, onShow } = useDialog();
const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  noticeTitle: "",
  total: 0,
});
const addModel = reactive({
  noticeId: "",
  noticeTitle: "",
  noticeText: "",
});
//表单验证规则
const rules = reactive({
  noticeTitle: [
    {
      required: true,
      message: "请输入信息主题",
      trigger: ["blur", "change"],
    },
  ],
  noticeText: [
    {
      required: true,
      message: "请输入信息内容",
      trigger: ["blur", "change"],
    },
  ],
});
const tags = ref("");
//创建
const addBtn = () => {
  tags.value = "0";
  addModel.noticeId = "";
  //配置弹框属性
  dialog.title = "创建信息";
  dialog.height = 350;
  dialog.width = 600;
  //显示弹框
  onShow();
  //清空表单
  addRef.value?.resetFields();
};
//修改
const editBtn = (row: SysNotice) => {
  tags.value = "1";
  console.log(row);
  addModel.noticeId = "";
  //配置弹框属性
  dialog.title = "修改信息";
  dialog.height = 350;
  dialog.width = 600;
  //数据回显
  nextTick(() => {
    Object.assign(addModel, row);
  });
  //显示弹框
  onShow();
  //清空表单
  addRef.value?.resetFields();
};
//删除
const deleteBtn = async (row: SysNotice) => {
  console.log(row);
  //信息确定
  const confirm = await global.$myconfirm("确定删除该数据吗？");
  console.log(confirm);
  if (confirm) {
    let res = await deleteApi(row.noticeId);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      //刷新列表
      getList();
    }
  }
};
//提交表单
const commit = () => {
  //表单验证
  addRef.value.validate(async (valid: boolean) => {
    if (valid) {
      let res = null;
      if (tags.value == "0") {
        res = await addApi(addModel);
      } else {
        res = await editApi(addModel);
      }
      if (res && res.code == 200) {
        ElMessage.success(res.msg);
        onClose();
        getList();
      }
    }
  });
};
//表格数据
const tableList = ref([]);
//获取表格数据
const getList = async () => {
  let res = await getListApi(searchParm);
  if (res && res.code == 200) {
    tableList.value = res.data.records;
    searchParm.total = res.data.total;
  }
};
//查询
const searchBtn = () => {
  searchParm.currentPage = 1;
  getList();
};
//重置
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
//表格高度
const tableHeight = ref(0);
onMounted(() => {
  getList();
  nextTick(() => {
    tableHeight.value = window.innerHeight - 250;
  });
});
</script>

<style lang="scss" scoped>
// 主题色定义 - "Minty Fresh" 🍃 Theme
$primary-color: #1abc9c;
$primary-color-light: #2ecc71;
$text-color: #2c3e50;
$text-color-light: #7f8c8d;
$bg-color: #f7f9fc;
$card-bg-color: #ffffff;
$border-color: #dfe4ea;
$shadow-color: rgba(44, 62, 80, 0.15);

// 主布局背景
.beautified-main {
  background-color: $bg-color;
  padding: 24px;
  height: 100%;
}

// 内容卡片 (无边框，仅阴影)
.content-card {
  background: $card-bg-color;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px -15px $shadow-color;
}

// 通用按钮样式
:deep(.el-button) {
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease-in-out;
  border: none;
  box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
  }
}

// 主按钮 (查询, 创建)
:deep(.el-button--primary) {
  color: #fff;
  background: linear-gradient(135deg, $primary-color, $primary-color-light);
}

// 表格内操作按钮
:deep(.el-button--warning) {
  background-color: #f1c40f;
  color: white;
  &:hover { background-color: #f39c12; }
}
:deep(.el-button--danger.is-plain) {
  color: #e74c3c;
  border: 1px solid #e74c3c;
  background: transparent;
  &:hover {
    color: #fff;
    background-color: #e74c3c;
  }
}

// 自定义输入框 (内发光效果)
:deep(.el-input__wrapper), :deep(.el-textarea__inner) {
  background-color: #fcfdfe;
  border-radius: 10px;
  border: 1px solid $border-color;
  box-shadow: none;
  transition: all 0.3s;
  
  &:focus-within, &:focus {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1), inset 0 1px 2px rgba($primary-color, 0.1);
    outline: none;
  }
}
:deep(.el-textarea__inner){
    padding: 8px 11px;
}

// 自定义表格 (极简风格)
.custom-table {
  border: none;
  :deep(thead th) {
    background-color: transparent;
    color: $text-color;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 3px solid $primary-color; // 标志性粗线
  }

  :deep(.el-table__row) {
    transition: background-color 0.3s;
    &:hover {
      background-color: lighten($primary-color, 40%) !important;
    }
  }
  
  :deep(td.el-table__cell), :deep(th.el-table__cell) {
    border-bottom: 1px solid $border-color;
  }
  :deep(.el-table__inner-wrapper::before){
    background-color: transparent;
  }
}

// 自定义分页
.custom-pagination {
  margin-top: 32px;
  justify-content: flex-end;
  :deep(.el-pagination.is-background .el-pager li) {
    background: #fff;
    border-radius: 8px;
    color: $text-color-light;
    border: 1px solid $border-color;
    &:hover {
        color: $primary-color;
    }
  }
  :deep(.el-pagination.is-background .el-pager li.is-active) {
    background: $primary-color;
    color: #fff;
    border-color: $primary-color;
  }
}

// 对话框美化
.dialog-beautify {
  :deep(.el-dialog) {
    border-radius: 16px;
    box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.2);
  }

  :deep(.el-dialog__header) {
    padding: 0;
    margin-right: 0;
    .el-dialog__title {
      display: block;
      padding: 20px 24px;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      background-color: $primary-color;
      text-align: center;
    }
    .el-dialog__headerbtn{
      top: 0;
      height: 62px;
       .el-dialog__close {
        color: #fff;
        font-size: 20px;
        &:hover{
            color: darken($color: #fff, $amount: 10%);
        }
       }
    }
  }

  :deep(.el-dialog__body) {
    padding: 32px;
    .el-form--label-top .el-form-item__label {
        padding: 0 0 10px;
        color: $text-color;
        font-weight: 600;
    }
  }

  :deep(.el-dialog__footer) {
    padding: 24px 32px;
    text-align: right;
    background-color: #f9fafc;
    border-top: 1px solid $border-color;
  }
}
</style>