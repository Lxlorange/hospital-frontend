<template>
  <el-main class="statistic-main">
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
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-title">科室挂号分布</div>
          <div ref="deptBarRef" class="chart" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-title">医生挂号Top10</div>
          <div ref="doctorBarRef" class="chart" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-title">时段分布</div>
          <div ref="timesAreaPieRef" class="chart" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div class="chart-title">预约状态分布</div>
          <div ref="statusPieRef" class="chart" />
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import {
  getRegistrationTrendApi,
  getVisitTrendApi,
  getDepartmentDistributionApi,
  getDoctorDistributionApi,
  getTimesAreaDistributionApi,
  getStatusDistributionApi,
  DateCount,
  NameCount,
} from "@/api/statistic";

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

const toLineOption = (title: string, data: DateCount[]) => {
  const x = data.map((i) => i.date);
  const y = data.map((i) => i.count);
  return {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, bottom: 40, top: 40 },
    xAxis: { type: "category", data: x },
    yAxis: { type: "value" },
    series: [{ type: "line", data: y, smooth: true, areaStyle: {} }],
  };
};

const toBarOption = (data: NameCount[]) => {
  const x = data.map((i) => i.name);
  const y = data.map((i) => i.count);
  return {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, bottom: 80, top: 40 },
    xAxis: { type: "category", data: x, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: y }],
  };
};

const toPieOption = (data: NameCount[]) => {
  return {
    tooltip: { trigger: "item" },
    legend: { top: "bottom" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: true,
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

<style scoped>
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
}
.chart-title {
  font-size: 14px;
  margin-bottom: 8px;
}
.chart {
  width: 100%;
  height: 360px;
}
</style>