import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:8080/api'

const request = async <T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: Record<string, any>,
  needAuth: boolean = true
): Promise<T> => {
  let token = ''
  if (needAuth) {
    try {
      const res = Taro.getStorageSync('token')
      token = res || ''
    } catch (e) {
      console.error('Failed to get token from storage')
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: headers,
    })

    const result = res.data as { code: number; message: string; data: T }

    if (result.code !== 0) {
      if (result.code === 401) {
        Taro.removeStorageSync('token')
        Taro.navigateTo({ url: '/pages/login/index' })
      }
      throw new Error(result.message || '请求失败')
    }

    return result.data
  } catch (error: any) {
    console.error(`[API] ${url} failed:`, error)
    throw error
  }
}

export const login = async (data: {
  code?: string
  phoneCode?: string
}) => {
  return request<{ data: any }>('/mini/login', 'POST', data, false)
}

export const getUserInfo = async () => {
  return request<{ data: any }>('/mini/user/info', 'GET')
}

export const bindIdCard = async (idCard: string) => {
  return request<{ data: any }>('/mini/bind-id-card', 'POST', { idCard })
}

export const uploadTicket = async (data: {
  imageUrl?: string
  imageBase64?: string
  movieName?: string
  showTime?: string
  cinema?: string
  cinemaLocation?: string
  seat?: string
}) => {
  return request<{ data: any }>('/ticket/upload', 'POST', data)
}

export const getTicketList = async (page: number = 1, size: number = 10) => {
  return request<{ data: any }>('/ticket/list?page=' + page + '&size=' + size, 'GET')
}

export const getTicketStats = async () => {
  return request<{ data: any }>('/ticket/stats', 'GET', undefined, false)
}

export const getCurrentLotteryConfig = async () => {
  return request<{ data: any }>('/lottery/config/current', 'GET', undefined, false)
}

export const getLotteryRecords = async (page: number = 1, size: number = 10) => {
  return request<{ data: any }>('/lottery/records?page=' + page + '&size=' + size, 'GET')
}

export const getWinningRecords = async () => {
  return request<{ data: any }>('/lottery/records/winning', 'GET')
}

export const claimPrize = async (recordId: number) => {
  return request<{ data: any }>('/lottery/claim/' + recordId, 'POST')
}