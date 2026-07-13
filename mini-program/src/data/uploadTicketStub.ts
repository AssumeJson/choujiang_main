import type { TicketStub } from '../types'

export const mockUploadTicketStub = (): TicketStub => {
  return {
    imageUrl: 'https://picsum.photos/id/292/600/400',
    movieName: '流浪地球3',
    showTime: '2025-01-25 19:30',
    cinema: '万达影城CBD店',
    createTime: new Date().toISOString()
  }
}
