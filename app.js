// app.js
App({
  onLaunch: function () {
    // 云开发初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上版本，以支持小程序云开发')
    } else {
      // 云环境 ID 配置 (请修改为你的实际环境 ID)
      const cloudEnv = 'cloud1-2g1k2at039348d5d';
      
      wx.cloud.init({
        env: cloudEnv,
        traceUser: true
      })
      .then(() => {
        console.log('✅ 云开发初始化成功');
      })
      .catch(err => {
        console.warn('⚠️ 云开发初始化失败，将使用本地数据:', err);
        this.globalData.cloudAvailable = false;
      });
    }

    // 全局数据
    this.globalData = {
      userInfo: null,
      isOpened: false,
      cloudAvailable: true // 云开发是否可用
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
        },
        fail: function () {
          // 用户拒绝授权，使用默认信息
          that.globalData.userInfo = {
            nickName: 'AI 学习者',
            avatarUrl: ''
          }
          typeof cb == 'function' && cb(that.globalData.userInfo)
        }
      })
    }
  }
})
