const api = require('../../utils/request.js')

Page({
  data: {
    phone: '',
    nickname: '',
    avatar: '',
    loading: false
  },

  onPhoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  handleGetUserProfile: function (e) {
    var that = this
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: function (res) {
        if (res.userInfo) {
          that.setData({
            nickname: res.userInfo.nickName,
            avatar: res.userInfo.avatarUrl
          })
          wx.showToast({
            title: '获取信息成功',
            icon: 'success'
          })
        }
      },
      fail: function (error) {
        console.error('[Login] Failed to get user info:', error)
        if (error.errMsg && error.errMsg.includes('auth deny')) {
          wx.showToast({
            title: '需要授权才能继续',
            icon: 'none'
          })
        }
      }
    })
  },

  handleGetPhoneNumber: function (e) {
    if (e.detail.code) {
      wx.showToast({
        title: '获取手机号成功',
        icon: 'success'
      })
    } else if (e.detail.errMsg && e.detail.errMsg.includes('auth deny')) {
      wx.showToast({
        title: '需要授权手机号',
        icon: 'none'
      })
    }
  },

  handleSubmit: function () {
    var that = this
    if (!that.data.nickname) {
      wx.showToast({
        title: '请先获取微信信息',
        icon: 'none'
      })
      return
    }

    that.setData({ loading: true })

    var code = ''
    wx.login({
      success: function (res) {
        code = res.code || ''
        console.log('[Login] 获取微信code:', code)
      },
      fail: function () {
        console.log('[Login] 微信登录失败，使用模拟登录')
      },
      complete: function () {
        api.login({
          code: code,
          phone: that.data.phone || undefined,
          nickname: that.data.nickname,
          avatar: that.data.avatar || 'https://picsum.photos/id/64/200/200'
        }).then(function (result) {
          if (result) {
            wx.setStorageSync('token', result.token)
            wx.setStorageSync('userId', result.userId)
            wx.setStorageSync('nickname', result.nickname)
            wx.setStorageSync('avatar', result.avatar)
            wx.setStorageSync('hasBindIdCard', result.hasBindIdCard)

            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500
            })

            setTimeout(function () {
              wx.switchTab({ url: '/pages/home/index' })
            }, 1500)
          }
        }).catch(function (error) {
          console.error('[Login] 登录失败:', error)
          wx.showToast({
            title: error.message || '登录失败，请重试',
            icon: 'none'
          })
        }).finally(function () {
          that.setData({ loading: false })
        })
      }
    })
  },

  handleQuickLogin: function () {
    var that = this
    wx.showModal({
      title: '游客登录',
      content: '游客登录无法参与抽奖和兑奖，是否继续？',
      success: function (res) {
        if (res.confirm) {
          that.setData({
            nickname: '游客' + Math.random().toString(36).substr(2, 8),
            avatar: 'https://picsum.photos/id/64/200/200'
          })
          that.handleSubmit()
        }
      }
    })
  }
})
