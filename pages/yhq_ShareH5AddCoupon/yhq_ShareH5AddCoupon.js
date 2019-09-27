var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    giftbagid:0,
    activityInfo:null,
    isShowUserInfoBtn:false,
    disabled:false,
    isSuccess:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var giftbagid =0;
    console.log(options.giftbagId)
    if( options.giftbagId!=undefined)
    {
      giftbagid = options.giftbagId;
      this.setData({
        giftbagid: giftbagid
      });
      this.loadActivityInfo();
    }
  },
  previewimg:function(e)
  {
    console.log(e)
    var current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current,
      urls: [current]
    })
  },
  loadActivityInfo:function()
  {
    var that=this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      wx.showLoading({
        title: '活动载入中...',
      });
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetH5GiftBagShareInfo",
      biz: {
        giftbagid: that.data.giftbagid
      }, //source:来源：1 优惠券小程序；2 会员小程序  formId:表单Id
      success: function (res) {
        console.log(res);
        if(res.Code=="0")
        {
          that.setData({
            activityInfo:res.Result
          });
         // WxParse.wxParse('rule', 'html', res.Result.ActivityRule, that, 1);
          if (res.Result!=null)
          {
            if (res.Result.ActivityRule!=null)
          {
              WxParse.wxParse('article', 'html', res.Result.ActivityRule, that, 1);
          }
          }
          
        }else
        {
          wx.showModal({
            title: '温馨提示',
            content: '没有设置H5领取活动信息',
            showCancel: 'none'
          });
        }
      },
      fail: function (msg) {
        console.log("GCChangeMPCoupon失败：" + JSON.stringify(msg));
        wx.showModal({
          title: '温馨提示',
          content: '系统异常，请稍后再来领取。',
          showCancel: false
        });
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
    });
  },
  /**领券 */
  addH5ShareCoupon:function(e)
  {
    if (this.data.activityInfo == null || this.data.activityInfo.Id<=0)
    {
      wx.showModal({
        title: '温馨提示',
        content: '没有设置H5领取活动信息',
        showCancel:'none'
      })
      return;
    }
    var mobile = e.detail.value["mobile"];
    if (mobile=='')
    {
      wx.showToast({
        title: '请输入您的手机号。',
        icon:'none'
      });
      return;
    } else if (!(/^1[3456789]\d{9}$/.test(mobile))) {
      wx.showToast({
        title: '手机号格式填写错误。',
        icon: 'none'
      });
      return;
    }

    var that=this;
    var peicount=0;
    if (that.data.activityInfo != null && that.data.activityInfo.PerPersonPerDayTotalCount!='')
    {
      peicount = that.data.activityInfo.PerPersonPerDayTotalCount;
    }
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      if (that.data.disabled)
      {
        wx.showToast({
          title: '正在领取中...请勿重复操作。',
          icon:'none'
        });
        return;
      }
        that.setData({
          disabled:true
        });
      
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.AddShareH5Coupons",
        biz: {
          giftbagid: that.data.giftbagid,
          mobile: mobile,
          isNewUser: that.data.activityInfo.IsNewUser,
          isFissionSharing: that.data.activityInfo.IsFissionSharing,
          perPersonPerDayTotalCount: peicount,
         },
        success: function (res) {
          console.log(res);
          if (res.Code == "0") {
            wx.showToast({
              title: '领取成功',
              icon:'success'
            });
            that.setData({
              isSuccess:true
            });
            that.addCouponByMobile();
          }else
          {
            wx.showToast({
              title: res.Msg,
              icon:'none'
            });
          }
        },
        fail: function (msg) {
          console.log("AddShareH5Coupons" + JSON.stringify(msg));
          wx.showModal({
            title: '温馨提示',
            content: '系统异常，请稍后再来领取。',
            showCancel: false
          });
        },
        complete: function (res) {
          that.setData({
            disabled: false
          });
        }
      });
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
    return {
      title: this.data.activityInfo.ForwardTitle,
      path: 'pages/yhq_ShareH5AddCoupon/yhq_ShareH5AddCoupon?giftbagId=' + this.data.giftbagid,
      imageUrl: this.data.activityInfo.ForwardingLink,
      desc: this.data.activityInfo.ForwardAbstract,
      success: (res) => {
      }
    }
  },
  getUserInfoBtnClick: function (e) {
    var that = this;
    if (e.detail.errMsg == "getUserInfo:ok") {
      that.loadActivityInfo();
    }
  },
  addCouponByMobile: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.DistributeCouponByMobile",
        biz: {
          sessionId: user.sessionId,
          channel: 1 //1:优惠券小程序；2：会员小程序
        },
        success: function (res) {
          console.log("根据手机号发券")
          console.log(res);
          if (res.Code == "0") {
            if (res.Result != null && res.Result.length > 0) {
              that.setData({
                addCouponByMobileCount: res.Result.length
              }, () => {
              });
            }

          } else if (res.Code == "300") {
            wx.navigateTo({
              url: '../login/login',
            });
          }
        },
        fail: function (msg) {
          console.log("根据手机号发券实际失败：" + JSON.stringify(msg));
        },
        complete: function (res) { }
      });
    });
  },
  /**关闭弹框 */
  closeTast:function()
  {
    this.setData({
      isSuccess:false
    });
  }
})