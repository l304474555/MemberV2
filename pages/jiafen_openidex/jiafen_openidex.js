// pages/jiafen_openidex/jiafen_openidex.js
var wxbarcode = require('../../utils/barcode_index.js');
var md5 = require('../../utils/md5.js');
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMember: false,//成为会员提示框
    storenotopen:false,//门店未开通佳纷会员业务提示框
    notchoosemembertype:false, //未选择佳纷会员类型提示框
    jiafenInfo:null, //佳纷活动信息
    jiafenCardtypes:[],
    code:"",
    chooseitem:null,
    openAreement:'', //开通协议
    payCodeTask:false ,
    nochooseCardtype:false,
    companyCode:'',
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP",
    tonewjfmembercoupons:false//是否给新注册的佳纷会员发券了
  },
  /**获取开通佳纷会员活动信息 */
  getJiafenopeninfo:function()
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
        interfaceCode: "WxMiniProgram.Service.GetJiafenActityInfo",
        biz: {
          provinceName: app.currProvince
        },
        success: function (res) {
          if(res.Result!=null)
          {
            that.setData({
              jiafenInfo: res.Result,
              openAreement:res.Result.Agreement,
              companyCode: res.Result.CompanyCode
            });
            if (res.Result.JFCardTypeList.length>0)
            {
              that.setData({
                jiafenCardtypes: res.Result.JFCardTypeList
              });
            }
          }
        
        },
        fail: function (msg) {
          console.log("GetJiafenActityInfo失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  /**获得支付条形码 */
  createPaybarcode: function (cardType, cardName, price)
  {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      var timestamp = new Date().getTime();
      var signstr = user.sessionId + timestamp + "myj_jiafen_barcode_sign";
      var sign = md5.hexMD5(signstr);  
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.JiafenCreateMpBarcode",
        biz: {
          sessionId:user.sessionId,
          timeStamp:timestamp,
          sign:sign,
          cardType:cardType,
          cardName:cardName,
          price:price,
          companyCode: that.data.companyCode
        },
        success: function (res) {
          if (res.Code == "0") {
            if (res.Result.barcode != "") {
              that.setData({
                code: res.Result.BarCode
              });
              wxbarcode.barcode('barcode', res.Result.BarCode, 640, 250);
              //弹出条形码支付
              that.setData({
                payCodeTask: true,
                nochooseCardtype: false
              });
            }

          } else if (res.Code == "301") {
            that.setData({
              isMember: true
            });
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
            return;
          } else {
            //that.getbarcode();
          }
        },
        fail: function (msg) {
          console.log("JiafenCreateMpBarcode失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  /**选择会员卡类型 */
  chooseCardtype:function(e)
  { 
    let chooseItem = e.currentTarget.dataset.item;
    this.setData({
      chooseitem: chooseItem
    });
  },
  /**查看开通佳纷会员协议 */
  seeAgreement:function()
  {
    wx.navigateTo({
      url: '../jiafen_agrement/jiafen_agrement',
    });
  },
  /**开通佳纷会员 */
  openJfMember:function()
  {
    if (this.data.chooseitem==null)
    {
      this.setData({
        nochooseCardtype:true
      });
    }else
    {
      if (this.data.chooseitem == null || this.data.chooseitem.Id <= 0 || this.data.chooseitem.CardName == '' || this.data.chooseitem.Price<=0)
      {
        wx.showModal({
          title: '温馨提示',
          content: '生成条码失败。请检查是否已勾选会员卡类型。',
        });
        this.setData({
          payCodeTask: false
        });
        return;
      }else
      {
      this.createPaybarcode(this.data.chooseitem.Id, this.data.chooseitem.CardName, this.data.chooseitem.Price);
       // this.toNewJfMemberAddCoupons();
      }
    }
  },
  /**关闭选择佳纷类型卡弹框 */
  ncloseTast:function()
  {
    this.setData({
      nochooseCardtype: false,
      payCodeTask:false,
      tonewjfmembercoupons:false
    });
  },
  /**回到个人中心页 */
  returnCenter:function()
  {
    this.setData({
      payCodeTask: false,
      nochooseCardtype: false
    });
    wx.reLaunch({
      url: '../member_center/member_center',
    });
  },
  /**打开支付页 */
  openWXPay:function()
  {
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.MPMberPay",
      biz: {
      },
      success: function (res) {
        if (res.Code == "0") {
          wx.openOfflinePayView({
            'appId': res.Result.appId,
            'timeStamp': res.Result.timeStamp,
            'nonceStr': res.Result.nonceStr,
            'package': res.Result.package,
            'signType': res.Result.signType,
            'paySign': res.Result.paySign,
            'success': function (res) { 
              wx.reLaunch({
                url: '../member_center/member_center',
              });
            },
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var that=this;
    // setInterval(function () {
    //   if (that.data.chooseitem == null || that.data.chooseitem.Id <= 0 || that.data.chooseitem.CardName == '' || that.data.chooseitem.Price <= 0) {
    //     wx.showModal({
    //       title: '温馨提示',
    //       content: '生成条码失败。请检查是否已勾选会员卡类型。',
    //     });
    //     that.setData({
    //       payCodeTask: false
    //     });
    //     return;
    //   } else {
    //     that.createPaybarcode(that.data.chooseitem.Id, that.data.chooseitem.CardName, that.data.chooseitem.Price);
    //   }
    // }, 60000); //循环间隔 单位ms
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
    this.setData({
      payCodeTask:false
    });
    this.getlocation();
  },
  getlocation: function () {
    var that = this;
    //改版 积分换券列表
    if (app.currCity != undefined) {
      that.getJiafenopeninfo();
    } else {
      var demo = new QQMapWX({
        key: that.data.key // 必填
      });
      //定位
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          let latitude = res.latitude;
          let longitude = res.longitude;
          demo.reverseGeocoder({
            location: {
              latitude: latitude,
              longitude: longitude
            },
            success: function (res) {
              app.currCity = res.result.address_component.city;
              app.currProvince = res.result.address_component.province;
              that.getJiafenopeninfo();
            },
            fail: function (res) {
              wx.showToast({
                title: '即将进入城市选择，请稍候...',
                icon: 'none',
                duration: 2000,
                success: function () {
                  setTimeout(function () {
                    wx.navigateTo({
                      url: '/pages/yhq_dw/yhq_dw?target="jiafen"'
                    });
                  }, 1500); //延迟时间 这里是1.5秒  

                }
              });
            },
            complete: function (res) { }
          });

        }, fail: function () {
          wx.showToast({
            title: '即将进入城市选择，请稍候...',
            icon: 'none',
            duration: 2000,
            success: function () {
              setTimeout(function () {
                wx.navigateTo({
                  url: '../yhq_dw/yhq_dw'
                });
              }, 1500); //延迟时间 这里是1.5秒  

            }
          });
        }
      });
    }
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
  closeTask:function()
  {
    this.setData({
      isMember:false
    });
  },
  //成为会员
  BecomeMember: function () {
    this.setData({
      isMember: false
    });
    wx.reLaunch({ url: "/pages/member_card/index" });
  },
  /**给新注册的佳纷会员发券 */
  toNewJfMemberAddCoupons:function()
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
        interfaceCode: "WxMiniProgram.Service.AddCouponsToNewJFMember",
        biz: {
          sessionId: user.sessionId,
          channel: 1
        },
        success: function (res) {
          console.log("给新注册佳纷会员发券")
          console.log(res)
         if(res.Code=="0")
         {
           that.setData({
             tonewjfmembercoupons:true
           });
         }
        },
        fail: function (msg) {
          console.log("AddCouponsToNewJFMember失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          that.setData({
            noMemberTask:false
          });
        }
      });
    });
  }

})