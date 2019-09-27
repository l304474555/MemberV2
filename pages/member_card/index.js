var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCompleted: false,
    isOpenning: false,
    isShowUserInfoBtn: false, //button组件获取用户信息
    hideCardInfo: true,
    isCodeSending: false,
    CodeBtnText: "获取验证码",
    GenderList: ['男', '女'],
    GenderIndex: 0,
    UserMobile: "",
    VerifyCode: "",
    Birthday: '',
    encryptCode: "",
    pubOpenId: "",
    ttPage: "",
    isMobileExistsModal: false,
    isUnbindOldAccount: 0,
    activityid: 0,
    shareMemberId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("会员卡onLoad");
    var jump = options.jumpPage
    this.setData({
      ttPage: jump
    });
    if (options.activityid != undefined) //九宫格活动号
    {
      this.setData({
        activityid: options.activityid
      });
    }
    if (options.shareMemberId != undefined) //九宫格分享者id
    {
      this.setData({
        shareMemberId: options.shareMemberId
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  back: function() {
    // wx.switchTab({ url: "/pages/yhq_index/yhq" });
    if (this.data.ttPage == "2") {
      wx.redirectTo({
        url: '../yhq_channel/yhq_channel',
      })
    } else if (this.data.ttPage == "3") {
      wx.redirectTo({
        url: '../r_game/r_game',
      })
    } else if (this.data.ttPage == "111") { //九宫格抽奖
      wx.redirectTo({
        url: '../yhq_ninebox/yhq_ninebox',
      })
    } else if (this.data.ttPage == "112") { //九宫格抽奖-助力
      if (this.data.activityid > 0 && this.data.shareMemberId > 0) {
        wx.redirectTo({
          url: '../yhq_squa_zl/yhq_squa_zl?activityId=' + this.data.activityid + '&shareMemberId' + this.data.shareMemberId,
        })
      } else {
        wx.redirectTo({
          url: '../yhq_ninebox/yhq_ninebox',
        })
      }
    } else {
      wx.switchTab({
        url: "/pages/yhq_index/yhq"
      });
    }
  },
  showMsg: function(msg, isBack) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success: function() {
        if (isBack) {
          //wx.switchTab({ url: '/pages/yhq_index/yhq'});
          if (this.data.ttPage == "2") {
            wx.redirectTo({
              url: '../yhq_channel/yhq_channel',
            })
          } else if (this.data.ttPage == "3") {
            wx.redirectTo({
              url: '../r_game/r_game',
            })
          } else if (this.data.ttPage == "111") { //九宫格抽奖
            wx.redirectTo({
              url: '../yhq_ninebox/yhq_ninebox',
            })
          } else if (this.data.ttPage == "112") { //九宫格抽奖-助力
            if (this.data.activityid > 0 && this.data.shareMemberId > 0) {
              wx.redirectTo({
                url: '../yhq_squa_zl/yhq_squa_zl?activityId=' + this.data.activityid + '&shareMemberId' + this.data.shareMemberId,
              })
            } else {
              wx.redirectTo({
                url: '../yhq_ninebox/yhq_ninebox',
              })
            }
          } else {
            wx.switchTab({
              url: "/pages/yhq_index/yhq"
            });
          }
        }
      }
    });
  },
  //快速开卡
  quickGetCard: function() {
    if (!wx.navigateToMiniProgram) {
      this.showMsg("当前微信版本较低，无法使用该功能，请升级到最新版本后重试。", true);
      return false;
    }
    var that = this;
    wx.showLoading({
      title: '正在载入……',
      mask: true
    });
    var cardId = myjCommon.myjConfig.cardId;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMemberCardParams",
      biz: {
        cardId: cardId,
        outer_str: "ticket_mp"
      },
      success: function(res) {
        console.log(res);
        if (res != null && res.errcode == 0) {
          //快速开卡
          var pData = myjCommon.util.getUrlParams(res.url);
          var extData = {
            encrypt_card_id: decodeURIComponent(pData.encrypt_card_id),
            outer_str: decodeURIComponent(pData.outer_str),
            biz: decodeURIComponent(pData.biz)
          };
          console.log("开卡");
          console.log(extData);
          that.data.isOpenning = true;

          wx.navigateToMiniProgram({
            appId: "wxeb490c6f9b154ef9",
            extraData: extData,
            //envVersion: "trial",
            success: function(mRes) {
              console.log("调用开卡组件成功：");
              console.log(mRes);
            },
            fail: function(err) {
              console.log("调用开卡组件错误：");
              console.log(err);
            }
          });
        } else {
          wx.hideLoading();
          that.showMsg("服务器繁忙，请一会再试。", true);
        }
      },
      fail: function(msg) {
        console.log("testApi失败：" + JSON.stringify(msg));
        that.showMsg("网络异常，请检查您的网络后重试。", true);
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },
  addWxMemberCard: function(sessionId) {
    var that = this;
    wx.showLoading({
      title: '正在载入……',
      mask: true
    });
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMemberCardExt",
      biz: {},
      success: function(res) {
        console.log(res);
        if (res != null) {
          //that.back();
          //领取会员卡
          var cardId = myjCommon.myjConfig.cardId;
          that.data.isOpenning = true;
          var cardList = [{
            cardId: cardId,
            cardExt: JSON.stringify(res)
          }];
          wx.addCard({
            cardList: cardList, // 需要添加的卡券列表
            success: function(res) {
              console.log(res);
              //var cardList = res.cardList; // 添加的卡券列表信息
            },
            fail: function(res) {
              console.log(res);
              //that.showMsg("启动会员卡失败", true);
            },
            complete: function() {
              //that.back();
            }
          });

          //wx.reLaunch({ url: "/pages/yhq_index/yhq" });
        } else {
          wx.hideLoading();
          that.showMsg("服务器繁忙，请一会再试。", true);
        }
      },
      fail: function(msg) {
        console.log("testApi失败：" + JSON.stringify(msg));
        that.showMsg("网络异常，请检查您的网络后重试。", true);
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },
  openUserWxMemberCard: function(sessionId) {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetUserWxMemberCard",
      biz: {
        sessionId: sessionId
      },
      success: function(res) {
        console.log(res);
        if (res.Code == "0") {
          that.data.isOpenning = true;
          wx.openCard({
            cardList: [{
              cardId: myjCommon.myjConfig.cardId,
              code: res.Result
            }],
            success: function(res) {
              console.log(res);

              //wx.reLaunch({ url: "/pages/yhq_index/yhq" });
            },
            fail: function(msg) {
              console.log(msg);
              that.showMsg("查看会员卡失败。", true);
            },
            complete: function() {
              //that.back();
            }
          });

        } else if (res.Code == "-100" || res.Code == "4014") {
          //已领卡但未获得开卡资料
          that.initBirthday();
          that.setData({
            hideCardInfo: false
          });
        } else {
          //that.addWxMemberCard(sessionId);
          that.quickGetCard();
        }
      },
      fail: function(msg) {
        console.log("GetUserWxMemberCard失败：" + JSON.stringify(msg));
        that.showMsg("网络异常，请检查您的网络后重试。", true);
      },
      complete: function(res) {

        wx.hideLoading();
      }
    });
  },
  toWxMemberCard: function() {
    //this.quickGetCard();
    //return;
    var that = this;
    wx.showLoading({
      title: '正在载入……',
      mask: true
    });
    myjCommon.getLoginUser(function(user) {
      //console.log("测试登录信息", user);
      if (user.isLogin) {
        that.openUserWxMemberCard(user.sessionId);
      } else {
        wx.hideLoading();
        that.setData({
          isShowUserInfoBtn: true
        });
        //that.quickGetCard();
      }
    }, true);

  },
  getUserInfoBtnClick: function(e) {
    console.log(e);
    if (e.detail.errMsg == "getUserInfo:ok") {
      this.setData({
        isShowUserInfoBtn: false
      });
      this.toWxMemberCard();
    }
  },
  mobileInput: function(e) {
    this.setData({
      UserMobile: e.detail.value
    });
  },
  bindVerifyCodeInput: function(e) {
    this.setData({
      VerifyCode: e.detail.value
    });
  },
  bindGenderChange: function(e) {
    this.setData({
      GenderIndex: e.detail.value
    });
  },
  bindBirthdayChange: function(e) {
    this.setData({
      Birthday: e.detail.value
    });
  },
  initBirthday: function() {
    var d = new Date();
    var str = d.getFullYear().toString() + '-' + (d.getMonth() + 1).toString() + "-" + d.getDate();
    this.setData({
      Birthday: str
    });
  },
  setValifyCodeSending: function() {
    var s = 60;
    var that = this;
    var setSendingData = function() {
      that.setData({
        isCodeSending: true,
        CodeBtnText: s.toString() + "秒后重新获取",
      });
      s--;

      if (s > 0) {
        setTimeout(function() {
          setSendingData();
        }, 1000);
      } else {
        that.setData({
          isCodeSending: false,
          CodeBtnText: "获取验证码",
        });
      }

    };
    setSendingData();
  },
  getMobileVerifyCode: function() {
    if (this.data.isCodeSending) {
      return false;
    }
    if (!/^1\d{10}$/.test(this.data.UserMobile)) {
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
      biz: {
        mobile: this.data.UserMobile,
        supplyType: "A",
        codeType: 1
      },
      success: function(res) {
        wx.hideLoading();
        /*wx.showToast({
          title: res.Msg,
          icon: 'success',
          duration: 2000
        });*/
      },
      fail: function(msg) {
        wx.hideLoading();
        console.log("调用api失败" + JSON.stringify(msg));
        //that.showMsg("发送失败，请一会重试。");
      },
    });
  },
  unbindOldAccount: function(e) {
    this.setData({
      isMobileExistsModal: false,
      isUnbindOldAccount: 1
    });
    this.submitOpenCardData(e);
  },
  cancelSubmit: function(e) {
    this.setData({
      isMobileExistsModal: false,
      isUnbindOldAccount: 0,
      UserMobile: "",
      VerifyCode: ""
    });
  },
  submitOpenCardData: function(e) {
    if (!this.checkCardData()) {
      return false;
    }
    //激活会员
    wx.showLoading({
      title: '正在激活您的会员卡……',
      mask: true
    });
    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.showMsg("登录授权失败，请一会重试。");
        wx.hideLoading();
        return false;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.ActivateCurrentMemberCard",
        biz: {
          sessionId: user.sessionId,
          mobile: that.data.UserMobile,
          verifyCode: that.data.VerifyCode,
          gender: that.data.GenderList[that.data.GenderIndex],
          birthday: that.data.Birthday,
          unbind: that.data.isUnbindOldAccount
        },
        success: function(res) {
          wx.hideLoading();
          if (res.Code == "0") {
            wx.showModal({
              title: '激活成功',
              content: "会员卡激活成功。",
              showCancel: false,
              success: function() {
                wx.reLaunch({
                  url: '/pages/member_card/index'
                });
              }
            });
          } else if (res.Code == "305") {
            //手机号已经存在
            that.setData({
              isMobileExistsModal: true,
              isUnbindOldAccount: 0,
            });
          } else {
            wx.showModal({
              title: '激活失败',
              content: res.Msg,
              showCancel: false,
              success: function() {}
            });
          }
        },
        fail: function(msg) {
          wx.hideLoading();
          console.log("激活失败：" + JSON.stringify(msg));
          wx.showModal({
            title: '激活失败',
            content: "网络异常，请检查您的网络后重试。",
            showCancel: false,
            success: function() {}
          });
        },
      });
    }, true);
  },
  checkCardData: function() {
    if (!/^1\d{10}$/.test(this.data.UserMobile)) {
      this.showMsg("请输入正确的手机号。");
      return false;
    }
    if (!/^\d{4}$/.test(this.data.VerifyCode)) {
      this.showMsg("请输入正确的验证码。");
      return false;
    }
    return true;
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log("会员卡onShow");
    if (this.data.isOpenning) {
      this.data.isOpenning = false;
      this.back();
    } else {
      this.toWxMemberCard();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})