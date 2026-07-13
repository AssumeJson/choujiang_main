const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    
    // 查找用户是否存在
    const userRes = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userRes.data.length > 0) {
      // 用户已存在
      return {
        code: 0,
        message: 'success',
        data: userRes.data[0]
      }
    } else {
      // 创建新用户
      const newUser = {
        nickname: '电影爱好者',
        avatar: 'https://picsum.photos/id/64/200/200',
        lotteryCount: 3,
        createTime: new Date()
      }
      const addRes = await db.collection('users').add({
        data: newUser
      })
      
      // 返回新用户信息
      return {
        code: 0,
        message: 'success',
        data: {
          _id: addRes._id,
          ...newUser
        }
      }
    }
  } catch (error) {
    console.error('[login] error:', error)
    return {
      code: -1,
      message: error.message || '服务异常',
      data: null
    }
  }
}
