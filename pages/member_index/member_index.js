// pages/yhq_index/yhq.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var WxParse = require('../../wxParse/wxParse.js');
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
const getBrandDayInfo_interface = 'WxMiniProgram.Service.GetBrandDayInfo';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowUserInfoBtn: false, //授权弹出框
    carInfo: {},//会员卡信息
    userInfo: {}, //用户信息
    defaultAvatar: "../img/default.png", //用户默认头像
    backgroundImg: '', //会员卡背景
    objcoupe: null, //券对象
    isShow: false, //会员尊享弹框
    isHave: false, //领券成功弹框
    isNo: false, //非会员
    isYes: false, //会员
    isWait: false, //更多尊享弹框
    isOnce: false, //只能是会员领取弹出框
    isRight: false,//权益,
    memberStatus: "",//是否是会员：会员状态
    isRunout: false, // 库存弹出框控制
    isMemEnjoy: false, //点击会员尊享如果是非会员弹出框
    //活动大礼包
    isBagsucess: false, //成功领取活动大礼包提示框
    channel: 1, //投放渠道：0 优惠券；1 会员；3 全部
    currTotalCnt: 0, //用户当前积分
    currCouponCount: 0, //当前用户待使用券数
    memberAdList: [], //广告栏
    objAd: null, //广告栏对象
    isAdTast: false, //广告栏弹出框
    memberEnjoylist: [], //会员尊享
    isMember: true, //用于标识是否是会员
    currenAppid: "wxc94d087c5890e1f8", //当前小程序appid
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP", //地图key
    fromApp: 1, //来源：1 优惠券小程序； 2 会员小程序
    isbind: false,
    cityName: "", //定位 2018.05.21
    channel: 1, //投放渠道
    menuList: [], //菜单栏
    /**首页改版 */
    currUserInfo: null, //当前登录用户信息
    bannerList: [], //banner
    bannerCurrent: 0,
    current: 0,
    swiperitcss: "swiper-box",
    //banner动态设置高度要不然会变形  
    imgheights: [],
    forwardCnt: 0,
    isSuccessAddCouponByMobile: false,
    addCouponByMobileCount: 0,
    jfUserInfo: null,
    ordinaryMember: '',
    isJfCoupons: false,
    /**券到账提醒 */
    couponRemindTast: false,//券到账提醒弹框
    couponsRemindInfo: null, //券到账提醒内容
    isjump: false, //是否跳转
    isJumpUrl: '',
    isBag: false,
    isBagsucessImg: "", //礼包领取成功弹出框图片
    isclicking: false,
    isSelectCity: false,

    isNewPage: 0,//是否为新版会员页面:0加载中，1旧页面，2新页面
    moduleList: [],//首页7个模块
    isBrandMember: false,  //是否品牌会员
  },

  /**用户定位 */
  getUserLocationInfo: function () {
    var that = this;
    var demo = new QQMapWX({
      key: that.data.key // 必填
    });
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      that.getJFUserInfo();//获取佳纷会员信息
      if (app.currCity != undefined) //全局已经存在城市
      {
        that.setData({
          cityName: app.currCity,
          isNewPage: app.checkNewPage()
        });
        /**加载配置信息 */
        that.GetMemberCardConfig();
        /**加载菜单栏 */
        that.GetMemberMenu(app.currCity);
        /**加载会员尊享 */
        that.loadMemEnjoy(app.currCity);
        /**加载广告 */
        that.GetMemberAd(app.currCity);
        /**加载banner */
        that.GetBanners(app.currCity);
        that.GetGiftBagActivity(app.currCity);
        that.addCouponByMobile();
        /**加载7个模块 */
        that.GetMemberIndexModules();
        // that.getJFGrantCoupon();
      } else  //如果不存在则查询定位记录
      {
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.GetUserLocationInfo",
          biz: {
            sessionId: user.sessionId,
            fromApp: that.data.fromApp
          },
          success: function (res) {
            if (res.City != null) {
              app.currCity = res.City;
              app.currProvince = res.Province;
              app.latitude = res.Latitude,
                app.longitude = res.Longitude;
              that.setData({
                cityName: res.City,
                isNewPage: app.checkNewPage()
              });
              /**加载配置信息 */
              that.GetMemberCardConfig();
              /**加载菜单栏 */
              that.GetMemberMenu(app.currCity);
              /**加载会员尊享 */
              that.loadMemEnjoy(app.currCity);
              /**加载广告 */
              that.GetMemberAd(app.currCity);
              /**加载banner */
              that.GetBanners(app.currCity);
              that.GetGiftBagActivity(app.currCity);
              that.addCouponByMobile();
              /**加载7个模块 */
              that.GetMemberIndexModules();
              //that.getJFGrantCoupon()
            } else //定位 记录到表里
            {
              that.setData({
                LoadingDesc: "定位中，请稍候……"
              });
              setTimeout(function () {
                if (!that.data.isLocated) {
                  that.setData({
                    isSelectCity: true,
                    locationExpire: true
                  });
                }
              }, 10000);
              wx.getLocation({
                type: 'wgs84',
                success: function (res) {
                  if (that.data.locationExpire) {
                    return;
                  }
                  that.setData({
                    isSelectCity: false
                  })
                  var latitude = res.latitude
                  var longitude = res.longitude
                  // 调用接口 根据经纬度去获取所在城市
                  that.setData({
                    LoadingDesc: "城市定位中，请稍候……"
                  });
                  demo.reverseGeocoder({
                    location: {
                      latitude: latitude,
                      longitude: longitude
                    },
                    success: function (res) {
                      if (that.data.locationExpire) {
                        return;
                      }

                      app.currCity = res.result.address_component.city;
                      app.currProvince = res.result.address_component.province;
                      app.latitude = res.result.address_component.latitude,
                        app.longitude = res.result.address_component.longitude;
                      /**加载配置信息 */
                      that.GetMemberCardConfig();
                      /**加载菜单栏 */
                      that.GetMemberMenu(app.currCity);
                      /**加载会员尊享 */
                      that.loadMemEnjoy(app.currCity);
                      /**加载广告 */
                      that.GetMemberAd(app.currCity);
                      /**加载banner */
                      that.GetBanners(app.currCity);
                      that.GetGiftBagActivity(app.currCity);
                      that.addCouponByMobile();
                      /**加载7个模块 */
                      that.GetMemberIndexModules();
                      //that.getJFGrantCoupon();
                      //调用保存接口把定位信息保存到表里
                      myjCommon.callApi({
                        interfaceCode: "WxMiniProgram.Service.UpdateUserLocation",
                        biz: {
                          sessionId: user.sessionId,
                          city: that.data.cityName, //城市
                          province: app.currProvince,//省份
                          lat: latitude, //城市维度
                          lng: longitude, //城市经度
                          fromApp: that.data.fromApp //来源：1 优惠券小程序； 2 会员小程序
                        },
                        success: function (res) {
                          //当旧账号解绑的时候业务要求不弹出“马上成为会员”弹框 4014是已经解 2018.05.15
                          if (user.lastErrorCode != "4014") {
                            if (res.Code == "301") {
                              that.setData({
                                noMemberTask: true
                              });
                              /**初始化注册会员组件方法 */
                              that.regerter1 = that.selectComponent("#regerter");
                              that.regerter1.init(that.data.noMemberTask, "wxc94d087c5890e1f8", "member_card");
                            }
                          }

                        },
                        fail: function (res) {
                        },
                        complete: function (res) {
                        }
                      });
                    },
                    fail: function (res) {
                      that.setData({
                        isSelectCity: true
                      });
                      //that.changeCity();
                    },
                    complete: function (res) {
                    }
                  });
                },
                fail: function (res) {
                  that.setData({
                    isSelectCity: true
                  });
                  //that.changeCity();
                },
                complete: function (res) {
                }
              });
            }
          },
          fail: function (msg) {
            //如果定位失败则跳转到选择城市页面
            that.setData({
              isSelectCity: true
            });
            //that.changeCity();
          },
          complete: function (res) {
            wx.hideLoading();
          }
        });
      }
    });
  },
  getUserLocationInfoV1: function (callback) {
    var that = this;
    var demo = new QQMapWX({
      key: that.data.key // 必填
    });
    // myjCommon.getLoginUser(function (user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }
    var user = myjCommon.getCurrentUser()
    that.getJFUserInfo();//获取佳纷会员信息
    if (app.currCity != undefined && app.currProvince != undefined) //全局已经存在城市
    {
      that.setData({
        cityName: app.currCity,
        isNewPage: app.checkNewPage()
      });
      /**加载配置信息 */
      that.GetMemberCardConfig();
      /**加载菜单栏 */
      that.GetMemberMenu(app.currCity);
      /**加载会员尊享 */
      that.loadMemEnjoy(app.currCity);
      /**加载广告 */
      that.GetMemberAd(app.currCity);
      /**加载banner */
      that.GetBanners(app.currCity);
      that.GetGiftBagActivity(app.currCity);
      that.addCouponByMobile();
      /**加载7个模块 */
      that.GetMemberIndexModules();
      // that.getJFGrantCoupon();

      if (app.currProvince.indexOf('广东') > -1) {
        callback && callback(app.currCity);
      }
    } else {
      var cityName = wx.getStorageSync("membercity");
      var provinceName = wx.getStorageSync("memberprovince");
      if (cityName && provinceName) {
        that.setData({
          cityName: cityName,
          isNewPage: app.checkNewPage()
        });
        app.currCity = cityName;
        app.currProvince = provinceName;
        /**加载配置信息 */
        that.GetMemberCardConfig();
        /**加载菜单栏 */
        that.GetMemberMenu(cityName);
        /**加载会员尊享 */
        that.loadMemEnjoy(cityName);
        /**加载广告 */
        that.GetMemberAd(cityName);
        /**加载banner */
        that.GetBanners(cityName);
        that.GetGiftBagActivity(cityName);
        that.addCouponByMobile();
        /**加载7个模块 */
        that.GetMemberIndexModules();

        if (provinceName.indexOf('广东') > -1) {
          callback && callback(cityName);
        }
      } else {
        wx.getLocation({
          type: 'wgs84',
          success: function (res) {
            if (that.data.locationExpire) {
              return;
            }
            var latitude = res.latitude
            var longitude = res.longitude
            // 调用接口 根据经纬度去获取所在城市
            that.setData({
              LoadingDesc: "城市定位中，请稍候……"
            });
            that.setData({
              isSelectCity: false
            })
            demo.reverseGeocoder({
              location: {
                latitude: latitude,
                longitude: longitude
              },
              success: function (res) {
                app.currCity = res.result.address_component.city;
                app.currProvince = res.result.address_component.province;
                app.latitude = res.result.address_component.latitude,
                  app.longitude = res.result.address_component.longitude;
                if (res.result.address_component.city) {
                  that.setData({
                    cityName: res.result.address_component.city
                  });
                }
                that.setData({
                  isNewPage: app.checkNewPage()
                });
                /**加载配置信息 */
                that.GetMemberCardConfig();
                /**加载菜单栏 */
                that.GetMemberMenu(app.currCity);
                /**加载会员尊享 */
                that.loadMemEnjoy(app.currCity);
                /**加载广告 */
                that.GetMemberAd(app.currCity);
                /**加载banner */
                that.GetBanners(app.currCity);
                that.GetGiftBagActivity(app.currCity);
                that.addCouponByMobile();
                /**加载7个模块 */
                that.GetMemberIndexModules();

                if (app.currProvince.indexOf('广东') > -1) {
                  callback && callback(app.currCity);
                }
                //that.getJFGrantCoupon();
                //调用保存接口把定位信息保存到表里
                myjCommon.callApi({
                  interfaceCode: "WxMiniProgram.Service.UpdateUserLocation",
                  biz: {
                    sessionId: user.sessionId,
                    city: that.data.cityName, //城市
                    province: app.currProvince,//省份
                    lat: latitude, //城市维度
                    lng: longitude, //城市经度
                    fromApp: that.data.fromApp //来源：1 优惠券小程序； 2 会员小程序
                  },
                  success: function (res) {
                    //当旧账号解绑的时候业务要求不弹出“马上成为会员”弹框 4014是已经解 2018.05.15
                    if (user.lastErrorCode != "4014") {
                      if (res.Code == "301") {
                        that.setData({
                          noMemberTask: true
                        });
                        /**初始化注册会员组件方法 */
                        that.regerter1 = that.selectComponent("#regerter");
                        that.regerter1.init(that.data.noMemberTask, "wxc94d087c5890e1f8", "member_card");
                      }
                    }

                  },
                  fail: function (res) {
                    that.setData({
                      isSelectCity: true
                    });
                  },
                  complete: function (res) {
                  }
                });
              },
              fail: function (res) {
                that.setData({
                  isSelectCity: true
                });
              },
              complete: function (res) {
              }
            });
          },
          fail: function (res) {
            that.setData({
              isSelectCity: true
            });
          },
          complete: function (res) {
          }
        });
      }
    }

    // });
  },
  //获取会员卡小程序相关配置信息
  GetMemberCardConfig: function () {
    var that = this;
    //wx.showLoading({
    //  title: '载入中……'
    //});
    // myjCommon.getLoginUser(function (user) {
    //   console.log(user)
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     wx.hideLoading();
    //     return false;
    //   }
    var user = myjCommon.getCurrentUser()
    that.setData({
      isShowUserInfoBtn: false,
      userInfo: user.userInfo
    });

    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMemberCardConfig",
      biz: { sessionId: user.sessionId, cityName: app.currProvince },
      success: function (res) {
        console.log("登录状态");
        console.log(user);
        console.log(user.lastErrorCode);
        if (user.lastErrorCode == "4014") {
          that.setData({
            isbind: true
          });
        }


        if (res.Code == "301") //非会员
        {
          that.setData({
            isMember: false,
            noMemberTask: true,
          });
          /**初始化注册会员组件方法 */
          that.regerter1 = that.selectComponent("#regerter");
          that.regerter1.init(that.data.noMemberTask, "wxc94d087c5890e1f8", "member_card");
          return;
        }
        that.setData({
          isMember: true,
          noMemberTask: false,
          swiperitcss: "swiper-boxN"
        });

        //可用积分
        var cntCount = res.Result.TotalCnt || 0;
        //所在城市
        var cityName = res.Result.CityName || "";
        //待使用券数
        var couponCount = res.Result.CouponCount || 0;
        that.setData({
          carInfo: res.Result.CardInfo,
          currTotalCnt: cntCount,
          currCity: cityName,
          isNewPage: app.checkNewPage(),
          currCouponCount: couponCount
        })
        //赋值积分到全局变量  兑换券的时候要用到
        app.globalData.currJifen = cntCount;
      },
      fail: function (msg) {
        console.log("调用GetMemberCardConfig失败" + JSON.stringify(msg));
      },
      complete: function (res) {
        wx.hideLoading();
        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();
      }
    });
    // });
  },
  //获取会员卡小程序相关配置信息
  GetMemberMenu: function (cityName) {
    var that = this;
    // myjCommon.getLoginUser(function (user) {
    //   console.log(user)
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     wx.hideLoading();
    //     return false;
    //   }
    var user = myjCommon.getCurrentUser()
    that.setData({
      isShowUserInfoBtn: false,
      userInfo: user.userInfo
    });

    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMiniMerberMuneFromCity",
      // interfaceCode: "WxMiniProgram.Service.GetMiniMerberMune",
      biz: { channel: that.data.channel, cityName: cityName },
      success: function (res) {
        console.log("菜单栏");
        console.log(res);
        if (res.Result.length > 0) {
          that.setData({
            menuList: res.Result
          });
        }
      },
      fail: function (msg) {
        console.log("调用GetMiniMerberMune失败" + JSON.stringify(msg));
      },
      complete: function (res) {

      }
    });
    // });
  },
  getUserInfoBtnClick: function (e) {
    //console.log("组件")
    //console.log(e);
    var that = this;
    if (e.detail.errMsg == "getUserInfo:ok") {
      wx.reLaunch({
        url: '/pages/member_index/member_index',
      })
      that.getUserLocationInfoV1();
      wx.getUserInfo({
        success: function (e) {
          that.setData({
            currUserInfo: e.userInfo,
            isShowUserInfoBtn: false
          });
        }
      });
    }
  },
  //读取广告栏信息
  GetMemberAd: function (cityName) {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMiniProgramAd",
      biz: { cityName: cityName },
      success: function (res) {
        console.log("广告栏")
        console.log(res)
        if (res.Result != null) {
          that.setData({
            memberAdList: res.Result
          });
        }
      },
      fail: function (msg) {
        console.log("调用GetMiniProgramAd失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
  },
  //读取banner信息
  GetBanners: function (cityName) {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMiniProBanner",
      biz: { cityName: cityName },
      success: function (res) {
        console.log("banner")
        console.log(res)

        if (res.Result != null) {
          that.setData({
            bannerCurrent: 0,
            bannerList: res.Result
          });
        }
      },
      fail: function (msg) {
        console.log("调用GetMiniProgramAd失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
  },
  //加载会员尊享
  loadMemEnjoy: function (cityname) {
    var that = this;
    // myjCommon.getLoginUser(function (user) {
    //   if (!user.isLogin) {
    //     wx.showModal({
    //       title: '提示',
    //       content: "登录失败，请稍后重试。",
    //       showCancel: false
    //     });
    //     wx.hideLoading();
    //     return false;
    //   }
    var user = myjCommon.getCurrentUser()

    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMPImageContentIndex",
      biz: { sessionId: user.sessionId, cityName: cityname },
      success: function (res) {
        console.log(res)
        that.setData({
          memberEnjoylist: res.Result
        });
      },
      fail: function (msg) {
        console.log("GetMPImageContentIndex失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
    // });
  },

  GetAd: function (event) {// //点击广告弹出框

    //广告栏id
    var id = event.currentTarget.dataset.id;
    var adobj = null;
    var remark = "";

    for (var i = 0; i < this.data.memberAdList.length; i++) {
      var obj = this.data.memberAdList[i];
      if (obj.Id == id) {
        adobj = obj;
        remark = obj.Contents;
        break;
      }
    }
    WxParse.wxParse('article', 'html', remark, this, 1);
    this.setData({
      objAd: adobj,
      isAdTast: true
    });

  },
  //会员尊享：点赞
  clickGreat: function (event) {
    //获取当前点赞的图标标识，根据标识来显示对应的图标
    var typeSign = "";
    //图文Id
    var comId = event.currentTarget.dataset.comid;
    var isCheck = event.currentTarget.dataset.ischeck;
    if (isCheck > 0) {
      typeSign = "0";
    } else if (isCheck <= 0) {
      typeSign = "1";
    } else {
      typeSign = "1";
    }
    var curUser = myjCommon.getCurrentUser();
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.LikeMPImageContent",
      biz: { sessionId: curUser.sessionId, imgid: comId, typeSign: typeSign },
      success: function (res) {
        //刷新点赞图标按钮
        that.loadMemEnjoy(app.currCity);
      },
      fail: function (msg) {
        console.log("调用LikeMPImageContent失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
  },
  /**
     * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    console.log("onload......");
    var that = this;
    wx.showLoading({
      title: '加载中',
    });
    that.setData({
      bannerCurrent: 0
    });

    if (options.AreaNo) { //扫码定位 AreaNo市级编码
      wx.getUserInfo({
        success: function (e) {
          console.log('执行getuserinfo')
          that.setData({
            currUserInfo: e.userInfo
          });
          that.formScanLocation(options.AreaNo)
        },
        fail: function (e) {
          that.formScanLocation(options.AreaNo)
        }
      })

    } else { //非扫码定位
      wx.getUserInfo({
        success: function (e) {
          console.log('执行getuserinfo')
          that.setData({
            currUserInfo: e.userInfo
          });
          //用户定位
          that.getUserLocationInfoV1(cityName => {
            that.checkBrandMember(cityName);
          });
        },
        fail: function (msg) {
          console.log(msg)
          // that.setData({
          //   isShowUserInfoBtn: true
          // });
          //用户定位
          that.getUserLocationInfoV1();
          wx.hideLoading();
        }
      });
    }


    /**获取转发管理配置 */
    myjCommon.forward(
      function (res) {
        if (res != null) {
          app.forwardinfo = res;
          that.setData({
            forwardCnt: res.ForwardCnt
          });
        }
      });

  },
  //扫码获取定位
  formScanLocation(options) {
    var that = this
    var AreaNo = options
    var currCity = ''
    var currProvince = ''
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetHotCity",
      biz: {},
      success: function (res) {
        console.log(res)
        if (res.Result) {
          res.Result.CityList.forEach(province => {
            province.CityList.forEach(city => {
              if (city.AreaNo == AreaNo) {
                currProvince = province.Name
                currCity = city.Name
              }
            })
          })
        }
        app.currCity = currCity
        app.currProvince = currProvince

        //调用保存接口把定位信息保存到表里
        var qqmapsdk = new QQMapWX({
          key: that.data.key // 必填
        });
        myjCommon.getLoginUser(function (user) {
          if (!user.isLogin) {
            that.setData({
              isShowUserInfoBtn: true
            });
            return;
          }

          qqmapsdk.geocoder({
            address: currCity, //地址参数，例：固定地址，address: '北京市海淀区彩和坊路海淀西大街74号'
            success: function (res) { //成功后的回调
              console.log(res)
              var latitude = res.result.location.lat,
                longitude = res.result.location.lng;
              myjCommon.callApi({
                interfaceCode: "WxMiniProgram.Service.UpdateUserLocation",
                biz: {
                  sessionId: user.sessionId,
                  city: app.currCity, //城市
                  province: app.currProvince,//省份
                  lat: latitude, //城市维度
                  lng: longitude, //城市经度
                  fromApp: that.data.fromApp //来源：1 优惠券小程序； 2 会员小程序
                },
                success: function (res) {
                  //当旧账号解绑的时候业务要求不弹出“马上成为会员”弹框 4014是已经解 2018.05.15
                  if (user.lastErrorCode != "4014") {
                    if (res.Code == "301") {
                      that.setData({
                        noMemberTask: true
                      });
                      /**初始化注册会员组件方法 */
                      that.regerter1 = that.selectComponent("#regerter");
                      that.regerter1.init(that.data.noMemberTask, "wxc94d087c5890e1f8", "member_card");
                    }
                  }

                },
                fail: function (res) {
                },
                complete: function (res) {
                }
              });
            },
          })
        })
        that.getUserLocationInfoV1()
      },
      fail: function () {
        app.currCity = currCity
        app.currProvince = currProvince
        that.getUserLocationInfoV1()
        wx.showToast({
          title: '网络异常，请稍后再试',
        })
      }
    })
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
      that.setData({
        defaultAvatar: user.userInfo.avatarUrl
      });
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.IsMember",
        biz: { sessionId: user.sessionId },
        success: function (res) {
          console.log(res)
          if (res.Code == "301") {
            that.setData({
              noMemberTask: true,
              isYes: false,
              memberStatus: "301"
            })
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.noMemberTask, "wxc94d087c5890e1f8", "member_card");
            return;
          } else {
            that.setData({
              isNo: false,
              isYes: true,
              memberStatus: "200"
            })
            app.globalData.isMember = true;
            //获取会员卡配置信息
            that.GetMemberCardConfig();
          }
          that.setData({
            backgroundImg: res.Result.Background
          })
        },
        fail: function (msg) {
          console.log("调用IsMember失败" + JSON.stringify(msg));
        },
        complete: function (res) {

        }
      });
    })
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
    console.log("onshow");
    this.data.isclicking = false;
    //券到账提醒
    this.getCouponsArriveRemind();
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
    //在标题栏中显示加载
    wx.showNavigationBarLoading();
    this.setData({
      bannerCurrent: 0
    });
    /**加载配置信息 */
    this.GetMemberCardConfig();
    /**加载菜单栏 */
    this.GetMemberMenu(app.currCity);
    /**加载会员尊享 */
    this.loadMemEnjoy(app.currCity);
    /**加载广告 */
    this.GetMemberAd(app.currCity);
    /**加载banner */
    this.GetBanners(app.currCity);
  },
  onPageScroll: function (obj) {
    if (obj.scrollTop > 190 && !this.data.isShowMiniNav) {
      this.setData({
        isShowMiniNav: true
      });
    }
    else if (obj.scrollTop < 190 && this.data.isShowMiniNav) {
      this.setData({
        isShowMiniNav: false
      });
    }
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
    var that = this;
    return {
      title: app.forwardinfo.ForwardTitle,
      path: app.forwardinfo.PageUrl,
      imageUrl: app.forwardinfo.ImageUrl,
      success: (res) => {
        that.setData({
          forwardCnt: (that.data.forwardCnt + 1)
        }, () => {
          console.log("转发")
          //记录转发次数
          that.updateForwardCnt(app.forwardinfo.Id, that.data.forwardCnt);
        });

      }
    }
  },
  updateForwardCnt: function (fid, forwardCnt) {
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.AddForwardCnt",
      biz: { id: fid, forwordcnt: forwardCnt },
      success: function (res) {
      }, fail: function (msg) {
        console.log(" 记录分享次数AddForwardCnt失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
  },
  //领取会员尊享券
  getCard: function (event) {
    var that = this;

    //判断库存是否充足
    var stocks = that.data.objcoupe.Stocks;//库存
    if (stocks == 0) {
      that.setData({
        isRunout: true,
        isShow: false
      });
      return;
    }
    else {
      var that = this;
      that.setData({
        isShow: false
      })
    }

    //领取券
    var cardId = event.currentTarget.dataset.cardid;
    var cardInfo = that.data.objcoupe;
    if (cardInfo.CardStatus != "立即领取") {
      return;
    }
    wx.showLoading({
      title: '正在提交……',
      mask: true
    });
    var that = this;
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
        interfaceCode: "WxMiniProgram.Service.AddUserCard",
        biz: { cardId: cardId, sessionId: user.sessionId },
        success: function (res) {
          if (res.Code == "0") {
            wx.showModal({
              title: '领取成功',
              content: "领取成功！到店使用微信支付即可自动享受优惠。",
              showCancel: false
            });
          }
          else if (res.Code == "301") {
            //非会员
            that.setData({
              noMemberTask: true,
              isMemEnjoy: true
            });
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.noMemberTask, "wxc94d087c5890e1f8", "member_card");
          }
          else {
            wx.showModal({
              title: '领取失败',
              content: res.Msg,
              showCancel: false
            });
          }
          if (parseInt(res.Result, 10) < 1) {
            cardInfo.CardStatus = "已领取";
            if (that.data.objcoupe != null && that.data.objcoupe.Id == cardInfo.Id) {
              that.data.objcoupe.CardStatus = "已领取";
            }
            that.setData({
              objcoupe: that.data.objcoupe
            });
          }
        },
        fail: function (msg) {
          console.log("调用AddUserCard失败：" + JSON.stringify(msg));
          wx.showModal({
            title: '领取失败',
            content: "网络异常，请检查您的网络后重试。",
            showCancel: false
          });
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });

    });
  }, //跳转到外卖小程序
  clickLinka: function () {
    wx.navigateToMiniProgram({
      appId: 'wxc670d51af76192f7',
      path: 'pages/category/category',
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
  },
  /**会员权益说明弹框 */
  clickRight: function () {
    var that = this;
    that.setData({
      isRight: true
    })
  },
  /**新人礼包 2018.05.21 */
  GetGiftBagActivity: function (cityName) {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      // var user = myjCommon.getCurrentUser()
      if (!user.isLogin) { return }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetGiftBagActivity",
        biz: {
          sessionId: user.sessionId,
          channel: 1,
          provinceName: app.currProvince,
          cityName: cityName
        },
        success: function (res) {
          console.log("礼包：" + JSON.stringify(res));
          if (res.Code == "0") {
            var jumpBool = false;
            if (res.Result[0].GiftActivityId > 0) {
              jumpBool = true;
            }
            that.setData({
              isBag: false,
              isBagsucess: true,
              isBagsucessImg: res.Result[0].ImageUrl,
              isjump: jumpBool,
              jumpurl: res.Result[0].PrizeProgramUrl
            });
          }
        },
        fail: function (msg) {
          console.log("礼包加载失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          console.log("礼包加载完成：" + JSON.stringify(res));
        }
      });

      //新人送积分 先注释
      that.GivingNewMemberGC(cityName, user.sessionId);
    });
  },
  /**加载首页7个模块 2019.07.15 */
  GetMemberIndexModules: function () {
    var that = this;
    // myjCommon.getLoginUser(function (user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }
    var user = myjCommon.getCurrentUser()
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMemberIndexModules",
      biz: {
        provinceName: app.currProvince
      },
      success: function (res) {
        console.log("首页模块：" + JSON.stringify(res));
        if (res.Code == "0") {
          that.setData({
            moduleList: res.Result
          })
        }
      },
      fail: function (msg) {
        console.log("首页模块：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
    // });
  },
  urlJump: function () {
    wx.navigateToMiniProgram({
      appId: 'wx55595d5cf709ce79',
      path: this.data.jumpurl,
      envVersion: 'release',
      success(res) { }
    });
  },
  //点击会员尊享：查看更多跳转到会员资讯页面
  locationToMas: function () {
    wx.reLaunch({
      url: '../member_zx/member_zx'
    })
  },
  locationProm: function (event)         //<-----刘秋芳 2017- 12 - 21 增加广告跳转网页功能-->
  {
    var that = this;
    //类型： 1：不跳转 2：跳转小程序 3：跳转频道页  4：跳转链接
    var typeid = event.currentTarget.dataset.ptype;//1：不跳转 2：跳转小程序 3：跳转频道页  4：跳转链接
    var appid = event.currentTarget.dataset.appid;
    //频道链接
    var channelid = event.currentTarget.dataset.channelid;
    //网页链接
    var bannerUrl = event.currentTarget.dataset.jumpurl;
    //跳转页面路径
    var url = event.currentTarget.dataset.url;

    if (typeid == 4) {
      wx.navigateTo({
        url: '../bannerWeb/bannerWeb?bannerUrl=' + bannerUrl
      })
    } else if (typeid == 2) {
      if (appid == that.data.currenAppid) //跳转到当前小程序的其他页面
      {
        wx.navigateTo({

          url: url,
        })
      } else //跳转到其他小程序
      {
        wx.navigateToMiniProgram({
          appId: appid,
          path: url,
          envVersion: 'release',
          success(res) {
          }
        });
      }
    } else if (typeid == 3) {
      wx.navigateTo({
        url: '../yhq_channel/yhq_channel?channelId=' + channelid
      })
    }
    that.setData({
      isAdTast: false
    });
  },

  //,wx55595d5cf709ce79
  //跳转到优惠券小程序
  locationCoupe: function () {
    wx.navigateToMiniProgram({
      appId: 'wx4df9ffe1d8f2ad76',
      path: 'pages/yhq_index/yhq',
      envVersion: 'release',
      success(res) {
      }
    })
  },
  //点击“积分换券”跳转到积分兑换页
  locationJifen: function () {
    wx.navigateTo({
      url: '../member_dh/member_dh'
    })
  },
  //点击图文调到详情
  locationDtl: function (event) {
    var id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../member_tw/member_tw?id=' + id
    })
  },
  //关闭弹框
  closeModel: function () {
    var that = this;
    that.setData({
      isShow: false,
      isHave: false,
      isWait: false,
      isRight: false,
      isOnce: false,
      isRunout: false,
      isMemEnjoy: false,
      isBag: false,
      isBagsucess: false,
      isjump: false,
      isGifTask: false,
      isAdTast: false,
      isNoMember: false,
      noMemberTask: false
    })
  },//点击会员卡调到会员卡界面
  OpenCard: function () {
    if (!this.data.currUserInfo) {
      wx.navigateTo({
        url: '../login/login',
      });
      return
    }
    if (this.data.isclicking) {
      return;
    }
    this.data.isclicking = true;

    if (app.currProvince.indexOf('广东') > -1) {
      wx.navigateTo({
        url: '../brandDay/brandDay',
      });
    } else {
      wx.navigateTo({
        url: '../member_barcode/member_barcode',
      });
    }
  },
  //领取会员卡
  getMemberCard: function (e) {
    this.setData({
      isMember: true,
      noMemberTask: false
    });
    myjCommon.logFormId(e.detail.formId);
    //wx.switchTab({ url: "/pages/member_card/index" });
    wx.navigateTo({
      url: '/pages/member_card/index',
    });
  },//跳到“我的积分”
  locationCoin: function (e) {
    if (e.detail.formId != undefined || e.detail.formId != '') {
      myjCommon.logFormId(e.detail.formId);
    }
    var target = e.currentTarget.dataset.target;
    console.log(target)
    if (target == "coupe") {
      wx.reLaunch({
        url: '../member_center/member_center?ttarget=coupe'
      })

    } else if (target == "coin") {
      wx.reLaunch({
        url: '../member_center/member_center?ttarget=coin'
      })
    }
  },
  locationBill: function (e) {
    if (e.detail.formId != undefined || e.detail.formId != '') {
      myjCommon.logFormId(e.detail.formId);
    }
    wx.navigateTo({
      url: '../member_mainbill/member_mainbill',
    });
  },
  /**跳转激活会员卡页面 */
  bindMemberinfo: function () {
    this.setData({
      isbind: false
    });
    wx.reLaunch({
      url: '/pages/member_card/index',
    });
  },
  /**跳转到选择城市页面 */
  changeCity: function () {
    this.setData({
      isSelectCity: false
    });
    wx.navigateTo({
      url: '/pages/yhq_dw/yhq_dw'
    });
  },/**跳到优惠券首页 */
  locationyhq: function () {
    //江苏省、浙江省、上海市 跳到条形码支付页
    if (app.currProvince == "江苏省" || app.currProvince == "浙江省" || app.currProvince == "上海市") {
      this.setData({
        isBagsucess: false
      });
    } else {
      wx.navigateToMiniProgram({
        appId: 'wx55595d5cf709ce79',
        path: '',
        envVersion: 'release',
        success(res) {
        }
      })
    }
  },
  /**点击菜单栏作相应的跳转 或者不跳 */
  menuclick: function (e) {
    //跳转（ 1：不跳转 2：跳转小程序 3：跳转频道页  4：跳转链接）
    var jump = e.currentTarget.dataset.jump;
    //小程序的appid
    var appid = e.currentTarget.dataset.appid;
    //小程序跳转路径
    var pagePath = e.currentTarget.dataset.pagepath;
    //频道id
    var channelPageId = e.currentTarget.dataset.channelpageid;
    //频道页地址或者h5页面地址
    var jumpUrl = e.currentTarget.dataset.jumpurl;


    //跳转小程序
    if (jump == 2) {
      //有配置appid和页面路径，如果没有配置页面路径就直接跳转对应appid的小程序的首页
      if (pagePath != undefined) {

        //判断是否是华东地区并且是抽奖链接
        var fanpaistr = "fanpai_lucky/fanpai_lucky";
        var nineboxstr = "ninebox_lucky/ninebox_lucky";
        // if ((app.currProvince == "上海市" || app.currProvince == "江苏省" || app.currProvince == "浙江省") && pagePath.indexOf(fanpaistr)!=-1)
        if (pagePath.indexOf(fanpaistr) != -1) {
          //获取活动号
          var activityNo = pagePath.substring(pagePath.indexOf('=') + 1);
          wx.removeStorageSync("aid");
          wx.setStorageSync("aid", activityNo);
          wx.navigateTo({
            url: '../components/fanpai_lucky/fanpai_lucky',
          })
          // } else if ((app.currProvince == "上海市" || app.currProvince == "江苏省" || app.currProvince == "浙江省") && pagePath.indexOf(nineboxstr)!=-1)
        } else if (pagePath.indexOf(nineboxstr) != -1) {
          //获取活动号
          var activityNo = pagePath.substring(pagePath.indexOf('=') + 1);
          wx.removeStorageSync("aid");
          wx.setStorageSync("aid", activityNo);
          wx.navigateTo({
            url: '../components/ninebox_lucky/ninebox_lucky',
          })
        }
        else {
          if (appid == this.data.currenAppid) {
            wx.navigateTo({
              url: pagePath,
            });
          } else {
            wx.navigateToMiniProgram({
              appId: appid,
              path: pagePath,
              envVersion: 'release',
              success(res) {
                // 打开成功
              }
            });
          }
        }
      }
    } else if (jump == 3) //跳转频道页
    {
      wx.navigateTo({
        url: '../yhq_channel/yhq_channel?channelId=' + channelPageId
      })
    } else if (jump == 4) //跳转其他页面
    {
      wx.navigateTo({
        url: '../bannerWeb/bannerWeb?bannerUrl=' + jumpUrl
      })
    }
  },
  bindchange: function (e) {
    this.setData({
      current: e.detail.current
    });
  },
  imageLoad: function (e) {
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
    //console.log(imgwidth, imgheight)
    //计算的高度值  
    var viewHeight = 750 / ratio;
    var imgheight = viewHeight
    var imgheights = this.data.imgheights
    //把每一张图片的高度记录到数组里  
    imgheights.push(imgheight)
    this.setData({
      imgheights: imgheights,
    })

  },
  renderBannerDialog: function (event) {
    var that = this;
    //类型： 1：不跳转 2：跳转小程序 3：跳转频道页  4：跳转链接
    var typeid = event.currentTarget.dataset.ptype;
    //typeid=5;
    var bannerUrl = event.currentTarget.dataset.jumpurl;
    //appid
    var appid = event.currentTarget.dataset.appid;
    //跳转页面路径
    var url = event.currentTarget.dataset.url;
    //0：广告图 1：视频
    var bannertype = event.currentTarget.dataset.bannertype;
    //bannertype=1;
    //bannerId
    var bannerId = event.currentTarget.dataset.id;
    //频道id
    var channelid = event.currentTarget.dataset.channelid;
    //优惠券活动号
    var activityNo = event.currentTarget.dataset.couponno;
    //activityNo="9639";
    //bannerId=1;
    //bannertype = 1;
    //bannertype :0广告图 1:视频
    if (bannertype == 0) {
      myjCommon.getLoginUser(function (user) {
        if (!user.isLogin) {
          that.setData({
            isShowUserInfoBtn: true
          });
          return;
        }
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.BannerCount",
          biz: {
            sessionId: user.sessionId,
            bannerId: bannerId
          },
          success: function (res) {
            console.log(res)
          },
          fail: function (msg) {
            console.log("计算浏览人数失败：" + JSON.stringify(msg));
          },
          complete: function (res) { }
        })
        if (typeid > 1) {
          if (typeid == 4) { //跳转到网页
            wx.navigateTo({
              url: '../bannerWeb/bannerWeb?bannerUrl=' + bannerUrl
            })
          } else if (typeid == 3) //频道页
          {
            wx.navigateTo({
              url: '../yhq_channel/yhq_channel?channel=' + channelid
            })
          } else if (typeid == 2) { //跳转到小程序
            if (appid == that.data.currenAppid) //跳转到当前小程序的其他页面
            {
              wx.navigateTo({
                url: url,
              })
            } else //跳转到其他小程序
            {
              if (appid == that.data.currenAppid) {
                wx.navigateTo({
                  url: url,
                })
              } else {
                wx.navigateToMiniProgram({
                  appId: appid,
                  path: url,
                  envVersion: 'release',
                  success(res) { }
                });
              }
            }
          }
          else if (typeid == 5 && activityNo != undefined) //跳转优惠券
          {
            //根据活动号去查找券详情
            myjCommon.callApi({
              interfaceCode: "WxMiniProgram.Service.GetCouponInfo",
              biz: {
                sessionId: user.sessionId,
                id: activityNo
              },
              success: function (res) {
                if (res.Result != null && res.Result.Remark) {
                  WxParse.wxParse('article', 'html', res.Result.Remark, that, 1);
                  that.setData({
                    objcoupe: res.Result,
                    isHowtast: true,
                    adcoupon: true
                  });
                }
              },
              fail: function (msg) {
                console.log("加载失败：" + JSON.stringify(msg));
              },
              complete: function (res) { }
            });

          }
        }
      });

    } else if (bannertype == 2) //悬浮窗
    {
      if (typeid > 1) {
        if (typeid == 4) { //跳转到网页
          wx.navigateTo({
            url: '../bannerWeb/bannerWeb?bannerUrl=' + bannerUrl
          })
        } else if (typeid == 3) //频道页
        {
          wx.navigateTo({
            url: '../yhq_channel/yhq_channel?channel=' + channelid
          })
        } else if (typeid == 2) { //跳转到小程序
          if (appid == that.data.currenAppid) //跳转到当前小程序的其他页面
          {
            wx.navigateTo({
              url: url,
            })
          } else //跳转到其他小程序
          {
            wx.navigateToMiniProgram({
              appId: appid,
              path: url,
              envVersion: 'release',
              success(res) { }
            });
          }
        }

      }
    }
    else if (bannertype == 1) {
      wx.navigateTo({
        url: '../yhq_video/yhq_video?videoId=' + bannerId
      })
    }
  },
  ncloseTast: function () {
    this.setData({
      isSuccessAddCouponByMobile: false,
      isJfCoupons: false,
      couponRemindTast: false
    });
  },
  /**检查当前用户是否有可派发的券如果有根据手机号发券 */
  addCouponByMobile: function () {
    var that = this;
    // myjCommon.getLoginUser(function (user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }
    var user = myjCommon.getCurrentUser()
    if (!user.isLogin) { return }
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.DistributeCouponByMobile",
      biz: {
        sessionId: user.sessionId,
        channel: 1  //1:优惠券小程序；2：会员小程序
      },
      success: function (res) {
        console.log("根据手机号发券")
        console.log(res);
        if (res.Code == "0") {
          if (res.Result != null && res.Result.length > 0) {
            that.setData({
              addCouponByMobileCount: res.Result.length
            }, () => {
              that.setData({
                isSuccessAddCouponByMobile: true
              });
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
      complete: function (res) {
      }
    });
    // });
  },
  /**判断是否是佳纷会员 */
  isJfMember: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.IsJFMember",
        biz: {
          sessionId: user.sessionId
        },
        success: function (res) {
          console.log("判断是否是佳纷会员");
          console.log(res);
        },
        fail: function (msg) {
          console.log("IsJFMember失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  /**佳纷会员  demi 2019.01.07 */
  getJFUserInfo: function () {
    var that = this;
    // myjCommon.getLoginUser(function (user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }
    var user = myjCommon.getCurrentUser()
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.IsJFMember",
      biz: {
        sessionId: user.sessionId
      },
      success: function (res) {
        if (res.Code == "301") {
          that.setData({
            noMemberTask: true
          });
          /**初始化注册会员组件方法 */
          that.regerter1 = that.selectComponent("#regerter");
          that.regerter1.init(that.data.noMemberTask, "wxc94d087c5890e1f8", "member_card");
          return;
        }
        if (res.Result && res.Result.MemberId > 0 && res.Result.StoreCode) {
          that.setData({
            jfUserInfo: res.Result
          });
        } else {
          that.setData({
            ordinaryMember: '普通会员'
          });
        }
      },
      fail: function (msg) {
        console.log("调用GetJFMemberInfo失败" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
    // });
  },

  /**创建人：黎梅芳 */
  /**创建日期：20190418 */
  /**描述： 获取佳纷权益发券信息*/
  getJFGrantCoupon: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetJfMemberGrantCounponCntCurmonth",
        biz: {
          sessionId: user.sessionId
        },
        success: function (res) {
          console.log("获取佳纷权益发券信息")
          console.log(res)
          if (res.Code == "0") {
            if (res.Result != null && res.Result > 0) {
              that.setData({
                isJfCoupons: true
              });
            }
          }

        },
        fail: function (msg) {
          console.log("调用GetJfMemberGrantCounponCntCurmonth失败" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  /**创建人：黎梅芳 */
  /**创建日期：20190513 */
  /**描述：券到账提醒 */
  getCouponsArriveRemind() {
    var that = this;
    // myjCommon.getLoginUser(function (user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }
    var user = myjCommon.getCurrentUser()
    if (!user.isLogin) { return; };
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.CouponsArriveRemindUser",
      biz: {
        sessionId: user.sessionId
      },
      success: function (res) {
        console.log("券到账提醒");
        console.log(res)
        if (res.Code == "0") {
          if (res.Result != null) {
            that.setData({
              couponRemindTast: true,
              couponsRemindInfo: res.Result
            });
          }
        }
      },
      fail: function (msg) {
        console.log("调用CouponsArriveRemindUser失败" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
    // });
  },
  /**创建人：liujiaqi */
  /**创建日期：20190716 */
  /**描述： 点击注册会员*/
  tapRegister() {
    let that = this;
    /**初始化注册会员组件方法 */
    that.setData({
      noMemberTask: true
    });
    that.regerter1 = that.selectComponent("#regerter");
    that.regerter1.init(that.data.noMemberTask, "wxc94d087c5890e1f8", "member_card");
  },
  /**创建人：liujiaqi */
  /**创建日期：20190716 */
  /**描述： 点击首页7个模块跳转（ 1：不跳转 2：跳转小程序 4：跳转链接）*/
  tapModuleList(e) {
    let item = e.target.dataset.item;
    console.log(item);
    if (item) {
      //跳转小程序
      if (item.Jump == 2) {
        //有配置appid和页面路径，如果没有配置页面路径就直接跳转对应appid的小程序的首页
        if (item.PagePath != undefined) {
          if (item.AppId == this.data.currenAppid) { wx.navigateTo({ url: item.PagePath }); return; }
          wx.navigateToMiniProgram({
            appId: item.AppId,
            path: item.PagePath,
            envVersion: 'release',
            success(res) {
            }
          });
        }
      } else if (item.Jump == 4) {//跳转其他页面
        wx.navigateTo({
          url: '../bannerWeb/bannerWeb?bannerUrl=' + item.JumpLink
        })
      }
    }
  },
  //签到
  tapToSign() {
    wx.navigateTo({
      url: '../sign/sign',
    })
  },
  GivingNewMemberGC: function (areaname, sessionid) {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GivingNewMemberGC",
      biz: {
        sessionId: sessionid,
        channel: that.data.channel,
        cityName: areaname,
        provinceName: app.currProvince
      },
      success: function (res) {
        console.log("新人送积分结果：");
        console.log(res);
      },
      fail: function (msg) {
        console.log("新人送积分失败：" + JSON.stringify(msg));
      },
      complete: function (res) { }
    });
  },
  /**关闭券到账提醒弹框*/
  closeRemindTask: function () {
    this.setData({
      couponRemindTast: false
    });
    /**标志已提醒过用户 */
    this.couponsArriveRemind();
  },
  couponsArriveRemind: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.RemoveCouponsArriveRemindCacheByMobile",
        biz: {
          sessionId: user.sessionId
        },
        success: function (res) {
          console.log("关闭券到账提醒弹框");
          console.log(res)
        },
        fail: function (msg) {
          console.log("调用WxMiniProgram.Service.RemoveCouponsArriveRemindCacheByMobile失败" + JSON.stringify(msg));
        },
        complete: function (res) { }
      });
    });
  },
  /**
   * 创建人：袁健豪
   * 创建时间：20191004
   * 描述：验证是否品牌日会员
   */
  checkBrandMember(cityName) {
    let self = this;

    myjCommon.getLoginUser(user => {
      if (!user.isLogin) {
        self.setData({
          isShowUserInfoBtn: true
        });
        wx.hideLoading();
        return;
      }
      myjCommon.callApi({
        interfaceCode: getBrandDayInfo_interface,
        biz: {
          cityName: cityName,
          sessionId: user.sessionId
        },
        success(res) {
          if (res.Code == '-1') {
            self.setData({
              isBrandMember: false
            });
            return;
          }
          let isBrandMember = false;
          res.Result.BrandModels.map((item, i) => {
            if (item.IsOpen == 1) {
              isBrandMember = true;
            }
          });
          self.setData({
            isBrandMember: isBrandMember
          });
        },
        fail(msg) {
          console.log(`调用WxMiniProgram.Service.GetBrandDayInfo失败：${JSON.stringify(msg)}`);
          wx.hideLoading();
        }
      });
    });
  }
})