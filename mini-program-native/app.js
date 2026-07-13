App({
  onLaunch: function () {
    console.log('电影票抽奖小程序启动')
  },

  onShow: function () {
    this.checkLoginStatus()
  },

  onHide: function () {
    console.log('小程序隐藏')
  },

  checkLoginStatus: function () {
    var token = wx.getStorageSync('token')
    var pages = getCurrentPages()
    if (pages.length > 0) {
      var currentPage = pages[pages.length - 1]
      var currentRoute = currentPage.route || ''

      if (!token && !currentRoute.includes('login')) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        })

        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }, 2000)
      }
    }
  },

  globalData: {
    userInfo: null
  }
})
