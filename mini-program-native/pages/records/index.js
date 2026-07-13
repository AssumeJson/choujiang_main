const api = require('../../utils/request.js')

Page({
  data: {
    records: [],
    config: null,
    loading: true
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    this.loadData()
  },

  loadData: function () {
    var that = this
    that.setData({ loading: true })

    Promise.all([
      api.getWinningRecords(),
      api.getCurrentLotteryConfig()
    ]).then(function (results) {
      var recordsRes = results[0]
      var configRes = results[1]

      if (recordsRes) {
        that.setData({ records: recordsRes })
      }
      if (configRes) {
        that.setData({ config: configRes })
      }
    }).catch(function (error) {
      console.error('[Records] Failed to load data:', error)
    }).finally(function () {
      that.setData({ loading: false })
    })
  },

  formatTime: function (timeStr) {
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
  },

  handleClaim: function (recordId) {
    var that = this
    wx.showModal({
      title: '确认兑奖',
      content: '兑奖时将核对您的身份证和手机号信息，请确保已绑定正确的信息',
      confirmText: '确认兑奖',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          api.claimPrize(recordId).then(function () {
            wx.showToast({
              title: '兑奖成功',
              icon: 'success'
            })
            that.loadData()
          }).catch(function (error) {
            console.error('[Records] Failed to claim prize:', error)
            wx.showToast({
              title: error.message || '兑奖失败',
              icon: 'none'
            })
          })
        }
      }
    })
  },

  handleUpload: function () {
    wx.switchTab({ url: '/pages/upload/index' })
  }
})