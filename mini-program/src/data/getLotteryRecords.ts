import type { LotteryRecord } from '../types'

export const mockGetLotteryRecords = (): LotteryRecord[] => {
  return [
    {
      prize: '免费爆米花',
      ticketStubId: 'stub_1',
      createTime: '2025-01-25T20:30:00Z'
    },
    {
      prize: '电影优惠券50元',
      ticketStubId: 'stub_2',
      createTime: '2025-01-20T15:30:00Z'
    },
    {
      prize: '纪念海报',
      ticketStubId: 'stub_3',
      createTime: '2025-01-15T21:30:00Z'
    },
    {
      prize: '再来一次',
      ticketStubId: 'stub_4',
      createTime: '2025-01-10T18:30:00Z'
    },
    {
      prize: '谢谢参与',
      ticketStubId: 'stub_5',
      createTime: '2025-01-05T22:30:00Z'
    }
  ]
}
