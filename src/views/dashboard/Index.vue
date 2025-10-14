<template>
  <el-main :style="{ height: mianHeight + 'px' }" class="main-container">
    <el-row :gutter="20" class="panel-row">
      <el-col :span="6">
        <el-card class="panel-card" style="background-color: #81c784;">
          <div class="panel-content">
            <div class="panel-num">{{ total.sysUserCount }}</div>
            <div class="panel-text">医生</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="panel-card" style="background-color: #ffb3ba;">
          <div class="panel-content">
            <div class="panel-num">{{ total.wxUserCount }}</div>
            <div class="panel-text">患者</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="panel-card" style="background-color: #66ccff;">
          <div class="panel-content">
            <div class="panel-num">{{ total.departmentCount }}</div>
            <div class="panel-text">科室</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="panel-card" style="background-color: #ff9800;">
          <div class="panel-content">
            <div class="panel-num">{{ total.visitCount }}</div>
            <div class="panel-text">挂号</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card v-if="strore.getType === '0'" class="box-card" style="margin-top: 30px">
      <template #header>
        <div class="card-header">
          <span>今日排班</span>
          <div class="schedule-buttons">
            <el-button type="primary" size="small" @click="getMySchedule('1')">本星期</el-button>
            <el-button type="warning" size="small" @click="getMySchedule('2')">下星期</el-button>
            <el-button type="success" size="small" @click="getMySchedule('3')">上星期</el-button>
          </div>
        </div>
      </template>
      <el-table :data="schedule" border stripe>
        <el-table-column prop="doctorName" label="姓名"></el-table-column>
        <el-table-column prop="times" label="日期"></el-table-column>
        <el-table-column prop="week" label="星期"></el-table-column>
        <el-table-column prop="type" label="是否出诊">
          <template #default="scope">
            <el-tag :type="scope.row.type === '0' ? 'danger' : 'success'" size="normal">
              {{ scope.row.type === '0' ? '否' : '出诊' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="放号"></el-table-column>
        <el-table-column prop="lastAmount" label="余号"></el-table-column>
      </el-table>
    </el-card>
  </el-main>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, reactive } from "vue";
import {
  getHomeTotalApi,
  getMyScheduleApi,
} from "../../api/home/index";
import { userSotre } from "@/store/user/index";

const mianHeight = ref(0);

const strore = userSotre();
//统计
const total = reactive({
  departmentCount: 0,
  sysUserCount: 0,
  wxUserCount: 0,
  visitCount: 0,
});
const getHomeTotal = async () => {
  let res = await getHomeTotalApi();
  if (res && res.code === 200) {
    Object.assign(total, res.data);
  }
};

//今日排班
const schedule = ref([]);
const getMySchedule = async (type: string) => {
  let res = await getMyScheduleApi({
    doctorId: strore.getUserId,
    type: type,
  });
  if (res && res.code === 200) {
    schedule.value = res.data;
  }
};
onMounted(() => {
  mianHeight.value = window.innerHeight - 100;
  getHomeTotal();
  getMySchedule("1");
  nextTick(() => {
    mianHeight.value = window.innerHeight - 100;
  });
});
</script>

<style scoped lang="scss">
.main-container {
  background-color: #f0f2f5; // 浅灰色背景，提升质感
}

.panel-row {
  margin-top: 20px;
  margin-bottom: 20px;
}

.panel-card {
  color: #fff;
  border-radius: 8px; // 略微的圆角
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // 轻微的阴影
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px); // 悬停时上移，增加交互感
  }
}

.panel-content {
  text-align: center;
  padding: 15px 0;
}

.panel-num {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 5px;
}

.panel-text {
  font-size: 16px;
  font-weight: 500;
}

// 今日排班卡片头部样式
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #000;
}
</style>