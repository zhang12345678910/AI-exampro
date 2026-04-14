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
    // 注意：需要先在微信公众平台配置订阅消息模板，获取模板 ID
    // 配置路径：mp.weixin.qq.com -> 功能 -> 订阅消息
    wx.requestSubscribeMessage({
      tmplIds: ['MESSAGE_TEMPLATE_ID'], // TODO: 替换为实际模板 ID
      success: async (res) => {
        if (res.errMsg === 'requestSubscribeMessage:ok' && res[MESSAGE_TEMPLATE_ID] === 'accept') {
          // 用户同意订阅
          try {
            await wx.cloud.callFunction({
              name: 'subscribeRemind',
              data: { remindTime: this.data.remindTime }
            })
            
            this.setData({ subscribed: true })
            wx.showToast({
              title: '订阅成功',
              icon: 'success'
            })
          } catch (err) {
            console.error('订阅云函数调用失败:', err)
            wx.showToast({
              title: '订阅失败，请重试',
              icon: 'none'
            })
          }
        } else if (res.errMsg.includes('cancel')) {
          wx.showToast({
            title: '已取消订阅',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('订阅失败:', err)
        // 引导用户手动配置
        wx.showModal({
          title: '订阅提示',
          content: '订阅消息功能需要在微信公众平台配置模板。暂时可手动打开小程序进行学习提醒。',
          showCancel: false
        })
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
