// pages/member_barcode/member_barcode.js
var wxbarcode = require('../../utils/barcode_index.js');
var md5 = require('../../utils/md5.js');
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: '',
    uCnt: 0, //当前用户积分
    isShowUserInfoBtn: false,
    isMember: false,
    memberDicountInfo: null, //会员满减信息
    intervalId: 0,
    isShow: false,
    isCodeError: false,
    isSelectCity:false,
    isShowMjCount:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var that = this;
    // that.data.isShow = true;
    // that.getbarcode();
    // if (that.data.intervalId < 1) {
    //   console.log("启动interval:", that.data.intervalId);
    //   that.data.intervalId = setInterval(function () {
    //     console.log("interval执行，id:", that.data.intervalId, "isShow:", that.data.isShow)
    //     if (that.data.isShow) {
    //       that.getbarcode();
    //     }
    //   }, 60000); //循环间隔 单位ms
    // }

    // /**获取会员满减优惠次数信息 */
    // var provinceName = app.currProvince;
    // if (!provinceName)
    // {
    //   provinceName='广东省';
    // }else
    // {
    //   if (provinceName != '' && provinceName == '广东省') {
    //     that.getMemberDiscountCnt();
    //   }
    // }
    
  },
  loadBarcodeInfo:function()
  {
    var that = this;
    that.data.isShow = true;
    that.getbarcode();
    setTimeout(()=>{
      that.getbarcode();
    },2000)
    if (that.data.intervalId < 1) {
      console.log("启动interval:", that.data.intervalId);
      that.data.intervalId = setInterval(function () {
        console.log("interval执行，id:", that.data.intervalId, "isShow:", that.data.isShow)
        if (that.data.isShow) {
          that.getbarcode();
        }
      }, 60000); //循环间隔 单位ms
    }

    /**获取会员满减优惠次数信息 */
    var provinceName = app.currProvince;
    if (!provinceName) {
      provinceName = '广东省';
    } else {
      if (provinceName != '' && provinceName == '广东省') {
        that.getMemberDiscountCnt();
      }
    }

  },
  /**生成随机数 */
  RndNum: function (n) {
    var rnd = "";
    for (var i = 0; i < n; i++)
      rnd += Math.floor(Math.random() * 10);
    return rnd;
  },

  /**获取后台生成的条形码 */
  getbarcode: function () {
    var that = this;
    var provinceName = app.currProvince;
    if (!provinceName)
    {
      provinceName='广东省';
    }
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true,
          isCodeError: true
        });
        return;
      }
      if(that.data.code=='')
      {
      wx.showLoading({
        title: '条码加载中...',
      });
      }
      var timestamp = new Date().getTime();
      //Tool.EncryptMd5(sessionId + timeStamp+"myj_barcode_sign");
      var signstr = user.sessionId + timestamp + "myj_barcode_sign";
      var sign = md5.hexMD5(signstr);
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.CreateMpBarcode",
        biz: {
          sessionId: user.sessionId,
          timeStamp: timestamp,
          sign: sign,
          cityName: provinceName,
          storeCode: ""
        },
        success: function (res) {
          console.log("生成条码结果")
          console.log(res)
          if (res.Code == "0") {
            if (res.Result.barcode != "") {
              that.setData({
                code: res.Result.barCode,
                isCodeError: false
              });
              wx.nextTick(() => {
              wxbarcode.barcode('barcode', res.Result.barCode, 640, 250, function (isSuccess, err) {
                if (!isSuccess) {
                 // setTimeout(function () {
                    console.log("条码绘制失败，重新绘制");
                    wxbarcode.barcode('barcode', res.Result.barCode, 640, 250, function () {
                      that.setData({
                        isCodeError: true
                      });
                    });

                 // }, 50);
                }
              });
              });
              console.log("生成条码：", res.Result.barCode);
            }else{
              wx.showModal({
                title: '温馨提示',
                content: '获取条码失败，请稍后再试',
              });
            }
            

          } else if (res.Code == "301") {
            that.setData({
              isMember: true,
              isCodeError: true,
              noMemberTask:true
            });
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
          } else {
            that.setData({
              isCodeError: true
            });
          }

        },
        fail: function (msg) {
          that.setData({
            isCodeError: true
          });
          console.log("CreateMpBarcode失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });
    });
  },
  getUserInfoBtnClick: function (e) {
    this.setData({
      isShowUserInfoBtn: false
    });
    if (e.detail.errMsg == "getUserInfo:ok") {
      this.getbarcode();
    }
  },
  //成为会员
  BecomeMember: function () {
    this.setData({
      isMember: false
    });
    wx.reLaunch({
      url: "/pages/member_card/index"
    });
  },
  closeTask: function () {
    this.setData({
      isMember: false
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.loadBarcodeInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.data.isShow = true;
    console.log("onShow ", this.data.isShow);
    //用户积分
    this.setData({
      uCnt: app.globalData.currJifen
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.data.isShow = false;
    console.log("onHide ", this.data.isShow);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.intervalId);
    console.log("onUnload：移除interval ", this.data.intervalId)
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
  /**跳到微信支付 */
  url_wxpay: function () {
    app.requestSubscribeMessage("Pay_success", function () {
      app.toWxPay()
    })
  },
  /**获取会员满减次数信息 */
  /**黎梅芳 20190606 */
  getMemberDiscountCnt: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      var provinceName = app.currProvince;
      if (!provinceName) {
        provinceName = '广东省';
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetMemberDiscountCnt",
        biz: {
          sessionId: user.sessionId,
          provinceName: provinceName,
        },
        success: function (res) {
          console.log(res)
          if (res.Code == "0") {
            if (res.Result != null) {
              that.setData({
                memberDicountInfo: res.Result,
                isShowMjCount:true
              });
            }
          } else if (res.Code == "301") {
            that.setData({
              isMember: true,
              noMemberTask: true
            });
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
          } else { }

        },
        fail: function (msg) {
          console.log("GetMemberDiscountCnt" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });
    });
  },
  /**创建人:黎梅芳 */
  /**创建日期：20190424 */
  /**描述：注册会员 */
  regesterByMobile: function (e) {
    var that = this;
    if (e.detail.errMsg != 'getPhoneNumber:ok') {
      that.setData({
        isMember: false
      });
      return;
    }
    wx.login({
      success: res => {
        myjCommon.getLoginUser(
          function (user) {
            if (!user.isLogin) {
              that.setData({
                isShowUserInfoBtn: true
              });
              return false;
            }
            myjCommon.callApi({
              interfaceCode: "WxMiniProgram.Service.RegesMeberByMobile",
              biz: {
                appId: "wxc94d087c5890e1f8",
                authCode: res.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                targetCode: "member_card",
                sessionId: user.sessionId,
                sourceCode: "wxuid"
              },
              success: function (res) {
                if (res.IsSuccess) {
                  that.getbarcode();
                  wx.showModal({
                    title: '温馨提示',
                    content: '注册成功！',
                    showCancel: false
                  });
                }
                else {
                  wx.showModal({
                    title: '温馨提示',
                    content: res.ErrorMsg,
                    showCancel: false
                  });
                }

              }, fail: function (msg) {
                that.setData({
                  noMemberTask: false
                });
                console.log("解密微信数据失败：" + JSON.stringify(msg));
              },
              complete: function (res) {
              }
            });
          });
      }, fail: function (msg) {
        that.setData({
          noMemberTask: false
        });

      }, complete: function () {
        that.setData({
          noMemberTask: false
        });
      }
    })

  },
  closeModel: function () {
    this.setData({
      noMemberTask: false
    });
  },
  closeTast:function()
  {
    this.setData({
      isShowMjCount:false
    });
  }
})