const api = require('../../utils/request.js')

Page({
  data: {
    imageUrl: '',
    ticketStub: null,
    uploading: false,
    editing: false,
    editForm: {
      movieName: '',
      showTime: '',
      cinema: '',
      cinemaLocation: '',
      seat: ''
    }
  },

  handleChooseImage: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          that.setData({
            imageUrl: res.tempFilePaths[0],
            ticketStub: null,
            editing: false
          })
        }
      },
      fail: function (error) {
        console.error('[Upload] Failed to choose image:', error)
      }
    })
  },

  handleUpload: function () {
    var that = this
    that.setData({ uploading: true })
    wx.showLoading({ title: '识别中...' })

    api.uploadTicket({
      imageUrl: that.data.imageUrl,
      movieName: that.data.editForm.movieName || undefined,
      showTime: that.data.editForm.showTime || undefined,
      cinema: that.data.editForm.cinema || undefined,
      cinemaLocation: that.data.editForm.cinemaLocation || undefined,
      seat: that.data.editForm.seat || undefined
    }).then(function (result) {
      if (result) {
        var ticket = {
          ...result,
          imageUrl: that.data.imageUrl,
          movieName: result.movieName,
          showTime: result.showTime || result.createdAt,
          cinema: result.cinema,
          cinemaLocation: result.cinemaLocation,
          seat: result.seat
        }
        that.setData({
          ticketStub: ticket,
          editForm: {
            movieName: ticket.movieName,
            showTime: ticket.showTime,
            cinema: ticket.cinema,
            cinemaLocation: ticket.cinemaLocation || '',
            seat: ticket.seat || ''
          }
        })

        wx.showToast({
          title: '识别成功',
          icon: 'success'
        })
      }
    }).catch(function (error) {
      console.error('[Upload] Failed to upload:', error)
      wx.showToast({
        title: error.message || '识别失败',
        icon: 'none'
      })
    }).finally(function () {
      wx.hideLoading()
      that.setData({ uploading: false })
    })
  },

  handleRetake: function () {
    this.setData({
      imageUrl: '',
      ticketStub: null,
      editing: false,
      editForm: {
        movieName: '',
        showTime: '',
        cinema: '',
        cinemaLocation: '',
        seat: ''
      }
    })
  },

  handleConfirm: function () {
    var that = this
    var form = that.data.editForm
    wx.showModal({
      title: '确认信息',
      content: '电影：' + form.movieName + '\n时间：' + form.showTime + '\n影院：' + form.cinema + '\n位置：' + (form.cinemaLocation || '') + '\n座位：' + (form.seat || '') + '\n\n兑奖时将核对您的身份证和手机号信息，请确保信息准确！',
      confirmText: '确认无误',
      cancelText: '返回修改',
      success: function (res) {
        if (res.confirm) {
          wx.showToast({
            title: '上传成功！多一张票根多一次中奖机会',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
            that.handleRetake()
          }, 2000)
        }
      }
    })
  },

  handleEdit: function () {
    this.setData({ editing: true })
  },

  cancelEdit: function () {
    this.setData({ editing: false })
  },

  onFieldInput: function (e) {
    var field = e.currentTarget.dataset.field
    var value = e.detail.value
    var editForm = this.data.editForm
    editForm[field] = value
    this.setData({ editForm: editForm })
  }
})
