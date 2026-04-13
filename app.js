// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上版本，以支持小程序云开发')
    } else {
      wx.cloud.init({
        env: 'ai-terms-env', // 云环境 ID，需替换为实际的
        traceUser: true
      })
    }

    // 全局数据
    this.globalData = {
      userInfo: null,
      isOpened: false
    }
  },

  // 获取用户信息
  getUserInfo: function (cb) {
    const that = this
    if (this.globalData.userInfo) {
      typeof cb == 'function' && cb(this.globalData.userInfo)
    } else {
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == 'function' && cb(that.globalData.userInfo)
        }
      })
    }
  }
})
