import Taro from '@tarojs/taro'
import { getToken, logout } from '@/utils/auth'

const BASE_URL = 'http://localhost:8080/api'

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const request = async <T = any>(
  options: Taro.request.Option
): Promise<T> => {
  const token = getToken()
  
  const defaultOptions: Taro.request.Option = {
    ...options,
    url: BASE_URL + options.url,
    header: {
      ...options.header,
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    timeout: 10000,
  }

  try {
    const res = await Taro.request<ApiResponse<T>>(defaultOptions)
    
    console.log(`[API] ${options.url} response:`, res)
    
    if (res.statusCode === 200) {
      const result = res.data
      if (result.code === 0) {
        return result.data
      } else {
        console.error(`[API] ${options.url} failed:`, result.message)
        throw new Error(result.message || '请求失败')
      }
    } else if (res.statusCode === 401) {
      console.error('[API] 未登录或token无效，需要重新登录')
      logout()
      throw new Error('未登录或token无效')
    } else {
      console.error(`[API] ${options.url} failed with status: ${res.statusCode}`)
      throw new Error('请求失败')
    }
  } catch (error: any) {
    console.error(`[API] ${options.url} error:`, error)
    throw error
  }
}

export const login = async (data: { code: string; phoneCode: string }) => {
  return request({
    url: '/mini/login',
    method: 'POST',
    data
  })
}

export const updateUserInfo = async (data: { nickname?: string; avatar?: string }) => {
  return request({
    url: '/mini/user/update',
    method: 'POST',
    data
  })
}

export const getUserInfo = async () => {
  return request({
    url: '/mini/user/info',
    method: 'GET'
  })
}

export const bindIdCard = async (idCard: string) => {
  return request({
    url: '/mini/bind-id-card',
    method: 'POST',
    data: { idCard }
  })
}

export const getCurrentLotteryConfig = async () => {
  return request({
    url: '/lottery/config/current',
    method: 'GET'
  })
}

export const getTicketStats = async () => {
  return request({
    url: '/ticket/stats',
    method: 'GET'
  })
}

export const uploadTicket = async (data: {
  imageUrl: string
  movieName?: string
  showTime?: string
  cinema?: string
  cinemaLocation?: string
  seat?: string
}) => {
  return request({
    url: '/ticket/upload',
    method: 'POST',
    data
  })
}

export const getWinningRecords = async () => {
  return request({
    url: '/lottery/records/winning',
    method: 'GET'
  })
}

export const claimPrize = async (recordId: number) => {
  return request({
    url: '/lottery/claim/' + recordId,
    method: 'POST'
  })
}