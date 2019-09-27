// pages/member_card/activate.js
var myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideCardInfo:true,
    isCodeSending: false,
    CodeBtnText: "获取验证码",
    GenderList: ['男', '女'],
    GenderIndex: 0,
    UserMobile:"",
    VerifyCode: "",
    Birthday: '',
    encryptCode: "",
    pubOpenId: ""
  },
  showMsg: function (msg) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success: function () {
        
      }
    });
  },
  mobileInput:function(e){
    this.setData({
      UserMobile: e.detail.value
    });
  },
  bindVerifyCodeInput:function(e){
    this.setData({
      VerifyCode: e.detail.value
    });
  }, 
  bindGenderChange:function(e){
    this.setData({
      GenderIndex: e.detail.value
    });
  },
  bindBirthdayChange:function(e){
    this.setData({
      Birthday: e.detail.value
    });
  },
  initBirthday:function(){
    var d = new Date();
    var str = d.getFullYear().toString() + '-' + (d.getMonth() + 1).toString() + "-" + d.getDate();
    this.setData({
      Birthday: str
    });
  },
  setValifyCodeSending:function(){
    var s = 60;
    var that = this;
    var setSendingData = function(){
      that.setData({
        isCodeSending: true,
        CodeBtnText: s.toString() + "秒后重新获取",
      });
      s--;

      if(s>0){
        setTimeout(function () {
          setSendingData();
        }, 1000);
      }
      else{
        that.setData({
          isCodeSending: false,
          CodeBtnText: "获取验证码",
        });
      }

    };
    setSendingData();
  },
  getMobileVerifyCode:function(){
    if (this.data.isCodeSending){
      return false;
    }
    if(!/^1\d{10}$/.test(this.data.UserMobile)){
      this.showMsg("请输入正确的手机号。");
      return;
    }
    wx.showLoading({
      title: '正在获取验证码……',
      mask: true
    });
    this.setValifyCodeSending();
    var that = this;
    myjCommon.callApi({
      interfaceCode: "ConsumerApp.Service.SendMobileValidateMessage",
      biz: { mobile: this.data.UserMobile, supplyType: "A", codeType: 1 },
      success: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: res.Msg,
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (msg) {
        wx.hideLoading();
        console.log("调用api失败" + JSON.stringify(msg));
        that.showMsg("发送失败，请一会重试。");
      },
    });
  },
  submitOpenCardData: function(e){
    if (!this.checkCardData()){
      return false;
    }
    //激活会员
    wx.showLoading({
      title: '正在激活您的会员卡……',
      mask: true
    });
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.ActivateMemberCardWithCardData",
      biz: { 
        cardId: myjCommon.myjConfig.cardId, 
        encryptCode: this.data.encryptCode, 
        pubOpenId: this.data.pubOpenId,
        mobile: this.data.UserMobile,
        verifyCode: this.data.VerifyCode,
        gender: this.data.GenderList[this.data.GenderIndex],
        birthday: this.data.Birthday
      },
      success: function (res) {
        wx.hideLoading();
        if(res.Code == "0"){
          wx.showModal({
            title: '激活成功',
            content: "会员卡激活成功。",
            showCancel: false,
            success: function () {
              wx.reLaunch({
                url: '/pages/yhq_index/yhq'
              });
            }
          });
        }
        else{
          wx.showModal({
            title: '激活失败',
            content: res.Msg,
            showCancel: false,
            success: function () {
            }
          });
        }
      },
      fail: function (msg) {
        wx.hideLoading();
        console.log("激活失败：" + JSON.stringify(msg));
        wx.showModal({
          title: '激活失败',
          content: "网络异常，请检查您的网络后重试。",
          showCancel: false,
          success: function () {
          }
        });
      },
    });
  },
  checkCardData:function(){
    if (!/^1\d{10}$/.test(this.data.UserMobile)) {
      this.showMsg("请输入正确的手机号。");
      return false;
    }
    if (!/^\d{4}$/.test(this.data.VerifyCode)){
      this.showMsg("请输入正确的验证码。");
      return false;
    }
    return true;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initBirthday();
    console.log("会员激活 onLoad");
    console.log(options);
    //模拟数据
    /*
    options = options || {};
    options.card_id = myjCommon.myjConfig.cardId;
    options.encrypt_code = "nzUh3ztvaPP8N4pVwmFQSyGZEWfqwKMAsCkkrweYXPA=";
    options.openid = "ojs3_tj7X_TZjeVg48ivf2BKJokQ";
    */
    if (options && options.card_id == myjCommon.myjConfig.cardId){
      //激活会员
      wx.showLoading({
        title: '正在激活您的会员卡……',
        mask: true
      });
      var that = this;
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.ActivateMemberCardWithCode",
        biz: { 
          cardId: options.card_id, 
          encryptCode: options.encrypt_code,
          pubOpenId: options.openid
        },
        success: function (res) {
          console.log(res);
          if (res.Code == "0") {
            wx.showModal({
              title: '激活成功',
              content: "会员卡激活成功。",
              showCancel: false,
              success:function(){
                wx.reLaunch({
                  url: '/pages/yhq_index/yhq'
                });
              }
            });
          }
          
          else if (res.Code == "-100" || res.Code == "4014"){
            //未获取到开卡信息
            that.setData({
              hideCardInfo:false,
              encryptCode: options.encrypt_code,
              pubOpenId: options.openid
            });
          }
          
          else {
            wx.showModal({
              title: '激活失败',
              content: "会员卡激活失败，请一会重试。",
              showCancel: false,
              success: function () {
                wx.reLaunch({
                  url: '/pages/member_card/index'
                });
              }
            });
          }
        },
        fail: function (msg) {
          console.log("激活失败：" + JSON.stringify(msg));
          wx.showModal({
            title: '激活失败',
            content: "网络异常，请检查您的网络后重试。",
            showCancel: false,
            success: function () {
              wx.reLaunch({
                url: '/pages/member_card/index'
              });
            }
          });
        },
        complete: function (res) {
          wx.hideLoading();
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
  
  }
})