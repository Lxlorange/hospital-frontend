<template>
  <el-main>
    <el-form :model="searchParm" :inline="true" size="default">
      <el-form-item>
        <el-input
          v-model="searchParm.name"
          placeholder="输入关键字"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="success" icon="Search" @click="searchBtn">查询</el-button>
        
      </el-form-item>
    </el-form>
    <el-table :height="tableHeight" :data="tableList" border stripe>
      <el-table-column prop="visitname" label="就诊人" />
      <el-table-column prop="nickName" label="挂号医生" />
      <el-table-column prop="deptName" label="挂号科室" />
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
      <el-table-column prop="createTime" label="挂号订单创建时间" />
      <el-table-column prop="price" label="挂号金额" />
      <el-table-column prop="address" label="就诊地址" />
      <el-table-column prop="status" label="挂号状态">
        <template #default="scope">
          <el-tag
            v-if="scope.row.status == '1'"
            type="primary"
            size="default"
            effect="dark"
            >已挂号</el-tag
          >
          <el-tag
            v-if="scope.row.status == '2'"
            type="warning"
            size="default"
            effect="dark"
            >取消挂号</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="hasCall" label="是否叫号">
        <template #default="scope">
          <el-tag
            v-if="scope.row.hasCall == '0'"
            type="warning"
            size="default"
            effect="dark"
            >未叫号</el-tag
          >
          <el-tag
            v-if="scope.row.hasCall == '1'"
            type="primary"
            size="default"
            effect="dark"
            >已叫号</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template #default="scope">
          <el-button
            style="background: linear-gradient(45deg, #42e695, #3bb2b8); color: white; border: none;"
            icon="Bell"
            size="small"
            @click="callBtn(scope.row)"
            >叫号</el-button
          >
          <el-button
            style="background: linear-gradient(45deg, #36d1dc, #5b86e5); color: white; border: none;"
            icon="View"
            size="small"
            @click="viewBtn(scope.row)"
          >查看</el-button>
          <el-button
            type="danger"
            icon="Delete"
            size="small"
            plain
            @click="deleteBtn(scope.row.makeId)"
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
  </el-main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";

import useInstance from "@/hooks/useInstance";
import { getListApi, deleteApi, MakeOrder,callVisitApi } from "@/api/order/index";
import { ElMessage } from "element-plus";
import { userSotre } from "@/store/user/index";

const ustore = userSotre();
const { global } = useInstance();

const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  name: "",
  timesArea: "",
  doctorId: ustore.getUserId,
});

//删除
const deleteBtn = async (id: string) => {
  //信息确定
  const confirm = await global.$myconfirm("确定删除该数据吗？");
  console.log(confirm);
  if (confirm) {
    let res = await deleteApi(id);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      //刷新列表
      getList();
    }
  }
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
  searchParm.name = "";
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
//叫号
const callBtn = async(row: MakeOrder) => {
  let confirm = await global.$myconfirm("确定叫号吗?");
  if (confirm) {
    let res = await callVisitApi(row);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};
//查看患者历史信息
const viewBtn = async(row: MakeOrder) => {
  console.log("Click User Information")
}
//表格高度
const tableHeight = ref(0);
onMounted(() => {
  getList();
  nextTick(() => {
    tableHeight.value = window.innerHeight - 230;
  });
});
</script>

<style scoped>
.el-table .el-button {
  margin: 4.5px; 
  padding: 7.5px;
}
</style>