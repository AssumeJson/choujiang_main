<template>
  <div class="lotteries">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>🎰 抽奖配置</span>
          <el-button type="primary" @click="showAddModal = true">
            <el-icon><Plus /></el-icon>
            创建活动
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" border stripe style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="活动名称" min-width="200" />
        <el-table-column prop="drawTime" label="开奖时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="活动描述" min-width="250" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="editConfig(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteConfig(row.id)">删除</el-button>
            <el-button 
              v-if="row.status === 1" 
              size="small" 
              type="primary" 
              @click="handleDraw(row.id)"
            >
              开奖
            </el-button>
          </template>
        </el-table-column>
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

    <el-dialog
      v-model="showAddModal"
      :title="editForm.id ? '编辑活动' : '创建活动'"
      width="600px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="editForm.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="开奖时间">
          <el-date-picker
            v-model="editForm.drawTime"
            type="datetime"
            placeholder="请选择开奖时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="editForm.startTime"
            type="datetime"
            placeholder="请选择开始时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="editForm.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="活动描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            placeholder="请输入活动描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="editForm.status">
            <el-option :label="'未开始'" :value="0" />
            <el-option :label="'进行中'" :value="1" />
            <el-option :label="'已开奖'" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLotteryConfigList, createLotteryConfig, updateLotteryConfig, deleteLotteryConfig, drawLottery } from '@/api'

const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const showAddModal = ref(false)
const editForm = ref({
  id: null,
  name: '',
  startTime: '',
  endTime: '',
  drawTime: '',
  status: 0,
  description: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getLotteryConfigList()
    tableData.value = res.data || []
    total.value = tableData.value.length
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
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

const getStatusTag = (status) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'info'
    default: return ''
  }
}

const editConfig = (row) => {
  editForm.value = {
    id: row.id,
    name: row.name,
    startTime: row.startTime,
    endTime: row.endTime,
    drawTime: row.drawTime,
    status: row.status,
    description: row.description
  }
  showAddModal.value = true
}

const saveConfig = async () => {
  if (!editForm.value.name || !editForm.value.drawTime) {
    ElMessage.warning('请填写活动名称和开奖时间')
    return
  }
  
  try {
    if (editForm.value.id) {
      await updateLotteryConfig(editForm.value.id, editForm.value)
      ElMessage.success('更新成功')
    } else {
      await createLotteryConfig(editForm.value)
      ElMessage.success('创建成功')
    }
    showAddModal.value = false
    editForm.value = {
      id: null,
      name: '',
      startTime: '',
      endTime: '',
      drawTime: '',
      status: 0,
      description: ''
    }
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const deleteConfig = async (id) => {
  ElMessageBox.confirm('确定要删除该活动吗？', '确认删除', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteLotteryConfig(id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleDraw = async (configId) => {
  ElMessageBox.confirm('确定要开始开奖吗？开奖后无法撤销！', '确认开奖', {
    type: 'warning'
  }).then(async () => {
    try {
      await drawLottery(configId)
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
.lotteries {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>