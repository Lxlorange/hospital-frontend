<template>
  <el-main>
    <el-form :model="searchParm" :inline="true" size="default">
      <el-form-item>
        <el-input
          v-model="searchParm.noticeTitle"
          placeholder="输入信息标题"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="success" icon="Search" @click="searchBtn">查询</el-button>
        
        <el-button
          v-if="global.$hasPerm(['sys:notice:add'])"
          style="background: linear-gradient(to right, #8a2be2, #4169e1); color: white; border: none;"
          icon="Plus"
          @click="addBtn"
          >创建</el-button
        >
      </el-form-item>
    </el-form>
    <el-table :height="tableHeight" :data="tableList" border stripe>
      <el-table-column prop="noticeTitle" label="信息标题"></el-table-column>
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
            @click="editBtn(scope.row)"
            >修改</el-button
          >
          <el-button
            v-if="global.$hasPerm(['sys:notice:delete'])"
            type="danger"
            icon="Delete"
            size="default"
            plain
            @click="deleteBtn(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
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

    <SysDialog
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
        >
          <el-form-item prop="noticeTitle" label="信息标题">
            <el-input
              placeholder="输入信息标题"
              v-model="addModel.noticeTitle"
            ></el-input>
          </el-form-item>
          <el-form-item prop="noticeText" label="信息内容">
            <el-input
              placeholder="输入信息内容"
              type="textarea"
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
      message: "输入信息标题",
      trigger: "change",
    },
  ],
  noticeText: [
    {
      required: true,
      message: "输入信息内容",
      trigger: "change",
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
  dialog.height = 200;
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
  dialog.height = 200;
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
const resetBtn = () => {
  searchParm.noticeTitle = "";
  searchParm.currentPage = 1;
  getList();
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