import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 0) {
      return res
    } else {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export const login = (data) => request.post('/auth/login', data)
export const getTicketStats = () => request.get('/ticket/stats')
export const getTicketList = (params) => request.get('/ticket/list', { params })
export const getLotteryConfigList = () => request.get('/lottery/config/list')
export const getCurrentLotteryConfig = () => request.get('/lottery/config/current')
export const createLotteryConfig = (data) => request.post('/lottery/config', data)
export const updateLotteryConfig = (id, data) => request.put(`/lottery/config/${id}`, data)
export const deleteLotteryConfig = (id) => request.delete(`/lottery/config/${id}`)
export const drawLottery = (configId) => request.post(`/lottery/draw/${configId}`)
export const getLotteryRecords = (params) => request.get('/lottery/records', { params })
export const getWinningRecords = () => request.get('/lottery/records/winning')
export const getUserList = (params) => request.get('/users', { params })
export const exportUsers = () => {
  window.open('/api/export/users')
}
export const exportTickets = () => {
  window.open('/api/export/tickets')
}
export const exportLotteries = () => {
  window.open('/api/export/lotteries')
}

export default request