// pages/member_bill_detail.js/member_bill_detail.js.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeName:'',
    searchnMonth:'',
    billDtlInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.uid != undefined) {
      console.log(options)
      this.loadBiiDtlByUid(options.uid, options.YearandMonth);
    }
    if (options.storename!=undefined)
    {
      this.setData({
        storeName: options.storename,
      });
    }
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //获取上一页信息
    prevPage.setData({
      isreturn:true
    });
    
  },
  loadBiiDtlByUid: function (uid, yearandMonth) {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      wx.showLoading({
        title: '数据载入中...',
      });
      console.log(uid)
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetMemberBillDtlByNo",
        biz: {
          uuid: uid,
          orderYMonth: yearandMonth,
          provinceName: app.currProvince
        },
        success: function (res) {
          console.log("明细")
          console.log(res)
          if(res.Result!=null)
          {
            that.setData({
              billDtlInfo: res.Result
            });
          }
        },
        fail: function (msg) {
          console.log("调用GetMemberBillDtlByNo接口失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });
    });
  },
  returnlist:function()
  {
    wx.navigateBack({
      url: '../member_mainbill/member_mainbill',
    });

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