<template>
  <el-main>
    <el-card shadow="never">
      <template #header>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>候补患者列表</span>
          <el-form :inline="true" :model="searchParm">
            <el-form-item>
              <el-input v-model="searchParm.name" placeholder="按就诊人姓名筛选" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="searchBtn">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <el-table :data="tableList" v-loading="loading" border stripe>
        <el-table-column prop="visitname" label="就诊人" width="120" />
        <el-table-column prop="doctorName" label="医生" width="120" />
        <el-table-column prop="deptName" label="科室" />
        <el-table-column prop="times" label="日期" width="120" />
        <el-table-column prop="timesAreaLabel" label="时段" width="90" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status==='pending'" type="warning">候补中</el-tag>
            <el-tag v-else-if="scope.row.status==='allocated'" type="success">已分配</el-tag>
            <el-tag v-else>已取消</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-main>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getAllWaitlistApi, allocateWaitlistApi } from '@/api/waitlist';


const loading = ref(false);
const tableList = ref<any[]>([]);
const searchParm = reactive({ name: '' });

const getList = async () => {
  loading.value = true;
  try {
    const res = await getAllWaitlistApi({ name: searchParm.name });
    if (res && res.code === 200) {
      tableList.value = res.data || [];
    }
  } finally {
    loading.value = false;
  }
};

const searchBtn = () => { getList(); };
const resetBtn = () => { searchParm.name = ''; getList(); };

const allocate = async (scheduleId: number) => {
  try {
    const res = await allocateWaitlistApi(String(scheduleId));
    if (res && res.code === 200) {
      ElMessage.success('分配成功');
      await getList();
    }
  } catch (e:any) {
    ElMessage.error(e?.msg || '分配失败');
  }
};

onMounted(() => { getList(); });
</script>