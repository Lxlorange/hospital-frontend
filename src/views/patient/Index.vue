<template>
    <el-main>
      <!-- 查询栏 -->
      <el-form :model="searchParm" :inline="true" size="default">
        <el-form-item>
          <el-input
            v-model="searchParm.name"
            placeholder="输入关键字"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" @click="searchBtn">查询</el-button>
          
        </el-form-item>
      </el-form>
      <!-- 表格数据 -->
      <el-table :height="tableHeight" :data="tableList" border stripe>
        <el-table-column prop="image" label="头像">
        <template #default="scope">
          <el-image
          v-if="scope.row.image"
            style="width: 80px; height: 80px"
            :src="imgbase + scope.row.image.split(',')[0]"
          />
        </template>
      </el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="nickName" label="微信昵称"></el-table-column>
        <el-table-column prop="userName" label="账号"></el-table-column>
        <el-table-column prop="sex" label="性别">
        <template #default="scope">
          <el-tag
            v-if="scope.row.sex == '0'"
            type="primary"
            size="default"
            effect="dark"
            >男</el-tag
          >
          <el-tag
            v-if="scope.row.sex == '1'"
            type="danger"
            size="default"
            effect="dark"
            >女</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="true"
            :inactive-value="false"
            :before-change="beforeStatus.bind(global, scope.row)"
            @change="changStatus(scope.row.userId)"
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #ff7670;
            "
          />
        </template>
      </el-table-column>
        <el-table-column
          v-if="global.$hasPerm(['sys:patient:delete'])"
          label="操作"
          align="center"
          width="280"
        >
          <template #default="scope">
            <el-button
            type="warning"
            icon="Edit"
            size="default"
            @click="resetPasswordBtn(scope.row)"
            >重置密码</el-button
          >
            <el-button
              v-if="global.$hasPerm(['sys:patient:delete'])"
              type="danger"
              icon="Delete"
              size="default"
              @click="deleteBtn(scope.row.userId)"
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
    </el-main>
  </template>
  
  <script setup lang="ts">
  import { nextTick, onMounted, reactive, ref,computed } from "vue";
  
  import useInstance from "@/hooks/useInstance";
  import {
    getListApi,
    deleteApi,
    enabledApi,
    resetPasswordApi,
    WxUser
  } from "@/api/wx_user/index";
  import { ElMessage } from "element-plus";
  const { global } = useInstance();
  const imgbase = computed(() => {
  return process.env.BASE_API_IMG;
});
  const searchParm = reactive({
    currentPage: 1,
    pageSize: 10,
    name: "",
    total: 0,
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
  
//重置密码
const resetPasswordBtn = async (row: WxUser) => {
  let confirm = await global.$myconfirm("确定重置密码吗?重置后密码为 666666");
  if (confirm) {
    let res = await resetPasswordApi(row.userId);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};


//开关按钮
// 判断是否在点击弹窗确认按钮时才调用接口
const switchTags = ref("");
const switchParm = reactive({
  userId: "",
  status: false,
});
// before方法加一个弹窗提示是否操作
const beforeStatus = async (row: any) => {
  console.log(row);
  const confirm = await global.$confirm(
    row.enabled ? "确定停用该用户吗?" : "确定启用该用户吗?"
  );
  return new Promise((resolve, reject) => {
    if (confirm) {
      // 点击确认按钮时显示switchTags值
      switchTags.value = "confirm";
      switchParm.userId = row.userId;
      switchParm.status = !row.status;
      console.log(switchParm);
      return resolve(confirm);
    } else {
      return reject(confirm);
    }
  });
};

const changStatus = async (userId: string) => {
  console.log("进入了");
  console.log(switchTags.value);
  // 判断tags值 这样就不会进页面时调用了
  if (switchTags.value == "confirm") {
    console.log("确定禁用");
    console.log(userId);
    try {
      let res = await enabledApi(switchParm);
      if (res && res.code == 200) {
        getList();
        ElMessage.success(res.msg);
      }
    } catch {
      getList();
    }
  }
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
  