import type { TicketStub } from '../types'

export const mockGetTicketStubs = (): TicketStub[] => {
  return [
    {
      imageUrl: 'https://picsum.photos/id/292/600/400',
      movieName: '流浪地球3',
      showTime: '2025-01-25 19:30',
      cinema: '万达影城CBD店',
      createTime: '2025-01-25T20:00:00Z'
    },
    {
      imageUrl: 'https://picsum.photos/id/312/600/400',
      movieName: '满江红2',
      showTime: '2025-01-20 14:00',
      cinema: '博纳国际影城',
      createTime: '2025-01-20T15:00:00Z'
    },
    {
      imageUrl: 'https://picsum.photos/id/326/600/400',
      movieName: '唐人街探案4',
      showTime: '2025-01-15 20:00',
      cinema: 'CGV影城',
      createTime: '2025-01-15T21:00:00Z'
    }
  ]
}
