// pages/r_game/r_game.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowUserInfoBtn:false,
    noMemberTask:false,
    LoadingDesc: "载入中，请稍候……"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
    this.inigame();
  },
  /**初始化第三方游戏 */
  inigame:function()
  {
    var that=this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.IsMember",
        biz: { sessionId: user.sessionId },
        success: function (res) {
          console.log(res)
          if(res.Code=="301") //非会员
          {
            that.setData({
              noMemberTask: true
            });
            app.globalData.loginUser.sessionId = user.sessionId;
            app.globalData.loginUser.isLogined = true;
            app.globalData.loginUser.isMember = false;
            app.globalData.loginUser.province = "广东省";
            app.globalData.loginUser.city = "东莞市";
            app.hwBus.emit('init', true);
          }else
          {
            app.globalData.loginUser.sessionId = user.sessionId;
            app.globalData.loginUser.isLogined = true;
            app.globalData.loginUser.isMember = true;
            app.globalData.loginUser.province = "广东省";
            app.globalData.loginUser.city = "东莞市";
            app.hwBus.emit('init', true);
            wx.navigateTo({
              url: '../hwgame/index',
            });
          }
        },
        fail: function (msg) {
          console.log("加载失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });

    });
  },
  //领取会员卡
  getMemberCard: function (e) {
    this.setData({
      noMemberTask: false
    });
    wx.reLaunch({ 
      url: "/pages/member_card/index?jumpPage=3" 
      });//'1'返回首页，“2”返回频道页
  },
  getUserInfoBtnClick: function (e) {
    var that = this;
    that.setData({
      isShowUserInfoBtn:false
    });
    if (e.detail.errMsg == "getUserInfo:ok") {
      that.inigame();
    }
  },
  closeTask:function()
  {
    this.setData({
      noMemberTask:false
    });
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