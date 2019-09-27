// pages/recode_index/recode_index.js
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
var myjCommon = require("../../utils/myjcommon.js");
var Mcaptcha  = require("../../utils/mcaptcha.js");
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
    reCode:'',
    isShowUserInfoBtn: false, //button组件获取用户信息
    urlReCode:'',//地址栏传进来的兑换码
    urlSign: '',//地址栏传进来的验签
    isUrl:0,//地址安全验证
    isClickCount:0, //兑换码验证不通过次数
    isShowGetCardInfo: false,//是否提示领取会员卡
    isShowClickImgCode:false,//是否进行图片验证码验证
    cvs: {
      width: 50,
      height: 35
    },//图片验证码的高宽
    imgCode:'',
    imgCodeInput:'',
    isShowUserCardInfo:false,//券信息弹出框
    isShowCardInfo: false,//券信息显示
    isGetCardInfo: false,//领取到券的弹出框
    isSending: false,
    cPrice:'',
   /* counpInfo: {
      CardImage: 'https://mimage.myj.com.cn/MicroMallFileServer/Files//Coupon//201806//ef8f1a631bc75de6.jpg',
      CardName: '四洲紫菜(番茄味6小包)4.5g（1包）',
      SDescription: '原价6元',
      SBeginTime: '2018.06.21',
      SEndTime: '06.21',
      MDescription: '会员价3元',
      },*/
    counpInfo: {},
    isClickStatus:true,
    Remark:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    var scene = decodeURIComponent(options.scene)
    if (scene != "undefined") {
       /*wx.showModal({
        title: '提示',
        content: scene,
        showCancel: false
      });*/
      var strs = scene.split("&");
      if (strs.length < 2) {
      /*  wx.showToast({
          title: '验签失败' + scene,
          icon: 'none',
          duration: 2000
        }),*/
          this.setData({
            isUrl: 1
          }); 
      }else{      
        
        var urecode = strs[0].split("=")[1];
        var usign = strs[1].split("=")[1];
        if (urecode != undefined && usign != undefined) {
          this.setData({

            reCode: urecode,
            urlSign: usign,
            isUrl: 1

          });

          console.log("温馨提示：有值")
        }
      }   

    }else{


      var urecode = options.c;
      var usign = options.s;
      if (urecode != undefined && usign != undefined) {
        this.setData({
          reCode: urecode,
          urlSign: usign,
          isUrl: 1
        }); 
      }else {
        this.setData({
          isUrl: 0
        }); 
      }

    }  


    if (this.data.isUrl == 1) {
      console.log("res");

      //验证安全链接
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.CheckReCodeSign",
        biz: { recode: this.data.reCode,sign: this.data.urlSign },
        success: function (res) {
          console.log("CheckReCodeSign:" + JSON.stringify(res))
          if (res.code == "1") {
            //验签失败

           /* wx.showToast({
              title: '验签失败',
              icon: 'none',
              duration: 2000
            })*/

          } else {
           /* wx.showToast({
              title: '验签成功',
              icon: 'none',
              duration: 2000
            }) */
      
          }
        },
        fail: function (msg) {
          console.log("出现异常：" + JSON.stringify(msg));

        },
        complete: function (res) {


        }
      });

    } 
    console.log("温馨提示：有值:" + this.data.isUrl)
},


  //兑换码输入框事件
  reCodeInput: function (e) {
    this.setData({
      reCode: e.detail.value,      
    })
  },

  //验证码输入框事件
  iCodeInput: function (e) {
    this.setData({
      imgCodeInput: e.detail.value,
    })
  },
  jumpUserCouponList:function(){
    console.log("跳转到我的券")
   // wx.redirectTo({ url: '../yhq_voucher/yhq_voucher' })
    wx.reLaunch({
      url: '/pages/yhq_voucher/yhq_voucher'
    })
  },
  //兑换按钮事件
  recodeBtnClick: function () {
   // this.clickUser();
    if (this.data.reCode.length == 0) {
    //兑换码为空
      console.log("温馨提示：兑换码为空！")
      wx.showModal({
        title: '提示',
        content:'兑换码不能为空',
        showCancel: false
      });
      /*
      this.setData({
        isShowUserCardInfo:true,
        isShowCardInfo:true,
        isGetCardInfo: true,
      })
     */

    } else {
     
      if (this.data.isClickCount>2){
        //进行验证码验证
        this.setData({
          isShowClickImgCode: true
        });
        this.getImgCode()
        this.loadImgCode()
      }else{
        this.addUserMTCode()
      }  
      console.log("res:" + this.data.isClickCount + "----code:" + this.data.imgCode);  
    }
  },
  updatTime:function(time){
    var date = new Date(time);
    return date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDate();
  },
  updatTime_end: function (time) {
    var date = new Date(time);
    return (date.getMonth() + 1) + '.' + date.getDate();
  },

  //领取会员卡
  getMemberCard: function (e) {
    
    myjCommon.logFormId(e.detail.formId);
    //wx.switchTab({ url: "/pages/member_card/index" });
    wx.reLaunch({
      url: '/pages/member_card/index',
    })
  },
  TestJoump:function(){  
    //wx.switchTab({ url: "/pages/member_card/index" });
    wx.navigateTo({
      url: '../recode_index/recode_index?c=1936654546&s=091fdd233a',
    })
  },

  //进行兑换优惠券
  addUserMTCode:function(){

    if (this.data.isClickStatus){   
    this.setData({
     // counpInfo:null,
      isShowCardInfo:false,
      isClickStatus:false,
     })
  
   /* var that = this;
    console.log("MDescription:" + this.data.counpInfo);  
    this.setData({
      cPrice: (that.data.counpInfo.MDescription.replace('会员价', '')).replace('元', ''),
      counpInfo: that.data.counpInfo,
      isShowCardInfo: true,
      isGetCardInfo: true,
    });*/


    //进行兑换码换券
    var that = this;
    var curUser = myjCommon.getCurrentUser();
    console.log("sessionId:" + curUser.sessionId + "----reCode:" + this.data.reCode);  
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.AddUserCouponByReCode",
      biz: { sessionId: curUser.sessionId, recode: this.data.reCode},
      success: function (res) {
        console.log("进行兑换码换券" + JSON.stringify(res));
        that.setData({         
          isClickStatus: true,
        }); 
        if (res.Code == "0") {
          res.Result.CouponInfo.SBeginTime = that.updatTime(res.Result.CouponInfo.SBeginTime)
          res.Result.CouponInfo.SEndTime = that.updatTime_end(res.Result.CouponInfo.SEndTime)
          if (res.Result.CouponInfo.Remark==""){
            that.GetRemark(res.Result.CouponInfo.CardInfoId);
          }else{
            WxParse.wxParse('article', 'html', res.Result.CouponInfo.Remark, that, 1);
            that.setData({
              Remark: res.Result.CouponInfo.Remark
            });
          }
          that.setData({ 
              cPrice: (res.Result.CouponInfo.MDescription.replace('会员价', '')).replace('元', ''),
              counpInfo: res.Result.CouponInfo,
              isShowCardInfo:true,
              //isShowGetCardInfo: true,  
              isGetCardInfo:true,   
              
          });
          console.log("进行兑换码换券counpInfo:" + JSON.stringify(that.data.counpInfo));
        }
        else if (res.Code == "301") {
          //非会员
          that.setData({
            isShowGetCardInfo: true,    
          }); 
        }
      // else if (res.Code == "4014") {
       //   that.setData({
       //     isbind: true
       //   });
      //  }
        else {
          if (res.Code == "200" || res.Code == "201" || res.Code == "202" || res.Code == "203" || res.Code == "204" || res.Code == "205") {
            //验证码不存在
            that.setData({
              isClickCount: that.data.isClickCount + 1,
         
            })    
          }else {
            //验证码归零
            that.setData({
              isClickCount: 0,
          
            }) 
          }        
          wx.showModal({
            title: '领取失败',
            content: res.Msg,
            showCancel: false
          });
        }       
      },
      fail: function (msg) {
        console.log("优惠券领取失败：" + JSON.stringify(msg));

        wx.showModal({
          title: '领取失败',
          content: "目前太多人了﹋o﹋请稍后再试!!",
          showCancel: false
        });
        //验证码归零
        that.setData({
          isClickStatus: true,

        })

      },
      complete: function (res) {
        that.data.isSending = false;
        wx.hideLoading();

      }      
    });
  }else{

      wx.showToast({
        title: '亲，请耐心等待。。',
        icon: 'none',
        duration: 2000
      })

  }
  },

    //提示用户授权
    getUserInfoBtnClick: function (e) {
    console.log(e);
    if (e.detail.errMsg == "getUserInfo:ok") {
      this.setData({isShowUserInfoBtn: false}),
      this.clickUser();

    }
  },

    GetRemark:function(id){
      var that = this;
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetCouponRemark",
        biz: { id: id },
        success: function (res) {
          WxParse.wxParse('article', 'html', res, that, 1);
          that.setData({          
            Remark: res
          });
        },
        fail: function (msg) {
          console.log("加载失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
      return "";
    },

    //验证用户授权
    clickUser:function(e){
      var that = this;
      myjCommon.getLoginUser(function (user) {
        if (!user.isLogin) {
          that.setData({
            isShowUserInfoBtn: true
          });
          wx.hideLoading();
          that.data.isSending = false;
          return false;
        }
      
    })
    },

    //关闭会员卡对话框
    closeGetCardModal: function () {
      this.setData({
        isShowGetCardInfo: false
      });
    },
    //关闭图片验证对话框
    closeImgCodeModal: function () {     
      this.setData({
        isShowClickImgCode: false,
        imgCodeInput: '',
      });
    },
    //关闭券信息弹出框
    closeUserCardModal:function(){
      this.setData({
        isShowUserCardInfo: false,
      });
    },
    //关闭券领取成功弹出框
    closeGetCardInfo: function () {
      this.setData({
        isGetCardInfo: false,
      });
    },
    //点击弹出券消息框
    binShowCardInfo:function(){
      this.setData({ 
        isShowUserCardInfo:true
      })
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
    //验证图片验证码
    clickImgCode: function (e) {

      if (this.data.imgCodeInput.length == 0) {
        wx.showToast({
          title: '验证码不能为空',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      
      if (this.data.imgCodeInput==this.data.imgCode){
       
        this.closeImgCodeModal();
        this.addUserMTCode();
        console.log("相等—imgCodeInput:" + this.data.imgCodeInput + "----imgCode:" + this.data.imgCode);  

      }else{

        wx.showToast({
          title: '验证码不正确，请重新再输',
          icon: 'none',
          duration: 2000
        })
        this.onTap();
        console.log("不相等—imgCodeInput:" + this.data.imgCodeInput + "----imgCode:" + this.data.imgCode);  


      }



    },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  //计算图形验证码的值
  getImgCode:function(){
    this.setData({
      imgCode:Math.floor(Math.random() * 9000) + 1000,
    })
  },
  //初始化图形验证码
  loadImgCode:function(){

    this.mcaptcha = new Mcaptcha({
      el: 'canvas',
      width: this.data.cvs.width,
      height: this.data.cvs.height,
      code: this.data.imgCode,
    })

  },
  //刷新图形验证码
  onTap:function() {
    this.setData({
      imgCodeInput:'',
    })
    this.getImgCode()
    this.mcaptcha.refresh(this.data.imgCode);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.clickUser()
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