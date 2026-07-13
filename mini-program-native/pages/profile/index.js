const api = require('../../utils/request.js')

Page({
  data: {
    user: null,
    showBindModal: false,
    idCard: '',
    binding: false
  },

  onLoad: function () {
    this.loadUserInfo()
  },

  onShow: function () {
    this.loadUserInfo()
  },

  loadUserInfo: function () {
    var that = this
    api.getUserInfo().then(function (result) {
      if (result) {
        that.setData({ user: result })
        wx.setStorageSync('hasBindIdCard', result.hasBindIdCard || 0)
      }
    }).catch(function (error) {
      console.error('[Profile] Failed to load user info:', error)
    })
  },

  handleBindIdCard: function () {
    var that = this
    var idCard = that.data.idCard
    if (!idCard || idCard.length !== 18) {
      wx.showToast({
        title: '请输入有效的身份证号',
        icon: 'none'
      })
      return
    }

    that.setData({ binding: true })
    api.bindIdCard(idCard).then(function () {
      wx.showToast({
        title: '绑定成功',
        icon: 'success'
      })
      that.setData({
        showBindModal: false,
        idCard: ''
      })
      that.loadUserInfo()
    }).catch(function (error) {
      console.error('[Profile] Failed to bind ID card:', error)
      wx.showToast({
        title: error.message || '绑定失败',
        icon: 'none'
      })
    }).finally(function () {
      that.setData({ binding: false })
    })
  },

  handleLogout: function () {
    var that = this
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userId')
          wx.removeStorageSync('nickname')
          wx.removeStorageSync('avatar')
          wx.removeStorageSync('hasBindIdCard')
          wx.navigateTo({ url: '/pages/login/index' })
        }
      }
    })
  },

  onIdCardInput: function (e) {
    this.setData({
      idCard: e.detail.value
    })
  },

  openBindModal: function () {
    this.setData({ showBindModal: true })
  },

  closeBindModal: function () {
    this.setData({
      showBindModal: false,
      idCard: ''
    })
  },

  handleMenuTap: function (e) {
    var index = e.currentTarget.dataset.index
    switch (index) {
      case '0':
        wx.showToast({ title: '我的票根功能开发中', icon: 'none' })
        break
      case '1':
        wx.switchTab({ url: '/pages/records/index' })
        break
      case '2':
        wx.showToast({ title: '设置功能开发中', icon: 'none' })
        break
      case '3':
        wx.showToast({ title: '帮助与反馈功能开发中', icon: 'none' })
        break
    }
  }
})