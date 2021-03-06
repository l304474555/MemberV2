// pages/applyfor/index.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyForType: 0,//申述类型
    giftBagBtn: false,//新人礼包申述
    userMobile: '',//用户手机号码
    isShowUserInfoBtn: false, //button组件获取用户信息
    cityName: "",//城市名称
    channel: 1, //投放渠道
    isApplyForBtn: true,//能否提交申诉，true:能，false：不能
    isShowMsg: false,//显示弹出框，true:显示，false：不显示
    showMsg: '',//弹出框显示信息
  },
  btnClick: function (event) {
    console.log("当前点击按钮：" + JSON.stringify(event.currentTarget.dataset.btntype));
    var btnType = event.currentTarget.dataset.btntype;
    if (btnType == "1") {
      if (this.data.giftBagBtn) {
        this.setData({
          applyForType: 0,
          giftBagBtn: false,
        });
      } else {
        this.setData({
          applyForType: 1,
          giftBagBtn: true,
        });
      }

    } else {
      this.setData({
        applyForType: 0,
        giftBagBtn: false,
      });
    }
  },
  beginApplyFor: function () {
    var that = this;
    if (that.data.isApplyForBtn) {
      wx.showLoading({
        title: '加载中',
      })
      that.setData({
        isApplyForBtn: false
      });

      if (that.data.cityName == "" || that.data.cityName == undefined) {
        wx.showModal({
          title: '申诉提示',
          content: "请选择区域"
        })
        return;
      }
      myjCommon.getLoginUser(function (user) {
        if (!user.isLogin) {
          that.setData({
            isShowUserInfoBtn: true
          });
          return;
        }
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.ApplyForGiftBag",
          biz: {
            sessionId: user.sessionId,
            channel: that.data.channel,
            cityName: that.data.cityName
          },
          success: function (res) {
            console.log(res)
            var sMsg = ''
            if (res.Code == "0") {
              sMsg = "申诉成功，新人礼包将在3分钟之内派发到您的账号中，请稍候在'我的券'页面中查看。";
            } else
              if (res.Code == "30001") {
                sMsg = "抱歉！您的新人礼包已在" + res.Msg + "派发，请不要重复领取喔~~";
              } else
                if (res.Code == "30002") {
                  sMsg = "抱歉！您的新人礼包已在" + res.Msg + "派发，请不要重复领取喔~~";
                } else
                  if (res.Code == "-1") {
                    sMsg = "抱歉！您不符合新人礼包派发条件，无法为您派发礼包喔~~";
                  } else {
                    sMsg = res.Msg;
                  }
            that.setData({
              isShowMsg: true,
              showMsg: sMsg
            });
          },
          fail: function (msg) {
            console.log("礼包申诉失败：" + JSON.stringify(msg));
          },
          complete: function (res) {
            console.log("礼包申诉执行了");
            that.setData({
              isApplyForBtn: true
            });
            wx.hideLoading();
          }
        })
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.GetMember();
    //获取地址栏参数
    var target = options.target;
    if (target != undefined) {
      if (target == 'applyfor') {
        that.setData({
          applyForType: 1,//申述类型
          giftBagBtn: true,//新人礼包申述
        });
      }
    }


    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }

      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetCurrentUserInfo",
        biz: {
          sessionId: user.sessionId
        },
        success: function (res) {
          console.log(res)
          var uinfo = app.globalData.loginUser;
          that.setData({
            userMobile: res.Mobile,
            cityName: app.currCity
          });

        },
        fail: function (msg) {
          console.log("获取小程序登录用户信息失败：" + JSON.stringify(msg));
        },
        complete: function (res) { }
      })


    });
  },

  GetMember: function () {///判断是否是会员
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        /* wx.showModal({
           title: '提示',
           content: "登录失败，请稍后重试。",
           showCancel: false
         });*/
        wx.hideLoading();
        return false;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.IsMember",
        biz: { sessionId: user.sessionId },
        success: function (res) {
          console.log(res)         
          if (res.Code == "301") {
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(true, "wxc94d087c5890e1f8", "member_card");
            return;
          }
        },
        fail: function (msg) {
          console.log("调用IsMember失败" + JSON.stringify(msg));
        },
        complete: function (res) {

        }
      });
    })
  },
  /**关闭消息框 */
  ncloseTast: function () {
    this.setData({
      isShowMsg: false,
      showMsg: ''
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  JumpDW: function () {
    wx.navigateTo({
      url: '../yhq_dw/yhq_dw?target=applyfor'
    })
  },
  getUserInfoBtnClick: function (e) {
    var that = this;
    if (e.detail.errMsg == "getUserInfo:ok") {
      //that.getUserLocationInfo();
      wx.navigateTo({
        url: '../yhq_index/yhq'
      })
    }
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