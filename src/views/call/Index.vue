<template>
  <div class="page-container">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <div class="header-title-decoration"></div>
            <span class="header-title">挂号列表管理</span>
          </div>
          <div class="search-area">
            <el-form :model="searchParm" :inline="true" size="default" class="search-form">
              <el-form-item v-if="userIdentity === '0'">
                <el-button type="primary" icon="Bell" @click="callNext">顺序叫号</el-button>
              </el-form-item>
              <el-form-item label="关键词检索">
                <el-input
                  v-model="searchParm.name"
                  placeholder="请输入就诊人或医生姓名"
                  clearable
                  prefix-icon="Search"
                  style="width: 240px"
                  @keyup.enter="searchBtn"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="searchBtn">查询</el-button>
                <el-button icon="Refresh" plain @click="resetBtn">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :height="tableHeight"
        :data="tableList"
        border
        stripe
        highlight-current-row
        header-cell-class-name="custom-table-header"
        row-class-name="custom-table-row"
      >
        <el-table-column prop="visitname" label="就诊人" width="110" align="center" fixed="left">
            <template #default="scope">
                <div class="patient-info">
                  <el-avatar :size="24" icon="UserFilled" class="patient-avatar" />
                  <span class="patient-name">{{ scope.row.visitname }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="nickName" label="挂号医生" width="110" align="center" />
        <el-table-column prop="deptName" label="挂号科室" width="120" align="center" />
        <el-table-column prop="times" label="挂号日期" width="120" align="center" />
        <el-table-column prop="timesArea" label="时段" width="80" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.timesArea == '0'" type="primary" effect="plain" size="small">上午</el-tag>
            <el-tag v-if="scope.row.timesArea == '1'" type="warning" effect="plain" size="small">下午</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="week" label="星期" width="80" align="center" />
        
        <el-table-column prop="price" label="费用" width="100" align="center">
             <template #default="scope">
               <span class="price-text">￥{{ scope.row.price }}</span>
             </template>
        </el-table-column>
        
        <el-table-column prop="status" label="挂号状态" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status == '1'" type="success" effect="dark" size="small">已挂号</el-tag>
            <el-tag v-if="scope.row.status == '2'" type="info" effect="plain" size="small">已取消</el-tag>
            <el-tag v-if="scope.row.status == '3'" type="warning" effect="dark" size="small">待改签</el-tag>
            <el-tag v-if="scope.row.status == '4'" type="primary" effect="plain" size="small">重新申请</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="hasCall" label="叫号进度" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.hasCall == '0'" type="info" effect="light">等待中</el-tag>
            <el-tag v-if="scope.row.hasCall == '1'" type="success" effect="light">已叫号</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="签到状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.signInStatus == '1'" type="success">已签到</el-tag>
            <el-tag v-else-if="scope.row.hasCall == '1' && isMissed(scope.row)" type="danger">已过号</el-tag>
            <el-tag v-else type="warning">未签到</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="倒计时" width="140" align="center">
          <template #default="scope">
            <div class="countdown-wrap" :class="getCountdownClass(scope.row)">
               <el-icon v-if="countdown(scope.row) && countdown(scope.row) !== '已过号'" class="is-loading"><Timer /></el-icon>
               <span>{{ countdown(scope.row) }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" min-width="170" align="center" />

        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip content="呼叫患者就诊" placement="top" :show-after="500">
                <el-button
                  type="primary"
                  link
                  icon="Bell"
                  @click="callBtn(scope.row)"
                  :disabled="scope.row.hasCall == '1' || scope.row.status == '2'"
                >
                  叫号
                </el-button>
              </el-tooltip>

              <!--<el-divider direction="vertical" />

              <el-tooltip content="确认患者已到达" placement="top" :show-after="500">
                <el-button
                  type="success"
                  link
                  icon="CircleCheck"
                  @click="checkInBtn(scope.row)"
                  :disabled="scope.row.signInStatus == '1' || isMissed(scope.row) || scope.row.hasCall != '1'"
                >
                  签到
                </el-button>
              </el-tooltip>-->

              <el-divider direction="vertical" />
              
              <el-tooltip content="查看历史病历" placement="top" :show-after="500">
                <el-button
                  type="info"
                  link
                  icon="Document"
                  @click="toHistory(scope.row)"
                >
                  病历
                </el-button>
              </el-tooltip>

              <el-divider direction="vertical" />

              <el-button
                type="danger"
                link
                icon="Delete"
                @click="deleteBtn(scope.row.makeId)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchParm.currentPage"
          v-model:page-size="searchParm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="searchParm.total"
          background
          @current-change="updatePage"
          @size-change="updatePage"
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import useInstance from "@/hooks/useInstance";
import { getListApi, deleteApi, MakeOrder, callVisitApi, checkInApi } from "@/api/order/index";
import { Timer } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { userSotre } from "@/store/user/index";
import { callNextApi } from '../../api/order/index';
import { getScheduleIdApi } from "@/api/home";

const ustore = userSotre();
const { global } = useInstance();
const router = useRouter();

// 搜索参数
const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  name: "",
  timesArea: "",
  doctorId: ustore.getUserId,
});

