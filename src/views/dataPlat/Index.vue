<template>
  <el-main :style="{ height: mianHeight + 'px' }" class="main-container">
    
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
          <span>今日排班</span>
          <div class="schedule-buttons">
            <el-button type="primary" size="small" @click="addConsultation()" style="margin-right: 15px;background-color: powderblue;color: black;">临时加号</el-button>
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
import { ElMessageBox, ElMessage } from "element-plus";
// 导入 Element Plus 图标
import {
  UserFilled,
  Avatar,
  Memo,
  Tickets
} from "@element-plus/icons-vue";
import {
  addConsultationApi,
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

const addConsultation = async () => {
  const doctorId = strore.getUserId;
  ElMessageBox.confirm("确认申请加号？", "加号", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
      await addConsultationApi(doctorId);
      ElMessage.success("已申请");
  }).catch(() => {});
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
/* 整个页面容器 */
.main-container {
  // 新的背景：一个柔和的径向渐变
  background: radial-gradient(circle, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px; // 增加内边距
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
             'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.panel-row {
  margin-bottom: 24px;
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

/* 顶部卡片 - 独立的渐变色 */
.card-doctor {
  background: linear-gradient(135deg, #26c6da 0%, #00acc1 100%); // 青色
}
.card-patient {
  background: linear-gradient(135deg, #ff7043 0%, #f4511e 100%); // 橙色
}
.card-department {
  background: linear-gradient(135deg, #7e57c2 0%, #5e35b1 100%); // 紫色
}
.card-visit {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%); // 绿色
}


/* “今日排班”卡片 - 玻璃拟态效果 */
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
</style>