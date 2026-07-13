<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #409EFF;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.uniqueUserCount || 0 }}</div>
              <div class="stat-label">观影人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #67C23A;">
              <el-icon><Ticket /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalTicketCount || 0 }}</div>
              <div class="stat-label">票根总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #E6A23C;">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.unusedTicketCount || 0 }}</div>
              <div class="stat-label">待抽奖票根</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-icon" style="background: #F56C6C;">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ winningCount || 0 }}</div>
              <div class="stat-label">中奖人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🎬 当前抽奖活动</span>
              <el-button type="primary" @click="goToLotteryConfig">
                <el-icon><Setting /></el-icon>
                配置活动
              </el-button>
            </div>
          </template>
          <div v-if="lotteryConfig" class="lottery-config">
            <div class="config-info">
              <div class="config-name">{{ lotteryConfig.name }}</div>
              <div class="config-status" :class="getStatusClass(lotteryConfig.status)">
                {{ getStatusText(lotteryConfig.status) }}
              </div>
            </div>
            <div class="config-details">
              <div class="detail-item">
                <span class="detail-label">📅 开奖时间：</span>
                <span class="detail-value">{{ formatDateTime(lotteryConfig.drawTime) }}</span>
              </div>
              <div v-if="lotteryConfig.description" class="detail-item">
                <span class="detail-label">📝 活动描述：</span>
                <span class="detail-value">{{ lotteryConfig.description }}</span>
              </div>
            </div>
            <div v-if="lotteryConfig.status === 1" class="draw-action">
              <el-button type="danger" size="large" @click="handleDraw">
                <el-icon><Shuffle /></el-icon>
                立即开奖
              </el-button>
              <span class="draw-tip">开奖后将从所有有效票根中抽取中奖者</span>
            </div>
          </div>
          <div v-else class="no-config">
            <el-icon><Bell /></el-icon>
            <span>暂无进行中的抽奖活动，请在抽奖配置中创建</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>🎫 最新票根</span>
          </template>
          <el-table :data="latestTickets" border stripe size="small">
            <el-table-column prop="movieName" label="电影名称" min-width="120" />
            <el-table-column prop="cinema" label="影院" min-width="100" />
            <el-table-column prop="seat" label="座位" width="80" />
            <el-table-column prop="createdAt" label="上传时间" width="160" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>🏆 最新中奖记录</span>
          </template>
          <el-table :data="latestWinners" border stripe size="small">
            <el-table-column prop="prizeName" label="奖项" min-width="150" />
            <el-table-column prop="userId" label="用户ID" width="80" />
            <el-table-column prop="isClaimed" label="状态" width="80">
              <template #default="{ row }">
                <span :class="row.isClaimed === 1 ? 'claimed' : 'unclaimed'">
                  {{ row.isClaimed === 1 ? '已兑奖' : '待兑奖' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="中奖时间" width="160" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTicketStats, getTicketList, getCurrentLotteryConfig, getWinningRecords, drawLottery } from '@/api'

const stats = ref({})
const lotteryConfig = ref(null)
const latestTickets = ref([])
const latestWinners = ref([])
const winningCount = ref(0)

const loadData = async () => {
  try {
    const [statsRes, ticketsRes, configRes, winnersRes] = await Promise.all([
      getTicketStats(),
      getTicketList({ page: 1, size: 5 }),
      getCurrentLotteryConfig(),
      getWinningRecords()
    ])
    
    if (statsRes.data) {
      stats.value = statsRes.data
    }
    if (ticketsRes.data && ticketsRes.data.records) {
      latestTickets.value = ticketsRes.data.records
    }
    if (configRes.data) {
      lotteryConfig.value = configRes.data
    }
    if (winnersRes.data) {
      latestWinners.value = winnersRes.data.slice(0, 5)
      winningCount.value = winnersRes.data.length
    }
  } catch (error) {
    console.error(error)
  }
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch {
    return dateStr
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 0: return '未开始'
    case 1: return '进行中'
    case 2: return '已开奖'
    default: return '未知'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-pending'
    case 1: return 'status-active'
    case 2: return 'status-finished'
    default: return ''
  }
}

const goToLotteryConfig = () => {
  window.location.href = '#/lotteries'
}

const handleDraw = () => {
  if (!lotteryConfig.value) return
  
  const now = new Date()
  const drawTime = new Date(lotteryConfig.value.drawTime)
  
  if (now < drawTime) {
    const diff = drawTime - now
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    ElMessage.warning(`开奖时间未到，还有 ${hours} 小时 ${minutes} 分钟`)
    return
  }
  
  ElMessageBox.confirm('确定要开始开奖吗？开奖后无法撤销！', '确认开奖', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await drawLottery(lotteryConfig.value.id)
      ElMessage.success('开奖成功！')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #999;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lottery-config {
  padding: 20px;
}

.config-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.config-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.config-status {
  padding: 4px 12px;
  border-radius: 4px;
  margin-left: 16px;
  font-size: 14px;
}

.status-pending {
  background: #E6A23C;
  color: white;
}

.status-active {
  background: #67C23A;
  color: white;
}

.status-finished {
  background: #909399;
  color: white;
}

.config-details {
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 10px;
}

.detail-label {
  color: #999;
}

.detail-value {
  color: #333;
}

.draw-action {
  display: flex;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.draw-tip {
  margin-left: 16px;
  color: #999;
  font-size: 14px;
}

.no-config {
  text-align: center;
  padding: 40px;
  color: #999;
}

.claimed {
  color: #67C23A;
}

.unclaimed {
  color: #E6A23C;
}
</style>