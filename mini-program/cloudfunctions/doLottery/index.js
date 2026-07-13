const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    
    // 检查用户抽奖次数
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userRes.data.length === 0 || userRes.data[0].lotteryCount <= 0) {
      return {
        code: -1,
        message: '抽奖次数不足',
        data: null
      }
    }
    
    // 奖品配置
    const prizes = [
      { name: '免费爆米花', probability: 0.1 },
      { name: '电影优惠券50元', probability: 0.1 },
      { name: '纪念海报', probability: 0.2 },
      { name: '再来一次', probability: 0.1 },
      { name: '谢谢参与', probability: 0.5 }
    ]
    
    // 随机抽奖
    const random = Math.random()
    let cumulative = 0
    let selectedPrize = prizes[prizes.length - 1].name
    
    for (const prize of prizes) {
      cumulative += prize.probability
      if (random < cumulative) {
        selectedPrize = prize.name
        break
      }
    }
    
    // 创建抽奖记录
    const lotteryRecord = {
      prize: selectedPrize,
      ticketStubId: event.ticketStubId || '',
      createTime: new Date()
    }
    const addRes = await db.collection('lottery_records').add({
      data: lotteryRecord
    })
    
    // 扣减抽奖次数
    await db.collection('users').where({
      _openid: openid
    }).update({
      data: {
        lotteryCount: db.command.inc(-1)
      }
    })
    
    return {
      code: 0,
      message: 'success',
      data: {
        _id: addRes._id,
        ...lotteryRecord
      }
    }
  } catch (error) {
    console.error('[doLottery] error:', error)
    return {
      code: -1,
      message: error.message || '服务异常',
      data: null
    }
  }
}
