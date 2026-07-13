const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    
    const res = await db.collection('ticket_stubs').where({
      _openid: openid
    }).orderBy('createTime', 'desc').get()
    
    return {
      code: 0,
      message: 'success',
      data: res.data
    }
  } catch (error) {
    console.error('[getTicketStubs] error:', error)
    return {
      code: -1,
      message: error.message || '服务异常',
      data: null
    }
  }
}
