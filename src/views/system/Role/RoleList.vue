<template>
  <el-main class="main-container">
    <el-card shadow="never" class="content-card">
      <el-form :model="searchParm" :inline="true" size="default" class="search-form">
        <el-form-item>
          <el-input
            placeholder="输入关键字"
            v-model="searchParm.roleName"
            class="search-input"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="custom-btn btn-query" icon="Search" @click="searchBtn">查询</el-button>
          <el-button
            v-if="global.$hasPerm(['sys:role:add'])"
            class="custom-btn btn-create"
            icon="Plus"
            @click="addBtn"
            >创建</el-button
          >
        </el-form-item>
      </el-form>

      <el-table :height="tableHeight" :data="tableList" border stripe class="data-table">
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="remark" label="角色备注"></el-table-column>
        <el-table-column
          v-if="global.$hasPerm(['sys:role:edit', 'sys:role:assign', 'sys:role:delete'])"
          label="操作"
          width="340"
          align="center"
          fixed="right"
        >
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                v-if="global.$hasPerm(['sys:role:edit'])"
                class="custom-btn btn-edit"
                icon="Edit"
                size="default"
                @click="editBtn(scope.row)"
                >修改</el-button
              >
              <el-button
                v-if="global.$hasPerm(['sys:role:assign'])"
                class="custom-btn btn-assign"
                icon="Edit"
                size="default"
                @click="assignBtn(scope.row)"
                >修改权限</el-button
              >
              <el-button
                v-if="global.$hasPerm(['sys:role:delete'])"
                class="custom-btn btn-delete"
                icon="Delete"
                size="default"
                @click="deleteBtn(scope.row.roleId)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

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
          <el-form-item prop="roleName" label="角色名称">
            <el-input v-model="addModel.roleName"></el-input>
          </el-form-item>
          <el-form-item prop="remark" label="备注">
            <el-input v-model="addModel.remark"></el-input>
          </el-form-item>
        </el-form>
      </template>
    </SysDialog>
    <AssignTree ref="assignTree"></AssignTree>
  </el-main>
</template>

<script setup lang="ts">
// ---------- Script 部分完全没有改动，保持原样 ----------
import { nextTick, onMounted, reactive, ref } from "vue";
import SysDialog from "@/components/SysDialog.vue";
import useDialog from "@/hooks/useDialog";
import { ElMessage, FormInstance } from "element-plus";
import { addApi, getListApi, editApi, deleteApi } from "@/api/role/index";
import { SysRole } from "@/api/role/RoleModel";
import useInstance from "@/hooks/useInstance";
import AssignTree from "./AssignTree.vue";
//菜单树的ref属性
const assignTree = ref();
//获取全局golbal
const { global } = useInstance();
//表单ref属性
const addRef = ref<FormInstance>();
//弹框属性
const { dialog, onClose, onShow } = useDialog();
//表单绑定的对象
const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  roleName: "",
  total: 0,
});

//判断创建还是修改的标识 0:创建 1：修改
const tags = ref("");
//创建按钮
const addBtn = () => {
  tags.value = "0";
  dialog.title = "创建";
  dialog.height = 180;
  //显示弹框
  onShow();
  //清空表单
  addRef.value?.resetFields();
};
//创建表单对象
const addModel = reactive({
  roleId: "",
  roleName: "",
  remark: "",
});
//表单验证规则
const rules = reactive({
  roleName: [
    {
      required: true,
      message: "输入角色名称",
      trigger: "change",
    },
  ],
});
//修改按钮
const editBtn = (row: SysRole) => {
  tags.value = "1";
  console.log(row);
  //显示弹框
  dialog.visible = true;
  dialog.title = "修改";
  dialog.height = 180;
  nextTick(() => {
    //回显数据
    Object.assign(addModel, row);
  });
  //清空表单
  addRef.value?.resetFields();
};
//修改权限按钮
const assignBtn = (row: SysRole) => {
  assignTree.value.show(row.roleId, row.roleName);
};
//删除按钮
const deleteBtn = async (roleId: string) => {
  console.log(roleId);
  console.log(global);
  const confirm = await global.$myconfirm("确定删除该数据吗？");
  console.log(confirm);
  if (confirm) {
    let res = await deleteApi(roleId);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      //刷新列表
      getList();
    }
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
//表单提交
const commit = () => {
  addRef.value?.validate(async (valid) => {
    if (valid) {
      console.log("表单验证通过");
      //提交求
      let res = null;
      if (tags.value == "0") {
        //创建
        res = await addApi(addModel);
      } else {
        res = await editApi(addModel); //修改
      }
      if (res && res.code == 200) {
        ElMessage.success(res.msg);
        //刷新列表
        getList();
        //关闭弹框
        onClose();
      }
    }
  });
};
//表格高度
const tableHeight = ref(0);
//表格数据
const tableList = ref([]);
//查询列表
const getList = async () => {
  let res = await getListApi(searchParm);
  if (res && res.code == 200) {
    //显示表格数据
    console.log(res);
    tableList.value = res.data.records;
    //显示分页总条数
    searchParm.total = res.data.total;
  }
};
//查询
const searchBtn = () => {
  getList();
};
//重置
onMounted(() => {
  nextTick(() => {
    tableHeight.value = window.innerHeight - 250; // 调整高度以适应新布局
  });
  getList();
});
</script>

<style scoped>
/* ---------- 这是新增的 Style 部分 ---------- */
.main-container {
  background-color: #f0f2f5;
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.content-card {
  border-radius: 8px;
  border: none;
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}
.search-input {
  width: 250px;
}
:deep(.search-input .el-input__wrapper) {
  border-radius: 6px;
  transition: all 0.3s;
}
:deep(.search-input .el-input__wrapper:hover) {
  border-color: #409eff;
}

/* --- 自定义按钮样式 --- */
.custom-btn {
  border: none;
  border-radius: 6px;
  color: #fff;
  padding: 8px 15px; /* 稍微减少了左右内边距以适应更多按钮 */
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.custom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
  background: linear-gradient(45deg, #26a69a 30%, #80cbc4 90%);
}
/* 创建按钮 */
.btn-create {
  background: linear-gradient(45deg, #8a2be2 30%, #4169e1 90%);
}
/* 修改按钮 */
.btn-edit {
  background: linear-gradient(45deg, #66bb6a 30%, #a5d6a7 90%);
}
/* 修改权限按钮 */
.btn-assign {
  background: linear-gradient(45deg, #ffa726 30%, #ffcc80 90%);
}
/* 删除按钮 */
.btn-delete {
  background: linear-gradient(45deg, #f44336 30%, #e57373 90%);
}

/* --- 数据表格样式 --- */
.data-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
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
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
}

/* 2. 为按钮包裹容器添加样式 */
.operation-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px; /* 控制按钮之间的间距 */
}
</style>