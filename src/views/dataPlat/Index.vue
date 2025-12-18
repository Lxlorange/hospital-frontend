<template>
  <el-main class="main-container">
    
    <el-row :gutter="20" class="panel-row">
      <el-col :span="6">
        <el-card class="panel-card card-doctor">
          <div class="panel-content">
            <div class="panel-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="panel-text-group">
              <div class="panel-num">{{ total.sysUserCount }}</div>
              <div class="panel-desc">医生</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="panel-card card-patient">
          <div class="panel-content">
            <div class="panel-icon">
              <el-icon><Avatar /></el-icon>
            </div>
            <div class="panel-text-group">
              <div class="panel-num">{{ total.wxUserCount }}</div>
              <div class="panel-desc">患者</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="panel-card card-department">
          <div class="panel-content">
            <div class="panel-icon">
              <el-icon><Memo /></el-icon>
            </div>
            <div class="panel-text-group">
              <div class="panel-num">{{ total.departmentCount }}</div>
              <div class="panel-desc">科室</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="panel-card card-visit">
          <div class="panel-content">
            <div class="panel-icon">
              <el-icon><Tickets /></el-icon>
            </div>
            <div class="panel-text-group">
              <div class="panel-num">{{ total.visitCount }}</div>
              <div class="panel-desc">挂号</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card v-if="strore.getType === '0'" class="box-card" style="margin-top: 30px">
      <template #header>
        <div class="card-header">
          <span>排班</span>
          <div class="schedule-buttons">
            <!--<el-button type="primary" size="small" @click="addConsultation()" style="margin-right: 15px;background-color: powderblue;color: black;" v-show="showAddConsultationBtn">临时加号</el-button>-->
            <el-button type="primary" size="small" @click="getMySchedule('1')">本星期</el-button>
            <el-button type="warning" size="small" @click="getMySchedule('2')">下星期</el-button>
            <el-button type="success" size="small" @click="getMySchedule('3')">上星期</el-button>
          </div>
        </div>
      </template>
      <el-table :data="schedule" stripe style="background-color: transparent;">
        <el-table-column prop="doctorName" label="姓名"></el-table-column>
        <el-table-column prop="times" label="日期"></el-table-column>
        <el-table-column prop="week" label="星期"></el-table-column>
        <el-table-column prop="type" label="是否出诊">
          <template #default="scope">
            <el-tag :type="scope.row.type === '0' ? 'danger' : 'success'" size="normal" style="color: black;">
              {{ scope.row.type === '0' ? '否' : '出诊' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="放号"></el-table-column>
        <el-table-column prop="lastAmount" label="余号"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button 
              type="success" 
              size="small" 
              @click="addConsultationBySchedule(scope.row)"
            >
              加号
            </el-button>
            <el-button 
              type="warning"
              size="small" 
              @click="askForLeave(scope.row)"
            >
              请假
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-card>

      <el-main class="statistic-main" v-if="userType==1">
    <div class="filters">
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      <el-button type="primary" @click="refresh">刷新</el-button>
    </div>
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-title">挂号趋势</div>
          <div ref="registrationTrendRef" class="chart" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-title">就诊趋势</div>
          <div ref="visitTrendRef" class="chart" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="chart-row">
      <el-col :span="6">
        <el-card class="chart-card">
          <div class="chart-title">科室挂号分布</div>
          <div ref="deptBarRef" class="chart" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="chart-card">
          <div class="chart-title">医生挂号Top10</div>
          <div ref="doctorBarRef" class="chart" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="chart-card">
          <div class="chart-title">时段分布</div>
          <div ref="timesAreaPieRef" class="chart" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="chart-card">
          <div class="chart-title">预约状态分布</div>
          <div ref="statusPieRef" class="chart" />
        </el-card>
      </el-col>
    </el-row>
  </el-main>
  </el-main>
  <AddConsultation 
    v-model="addVisible"
    :consultation="consultation"
    @update="refreshDataPlat"
  />
  <AddConsultationBySchedule
    v-model="addVisible2"
    :consultation="consultation"
    :scheduleId="currentScheduleId"
    @update="refreshDataPlat"
  />
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, reactive, watch } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import AddConsultation from "@/components/AddConsultation.vue";
import AddConsultationBySchedule from "@/components/AddConsultationBySchedule.vue";
import { requestLeave } from "@/api/leave";
import * as echarts from "echarts"

// 导入 Element Plus 图标
import {
  UserFilled,
  Avatar,
  Memo,
  Tickets
} from "@element-plus/icons-vue";
import {
  getHomeTotalApi,
  getMyScheduleApi,
} from "../../api/home/index";
import {
  getRegistrationTrendApi,
  getVisitTrendApi,
  getDepartmentDistributionApi,
  getDoctorDistributionApi,
  getTimesAreaDistributionApi,
  getStatusDistributionApi,
  DateCount,
  NameCount,
} from "@/api/statistic"
import { userSotre } from "@/store/user/index";

const mianHeight = ref(0);

const strore = userSotre();

const userType: number = Number(strore.getType);

const currentScheduleId = ref<number>(0);

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

const addConsultationBySchedule = async (row: any) => {
  currentScheduleId.value = row.scheduleId;
  addVisible2.value = true;
}

//排班
const schedule = ref([]);
const getMySchedule = async (type: string) => {
  let res = await getMyScheduleApi({
    doctorId: strore.getUserId,
    type: type,
  });
  if (res && res.code === 200) {
    schedule.value = res.data;
  }
  console.log(schedule.value)
};

const addVisible = ref<boolean>(false);
const addVisible2 = ref<boolean>(false);

const consultation = ref<any>({});
const refreshDataPlat = () => {

}

//添加号源
const showAddConsultationBtn = ref<boolean>(false);
const addConsultation = async () => {
  addVisible.value = true;
};

const askForLeave = async (row: any) => {
  let { value: reason } = await ElMessageBox.prompt(
      `请输入请假理由（${row.times} ${row.week}）`,
      '请假确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '身体不适 / 家中有事',
        inputPattern: /^.{1,100}$/, // 限制输入1~100字
        inputErrorMessage: '请假理由不能为空',
        type: 'warning',
      }
  );
  const doctorId = String(row.doctorId);
  const scheduleId = Number(row.scheduleId);
  reason = String(reason);
  const res = await requestLeave({
    doctorId,
    scheduleId, 
    reason
  });
  if(res.code == 200) {
    ElMessage.success("申请成功")
  }
}

