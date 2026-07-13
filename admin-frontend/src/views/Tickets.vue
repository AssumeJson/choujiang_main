<template>
  <div class="tickets">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>🎫 票根管理</span>
          <el-button type="primary" @click="exportTickets">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
        </div>
      </template>
      
      <div class="search-box">
        <el-input
          v-model="searchForm.movieName"
          placeholder="请输入电影名称"
          clearable
          style="width: 250px; margin-right: 10px;"
          @keyup.enter="loadData"
        />
        <el-input
          v-model="searchForm.cinema"
          placeholder="请输入影院名称"
          clearable
          style="width: 250px; margin-right: 10px;"
          @keyup.enter="loadData"
        />
        <el-select
          v-model="searchForm.isValid"
          placeholder="票根状态"
          clearable
          style="width: 150px; margin-right: 10px;"
        >
          <el-option :label="'有效'" :value="1" />
          <el-option :label="'无效'" :value="0" />
        </el-select>
        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
      </div>
      
      <el-table :data="tableData" v-loading="loading" border stripe style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="movieName" label="电影名称" min-width="150" />
        <el-table-column prop="cinema" label="影院" min-width="120" />
        <el-table-column prop="cinemaLocation" label="位置" min-width="150" />
        <el-table-column prop="seat" label="座位" width="100" />
        <el-table-column prop="showTime" label="放映时间" width="180" />
        <el-table-column prop="isValid" label="状态" width="100">
          <template #default="{ row }">
            <span :class="row.isValid === 1 ? 'valid' : 'invalid'">
              {{ row.isValid === 1 ? '有效' : '无效' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="isUsedForLottery" label="抽奖状态" width="120">
          <template #default="{ row }">
            <span :class="row.isUsedForLottery === 1 ? 'used' : 'unused'">
              {{ row.isUsedForLottery === 1 ? '已抽奖' : '待抽奖' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="180" />
      </el-table>
      
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTicketList, exportTickets } from '@/api'

const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const searchForm = ref({
  movieName: '',
  cinema: '',
  isValid: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTicketList({
      page: page.value,
      size: size.value,
      movieName: searchForm.value.movieName,
      cinema: searchForm.value.cinema,
      isValid: searchForm.value.isValid || undefined
    })
    tableData.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.tickets {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
}

.valid {
  color: #67C23A;
}

.invalid {
  color: #F56C6C;
}

.used {
  color: #909399;
}

.unused {
  color: #409EFF;
}
</style>