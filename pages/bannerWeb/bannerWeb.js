// pages/bannerWeb/bannerWeb.js
const app = getApp();
const myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    path: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
  // var that=this;
  // this.setData({
  //   path:'https://ceshiserver.myj.com.cn/test.html'
  // })
  // },

  onLoad: function (options) {
    this.initUrl(options)
    var that = this;
    var bannerweburl = options.bannerUrl
    that.setData({
      path: bannerweburl
    })
  },
  initUrl(options) {
    var that = this;
    var bannerweburl = options.bannerUrl
    if (bannerweburl.indexOf('mimage') > -1) { //抽奖h5需要登陆获取token
      this.getToken(options)
    } else {
      this.setData({
        path: bannerweburl
      })
    }
  },
  getToken(options) {
    var that = this;
    var bannerweburl = options.bannerUrl
    myjCommon.getLoginUser(function (user) {
      console.log(user.sessionId)
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      app.signPost.callApi({
        url: '/api/Member/MPLogin',
        biz: {
          "sessionId": user.sessionId,
          "channel": "wx",
        },
        success: function (res) {
          if (res.code == 0) {
            that.setData({
              path: bannerweburl + '?1211=1&token=' + res.data.token// 'http://www.baidu.com'//
            })
          } else {
            wx.showModal({
              title: '温馨提示',
              content: res.msg,
              showCancel: false,
              success() {
                myjCommon.relogin(function (user) {
                  that.getToken(options)
                })
              }
            })

          }
        }
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})