onMounted(() => {  
  const userType:string = strore.getType;
  if(userType == "0"){
    showAddConsultationBtn.value = true;
  }
  mianHeight.value = window.innerHeight - 100;
  getHomeTotal();
  getMySchedule("1");
  nextTick(() => {
    mianHeight.value = window.innerHeight - 100;
  });
});

const registrationTrendRef = ref<HTMLDivElement | null>(null);
const visitTrendRef = ref<HTMLDivElement | null>(null);
const deptBarRef = ref<HTMLDivElement | null>(null);
const doctorBarRef = ref<HTMLDivElement | null>(null);
const timesAreaPieRef = ref<HTMLDivElement | null>(null);
const statusPieRef = ref<HTMLDivElement | null>(null);

const dateRange = ref<[string, string] | null>(null);

const initDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  dateRange.value = [fmt(start), fmt(end)];
};

const toLineOption = (_title: string, data: DateCount[]) => {
  const x = data.map((i) => i.date);
  const y = data.map((i) => i.count);

  // 定义渐变色，用于 areaStyle
  const areaGradient = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1, // 渐变方向：从上到下
    colorStops: [
      {
        offset: 0,
        color: '#409EFF', // 0% 处的颜色（顶部）- 较深蓝色
      },
      {
        offset: 1,
        color: '#E6F7FF', // 100% 处的颜色（底部）- 极浅蓝色
      },
    ],
    global: false,
  };

  const lineColor = '#409EFF';

  return {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, bottom: 40, top: 40 },
    xAxis: { type: "category", data: x },
    yAxis: { type: "value" },
    series: [{ 
      type: "line", 
      data: y, 
      smooth: true, 
      areaStyle: { color: areaGradient }, 
      itemStyle: { color: lineColor },
      lineStyle: { width: 3, color: lineColor } 
    }],
  };
};

const toBarOption = (data: NameCount[]) => {
  const x = data.map((i) => i.name);
  const y = data.map((i) => i.count);

  // 柱子颜色使用从下到上的渐变
  const barGradient = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: '#409EFF' }, // 顶部较深
      { offset: 1, color: '#9CD9FF' } // 底部较浅
    ],
    global: false
  };

  return {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, bottom: 80, top: 40 },
    xAxis: { 
      type: "category", 
      data: x, 
      axisLabel: { 
        interval: 0, 
        rotate: 30,
        color: '#333'
      },
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    yAxis: { 
      type: "value",
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [{ 
      type: "bar", 
      data: y,
      itemStyle: {
        color: barGradient,
        borderRadius: [5, 5, 0, 0] // 顶部圆角
      },
      barWidth: '60%' 
    }],
  };
};

