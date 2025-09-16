<template>
  <el-main>
    <!-- 查询栏 -->
    <el-form :model="searchParm" :inline="true" size="default">
      <el-form-item>
        <el-input
          v-model="searchParm.deptName"
          placeholder="输入科室名称"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" @click="searchBtn">查询</el-button>
        
        <el-button v-if="global.$hasPerm(['sys:department:add'])" type="primary" icon="Plus" @click="addBtn">创建</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格数据 -->
     <el-table :data="tableList" :height="tableHeight" border stripe>
      <el-table-column prop="deptName" label="科室名称"></el-table-column>
      <el-table-column prop="phone" label="科室电话"></el-table-column>
      <el-table-column prop="orderNum" label="科室序号"></el-table-column>
      <el-table-column prop="toHome" label="数据中台">
        <template #default="scope">
          <el-tag v-if="scope.row.toHome == '0'" type="danger" size="default"
            >未显示</el-tag
          >
          <el-tag v-if="scope.row.toHome == '1'" type="success" size="default"
            >已显示</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column  v-if="global.$hasPerm(['sys:department:edit','sys:department:delete'])" label="操作" align="center" width="220">
        <template #default="scope">
          <el-button
            v-if="global.$hasPerm(['sys:department:edit'])"
            type="primary"
            icon="Edit"
            size="default"
            @click="editBtn(scope.row)"
            >修改</el-button
          >
          <el-button
            v-if="global.$hasPerm(['sys:department:delete'])"
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
        :page-sizes="[10,20, 40, 80, 100]"
        :page-size="searchParm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="searchParm.total" background>
      </el-pagination>
      
    <!-- 创建弹框 -->
    <SysDialog
      :title="dialog.title"
      :width="dialog.width"
      :height="dialog.height"
      :visible="dialog.visible"
      @onConfirm="commit"
      @on-close="onClose"
    >
      <template v-slot:content>
        <el-form
          :model="addModel"
          ref="addRef"
          :rules="rules"
          label-width="80px"
          :inline="false"
          size="normal"
        >
          <el-form-item prop="deptName" label="科室名称">
            <el-input v-model="addModel.deptName"></el-input>
          </el-form-item>
          <el-form-item prop="phone" label="科室电话">
            <el-input v-model="addModel.phone"></el-input>
          </el-form-item>
          <el-form-item prop="orderNum" label="科室序号">
            <el-input v-model="addModel.orderNum"></el-input>
          </el-form-item>
          <el-form-item prop="toHome" label="数据中台">
            <el-radio-group v-model="addModel.toHome">
              <el-radio :label="'0'">不显示</el-radio>
              <el-radio :label="'1'">显示</el-radio>
            </el-radio-group>
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
import {addApi,Department,getListApi,editApi,deleteApi} from '@/api/department/index'
import { ElMessage } from "element-plus";
import useInstance from "@/hooks/useInstance";
const { global } = useInstance();
//表单ref属性
const addRef = ref();
//弹框属性
const { dialog, onClose, onShow } = useDialog();
//查询参数
const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  deptName: "",
  total:0
});
//表单绑定的对象
const addModel = reactive({
  deptId: "",
  deptName: "",
  phone: "",
  toHome: "0",
  orderNum: "",
});
//表单验证规则
const rules = reactive({
  deptName: [
    {
      required: true,
      message: "输入科室名称",
      trigger: "change",
    },
  ],
});
//查询
const searchBtn = () => {
  searchParm.currentPage = 1;
  getList()
};
//重置
const resetBtn = () => {
  searchParm.deptName = ''
  searchParm.currentPage = 1;
  getList()
};
//创建、修改的标识
const tags = ref('')
//创建
const addBtn = () => {
  addModel.deptId = ''
  tags.value = '0'
  //显示弹框属性
  dialog.title = "创建科室";
  dialog.height = 210;
  //显示弹框
  onShow();
  //清空表单
  addRef.value?.resetFields();
};
//修改按钮
const editBtn = (row:Department)=>{
  addModel.deptId = ''
  tags.value = '1'
  //显示弹框属性
  dialog.title = "修改科室";
  dialog.height = 210;
  //数据回显
  nextTick(()=>{
    Object.assign(addModel,row)
  })
  //显示弹框
  onShow();
  //清空表单
  addRef.value?.resetFields();
}
//删除按钮
const deleteBtn = async(row:Department)=>{
  //信息确定
  const confirm = await global.$myconfirm("确定删除该数据吗？");
  console.log(confirm);
  if (confirm) {
    let res = await deleteApi(row.deptId);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      //刷新列表
      getList();
    }
  }
}
//弹框提交
const commit = () => {
  //表单验证：必填项，必须要填写
  addRef.value.validate(async(valid:boolean)=>{
    if(valid){//表单提交
      let res = null;
      if(tags.value == '0'){
        res = await addApi(addModel)
      }else{
        res = await editApi(addModel)
      }
      if(res && res.code == 200){
        ElMessage.success(res.msg)
        //关闭弹框
        onClose()
        //刷新表格
        getList()
      }
    }
  })
};
//表格数据
const tableList = ref([])
//查询列表数据
const getList = async()=>{
  let res = await getListApi(searchParm)
  if(res && res.code == 200){
    //显示表格的数据
    tableList.value = res.data.records;
    //显示分页总数
    searchParm.total = res.data.total;
  }
}
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
const tableHeight = ref(0)
onMounted(()=>{
  getList()
  nextTick(()=>{
    tableHeight.value = window.innerHeight - 230
  })
})
</script>

<style scoped></style>
