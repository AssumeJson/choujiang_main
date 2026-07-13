const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    
    // 模拟票根识别结果
    const movies = [
      { name: '流浪地球3', time: '2025-01-25 19:30', cinema: '万达影城CBD店' },
      { name: '满江红2', time: '2025-01-20 14:00', cinema: '博纳国际影城' },
      { name: '唐人街探案4', time: '2025-01-15 20:00', cinema: 'CGV影城' },
      { name: '哪吒之魔童闹海', time: '2025-01-10 18:00', cinema: 'UME国际影城' }
    ]
    const randomMovie = movies[Math.floor(Math.random() * movies.length)]
    
    // 创建票根记录
    const ticketStub = {
      imageUrl: event.imageData || 'https://picsum.photos/id/292/600/400',
      movieName: randomMovie.name,
      showTime: randomMovie.time,
      cinema: randomMovie.cinema,
      createTime: new Date()
    }
    const addRes = await db.collection('ticket_stubs').add({
      data: ticketStub
    })
    
    // 更新用户抽奖次数
    await db.collection('users').where({
      _openid: openid
    }).update({
      data: {
        lotteryCount: db.command.inc(1)
      }
    })
    
    return {
      code: 0,
      message: 'success',
      data: {
        _id: addRes._id,
        ...ticketStub
      }
    }
  } catch (error) {
    console.error('[uploadTicketStub] error:', error)
    return {
      code: -1,
      message: error.message || '服务异常',
      data: null
    }
  }
}