const toPieOption = (data: NameCount[]) => {
  const colors = [
    '#409EFF',
    '#26C6DA',
    '#7E57C2',
    '#66BB6A',
    '#FFA726',
    '#64B5F6',
  ];

  return {
    tooltip: { 
      trigger: "item",
      formatter: '{b}: {c} ({d}%)'
    },
    legend: { 
      type: 'scroll',
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      textStyle: { color: '#333' }
    },
    color: colors,
    series: [
      {
        type: "pie",
        radius: ["35%", "65%"],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: {
          show: false,
          position: 'center',
          formatter: '{b}\n{d}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        data: data.map((i) => ({ name: i.name, value: i.count })),
      },
    ],
  };
};

const renderChart = (el: HTMLDivElement | null, option: any) => {
  if (!el) return;
  const chart = echarts.init(el);
  chart.setOption(option);
  window.addEventListener("resize", () => chart.resize());
};

const refresh = async () => {
  try {
    const [startDate, endDate] = dateRange.value || [];
    const [regRes, visitRes, deptRes, doctorRes, timeRes, statusRes] = await Promise.all([
      getRegistrationTrendApi({ startDate, endDate }),
      getVisitTrendApi({ startDate, endDate }),
      getDepartmentDistributionApi({ startDate, endDate }),
      getDoctorDistributionApi({ startDate, endDate, limit: 10 }),
      getTimesAreaDistributionApi({ startDate, endDate }),
      getStatusDistributionApi({ startDate, endDate }),
    ]);

    renderChart(registrationTrendRef.value, toLineOption("挂号趋势", regRes.data || []));
    renderChart(visitTrendRef.value, toLineOption("就诊趋势", visitRes.data || []));
    renderChart(deptBarRef.value, toBarOption(deptRes.data || []));
    renderChart(doctorBarRef.value, toBarOption(doctorRes.data || []));
    renderChart(timesAreaPieRef.value, toPieOption(timeRes.data || []));
    renderChart(statusPieRef.value, toPieOption(statusRes.data || []));
  } catch (e) {
    ElMessage.error("统计数据加载失败");
  }
};

onMounted(() => {
  initDefaultRange();
  refresh();
});

watch(dateRange, () => {});
</script>

<style scoped lang="scss">
/* 整个页面容器 */
.main-container {
  // 新的背景：一个柔和的径向渐变
  background: radial-gradient(circle, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px; // 增加内边距
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
             'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  min-height: 100vh;
}

.panel-row {
  margin-bottom: 0px;
}

/* 顶部统计卡片 - 通用样式 */
.panel-card {
  border-radius: 12px; // 更圆的圆角
  color: #fff;
  border: none;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); // 更深的阴影
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px); // 悬停上移效果更明显
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
}

/* 顶部卡片 - 内容布局 (图标在左，文字在右) */
.panel-content {
  display: flex;
  align-items: center;
  justify-content: space-between; // 两端对齐
  padding: 20px 25px;
}

.panel-icon {
  font-size: 50px; // 图标放大
  opacity: 0.8;
}

.panel-text-group {
  text-align: right; // 文字居右
}

.panel-num {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 2px;
}

.panel-desc {
  font-size: 14px;
  font-weight: 300; // 字体更细
  letter-spacing: 0.5px;
}

.card-doctor {
  background: linear-gradient(135deg, #42c3f4 0%, #1ea9dd 100%);
}

.card-patient {
  background: linear-gradient(135deg, #4fe3b9 0%, #2ecb9d 100%);
}

.card-department {
  background: linear-gradient(135deg, #b08bff 0%, #8a63f0 100%);
}

.card-visit {
  background: linear-gradient(135deg, #ffd66e 0%, #fbc344 100%);
}

/* “排班”卡片 - 玻璃拟态效果 */
.box-card {
  border-radius: 12px;
  border: none;
  
  // 核心：玻璃拟态效果
  background: rgba(255, 255, 255, 0.7); // 半透明背景
  backdrop-filter: blur(10px); // 毛玻璃模糊效果
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1); // 柔和阴影
  border: 1px solid rgba(255, 255, 255, 0.18); // 细微边框
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 20px;
    font-weight: 600;
    color: #333; // 标题颜色加深
  }
}

/* 表格样式美化 
  使用 :deep() 穿透 scoped 限制，修改 Element Plus 内部组件样式
*/
:deep(.el-table) {
  background-color: transparent !important; // 使表格背景透明以适应玻璃效果

  // 表头和行
  th.el-table__cell, tr {
    background-color: transparent !important;
    color: #333;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05); // 用更细的线代替
  }

  // 表头文字
  thead {
    th {
      .cell {
        font-weight: 600;
        color: #1a237e; // 表头用深蓝色
      }
    }
  }

  // 表格主体
  .el-table__body {
    // 悬停行
    tr:hover > td.el-table__cell {
      background-color: rgba(255, 255, 255, 0.4) !important;
    }
  }

  // 斑马纹
  .el-table__row--striped {
    td.el-table__cell {
      background-color: rgba(245, 245, 245, 0.5) !important;
    }
  }

  // 移除表格最下方的边框
  &::before {
    height: 0;
  }
}

.statistic-main {
  padding: 16px;
}
.filters {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
.chart-row {
  margin-bottom: 16px;
}
.chart-card {
  width: 100%;
  &:hover {
    transform: scale(1.05); /* 放大2% */
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); /* 增加阴影深度 */
    z-index: 10; /* 确保悬停时图表在上方 */
  }
}
.chart-title {
  font-size: 14px;
  margin-bottom: 8px;
}
.chart {
  width: 100%;
  height: 300px;
}
</style>