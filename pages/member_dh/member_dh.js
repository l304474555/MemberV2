// pages/member_dh/member_dh.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var WxParse = require('../../wxParse/wxParse.js');
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSize: 10, //页的大小
    pageIndex: 1, //页号
    isCompleted: false, //是否加载完
    gifpageSize: 10, //页的大小
    gifpageIndex: 1, //页号
    isgifCompleted: false, //是否加载完
    integraRule: "", //积分规则
    isHowInterTast: false, //是否弹出积分规则弹出框
    objcoupe: null,//券对象
    isHowtast: false, //券详情弹出框
    ismeritask:false, //实物礼品弹框
    isMember: false, //是否是会员
    isChange: false, //确认是否兑换券弹出框
    needJifen: 0, //兑换需要的积分
    carId: 0, //券Id
    isEnave: false, //是否够积分抵扣弹出框
    isGetSucess: false, //券兑换成功弹出框
    formId: "",
    isNorMember: false,
    currentTab:0,
    MaterialList:[], //实物礼品
    integralList: [], //优惠券列表
    toView: 'red',
    toMertiryView:'red',
    scrollTop: 100,
    coupontype:-1,
    gifType:0,
    isexpress:false, //填写快递信息弹框
    form_info: '', //快递信息表单值
    reckey:'',
    scrollHeight: 0,
    disabled:false,
    redeemCode:'', //兑换码
    isredeecodeTast:false, //兑换码弹框
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP",
    isShowUserInfoBtn:false,
    deducContent:'',
    noteContent:'',
    tuodongwidth:300,
    tuodongheight: 650,
    floatheight: 430,//浮动图标位置
    /**华东会员小程序优化 */
    currentProvince:'' //当前省份
  },
  //加载积分兑换券列表
  LoadGCMPJfList: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }wx.showLoading({
        title: '加载中...',
      });
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetCardActivityList",
        biz: { typeId: 0, pageSize: that.data.pageSize, pageIndex: that.data.pageIndex, sessionId: user.sessionId, channel: 1, cityName: app.currCity },
        success: function (res) {
          console.log("积分列表");
          console.log(res)
          if (res.Data.length>0)
          {
            var merit=[];
            var coupe=[];

            for(var i=0;i<res.Data.length;i++)
            {
              if (res.Data[i].CouponType==1) //优惠券
              {
                coupe.push(res.Data[i]);

              } else if (res.Data[i].CouponType == 3) //实物礼品
              {
                merit.push(res.Data[i]);
              }
            }
            that.setData({
              MaterialList: merit, //实物礼品
              integralList: coupe   //优惠券
            });
          }
          console.log(that.data.MaterialList);
          console.log(that.data.integralList)
        },
        fail: function (msg) {
          console.log("GetGCMPCouponList失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });
    });
  }
  ,
  //取得卡片信息
  getCardInfo: function (cardId) {
    var list = this.data.integralList;
    var obj;
    for (var i = 0; i < list.length; i++) {
      obj = list[i];
      if (obj.Id == cardId) {
        break;
      }
    }
    return obj;
  },
  //取得卡片信息
  getgifCardInfo: function (cardId) {
    var list = this.data.MaterialList;
    var obj;
    for (var i = 0; i < list.length; i++) {
      obj = list[i];
      if (obj.Id == cardId) {
        break;
      }
    }
    return obj;
  },
  //积分兑换券
  ExchangeCoupe: function (event) {
   /**创建者：黎梅芳 */
   /**创建日期：20190422 */
   /**描述：记录formid */
    if (event.detail.formId != undefined && event.detail.formId!='')
    {
      myjCommon.logFormId(event.detail.formId);
    }

    var that = this;
    //1.判断是否是会员
    //2.弹出框让用户确认是否要兑换
    //3.判断用户是否够积分兑换
    //4.调用接口兑换

    if (!that.data.isNorMember) {
      that.setData({
        isMember: true
      });
      return;
    }
    var formId = event.detail.formId;
    var carid = event.target.dataset.cardid;
    var jifen = event.target.dataset.jifen;
    var coupontype = event.target.dataset.coupontype;
    var gifType = event.target.dataset.giftype; //礼品类型[1: 实物  2：兑换码]
    var carStatus = event.target.dataset.carstatus;// 卡券状态
    that.setData({
      needJifen: jifen
    });

    let content = '兑换此券需抵扣' + that.data.needJifen + '积分\n\t请确认是否抵扣？';
    if(coupontype==3)//礼品
    {
      if (carStatus !="立即领取" ) {
        return;
      }
      content = '兑换此礼品需抵扣' + that.data.needJifen + '积分\n\t请确认是否抵扣？';
    }else
    {
      if (carStatus != "立即领取") {
        return;
      }
    }

    that.setData({
      deducContent: content,
      isChange: true,
      isHowtast: false,
      ismeritask:false,
      carId: carid,
      coupontype: coupontype,
      formId: formId,
      gifType:gifType
    });
  },
  //确认兑换
  yesExcange: function (e) {
    /**创建者：黎梅芳 */
    /**创建日期：20190422 */
    /**描述：记录formid */
    if (e.detail.formId != undefined && e.detail.formId != '') {
      myjCommon.logFormId(e.detail.formId);
    }
    var that = this;
    if (that.data.disabled)
    {
      wx.showToast({
        title: '正在兑换中...请勿重复操作哦',
        icon:'none'
      });
      return;
    }else
    {
    that.setData({
      disabled:true
    });
    }
    var currJifen = parseInt(app.globalData.currJifen); //用户当前积分
    var needJifen = parseInt(that.data.needJifen); //兑换券所需积分
    
    var carid = that.data.carId;//券id
    var cardInfo = null;
    //调用接口兑换
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        that.setData({
          disabled: false
        });
        return false;
      }

      if (that.data.coupontype==3) //礼品
      {
        cardInfo=that.getgifCardInfo(carid);
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.AddExchangeGif",
          biz: { 
            sessionId: user.sessionId, 
            cardId: carid, 
            GCCnt: needJifen, 
            source: 2, 
            province:app.currProvince
            },//source:来源：1 优惠券小程序；2 会员小程序  formId:表单Id
          success: function (res) {
            that.setData({
              isChange:false
            });
            if (res.Code == "301") //非会员
            {
              that.setData({
                isMember: true
              });
              /**初始化注册会员组件方法 */
              that.regerter1 = that.selectComponent("#regerter");
              that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
            } else if (res.Code == "306") //金币不够
            {

              that.setData({
                noteContent: '您的积分余额不足，暂不能兑换此礼品!',
                isEnave: true,
                isChange: false
              });

            } else if (res.Code == "0") //兑换成功
            {
              if (that.data.gifType==2) //兑换码
              {
                that.setData({
                  redeemCode: res.Msg,
                  isChange: false,
                  isredeecodeTast: true
                });
              } else if (that.data.gifType == 1)
              {
                that.setData({
                  reckey: res.Msg,
                  isChange: false,
                  isexpress: true
                });
              }
              if (parseInt(res.Result)<=0) {
                cardInfo.CardStatus = "已兑换";
                if (that.data.objcoupe != null && that.data.objcoupe.Id == cardInfo.Id) {
                  that.data.objcoupe.CardStatus = "已兑换";
                }
                that.setData({
                  MaterialList: that.data.MaterialList,
                  objcoupe: that.data.objcoupe
                  //pageIndex: 1
                });
              }
              //that.LoadGCMPJfList();
            }
            else  //已达到领取上限 ||  对不起，券已被抢光 || 卡券活动不存在或已被删除
            {
              wx.showModal({
                title: '领取提示',
                content: res.Msg
              })
            }
          },
          fail: function (msg) {
            console.log("AddExchangeGif失败：" + JSON.stringify(msg));
            that.setData({
              isChange: false,
              disabled: false
            });
            wx.showModal({
              title: '温馨提示',
              content: '系统出错了，请稍后再来兑换。',
              showCancel: false
            });
          },
          complete: function (res) {
            that.setData({
              disabled: false
            });
          }
        });
      }else 
      {
       cardInfo=that.getCardInfo(carid); //根据id获取券对象
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.GCChangeMPCoupon",
          biz: { 
            sessionId: user.sessionId, 
            cardId: carid, 
            GCCnt: needJifen, 
            source: 2, 
            cityName: app.currProvince,
            formId: that.data.formId 
            },//source:来源：1 优惠券小程序；2 会员小程序  formId:表单Id
          success: function (res) {
            console.log(res)
            if (res.Code == "301") //非会员
            {
              that.setData({
                isMember: true
              });
              /**初始化注册会员组件方法 */
              that.regerter1 = that.selectComponent("#regerter");
              that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
            } else if (res.Code == "306") //金币不够
            {
              that.setData({
                noteContent:'您的积分余额不足，暂不能兑换此券!',
                isEnave: true,
                isChange: false
              });

            } else if (res.Code == "0") //兑换成功
            {
              
                that.setData({
                  isGetSucess: true,
                  isChange: false
                });
                if (parseInt(res.Result)<=0) {
                cardInfo.CardStatus = "已兑换";
                if (that.data.objcoupe != null && that.data.objcoupe.Id == cardInfo.Id) {
                  that.data.objcoupe.CardStatus = "已兑换";
                }
                that.setData({
                  integralList: that.data.integralList,
                  objcoupe: that.data.objcoupe
                  //pageIndex: 1
                });
                }
              //that.LoadGCMPJfList();
            }
            else  //已达到领取上限 ||  对不起，券已被抢光 || 卡券活动不存在或已被删除
            {
              wx.showModal({
                title: '领取提示',
                content: res.Msg
              })
            }
          },
          fail: function (msg) {
            console.log("GCChangeMPCoupon失败：" + JSON.stringify(msg));
            that.setData({
              isChange: false,
              disabled: false
            });
            wx.showModal({
              title: '温馨提示',
              content: '系统出错了，请稍后再来兑换。',
              showCancel: false
            });
          },
          complete: function (res) {
            that.setData({
              disabled: false
            });
          }
        });
      }
    });
  },
  /**保存填写的快递信息 */
  savexpressinfo: function (e) {
    console.log(e);
    var id = e.currentTarget.dataset.id;
    var userName = e.detail.value["username"]; //姓名
    var mobile = e.detail.value["mobile"]; //电话
    var adress = e.detail.value["adress"]; //地址
    var that = this;
    if (userName == "" && mobile == "" && adress == "") {
      that.setData({
        isexpress: false
      });
      return;
    } else if (userName != "" && mobile == "")
    {
      wx.showToast({
        title: '请填写您的手机号。',
        icon: 'none'
      });
      that.setData({
        isExpress: true
      });
      return;
    }
    else if (mobile != "" && adress == "") {
      wx.showToast({
        title: '请填写您的地址。',
        icon: 'none'
      });
      that.setData({
        isExpress: true
      });
      return;
    }
    if (mobile!="")
    {
      if (!(/^1[34578]\d{9}$/.test(mobile))) {
        wx.showToast({
          title: '手机号格式填写错误。',
          icon: 'none'
        });
        that.setData({
          isExpress: true
        });
        return;
      } 
    }
    
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.EditExpress",
        biz: { reckey: that.data.reckey, sessionId: user.sessionId, reName: userName, reMobile: mobile, reAddress: adress },
        success: function (res) {
          console.log("保存快递信息");
          console.log(res);
          that.setData({
            form_info: ''
          });
          if(res.Code="ok")
          {
            that.setData({
              isexpress:false
            });
            wx.showToast({
              title: res.Msg,
              duration:3000
            })
          }

        },
        fail: function (msg) {
          console.log("UpdateUserWinById" + JSON.stringify(msg));
 
        },
        complete: function (res) {
          that.setData({
            isExpress: false
          });
        }
      });
    });
  },
  //成为会员
  BecomeMember: function () {
    this.setData({
      isMember:false
    });
    wx.reLaunch({ url: "/pages/member_card/index" });
  },
  //点击券打开券详情弹出框
  OpenCoupe: function (event) {
    console.log(event)
    var that = this;
    var id = event.currentTarget.dataset.id;
    var vibid = event.currentTarget.dataset.vibid;//crm活动号
    var target = 'yhq';
    if (id <= 0 || id == null) {
      target = 'crm'
      id = vibid;
    }
    //劵类型 0：支付劵 1：优惠劵 2：广告区3：实物礼品
    var coupetype = event.currentTarget.dataset.coupontype;
    var coupe = null;
    if (coupetype==3)
    {
      for (var i = 0; i < this.data.MaterialList.length; i++) {
        var obj = this.data.MaterialList[i];
        if (obj.Id == id) {
          coupe = obj;
          break;
        }
      }
    }else
    {
    for (var i = 0; i < this.data.integralList.length; i++) {
      var obj = this.data.integralList[i];
      if (obj.Id == id) {
        coupe = obj;
        break;
      }
    }
    }
    if (coupe.Remark) {
      WxParse.wxParse('article', 'html', coupe.Remark, that, 1);
      that.setData({
        objcoupe: coupe,//现金券对象
        isHowtast: true
      });
      return;
    }
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetCouponRemark",
      biz: { id: id, target: target},
      success: function (res) {
        WxParse.wxParse('article', 'html', res.Result, that, 1);
        if (coupetype==3) //实物弹框
        {
          that.setData({
            objcoupe: coupe,
            ismeritask:true
            
          });
        }else //优惠券弹框
        {
        that.setData({
          objcoupe: coupe,
          isHowtast: true
        });
        }
      },
      fail: function (msg) {
        console.log("加载失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
  },
  //点击积分规则弹出积分规则
  OpeninteRule: function () {
    this.setData({
      isHowInterTast: true
    });
  },
  //加载积分规则
  LoadinterRule: function () {
    var that = this;
    //调用接口兑换
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn:true
        });
        wx.hideLoading();
        return;
      }
      that.getlocation();
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetIntegral",
        biz: { sessionId: user.sessionId },
        success: function (res) {
          //非会员
          if (res.Code == "301") {
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
          } else {
            that.setData({
              isNorMember: true
            });
          }

          if (res.Result.length > 0) {
            var rule = "";
            for (var i = 0; i < res.Result.length; i++) {
              rule = res.Result[i].RuleIDRule;
              break;
            }
            that.setData({
              integraRule: rule
            });
          }
        },
        fail: function (msg) {
          console.log("GetIntegral失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var that = this;
    that.setData({
      integralList: [],
      pageIndex: 1,
      pageSize:10,
      gifpageSize:10,
      isCompleted: false,
      MaterialList: [],
      gifpageIndex: 1, //页号
      isgifCompleted: false,
      disabled:false
    });
    that.LoadinterRule();
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });

        if (res.screenWidth > 320) //iphone5以上的手机
        {
          that.setData({
            floatheight: 630,
            tuodongwidth: (res.screenWidth - 75)
          });
        } else {
          that.setData({
            floatheight: 490,
            tuodongwidth: (res.screenWidth - 95)
          });
        }

        that.setData({
          tuodongheight: (res.screenHeight - 170),

        });
      }
    });
  },
  getlocation:function()
  {
    var that=this;
    //改版 积分换券列表
    if (app.currCity != undefined) {
      that.loadCouponList();
      that.loadGifList();
    }else
    {
      var cityName = wx.getStorageSync("membercity");
      var provinceName = wx.getStorageSync("memberprovince");
      if (cityName && provinceName) {
        app.currCity = cityName;
        app.currProvince = provinceName;
      }else
      {
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
                that.loadCouponList();
                that.loadGifList();
                that.setData({
                  currentProvince: app.currProvince
                });
              },
              fail: function (res) {
              },
              complete: function (res) { }
            });

          }, fail: function () {
            // 调起客户端小程序设置界面，返回用户设置的操作结果。
            wx.openSetting({
              success: function (res) {
                if (!res.authSetting["scope.userLocation"]) {
                  //这里是授权成功之后 重新获取数据
                  /**获取当前地理位置 */
                  wx.getLocation({
                    type: 'gcj02',
                    success: function (res) {
                      /**纬度 */
                      let latitude = res.latitude;
                      /**经度 */
                      let longitude = res.longitude;
                      demo.reverseGeocoder({
                        location: {
                          latitude: latitude,
                          longitude: longitude
                        },
                        success: function (res) {
                          app.currCity = res.result.address_component.city;
                          app.currProvince = res.result.address_component.province;
                          that.loadCouponList();
                          that.loadGifList();
                          that.setData({
                            currentProvince: app.currProvince
                          });
                        },
                        fail: function (res) {

                        },
                        complete: function (res) { }
                      });
                    },
                    fail: function (res) {
                      wx.showModal({
                        title: '无法获取到您所在的城市，请检查是否已经开了允许定位',
                        showCancel: false
                      });
                    },
                    complete: function () {

                    }
                  });
                }
              }
            });
          }
        })
      }
    }

  },
  /**获取优惠券兑换列表 */
  loadCouponList:function()
  {
    var that = this;
    wx.showLoading({
      title: '数据加载中...',
    });
    //调用接口兑换
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        wx.hideLoading();
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetJfExchanCoupeList",
        biz: { typeId: 0, couponType:0, pageSize: that.data.pageSize, pageIndex: that.data.pageIndex, sessionId: user.sessionId, channel: 1, cityName: app.currCity },
        success: function (res) {
          console.log(res)
          //非会员
          if (res.Code == "301") {
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
          } else {
            that.setData({
              isNorMember: true
            });
          }
          var list = that.data.integralList.concat(res.Data);
          that.setData({
            integralList: list
          });
          //是否加载完
          var pCount = parseInt(res.Total / that.data.pageSize);
          if (res.Total % that.data.pageSize > 0) {
            pCount++;
          }
          if (that.data.pageIndex >= pCount) {
            that.setData({
              isCompleted: true
            });
          }
        },
        fail: function (msg) {
          console.log("GetJfExchanCoupeList失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });
    });
  },
  /**获取礼品兑换列表 */
  loadGifList:function()
  {
    var that = this;
    //调用接口兑换
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        wx.hideLoading();
        return false;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetJfExchanCoupeList",
        biz: { typeId: 0, couponType: 1, pageSize: that.data.gifpageSize, pageIndex: that.data.gifpageIndex, sessionId: user.sessionId, channel: 1, cityName: app.currCity },
        success: function (res) {
          console.log(res)
          //非会员
          if (res.Code == "301") {
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
          } else {
            that.setData({
              isNorMember: true
            });
          }
          var list = that.data.MaterialList.concat(res.Data);
          that.setData({
            MaterialList: list
          });
          //是否加载完
          var pCount = parseInt(res.Total / that.data.gifpageSize);
          if (res.Total % that.data.gifpageSize > 0) {
            pCount++;
          }
          if (that.data.gifpageIndex >= pCount) {
            that.setData({
              isgifCompleted: true
            });
          }
        },
        fail: function (msg) {
          console.log("GetJfExchanCoupeList失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  getUserInfoBtnClick: function (e) {
    var that=this;
    that.setData({
      isShowUserInfoBtn:false
    });
    if (e.detail.errMsg == "getUserInfo:ok") {
      that.LoadinterRule();
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
    //console.log("下拉")
   /* if (this.data.isCompleted) {
      return;
    }
    this.data.pageIndex++;
    this.LoadGCMPJfList();*/

    if (this.data.currentTab==0) //优惠券
    {
      if (this.data.isCompleted) {
        return;
      }
      this.data.pageIndex++;
      this.loadCouponList();
    } else if (this.data.currentTab == 1) //礼品
   {
      if (this.data.isgifCompleted) {
        return;
      }
      this.data.gifpageIndex++;
      this.loadGifList();
   }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //关闭弹框
  closeTast: function () {
    this.setData({
      ismeritask:false,
      isHowInterTast: false,
      isChange: false,
      isHowtast: false,
      isMember:false,
      needJifen: 0,
      carid: 0,
      isGetSucess: false,
      isredeecodeTast:false
    });
  },
  //避免2个弹框时关闭的时候一起关闭了。
  ncloseTast: function () {
    this.setData({
      isEnave: false
    });
  },
  exprescloseTast:function()
  {
    this.setData({
      isexpress:false,
      form_info:''
    });
  },
  //领取会员卡
  getMemberCard: function (e) {
    //myjCommon.logFormId(e.detail.formId);
    wx.switchTab({ url: "/pages/member_card/index" });
  },
  /**跳转到兑换记录列表页 */
  contact:function()
  {
    console.log("跳转")
    wx.navigateTo({
      url: '../member_gift/member_gif',
    });
  },
  catchTouchMove:function()
  {
    return false;
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  upper: function (e) {
    //console.log(e)
  },
  lower: function (e) {
    //console.log(e)
  },
  scroll: function (e) {
    //console.log(e)
  },
  tap: function (e) {
    for (var i = 0; i < this.data.MaterialList.length; ++i) {
      if (this.data.MaterialList[i] === this.data.toView) {
        this.setData({
          toView: this.data.MaterialList[i + 1]
        })
        break
      }
    }
  },
  tapMove: function (e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  },
  /**复制兑换码 */
  copyreedcode:function()
  {
    wx.setClipboardData({
      data: this.data.redeemCode,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) // data
          }
        })
      }
    });
  },
  /**进入我的券 */
  toMyCoupon:function()
  {
    wx.switchTab({
      url: '../member_center/member_center',
    });
  },
  /**打开微信支付：跳转到微信支付页 */
  url_wxpay: function () {
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
  }
})