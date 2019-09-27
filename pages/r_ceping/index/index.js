// pages/index/index.js


const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    setTimeout(this.enterCardGame, 200)

  },

  enterCardGame() {
    wx.navigateTo({
      url: '../cepingGame/index'
    })
  }
  // let url = '../cardGame/index'
  // name && (url += `?sessionId=${sessionId}&name=${name}`)
  // 模拟从分享入口进入
  // wx.navigateTo({url: "../cardGame/index?sessionId=abccsfdaa&name=ㄉㄏㄊㄜ"})
  // }
})