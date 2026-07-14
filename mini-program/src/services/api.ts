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

  console.log(`[API] 请求: ${method} ${BASE_URL}${url}, needAuth: ${needAuth}, token: ${token ? '存在' : '不存在'}`)

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: headers,
    })

    console.log(`[API] 响应: ${method} ${BASE_URL}${url}, status: ${res.statusCode}, data:`, res.data)

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
  return request<{
    token: string
    userId: number
    openid: string
    nickname: string
    avatar: string
    phone: string
    hasBindIdCard: number
    hasWon: number
    ticketCount: number
  }>('/mini/login', 'POST', data, false)
}

export const getUserInfo = async () => {
  return request<{
    id: number
    openid: string
    nickname: string
    avatar: string
    phone: string
    idCard: string
    hasBindIdCard: number
    hasWon: number
    ticketCount: number
    createdAt: string
    updatedAt: string
  }>('/mini/user/info', 'GET', undefined, true)
}

export const bindIdCard = async (idCard: string) => {
  return request<any>('/mini/bind-id-card', 'POST', { idCard })
}

export const updateUserInfo = async (data: { nickname?: string; avatar?: string }) => {
  return request<any>('/mini/user/update', 'POST', data)
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
  return request<any>('/ticket/upload', 'POST', data)
}

export const getTicketList = async (page: number = 1, size: number = 10) => {
  return request<any>('/ticket/list?page=' + page + '&size=' + size, 'GET')
}

export const getTicketStats = async () => {
  return request<{
    totalTicketCount: number
    uniqueUserCount: number
  }>('/ticket/stats', 'GET', undefined, false)
}

export const getCurrentLotteryConfig = async () => {
  return request<{
    id: number
    status: number
    startTime: string
    endTime: string
    prizeName: string
    prizeCount: number
    createdAt: string
  }>('/lottery/config/current', 'GET', undefined, false)
}

export const getLotteryRecords = async (page: number = 1, size: number = 10) => {
  return request<any>('/lottery/records?page=' + page + '&size=' + size, 'GET')
}

export const getWinningRecords = async () => {
  return request<any>('/lottery/records/winning', 'GET')
}

export const claimPrize = async (recordId: number) => {
  return request<any>('/lottery/claim/' + recordId, 'POST')
}