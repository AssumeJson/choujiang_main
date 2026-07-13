const api = require('../../utils/request.js')

Page({
  data: {
    isSpinning: false,
    result: null,
    hasSpun: false,
    config: null
  },

  onLoad: function () {
    var that = this
    api.getCurrentLotteryConfig().then(function (result) {
      if (result) {
        that.setData({ config: result })
      }
    }).catch(function (error) {
      console.error('[Lottery] Failed to get config:', error)
    })
  },

  handleLottery: function () {
    var that = this
    if (that.data.isSpinning) return

    if (!that.data.config || that.data.config.status !== 1) {
      wx.showToast({
        title: '活动尚未开始或已结束',
        icon: 'none'
      })
      return
    }

    that.setData({ isSpinning: true })

    setTimeout(function () {
      api.getLotteryRecords(1, 1).then(function (records) {
        var mockResult = {
          prize: '谢谢参与',
          createdAt: new Date().toISOString()
        }

        if (records && records.length > 0 && records[0].isClaimed === 0) {
          mockResult = {
            prize: records[0].prizeName || records[0].prize || '精美礼品一份',
            createdAt: records[0].createdAt || records[0].createTime || new Date().toISOString()
          }
        }

        that.setData({
          result: mockResult,
          hasSpun: true,
          isSpinning: false
        })
      }).catch(function (error) {
        console.error('[Lottery] Failed to get records:', error)
        that.setData({
          result: {
            prize: '谢谢参与',
            createdAt: new Date().toISOString()
          },
          hasSpun: true,
          isSpinning: false
        })
      })
    }, 2000)
  },

  handleBack: function () {
    wx.switchTab({ url: '/pages/home/index' })
  },

  handleCheckRecords: function () {
    wx.switchTab({ url: '/pages/records/index' })
  },

  isWinning: function (prize) {
    if (!prize) return false
    return !prize.includes('谢谢') && !prize.includes('未中奖')
  }
})