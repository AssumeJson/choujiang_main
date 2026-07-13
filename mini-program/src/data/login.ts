import type { User } from '../types'

export const mockLogin = (): User => {
  return {
    nickname: '电影爱好者',
    avatar: 'https://picsum.photos/id/64/200/200',
    lotteryCount: 3,
    createTime: new Date().toISOString()
  }
}
