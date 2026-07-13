import Taro from '@tarojs/taro'
import { mockLogin } from '../data/login'
import { mockUploadTicketStub } from '../data/uploadTicketStub'
import { mockGetTicketStubs } from '../data/getTicketStubs'
import { mockDoLottery } from '../data/doLottery'
import { mockGetLotteryRecords } from '../data/getLotteryRecords'

const isWeapp = process.env.TARO_ENV === 'weapp'

const mockFunctions: Record<string, any> = {
  login: mockLogin,
  uploadTicketStub: mockUploadTicketStub,
  getTicketStubs: mockGetTicketStubs,
  doLottery: mockDoLottery,
  getLotteryRecords: mockGetLotteryRecords
}

export async function callFunction<T = any>(
  name: string,
  data?: Record<string, any>
): Promise<T> {
  if (!isWeapp) {
    console.log(`[Cloud] Mock call: ${name}`)
    const mockFn = mockFunctions[name]
    if (mockFn) {
      return mockFn(data) as T
    }
    throw new Error(`Mock function ${name} not found`)
  }
  const res = await Taro.cloud.callFunction({ name, data })
  const result = res.result as { code: number; message: string; data: T }
  if (result.code !== 0) {
    console.error(`[Cloud] ${name} failed:`, result.message)
    throw new Error(result.message || '请求失败')
  }
  return result.data
}

export function getDatabase() {
  if (!isWeapp) {
    return null
  }
  return Taro.cloud.database()
}
