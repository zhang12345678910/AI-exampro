// pages/remind/remind.js
Page({
  data: {
    subscribed: false,
    remindTime: '20:00',
    loading: true
  },

  onLoad: function () {
    this.loadSubscribeStatus()
  },

  // 加载订阅状态
  async loadSubscribeStatus() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getUserInfo'
      })
      
      if (res.result && res.result.success) {
        const userData = res.result.data
        this.setData({
          subscribed: userData.remindSubscribed || false,
          remindTime: userData.remindTime || '20:00',
          loading: false
        })
      }
    } catch (err) {
      console.error('加载订阅状态失败:', err)
      this.setData({ loading: false })
    }
  },

  // 订阅提醒
  async subscribeRemind() {
    // 请求订阅消息授权
    wx.requestSubscribeMessage({
      tmplIds: ['YOUR_TEMPLATE_ID'], // 需要在微信公众平台配置
      success: async (res) => {
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          // 用户同意订阅
          await wx.cloud.callFunction({
            name: 'subscribeRemind',
            data: { remindTime: this.data.remindTime }
          })
          
          this.setData({ subscribed: true })
          wx.showToast({
            title: '订阅成功',
            icon: 'success'
          })
        }
      },
      fail: (err) => {
        console.error('订阅失败:', err)
        if (err.errMsg.includes('cancel')) {
          wx.showToast({
            title: '已取消订阅',
            icon: 'none'
          })
        }
      }
    })
  },

  // 取消订阅
  async unsubscribeRemind() {
    try {
      await wx.cloud.callFunction({
        name: 'subscribeRemind',
        data: { action: 'unsubscribe' }
      })
      
      this.setData({ subscribed: false })
      wx.showToast({
        title: '已取消提醒',
        icon: 'success'
      })
    } catch (err) {
      console.error('取消订阅失败:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 选择提醒时间
  onTimeChange(e) {
    this.setData({ remindTime: e.detail.value })
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '每天 5 分钟，轻松学会 AI 术语！',
      path: '/pages/index/index'
    }
  }
})
