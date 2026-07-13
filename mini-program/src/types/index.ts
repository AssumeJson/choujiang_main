export interface User {
  _id?: string
  userId?: number
  openid?: string
  nickname: string
  avatar: string
  phone?: string
  idCard?: string
  hasBindIdCard: number
  hasWon: number
  ticketCount: number
  createTime?: string
}

export interface TicketStub {
  _id?: string
  id?: number
  userId?: number
  imageUrl: string
  movieName: string
  showTime: string
  cinema: string
  cinemaLocation?: string
  seat?: string
  ticketHash?: string
  isValid?: number
  isUsedForLottery?: number
  createTime?: string
  createdAt?: string
}

export interface LotteryRecord {
  _id?: string
  id?: number
  userId?: number
  ticketStubId?: number
  prizeId?: number
  prizeName?: string
  prize: string
  lotteryConfigId?: number
  isWin: number
  isClaimed?: number
  claimTime?: string
  createTime?: string
  createdAt?: string
}

export interface Prize {
  _id?: string
  id?: number
  name: string
  image: string
  description: string
  probability: number
  stock: number
}

export interface LotteryConfig {
  id?: number
  name: string
  startTime?: string
  endTime?: string
  drawTime: string
  status: number
  description?: string
  createdAt?: string
}

export interface MiniLoginResponse {
  token: string
  userId: number
  openid: string
  nickname: string
  avatar: string
  phone?: string
  hasBindIdCard: number
  hasWon: number
  ticketCount: number
}

export interface TicketStats {
  totalTicketCount: number
  usedTicketCount: number
  unusedTicketCount: number
  uniqueUserCount: number
}