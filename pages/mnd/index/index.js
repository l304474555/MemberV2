// pages/index/index.js


const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    setTimeout(this.enterCardGame, 500)
   
  },
    // const _city = filterProvince(province, city)
    // !sessionId && wx.login({
    //   success({code}) {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    //获取卡片游戏配置
    // console.log('sessionId', sessionId, unionid)  
    //有unionid说明是通过分享入口进来，自动跳转到游戏内部
    //也可以根据微信场景值判断
    // unionid && this.showNextPage(unionid, name)
  // },

  enterCardGame() {
    wx.navigateTo({url: '../cardGame/index'})
  }
    // let url = '../cardGame/index'
    // name && (url += `?unionid=${unionid}&name=${name}`)
    // 模拟从分享入口进入
  // }
})