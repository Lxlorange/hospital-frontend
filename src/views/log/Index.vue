<template>
  <el-main>
    <el-card shadow="never">
      <div style="margin-bottom:12px;display:flex;gap:12px;align-items:center;">
        <el-radio-group v-model="activeType">
          <el-radio-button label="login">登录日志</el-radio-button>
          <el-radio-button label="op">操作日志</el-radio-button>
        </el-radio-group>
        <el-input v-model="searchParm.name" placeholder="输入姓名" clearable style="width:220px;" />
        <el-button type="primary" @click="searchBtn">查询</el-button>
      </div>

      <el-table :data="tableList" border stripe style="width:100%">
        <el-table-column prop="nickName" label="姓名" width="160" />
        <el-table-column prop="ipAddr" label="IP地址" width="180" />
        <el-table-column v-if="activeType==='login'" prop="loginTime" label="登录时间" :formatter="timeFormatter" />
        <el-table-column v-if="activeType==='op'" prop="operation" label="操作说明" />
        <el-table-column v-if="activeType==='op'" prop="status" label="状态" width="90" />
        <el-table-column v-if="activeType==='op'" prop="operateTime" label="操作时间" :formatter="timeFormatter" />
      </el-table>

      <div style="margin-top:12px;display:flex;justify-content:flex-end;">
        <el-pagination
          @size-change="sizeChange"
          @current-change="currentChange"
          :current-page="searchParm.currentPage"
          :page-sizes="[10,20,40,80,100]"
          :page-size="searchParm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="searchParm.total"
          background
        />
      </div>
    </el-card>
  </el-main>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import http from '@/http'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

type LoginLog = {
  id: string
  userId: string
  username: string
  nickName: string
  ipAddr: string
  loginTime: string
}
type OperationLog = {
  id: string
  userId: string
  username: string
  nickName: string
  ipAddr: string
  operation: string
  method: string
  uri: string
  status: number
  operateTime: string
}

const searchParm = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  name: ''
})

const activeType = ref<'login'|'op'>('login')
const tableList = ref<Array<LoginLog|OperationLog>>([])

const getList = async () => {
  try {
    const url = activeType.value === 'login' ? '/api/loginLog/list' : '/api/operationLog/list'
    const res = await http.get(url, searchParm)
    if (res && res.code === 200) {
      tableList.value = res.data.records || []
      searchParm.total = res.data.total || 0
    }
  } catch (e: any) {
    ElMessage.error(e?.msg || '加载失败')
  }
}

const searchBtn = () => {
  searchParm.currentPage = 1
  getList()
}
const sizeChange = (size: number) => {
  searchParm.pageSize = size
  searchParm.currentPage = 1
  getList()
}
const currentChange = (page: number) => {
  searchParm.currentPage = page
  getList()
}

onMounted(() => { getList() })
watch(activeType, () => { searchParm.currentPage = 1; getList() })

const timeFormatter = (_row: any, _col: any, cellValue: string) => {
  if (!cellValue) return ''
  const t = dayjs(cellValue)
  return t.isValid() ? t.format('YYYY-MM-DD HH:mm:ss') : String(cellValue).replace('T',' ').split('+')[0]
}
</script>

<style scoped>
</style>