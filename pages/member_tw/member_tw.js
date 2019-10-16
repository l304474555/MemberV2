// pages/member_tw/member_tw.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    objCom:null //详情对象
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id)
    //获取地址栏参数
    this.LoadInfoDtl(options.id)
  },
  //加载详情
  LoadInfoDtl: function (id) {
    var that = this;
    var article = '';
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMPImageContentInfo",
      biz: { Id: id },
      success: function (res) {
        console.log("详情")
        console.log(res)
        article = res.Result.Contents;
       that.setData({
          objCom: res.Result
        });
        WxParse.wxParse('article', 'html', article, that, 1);
      },
      fail: function (msg) {
        console.log("testApi失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
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
  
  },
  //跳转到对应的小程序
  locationProm: function (event) {
    //类型：1优惠券小程序；2会员小程序；4外卖小程序
    var typeid = event.currentTarget.dataset.ptype;
    console.log(typeid)
    if (typeid == 0) {
      wx.navigateToMiniProgram({
        appId: 'wx55595d5cf709ce79',
        path: 'pages/yhq_index/yhq',
        envVersion: 'release',
        success(res) {
        }
      })
    } else if (typeid == 2) {
      wx.navigateToMiniProgram({
        appId: 'wxc94d087c5890e1f8',
        path: '',
        envVersion: 'release',
        success(res) {
        }
      })
    } else if (typeid == 1) {
      wx.navigateToMiniProgram({
        appId: 'wxc670d51af76192f7',
        path: 'pages/category/category',
        envVersion: 'release',
        success(res) {
        }
      })
    }
  }
})