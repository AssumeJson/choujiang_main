import type { LotteryRecord } from '../types'

export const mockDoLottery = (): LotteryRecord => {
  const prizes = ['免费爆米花', '电影优惠券50元', '纪念海报', '再来一次', '谢谢参与']
  const randomPrize = prizes[Math.floor(Math.random() * prizes.length)]
  
  return {
    prize: randomPrize,
    ticketStubId: 'stub_' + Date.now(),
    createTime: new Date().toISOString()
  }
}
