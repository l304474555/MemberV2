// pages/applyfor/index.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      applyForType:0,//申述类型
      giftBagBtn:false,//新人礼包申述
      userMobile:'',//用户手机号码
      cityName:"",//城市名称
      channel: 1, //投放渠道
      isApplyForBtn:true,//能否提交申诉，true:能，false：不能
      isShowMsg: false,//显示弹出框，true:显示，false：不显示
      showMsg: '',//弹出框显示信息
      noMemberTask: false,
      key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP",
     
  },
  btnClick: function (event){
    console.log("当前点击按钮：" + JSON.stringify(event.currentTarget.dataset.btntype));
    var btnType = event.currentTarget.dataset.btntype;
    if (btnType=="1"){
      if (this.data.giftBagBtn){
        this.setData({
          applyForType: 0,
          giftBagBtn: false,
        });
      }else{
        this.setData({
          applyForType: 1,
          giftBagBtn: true,
        });
      }
    
    }else{
      this.setData({
        applyForType: 0,
        giftBagBtn: false,
      });
    }
  },
  beginApplyFor:function(){
    var that=this;
    if (that.data.isApplyForBtn) {
      wx.showLoading({
        title: '加载中',
      })
      that.setData({
        isApplyForBtn: false
      });
    
    if (that.data.cityName == "" || that.data.cityName==undefined){     
      wx.showModal({
        title: '申诉提示',
        content: "请选择区域"
      })
      return;
    }
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        // that.setData({
        //   isShowUserInfoBtn: true
        // });
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
          var sMsg=''
          if(res.Code=="0"){         
            sMsg = "申诉成功，新人礼包将在3分钟之内派发到您的账号中，请稍候在'我的券'页面中查看。";
          }else
          if (res.Code == "30001") {         
            sMsg = "抱歉！您的新人礼包已在" + res.Msg + "派发，请不要重复领取喔~~";
          }else
          if (res.Code == "30002") {           
            sMsg = "抱歉！您的新人礼包已在" + res.Msg + "派发，请不要重复领取喔~~";
          } else
          if (res.Code == "-1") {           
            sMsg = "抱歉！您不符合新人礼包派发条件，无法为您派发礼包喔~~";
          } else {
            sMsg = res.Msg;
          }

          if (res.Code == "301") {
            that.setData({
              noMemberTask: true
            });
          } else{
            that.setData({
              isShowMsg: true,
              showMsg: sMsg
            });
          }
         
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
   

    //获取地址栏参数
    var target = options.target;
    if (target != undefined)
    {
      if (target =='applyfor'){
        that.setData({
          applyForType:1,//申述类型
          giftBagBtn: true,//新人礼包申述
          cityName: app.currCity
        });
      }
    }else{
      var demo = new QQMapWX({
        key: that.data.key // 必填
      });
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          demo.reverseGeocoder({
            location: {
              latitude: latitude,
              longitude: longitude
            },
            success: function (res) {
              that.setData({
                cityName: res.result.address_component.city
              });
            }
          })
        }
      })

    }
  
   
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        // that.setData({
        //   isShowUserInfoBtn: true
        // });
        return;
      }

      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetCurrentUserInfo",
        biz: {
          sessionId: user.sessionId
        },
        success: function (res) {
          console.log(res)          
          var uinfo = app.globalData.currCity;
          that.setData({
            userMobile: res.Mobile,           
          });

        },
        fail: function (msg) {
          console.log("获取小程序登录用户信息失败：" + JSON.stringify(msg));
        },
        complete: function (res) { }
      })

      
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  //领取会员卡
  getMemberCard: function (e) {
    this.setData({
      noMemberTask: false
    });
    myjCommon.logFormId(e.detail.formId);
    //wx.switchTab({ url: "/pages/member_card/index" });
    wx.reLaunch({
      url: '/pages/member_card/index',
    })
  },
  JumpDW:function(){
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
  JumpIndex:function(){
    wx.reLaunch({
      url: '../yhq_index/yhq'
    })
  },
  /**关闭消息框 */
  ncloseTast: function () {
    this.setData({
      isShowMsg: false,
      showMsg: ''
    });
  },

  //关闭提示框
  closeTask: function (e) {
    myjCommon.logFormId(e.detail.formId);
    var that = this;
    that.setData({
      noMemberTask: false,
    });
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