// 表格数据
const tableList = ref<MakeOrder[]>([]);
const loading = ref(false);
const nowTs = ref(Date.now());
let timer: number | undefined;
const allList = ref<MakeOrder[]>([]);

const userIdentity: string = ustore.getType;

const callNext = async () => {
  const doctorId = ustore.getUserId;

  if(ustore.getType != '0') {
    ElMessage.error("非医生请勿叫号");
    return;
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);  // YYYY-MM-DD
  //const date = '2025-12-08'
  const timeSlot = now.getHours() < 12 ? "0" : "1";

  try {
    const res = await getScheduleIdApi(date, timeSlot, doctorId);
    
    const scheduleId: number = res?.data;
    if (!scheduleId) {
      ElMessage.error("您当前不在上班时间");
      return;
    }
    try {
      await callNextApi(scheduleId);
      ElMessage.success("叫号成功");
    }catch(err: any) {
      ElMessage.error(err.msg);
    }
    
  } catch (err) {}
};

// 获取表格数据
const getList = async () => {
  loading.value = true;
  try {
    let res = await getListApi(searchParm);
    if (res && res.code == 200) {
      searchParm.total = res.data.total;
      const allParm: any = { ...searchParm, currentPage: 1, pageSize: res.data.total };
      let resAll = await getListApi(allParm);
      if (resAll && resAll.code == 200) {
        allList.value = resAll.data.records || [];
        allList.value.sort((a: any, b: any) => {
          const ta = parseDateTs(a.times);
          const tb = parseDateTs(b.times);
          if (ta !== tb) return ta - tb;
          const areaA = a.timesArea === '0' ? 0 : 1;
          const areaB = b.timesArea === '0' ? 0 : 1;
          return areaA - areaB;
        });
        updatePage();
      }
    }
  } catch (error) {
    console.error("Failed to fetch list:", error);
    ElMessage.error("获取列表失败");
  } finally {
    loading.value = false;
  }
};

const updatePage = () => {
  const start = (searchParm.currentPage - 1) * searchParm.pageSize;
  const end = start + searchParm.pageSize;
  tableList.value = allList.value.slice(start, end);
};

