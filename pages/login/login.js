// pages/login/login.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowUserInfoBtn:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  getUserInfoBtnClick:function(e)
  {
    var that = this;
    myjCommon.logout();
    if (e.detail.errMsg == "getUserInfo:ok") {
      myjCommon.loginByUserInfo(e.detail, function (user) {
        if (!user.isLogin) {
          wx.showModal({
            title: '提示',
            content: "登录授权失败，请确保不要拒绝授权申请，再重试。",
            showCancel: false
          });
          return;
        }
        console.log("login success");
        var pages = getCurrentPages();
        console.log(pages);
        if(pages.length>1){
          var prevPage = pages[pages.length - 2]; //获取上一页的信息:订单数据
          if (prevPage.route == 'pages/member_index/member_index') {
            wx.reLaunch({
              url: '/pages/member_index/member_index',
            });
          }else
          { 
        wx.navigateBack({
          delta: 1,
          success:function(){
            console.log("login success. navigateBack success.")
          },
          fail:function(){
            console.log("login success. navigateBack fail.");
            //跳回上一页失败，直接返回首页
            wx.reLaunch({
              url: '/pages/member_index/member_index',
            });
          }
        });
          }
        }
        else{
          //只有当前页，直接返回首页
          wx.reLaunch({
            url: '/pages/member_index/member_index',
          });
        }
      });
    }
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
  
  },

  /**
   * 拒绝登录
   */
  refuseLogin() {
    wx.navigateBack();
  }
})