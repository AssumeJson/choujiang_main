const api = require('../../utils/request.js')

Page({
  data: {
    user: null,
    config: null,
    stats: null,
    loading: true
  },

  onLoad: function () {
    this.initData()
  },

  onShow: function () {
    this.initData()
  },

  initData: function () {
    var that = this
    that.setData({ loading: true })

    Promise.all([
      api.getUserInfo(),
      api.getCurrentLotteryConfig(),
      api.getTicketStats()
    ]).then(function (results) {
      var userRes = results[0]
      var configRes = results[1]
      var statsRes = results[2]

      if (userRes) {
        that.setData({ user: userRes })
      }
      if (configRes) {
        that.setData({ config: configRes })
      }
      if (statsRes) {
        that.setData({ stats: statsRes })
      }
    }).catch(function (error) {
      console.error('[Home] Failed to init data:', error)
    }).finally(function () {
      that.setData({ loading: false })
    })
  },

  handleUpload: function () {
    var hasBindIdCard = wx.getStorageSync('hasBindIdCard')
    if (!hasBindIdCard || hasBindIdCard === 0) {
      wx.showModal({
        title: '提示',
        content: '兑奖时需要核对身份证信息，建议先绑定身份证',
        confirmText: '去绑定',
        cancelText: '暂不绑定',
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/profile/index' })
          } else {
            wx.switchTab({ url: '/pages/upload/index' })
          }
        }
      })
    } else {
      wx.switchTab({ url: '/pages/upload/index' })
    }
  },

  handleRecords: function () {
    wx.switchTab({ url: '/pages/records/index' })
  },

  formatDrawTime: function (timeStr) {
    try {
      var date = new Date(timeStr)
      return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0') + ' ' +
        String(date.getHours()).padStart(2, '0') + ':' +
        String(date.getMinutes()).padStart(2, '0')
    } catch (e) {
      return timeStr
    }
  },

  getStatusText: function (status) {
    switch (status) {
      case 0: return '未开始'
      case 1: return '进行中'
      case 2: return '已开奖'
      default: return '未知'
    }
  }
})