// 删除按钮
const deleteBtn = async (id: string) => {
  const confirm = await global.$myconfirm("确定要删除该挂号记录吗？此操作不可恢复。");
  if (confirm) {
    let res = await deleteApi(id);
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};

// 叫号按钮
const callBtn = async (row: MakeOrder) => {
  // 简单的前置判断，防止重复点击
  if(row.hasCall == '1') return;
  const confirm = await global.$myconfirm(`确定呼叫就诊人【${row.visitname}】吗?`);
  if (confirm) {
    let res = await callVisitApi(row);
    if (res && res.code == 200) {
      // 前端立即展示倒计时的兜底：使用服务端返回的叫号时间或本地当前时间
      if (res.data && res.data.calledTime) {
        const serverTs = parseDateTimeTs(res.data.calledTime as any);
        const now = Date.now();
        if (serverTs === 0 || Math.abs(now - serverTs) > 5000) {
          row.calledTime = now as any;
        } else {
          row.calledTime = res.data.calledTime as any;
        }
      } else {
        row.calledTime = Date.now() as any;
      }
      row.hasCall = '1' as any;
      const baseTs = typeof row.calledTime === 'number' ? row.calledTime as number : parseDateTimeTs(row.calledTime as any);
      (row as any)._localCalledTs = baseTs as any;
      const idx = (allList.value as any[]).findIndex((x: any) => String(x.makeId) === String((row as any).makeId));
      if (idx >= 0) {
        (allList.value[idx] as any).hasCall = '1';
        (allList.value[idx] as any).calledTime = row.calledTime as any;
        (allList.value[idx] as any)._localCalledTs = baseTs as any;
      }
      updatePage();
      ElMessage.success(res.msg);
    }
  }
};

const checkInBtn = async (row: any) => {
  const confirm = await global.$myconfirm("确定为该患者签到吗?");
  if (confirm) {
    let res = await checkInApi({ makeId: String(row.makeId) });
    if (res && res.code == 200) {
      ElMessage.success(res.msg);
      getList();
    }
  }
};

const parseDateTs = (t: any) => {
  if (!t) return 0;
  const s = String(t).trim();
  const d = new Date(s);
  const v = d.getTime();
  if (!isNaN(v)) return v;
  const m = s.match(/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/);
  if (!m) return 0;
  const p = s.split(/[-\/]+/).map((x: any) => parseInt(x, 10));
  return new Date(p[0], p[1] - 1, p[2]).getTime();
};

const parseDateTimeTs = (t: any) => {
  if (!t) return 0;
  if (typeof t === 'number') return t;
  if (t instanceof Date && !isNaN(t.getTime())) return t.getTime();
  const s = String(t).trim();
  const d = new Date(s);
  const v = d.getTime();
  if (!isNaN(v)) return v;
  const r = s.match(/^([0-9]{4})[-\/]([0-9]{1,2})[-\/]([0-9]{1,2})[ T]([0-9]{1,2}):([0-9]{1,2})(?::([0-9]{1,2}))?/);
  if (!r) return 0;
  return new Date(parseInt(r[1],10), parseInt(r[2],10)-1, parseInt(r[3],10), parseInt(r[4],10), parseInt(r[5],10), r[6]?parseInt(r[6],10):0).getTime();
};

const isMissed = (row: any) => {
  if (!row.calledTime || row.signInStatus === '1') return false;
  const bts = (() => { const ts = parseDateTimeTs(row.calledTime); if (ts) return ts; const s = String(row.calledTime).trim(); const z = new Date(s.replace(' ','T') + 'Z'); const v = z.getTime(); return isNaN(v) ? 0 : v; })();
  const remain = 180 - Math.floor((nowTs.value - bts) / 1000);
  return remain <= 0;
};

// 倒计时逻辑
const countdown = (row: any) => {
  if (!row.calledTime || row.signInStatus === '1') return '';
  const bts = (() => { const ts = parseDateTimeTs(row.calledTime); if (ts) return ts; const s = String(row.calledTime).trim(); const z = new Date(s.replace(' ','T') + 'Z'); const v = z.getTime(); return isNaN(v) ? 0 : v; })();
  const remain = 180 - Math.floor((nowTs.value - bts) / 1000);
  return remain > 0 ? `${remain}s` : '已过号';
};

// 倒计时样式类
const getCountdownClass = (row: any) => {
  if (!row.calledTime || row.signInStatus === '1') return '';
  const bts = (() => { const ts = parseDateTimeTs(row.calledTime); if (ts) return ts; const s = String(row.calledTime).trim(); const z = new Date(s.replace(' ','T') + 'Z'); const v = z.getTime(); return isNaN(v) ? 0 : v; })();
  const remain = 180 - Math.floor((nowTs.value - bts) / 1000);
  if (remain <= 0) return 'text-missed';
  if (remain <= 30) return 'text-urgent';
  return 'text-normal';
};

// 跳转到历史记录页面
const toHistory = (row: MakeOrder) => {
  router.push({
    name: "PatientHistory",
    query: {
      visitUserId: row.visitUserId,
      visitName: row.visitname
    }
  });
};

// 查询按钮
const searchBtn = () => {
  searchParm.currentPage = 1;
  getList();
};

// 重置按钮
const resetBtn = () => {
  searchParm.name = "";
  searchParm.currentPage = 1;
  getList();
};

// 表格高度处理
const tableHeight = ref(0);
const TABLE_BOTTOM_OFFSET = 240; 

const setTableHeight = () => {
  tableHeight.value = window.innerHeight - TABLE_BOTTOM_OFFSET;
};

onMounted(() => {
  getList();
  nextTick(() => {
    setTableHeight();
  });
  window.addEventListener('resize', setTableHeight);
  timer = window.setInterval(() => { nowTs.value = Date.now(); }, 1000);
});

onUnmounted(() => {
  window.removeEventListener('resize', setTableHeight);
  if (timer) window.clearInterval(timer);
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background-color: #f5f7fa; /* 更柔和的背景色 */
  min-height: 100vh;
  box-sizing: border-box;
}

.main-card {
  border: none;
  border-radius: 8px;
  /* 稍微加一点阴影 */
  box-shadow: 0 1px 4px rgba(0,21,41,.08) !important;
  
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  
  .header-title-decoration {
    width: 4px;
    height: 18px;
    background-color: #409eff;
    border-radius: 2px;
    margin-right: 10px;
  }

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.search-form {
  .el-form-item {
    margin-bottom: 0;
    margin-right: 12px;
  }
}

/* 表格自定义样式 */
:deep(.custom-table-header th) {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
  height: 50px;
}

:deep(.custom-table-row td) {
    padding: 8px 0; /* 适当增加行高 */
}

.patient-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  .patient-avatar {
    background-color: #e6f7ff;
    color: #409eff;
  }
  
  .patient-name {
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }
}

.price-text {
  color: #f56c6c;
  font-weight: bold;
}

/* 倒计时样式 */
.countdown-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: monospace; /* 等宽字体防止数字跳动 */
  font-weight: bold;
}
.text-normal { color: #409eff; }
.text-urgent { color: #e6a23c; }
.text-missed { color: #909399; }

/* 按钮区域 */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 10px;
}
</style>