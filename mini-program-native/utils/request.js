const BASE_URL = 'http://localhost:8080/api'

const request = function (url, method, data, needAuth) {
  var token = ''
  if (needAuth === undefined || needAuth === true) {
    try {
      var res = wx.getStorageSync('token')
      token = res || ''
    } catch (e) {
      console.error('Failed to get token from storage')
    }
  }

  var header = {
    'Content-Type': 'application/json'
  }
  if (token) {
    header['Authorization'] = 'Bearer ' + token
  }

  return new Promise(function (resolve, reject) {
    wx.request({
      url: BASE_URL + url,
      method: method || 'GET',
      data: data || {},
      header: header,
      success: function (res) {
        var result = res.data
        if (result.code !== 0) {
          if (result.code === 401) {
            wx.removeStorageSync('token')
            wx.navigateTo({ url: '/pages/login/index' })
          }
          reject(new Error(result.message || '请求失败'))
        } else {
          resolve(result.data)
        }
      },
      fail: function (error) {
        console.error('[API] ' + url + ' failed:', error)
        reject(error)
      }
    })
  })
}

module.exports = {
  request: request,
  login: function (data) {
    return request('/mini/login', 'POST', data, false)
  },
  getUserInfo: function () {
    return request('/mini/user/info', 'GET')
  },
  bindIdCard: function (idCard) {
    return request('/mini/bind-id-card', 'POST', { idCard: idCard })
  },
  uploadTicket: function (data) {
    return request('/ticket/upload', 'POST', data)
  },
  getTicketList: function (page, size) {
    return request('/ticket/list?page=' + (page || 1) + '&size=' + (size || 10), 'GET')
  },
  getTicketStats: function () {
    return request('/ticket/stats', 'GET', {}, false)
  },
  getCurrentLotteryConfig: function () {
    return request('/lottery/config/current', 'GET', {}, false)
  },
  getLotteryRecords: function (page, size) {
    return request('/lottery/records?page=' + (page || 1) + '&size=' + (size || 10), 'GET')
  },
  getWinningRecords: function () {
    return request('/lottery/records/winning', 'GET')
  },
  claimPrize: function (recordId) {
    return request('/lottery/claim/' + recordId, 'POST')
  }
}
