// pages/jiafen_memberinfo/jiafen_memberinfo.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var wxbarcode = require('../../utils/barcode_index.js');
var md5 = require('../../utils/md5.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMember:false,
    code:'',
    jfUserInfo:null,
    openAreement:'' //协议
  },
  /**获取佳纷会员信息 */
  getJFMemberInfo:function()
  {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetJFMemberInfo",
        biz: {
          sessionId: user.sessionId,
          discountType:1
        },
        success: function (res) {
          console.log(res)
          if (res.Code == "301") {
            that.setData({
              isMember:true
            });
            return;
          }
          if (res.Result != null) {
            that.setData({
              jfUserInfo: res.Result,
              openAreement: res.Result.Agreement
            });
          }
        },
        fail: function (msg) {
        
        },
        complete: function (res) {
          that.getbarcode();
        }
      });
    });
  },
  /**获取后台生成的条形码 */
  getbarcode: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      var timestamp = new Date().getTime();
      //Tool.EncryptMd5(sessionId + timeStamp+"myj_barcode_sign");
      var signstr = user.sessionId + timestamp + "myj_barcode_sign";
      var sign = md5.hexMD5(signstr);
      var storeCode='';
      if (that.data.jfUserInfo!=null)
      {
        storeCode = that.data.jfUserInfo.StoreCode;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.CreateMpBarcode",
        biz: {
          sessionId: user.sessionId,
          timeStamp: timestamp,
          sign: sign,
          cityName: app.currProvince,
          storeCode: storeCode
        },
        success: function (res) {
          if (res.Code == "0") {
            if (res.Result.barcode != "") {
              that.setData({
                code: res.Result.barCode
              });
              wxbarcode.barcode('barcode', res.Result.barCode, 640, 200);
            }

          } else if (res.Code == "301") {
            that.setData({
              isMember: true
            });
          } else {
          }

        },
        fail: function (msg) {
          console.log("CreateMpBarcode失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });
    });
  },
  /**跳到微信支付 */
  wxPay: function () {
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.MPMberPay",
      biz: {},
      success: function (res) {
        if (res.Code == "0") {
          wx.openOfflinePayView({
            'appId': res.Result.appId,
            'timeStamp': res.Result.timeStamp,
            'nonceStr': res.Result.nonceStr,
            'package': res.Result.package,
            'signType': res.Result.signType,
            'paySign': res.Result.paySign,
            'success': function (res) { },
            'fail': function (res) {
              console.log(res)
            },
            'complete': function (res) { }
          });
        }


      },
      fail: function (msg) {
        console.log("MPMberPay失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
  },
  test:function()
  {
    wx.scanCode({
      success: (res) => {
        console.log(res)
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getJFMemberInfo();
    var that = this;
    setInterval(function () {
      that.getbarcode();
    }, 60000); //循环间隔 单位ms
  },
  /**查看开通佳纷会员协议 */
  seeAgreement: function () {
    wx.navigateTo({
      url: '../jiafen_agrement/jiafen_agrement',
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