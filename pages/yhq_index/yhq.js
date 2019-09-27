// pages/yhq_index/yhq.js

var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var WxParse = require('../../wxParse/wxParse.js');
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
import easyRec from '../../utils/easyrec.js'


Page({

  /**
   * 页面的初始数据 650px
   */
  data: {
    defaultAvatar: "../img/default.png",
    userInfo: {
      isLogin: false
    },
    currentType: -1,
    bannerList: [],
    bannerCurrent: 0,
    actBanner: null,
    isShowBannerInfo: false,
    isShowGetCardInfo: false,
    cardTypeList: [],
    barWidth: 345,
    cardList: [],
    pageSize: 10,
    pageIndex: 1,
    isLoading: false,
    isCompleted: false,
    isShowMiniNav: false,
    mainMinHeight: 100,
    isHowtast: false,
    objcoupe: null,
    //banner动态设置高度要不然会变形  
    imgheights: [],
    //图片宽度  
    imgwidth: 750,
    //默认  
    current: 0,
    GiftBag: "", //活动大礼包
    currGiftBagId: "", //当前礼包活动列表Id
    isBag: false,
    isBagsucess: false, //礼包领取成功弹出框
    isBagsucessImg: "", //礼包领取成功弹出框图片
    channel: 1, //投放渠道
    isNoMember: false, //不是会员弹出框 礼包
    //isNoMember:false,//不是会员弹出框 礼包
    isShowUserInfoBtn: false, //button组件获取用户信息
    isSucessTask: false, //领取成功弹出框
    isSelectCity: false, //定位失败提示选择城市弹出框
    cityName: "", //当前所在的城市
    //currCity:"",
    fromApp: 1, //来源：1 优惠券小程序； 2 会员小程序
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP",
    noMemberTask: false,
    LoadingDesc: "加载中，请稍候……",
    locationExpire: false, //是否定位超时
    isLocated: false, //是否定位完成
    isSending: false,
    currAppid: "wx55595d5cf709ce79", //当前小程序的appid
    isbind: false, //是否绑定 2018.05.15 解绑旧账号需求
    noticeobj: null,
    noticeTask: false,
    inputValue: "",
    madewords: "",
    isscan: false,
    searchModel: false,
    /**优惠券小程序首页改版 */
    storeList: [], // 门店列表
    pageIndex: 1,
    pageSize: 10,
    lat: 0, //维度
    lng: 0, //经度
    isShowSelectSore: false, //定位失败弹框选择门店
    currStoreInfo: {
      storeName: '', //门店名称
      storeCode: '', //门店号
      storeAddress: '', //门店地址
      storelat: 0.00, //门店经维度
      storelng: 0.00, //门店经经度
      distance: 0, //门店距离
      province: '' //门店所在省份
    },
    storeGroupList: [],
    serviceItems: [], //服务项目
    groupJsonstr: '',
    clock: '',
    hr: 0, //倒计时：时。分。秒
    minite: 0,
    second: 0,
    scrollHeight: 0, //服务项目滚动的位置
    swiperitcss: "swiper-box",
    istimeoutsys: false,
    ischangestore: false, //标志检测到是否已经切换到最近门店

    //第三期优化 2018.10.10
    crmNo: '',
    isentyGoods: false,
    isnotentyGoods: false,
    seeOthergoodObj: null,
    adcoupon: false, //广告图优惠券弹框区分

    //悬浮窗 2018.10.11
    ballBottom: 240,
    ballRight: 120,
    floatheight: 430, //浮动图标位置
    tuodongheight: 650,
    tuodongwidth: 300,
    showadimginfo: null, //悬浮窗
    isShowopenimg: false, //是否展示开屏图

    //积分换券 2018.10.18
    isEnave: false, //积分不足弹框
    isChange: false, //确认是否兑换弹框
    disabled: false,
    cardinfo: null, //券信息
    deducContent: '',
    forwardCnt: 0,
    /**根据手机号发券 2018.12.26 */
    isSuccessAddCouponByMobile: false,
    addCouponByMobileCount: 0,
    /**开屏礼包 2019.02.20 */
    opengiftbagInfo: null, //开屏礼包活动信息
    opengiftbagCoupons: [], //开屏礼包所包含的券信息
    addOpenscreensucess: false, //是否领取了开屏礼包
    advertList: [], //广告图
    giftNo: 0, //开屏礼包活动号
    isMoreEntance: false,
    isencon: false,
    isShowScreen: false,
    isJfCoupons: false, //是否发放了佳纷会员权益券
    /**券到账提醒 */
    couponRemindTast: false, //券到账提醒弹框
    couponsRemindInfo: null, //券到账提醒内容
    exinteget: false, //积分换券
    storeCompanyCode: '', //门店companycode
    isupdateshop: false, //是否手动更新了门店
    isjump: false, //是否跳转
    isJumpUrl: '',
    storeInfo: null,
    giftStoreTast: false,
    giftStoreImg: '',
    isFromType: false,
    isShowPublicPlug: false,  //是否显示公众号插件
    act_id: '',//是否显示插件 插件id
  },
  testFormSubmit: function(event) {
    console.log(event);
  },
  //切换分类 485 s   560 plus
  switchType: function(event) {
    let that = this;
    //是否是设置显示所有的券 
    var isall = event.currentTarget.dataset.isall;
    var currenttype = event.currentTarget.dataset.type;
    let isGuess = event.currentTarget.dataset.isguess;

    if (isall) {
      currenttype = 0;
    }

    if(isGuess){
      wx.getUserInfo({
        success(e) {
          that.newSwitchType(currenttype);
        }, fail(e) {
          that.data.currentType = currenttype;
          that.data.isFromType = true;
          that.setData({
            isShowUserInfoBtn: true
          });
        }
      });
      // myjCommon.getLoginUser(user=>{
      //   if(!user.isLogin){
          
      //   }
        
      // });
    }else{
      this.newSwitchType(currenttype);
    }
  },
  /**
   * 创建人：袁健豪
   * 创建时间：20190923
   * 描述：将switchType多次调用的代码抽出来封装起来
   */
  newSwitchType(currenttype){
    this.setData({
      currentType: currenttype,
      pageIndex: 1,
      cardList: [],
      isLoading: false,
      isCompleted: false,
      isMoreEntance: false
    });
    // this.loadCardList();
    this.getCouponActivityList(currenttype, this.data.currStoreInfo.storeCode, this.data.groupJsonstr);
    if (currenttype == 126) {
      this.getUserOpenIdBySessionId();
    }
    this.data.isFromType = false;
  },
  //显示banner详情-----刘秋芳 2017- 12 - 21 广告去掉弹框增加跳转（小程序、网页）功能
  renderBannerDialog: function(event) {
    var that = this;
    console.log("点击了")
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
    //bannertype :0广告图 1:视频
    // myjCommon.getLoginUser(function(user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }
    var user = myjCommon.getCurrentUser()
      if (bannertype == 0) {

        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.BannerCount",
          biz: {
            sessionId: user.sessionId,
            bannerId: bannerId
          },
          success: function(res) {
            console.log(res)
          },
          fail: function(msg) {
            console.log("计算浏览人数失败：" + JSON.stringify(msg));
          },
          complete: function(res) {}
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
            if (appid == that.data.currAppid) //跳转到当前小程序的其他页面
            {
              wx.redirectTo({
                url: url,
              })
            } else //跳转到其他小程序
            {
              wx.navigateToMiniProgram({
                appId: appid,
                path: url,
                envVersion: 'release',
                success(res) {}
              });
            }
          } else if (typeid == 5 && activityNo != undefined) //跳转优惠券
          {
            //根据活动号去查找券详情
            that.getBannerCouponInfo(user.sessionId, activityNo);
          }
        }
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
            if (appid == that.data.currAppid) //跳转到当前小程序的其他页面
            {
              wx.redirectTo({
                url: url,
              })
            } else //跳转到其他小程序
            {
              wx.navigateToMiniProgram({
                appId: appid,
                path: url,
                envVersion: 'release',
                success(res) {}
              });
            }
          } else if (typeid == 5 && activityNo != undefined) //跳转优惠券
          {
            //根据活动号去查找券详情
            that.getBannerCouponInfo(user.sessionId, activityNo);
          }
        }
      } else if (bannertype == 1) {
        wx.navigateTo({
          url: '../yhq_video/yhq_video?videoId=' + bannerId
        })
      }
    // });
  },
  /**banner跳转优惠券获取优惠券详情 */
  getBannerCouponInfo(sessionId, activityNo) {
    var that = this;
    var couponinfo = null;
    //根据活动号去查找券详情
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetCouponInfo",
      biz: {
        sessionId: sessionId,
        id: activityNo
      },
      success: function(res) {
        if (res.Result != null) {
          couponinfo = res.Result;
          WxParse.wxParse('article', 'html', couponinfo.Remark, that, 1);
          that.setData({
            objcoupe: couponinfo,
            isHowtast: true,
            adcoupon: true
          });
        }
      },
      fail: function(msg) {
        console.log("加载失败：" + JSON.stringify(msg));
      },
      complete: function(res) {}
    });
  },

  closeBannerDialog: function() {
    this.setData({
      isShowBannerInfo: false,
      actBanner: null
    });
  },
  //取得卡片信息
  getCardInfo: function(cardId) {
    var list = this.data.cardList;
    var obj;
    for (var i = 0; i < list.length; i++) {
      obj = list[i];
      if (obj.Id == cardId) {
        break;
      }
    }
    return obj;
  },

  //领取卡片
  getCard: function(event) {
    /**记录fromid */
    console.log("fromid:" + event.detail.formId)
    if (event.detail.formId != undefined || event.detail.formId != '') {
      myjCommon.logFormId(event.detail.formId);
    }
    if (this.data.isSending) {
      return;
    }
    this.data.isSending = true;
    var that = this;
    var cardId = event.detail.target.dataset.cardid;
    var formId = event.detail.formId;
    var cardInfo = null;
    if (that.data.adcoupon) {
      cardInfo = that.data.objcoupe;
    } else {
      cardInfo = that.getCardInfo(cardId);
    }

    //劵类型 0：支付劵 1：优惠劵 2：广告区
    var coupontype = event.detail.target.dataset.coupontype;
    // 跳转方式：跳转小程序，跳转频道页，跳转链接
    var jump = event.detail.target.dataset.jump;
    //跳转小程序的Appid
    var appid = event.detail.target.dataset.appid;
    //跳转小程序的页面路径
    var pagepath = event.detail.target.dataset.pagepath;
    if (pagepath != undefined) {
      pagepath = pagepath.trim();
    }

    //频道Id
    var channelpageId = event.detail.target.dataset.channelpageid;
    //跳转网页链接
    var bannerUrl = event.detail.target.dataset.jumplink;
    //console.log(cardInfo.CardStatus)
    if (cardInfo.CardStatus != "立即领取") {
      this.data.isSending = false;
      return;
    }
    if (coupontype == 2) { //广告区
      that.data.isSending = false;
      if (jump == "跳转小程序") {
        if (appid == that.data.currAppid) //跳转到当前小程序的其他页面
        {
          wx.reLaunch({
            url: pagepath,
            success: function() {
              console.log("success")
            }
          })
        } else //跳转到其他小程序
        {
          wx.navigateToMiniProgram({
            appId: appid,
            path: pagepath,
            envVersion: 'release',
            success(res) {}
          });
        }

      }
      if (jump == "跳转频道页") {
        that.setData({
          isHowtast: false
        });
        wx.navigateTo({
          url: '../yhq_channel/yhq_channel?channel=' + channelpageId
        })
      }
      if (jump == "跳转链接") {
        that.setData({
          isHowtast: false
        });
        wx.navigateTo({
          url: '../bannerWeb/bannerWeb?bannerUrl=' + bannerUrl
        })
      }
    } else {
      wx.showLoading({
        title: '正在提交……',
        mask: true
      });
      var that = this;
      myjCommon.getLoginUser(function(user) {
        if (!user.isLogin) {
          that.setData({
            isShowUserInfoBtn: true
          });
          wx.hideLoading();
          that.data.isSending = false;
          return false;
        }

        var mflag = "0";

        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.AddUserCard",
          biz: {
            cardId: cardId,
            sessionId: user.sessionId,
            mflag: mflag,
            source: 1,
            formId: formId
          },
          success: function(res) {
            if (res.Code == "0") {
              if (cardInfo.GiftType == 2) //兑换码
              {
                wx.showModal({
                  title: '领取成功',
                  content: '请在美宜佳会员小程序--积分换券--礼品的“兑换记录”查看您的兑奖码',
                  showCancel: false
                });
                that.setData({
                  isHowtast: false
                });
              } else {
                that.setData({
                  isSucessTask: true,
                  isHowtast: false

                });
              }
            } 
            // else if (res.Code == "300") {
            //   wx.navigateTo({
            //     url: '../login/login',
            //   });
            // } 
            else if (res.Code == "301") {
              //非会员
              that.setData({
                isShowGetCardInfo: true,
                isHowtast: false
              });
            } else if (res.Code == "4014") {
              that.setData({
                isbind: true
              });
              /*
              wx.showModal({
                title: '提示',
                content: res.Msg,
                showCancel: false,
                complete: function () {
                  wx.reLaunch({
                    url: '/pages/member_card/index',
                  });
                }
              });*/
            } else {
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
                cardList: that.data.cardList,
                objcoupe: that.data.objcoupe
              });
            }
          },
          fail: function(msg) {
            console.log("优惠券领取失败：" + JSON.stringify(msg));
            wx.showModal({
              title: '领取失败',
              content: "目前太多人了﹋o﹋请稍后再试!!",
              showCancel: false
            });
          },
          complete: function(res) {
            that.data.isSending = false;
            wx.hideLoading();
          }
        });

      });
    }
  },
  /**积分换券 */
  intergalex: function(event) {
    /**记录fromid */
    if (event.detail.formId != undefined || event.detail.formId != '') {
      myjCommon.logFormId(event.detail.formId);
    }
    //获取券信息
    let cardinfo = event.detail.target.dataset.cardinfo;
    //1、弹出确认是否兑换弹框
    this.setData({
      isHowtast: false,
      isChange: true,
      cardinfo: cardinfo,
      deducContent: '兑换此券需抵扣' + cardinfo.Integral + '积分\n\t请确认是否抵扣？'
    });
  },
  /**确认兑换 */
  yesExcange: function(e) {
    //2、是-检查积分是否足够
    //3、足够-兑换
    var that = this;
    if (that.data.exinteget) {
      wx.showToast({
        title: '正在兑换中...请勿重复操作哦',
        icon: 'none'
      });
      return;
    } else {
      that.setData({
        exinteget: true
      });
    }
    myjCommon.getLoginUser(
      function(user) {
        if (!user.isLogin) {
          wx.showModal({
            title: '提示',
            content: '登录失败，晴稍后重试。',
            showCancel: false
          });
          that.setData({
            disabled: false
          });
          return;
        }
        var cardInfo = that.data.cardinfo;
        // var cardInfo = that.getCardInfo(that.data.cardinfo.Id); //根据id获取券对象
        if (cardInfo == null) {
          wx.showModal({
            title: '提示',
            content: '兑换暂不能兑换，请稍后再来兑换哦！',
            showCancel: false
          });
        } else {
          //开始兑换
          myjCommon.callApi({
            interfaceCode: "WxMiniProgram.Service.GCChangeMPCoupon",
            biz: {
              sessionId: user.sessionId,
              cardId: that.data.cardinfo.Id,
              GCCnt: that.data.cardinfo.Integral,
              source: 1, //1 优惠券小程序；2 会员小程序
              cityName: that.data.currStoreInfo.province,
              formId: that.data.formId
            }, //source:来源：1 优惠券小程序；2 会员小程序  formId:表单Id
            success: function(res) {
              console.log(res)
              if (res.Code == "301") //非会员
              {
                that.setData({
                  isNoMember: true
                });
              } else if (res.Code == "306") //金币不够
              {
                that.setData({
                  isEnave: true,
                  isChange: false
                });

              } else if (res.Code == "0") //兑换成功
              {
                if (cardInfo.GiftType == 2) //兑换码
                {
                  that.setData({
                    isHowtast: false,
                    isChange: false
                  });
                  wx.showModal({
                    title: '领取成功',
                    content: '请在美宜佳会员小程序--积分换券--礼品的“兑换记录”查看您的兑奖码',
                    showCancel: false
                  });

                } else //非兑换码
                {
                  that.setData({
                    isSucessTask: true,
                    isChange: false,
                    isHowtast: false,
                    isChange: false
                  });
                }

                if (parseInt(res.Result) <= 0) {
                  cardInfo.CardStatus = "已领取";
                  if (that.data.objcoupe != null && that.data.objcoupe.Id == cardInfo.Id) {
                    that.data.objcoupe.CardStatus = "已领取";
                  }
                  that.setData({
                    cardList: that.data.cardList,
                    objcoupe: that.data.objcoupe
                  });
                }
              } else //已达到领取上限 ||  对不起，券已被抢光 || 卡券活动不存在或已被删除
              {
                that.setData({
                  isHowtast: false,
                  isChange: false
                });
                wx.showModal({
                  title: '领取提示',
                  content: res.Msg
                })
              }
            },
            fail: function(msg) {
              console.log("GCChangeMPCoupon失败：" + JSON.stringify(msg));
              that.setData({
                isChange: false,
                disabled: false,
                exinteget: false
              });
              wx.showModal({
                title: '温馨提示',
                content: '系统出错了，请稍后再来兑换。',
                showCancel: false
              });
            },
            complete: function(res) {
              that.setData({
                disabled: false,
                exinteget: false
              });

            }
          });
        }

      }
    );
  },
  //关闭会员卡对话框
  closeGetCardModal: function() {
    this.setData({
      isShowGetCardInfo: false
    });
  },
  //领取会员卡
  getMemberCard: function(e) {
    this.setData({
      noMemberTask: false
    });
    myjCommon.logFormId(e.detail.formId);
    //wx.switchTab({ url: "/pages/member_card/index" });
    wx.reLaunch({
      url: '/pages/member_card/index',
    })
  },
  //点击查看卡券信息
  opencoupe: function(event) {
    var that = this;
    var id = event.currentTarget.dataset.id; //主键id
    var coupon = null;
    var vibid = event.currentTarget.dataset.vibid;//crm活动号
    var target = 'yhq';
    if (id <= 0 || id == null) {
      target = 'crm'
      id = vibid;
    }
    for (var i = 0; i < this.data.cardList.length; i++) {
      var obj = this.data.cardList[i];
      if (obj.Id == id) {
        coupon = obj;
        break;
      }
    }
    if (coupon != null && coupon.Remark) {
      WxParse.wxParse('article', 'html', coupon.Remark, that, 1);
      that.setData({
        objcoupe: coupon,
        isHowtast: true
      });
      return;
    }
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetCouponRemark",
      biz: {
        id: id,
        target: target
      },
      success: function(res) {
        if (coupon != null) {
          coupon.Remark = res.Result;
        }
        WxParse.wxParse('article', 'html', res.Result, that, 1);
        that.setData({
          objcoupe: coupon,
          isHowtast: true
        })
      },
      fail: function(msg) {
        console.log("加载失败：" + JSON.stringify(msg));
      },
      complete: function(res) {}
    });

    /*
    var article = '';
    var id = event.currentTarget.dataset.id; //主键id
    var coupe = null;
    for (var i = 0; i < this.data.cardList.length; i++) {
      var obj = this.data.cardList[i];
      if (obj.Id == id) {
        coupe = obj;
        article = obj.Remark;
        break;
      }
    }
    if (article == null) {
      article = "";
    }
    WxParse.wxParse('article', 'html', article, this, 1);
    var that = this;
    that.setData({
      objcoupe: coupe,
      isHowtast: true
    });
    */
  },
  //关闭提示框
  closeTask: function(e) {
    myjCommon.logFormId(e.detail.formId);
    var that = this;
    that.setData({
      objcoupe: null,
      isHowtast: false,
      isBagsucess: false,
      isBag: false,
      isNoMember: false,
      isSucessTask: false,
      noMemberTask: false,
      isbind: false,
      isnotentyGoods: false,
      isentyGoods: false,
      isChange: false
    });
  },
  /**关闭开屏图 */
  closeshowoimg: function() {
    this.setData({
      isShowopenimg: false,
      isShowScreen: false,
      opengiftbagInfo: null, //开屏礼包活动信息
      opengiftbagCoupons: [], //开屏礼包所包含的券信息
      addOpenscreensucess: false //是否领取了开屏礼包
    });
  },
  /**积分换券关闭框 */
  ncloseTast: function() {
    this.setData({
      isEnave: false,
      isSuccessAddCouponByMobile: false,
      isJfCoupons: false
    });
  },
  getUserInfoBtnClick: function(e) {
    var that = this;
    if (e.detail.errMsg == "getUserInfo:ok") {
      // that.getUserLocationInfo();
      // wx.reLaunch({
      //   url: '/pages/yhq_index/yhq',
      // })
      // that.loadconfig();
      wx.getUserInfo({
        success: function (e) {
          that.setData({
            isShowUserInfoBtn: false
          });

          if (that.data.isFromType == true) {
            // setTimeout(that.newSwitchType, 500, that.data.currentType)
            that.newSwitchType(that.data.currentType);
          } else {
            that.loadconfig();
          }
        }
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setData({
      currentType: -1,
      pageIndex: 1,
      cardList: [],
      serviceItems: [],
      isLoading: true,
      isCompleted: false,
      LoadingDesc: "载入中，请稍候……",
      isLocated: false,
      locationExpire: false,
      searchModel: false,
      // isShowopenimg: false,
      /**优惠券首页改版 */
      storeList: [], // 门店列表
      storeIndex: 1,
      storeSize: 10,
      cardinfo: false,
      advertList: [],
      bannerList: [],
      isMoreEntance: false,
      isupdateshop: false, //是否手动更新了门店
      forwardinfo: null,
      giftStoreTast: false
    });
    /**获取转发管理配置 */
    var forward = wx.getStorageSync("forward");
    if (forward != "") {
      that.setData({
        forwardCnt: forward.ForwardCnt,
        forwardinfo: forward
      });
    }

    
    //that.loadDatainfo(); 

    console.log("onload")
    console.log(options);
    if (options.clstore)//美宜佳铺子跳过来
   {
     //重新加载该门店信息
      this.GetCouponIndexData(options.clstore, 0, 0);
    } else {
      that.loadconfig();
    }
    // that.addCouponByMobile();
    wx.getSystemInfo({
      success: function(res) {
        if (res.screenWidth > 320) //iphone5以上的手机
        {
          that.setData({
            floatheight: 475,
            tuodongwidth: (res.screenWidth - 75)
          });
        } else {
          that.setData({
            floatheight: 375,
            tuodongwidth: (res.screenWidth - 95)
          });
        }
        that.setData({
          tuodongheight: (res.screenHeight - 170),

        });
      }

    });

    this.showPublicPlug();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    console.log("onReady");
    if (app.globalData.loginUser.sessionId && app.hwBus) {
      console.log("game init 4:", app.globalData.loginUser);
      app.hwBus.emit('init', true);
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    console.log("onshow")
    this.data.isSending = false;
    this.notice(); //系统维护公告
    var storeinfo = wx.getStorageSync("storeinfo");
    var map = wx.getStorageSync("map");
    /**优惠券到账提醒 */
    this.getCouponsArriveRemind();
    if (storeinfo && this.data.isupdateshop) {//选择门店之后返回首页
       this.setData({
      groupJsonstr :'',
      currentType :-1,
        pageIndex :1,
        cardList : [],
        serviceItems : [],
        isLoading : true,
        isCompleted : false,
        LoadingDesc : "载入中，请稍候……",
        isLocated : false,
        locationExpire : false,
        searchModel : false,
        // isShowopenimg: false,
        /**优惠券首页改版 */
        storeList : [], // 门店列表
        storeIndex : 1,
        storeSize :10,
        cardinfo : false,
        advertList : [],
        bannerList : [],
         isupdateshop:false
       });
      if (storeinfo.storeCode && ((storeinfo.storelat && storeinfo.storelng) || storeinfo.storelat >= 0 || storeinfo.storelng >= 0)) {
        if (storeinfo.province == "广东省") {//广东省加载静态文件
          this.loadStaticIndexData(storeinfo.storeCode, storeinfo.companycode, storeinfo.storelat, storeinfo.storelng)
        } else {
          //重新加载该门店信息
          this.GetCouponIndexData(storeinfo.storeCode, storeinfo.storelat, storeinfo.storelng);
        }
      } else {
        this.setData({
          isShowSelectSore: true
        });
      }
    } else if (storeinfo && map) {//选择地图页返回首页
      if (storeinfo.storeCode && storeinfo.storelat > 0 && storeinfo.storelng > 0) {
        this.setData({
          currentType: -1,
          pageIndex: 1,
          cardList: [],
          serviceItems: [],
          isLoading: true,
          isCompleted: false,
          LoadingDesc: "载入中，请稍候……",
          isLocated: false,
          locationExpire: false,
          searchModel: false,
          // isShowopenimg: false,
          /**优惠券首页改版 */
          storeList: [], // 门店列表
          storeIndex: 1,
          storeSize: 10,
          cardinfo: false,
          advertList: [],
          bannerList: [],
          isupdateshop: false
        });
        if (storeinfo.province == "广东省") {
          this.loadStaticIndexData(storeinfo.storeCode, storeinfo.companycode, storeinfo.storelat, storeinfo.storelng)
        } else {
          //重新加载该门店信息
          this.GetCouponIndexData(storeinfo.storeCode, storeinfo.storelat, storeinfo.storelng);
        }
      } else {
        this.setData({
          isShowSelectSore: true
        });
      }
    }
    if (app.globalData.isYhqIndex) //登录页回来重新加载信息
    {
      this.loadconfig();
    }

    //调用“扫一扫的时候会再执行onshow事件这样又会去重新定位一次  所以再这里加个判断 2017.7.11 
    // if (this.data.isscan) {
    //   this.loadDatainfo();
    // } else {
    //   this.getUserLocationInfo(); //定位信息
    // }

  },
  /**公告 */
  notice: function() {
    var that = this;
    wx.request({
      url: 'https://mimage.myj.com.cn/MicroMallFileServer/update.js?t=' + new Date().getTime().toString(),
      data: {},
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success: function(res) {
        console.log(res.data);
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].Pages == "home" && res.data[i].Upgrade == 1) {
            that.setData({
              noticeobj: res.data[i],
              noticeTask: true
            });
            break;
          } else {
            continue;
          }
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    console.log("onHide");
    this.data.isSending = false;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    console.log("onUnload");
    this.data.isSending = false;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    //console.log("下拉");
  },
  onPageScroll: function(obj) {
    //console.log(obj);
    if (obj.scrollTop > 335 && !this.data.isShowMiniNav) {
      this.setData({
        isShowMiniNav: true
      });
    } else if (obj.scrollTop < 335 && this.data.isShowMiniNav) {
      this.setData({
        isShowMiniNav: false
      });
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function(event) {
    if (this.data.isCompleted) {
      return;
    }
    this.data.pageIndex++;
    this.getCouponActivityList(this.data.currentType, this.data.currStoreInfo.storeCode, this.data.groupJsonstr);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    if (that.data.forwardinfo != null) {
      return {
        title: that.data.forwardinfo.ForwardTitle,
        path: that.data.forwardinfo.PageUrl,
        imageUrl: that.data.forwardinfo.ImageUrl,
        success: (res) => {
          that.setData({
            forwardCnt: (that.data.forwardCnt + 1)
          }, () => {
            //记录转发次数
            that.updateForwardCnt(that.data.forwardinfo.Id, that.data.forwardCnt);
          });
        }
      }
    }
  },
  updateForwardCnt: function(fid, forwardCnt) {
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.AddForwardCnt",
      biz: {
        id: fid,
        forwordcnt: forwardCnt
      },
      success: function(res) {},
      fail: function(msg) {
        console.log(" 记录分享次数AddForwardCnt失败：" + JSON.stringify(msg));
      },
      complete: function(res) {}
    });
  },
  //弹出礼包活动 
  GetGiftBagActivity: function(areaname) {
    var that = this;
    // myjCommon.getLoginUser(function(user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }
    var user = myjCommon.getCurrentUser()
    if (!user.isLogin) { return} ;
      app.globalData.loginUser.sessionId = user.sessionId;
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetGiftBagActivity",
        biz: {
          sessionId: user.sessionId,
          channel: that.data.channel,
          cityName: areaname,
          provinceName: app.currProvince
        },
        success: function(res) {
          //console.log("礼包：" + JSON.stringify(res));
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
          // else if (res.Code == "300") {
          //   wx.navigateTo({
          //     url: '../login/login',
          //   });
          // }
        },
        fail: function(msg) {
          console.log("礼包加载失败：" + JSON.stringify(msg));
        },
        complete: function(res) {
          console.log("礼包加载完成：" + JSON.stringify(res));
        }
      });
      //新人送积分 先注释
      //that.GivingNewMemberGC(areaname, user.sessionId);currStoreInfo: {
      if (that.data.currStoreInfo && that.data.currStoreInfo.storeCode) {
        that.GivingGifbagByStore(user.sessionId, that.data.currStoreInfo.storeCode);
      }
    // });
  },
  GivingNewMemberGC: function(areaname, sessionid) {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GivingNewMemberGC",
      biz: {
        sessionId: sessionid,
        channel: that.data.channel,
        cityName: areaname,
        provinceName: app.currProvince
      },
      success: function(res) {
        console.log("新人送积分结果：");
        console.log(res);
      },
      fail: function(msg) {
        console.log("新人送积分失败：" + JSON.stringify(msg));
      },
      complete: function(res) {}
    });
  },
  urlJump: function() {
    if (this.data.isjump) {
      wx.navigateTo({
        url: this.data.jumpurl,
      });
    }
  },
  imageLoad: function(e) {
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
  bindchange: function(e) {
    this.setData({
      current: e.detail.current
    })
  },

  //查询当前用户有没有定位记录：有直接读取；没有则定位
  getUserLocationInfo: function() {
    var that = this;
    var demo = new QQMapWX({
      key: that.data.key // 必填
    });
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }

      if (app.currCity != undefined && app.globalData.loginUser.sessionId != "" && app.globalData.loginUser.isMember) //全局已经存在城市
      {
        that.setData({
          cityName: app.currCity
        });
        that.GetGiftBagActivity(app.currCity);

        /**查看是否有活动佳纷会员权益的券 */
        //that.getJFGrantCoupon();
        if (app.hwBus) {
          console.log("game init 1:", app.globalData.loginUser);
          app.hwBus.emit('init', true);
        }
      } else //如果不存在则查询定位记录
      {
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.GetUserLocationInfo",
          biz: {
            sessionId: user.sessionId,
            fromApp: that.data.fromApp
          },
          success: function(res) {
            if (res.City != null) {
              that.setData({
                cityName: res.City
              });
              app.currCity = res.City;
              app.latitude = res.Latitude;
              app.longitude = res.Longitude;
              app.currProvince = res.Province;
              //记录全局用户信息
              app.globalData.loginUser.sessionId = user.sessionId;
              app.globalData.loginUser.isLogined = true;
              app.globalData.loginUser.isMember = res.MemberId > 0;
              app.globalData.loginUser.province = res.Province;
              app.globalData.loginUser.city = res.City;
              if (app.hwBus) {
                console.log("game init 2:", app.globalData.loginUser);
                app.hwBus.emit('init', true);
              }
              that.GetGiftBagActivity(app.currCity);
              /**查看是否有活动佳纷会员权益的券 */
              //that.getJFGrantCoupon();
            } else //定位 记录到表里
            {
              that.setData({
                LoadingDesc: "定位中，请稍候……"
              });
              setTimeout(function() {
                if (!that.data.isLocated) {
                  that.data.locationExpire = true
                }
              }, 10000);
              wx.getLocation({
                type: 'wgs84',
                success: function(res) {
                  if (that.data.locationExpire) {
                    return;
                  }
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
                    success: function(res) {
                      if (that.data.locationExpire) {
                        return;
                      }
                      that.setData({
                        isLocated: true,
                        cityName: res.result.address_component.city,
                        LoadingDesc: "加载中，请稍候……"
                      });
                      app.currCity = res.result.address_component.city;
                      app.currProvince = res.result.address_component.province;
                      app.latitude = res.result.address_component.latitude;
                      app.longitude = res.result.address_component.longitude;
                      //记录全局用户信息
                      console.log("用户定位信息：", res);
                      app.globalData.loginUser.sessionId = user.sessionId;
                      app.globalData.loginUser.isLogined = true;
                      app.globalData.loginUser.isMember = true;
                      app.globalData.loginUser.province = res.result.address_component.province;

                      app.globalData.loginUser.city = res.result.address_component.city;
                      if (app.hwBus) {
                        console.log("game init 3:", app.globalData.loginUser);
                        app.hwBus.emit('init', true);
                      }
                      that.GetGiftBagActivity(app.currCity);
                      /**查看是否有活动佳纷会员权益的券 */
                      // that.getJFGrantCoupon();
                      //调用保存接口把定位信息保存到表里
                      myjCommon.callApi({
                        interfaceCode: "WxMiniProgram.Service.UpdateUserLocation",
                        biz: {
                          sessionId: user.sessionId,
                          city: that.data.cityName,
                          lat: latitude,
                          lng: longitude,
                          fromApp: that.data.fromApp
                        },
                        success: function(res) {
                          if (res.Code == "301") {
                            app.globalData.loginUser.isMember = false;
                          }
                          //当旧账号解绑的时候业务要求不弹出“马上成为会员”弹框 4014是已经解 2018.05.15
                          if (user.lastErrorCode != "4014") {
                            if (res.Code == "301") {
                              that.setData({
                                noMemberTask: true
                              });
                            }
                          }

                        },
                        fail: function(res) {},
                        complete: function(res) {}
                      });
                    },
                    fail: function(res) {},
                    complete: function(res) {

                    }
                  });
                },
                fail: function(res) {},
                complete: function(res) {}
              });
            }
          },
          fail: function(msg) {},
          complete: function(res) {}
        });
      }
    });
  },

  //切换当前城市：跳转到选择城市列表
  changeCity: function() {
    this.setData({
      isSelectCity: false
    });
    wx.navigateTo({
      url: '../yhq_dw/yhq_dw?target=index'
    })
  },
  bindMemberinfo: function() {
    wx.reLaunch({
      url: '/pages/member_card/index',
    });
  },


  /**优惠券首页改版 2018.08.10 */
  /**加载门店信息 */
  loadDatainfo: function() {
    var that = this;
    that.setData({
      cardList: [],
      pageSize: 10,
      pageIndex: 1,
      isCompleted: false
    });
    that.setData({
      isShowUserInfoBtn: false
    });
    //读取缓存门店数据  如果存在则先加载缓存门店的信息
    var storeinfo = wx.getStorageSync("storeinfo");
    if (storeinfo != '') {
      that.setData({
        currStoreInfo: storeinfo
      });
      that.GetCouponIndexData(storeinfo.storeCode, storeinfo.storelat, storeinfo.storelng);

    } else //定位获取数据
    {
      that.locationStore();
    }
  },
  /**获取当前门店信息 */
  locationStore: function() {
    var that = this;
    /**获取当前地理位置 */
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        /**纬度 */
        var latitude = res.latitude;
        /**经度 */
        var longitude = res.longitude;

        that.GetCouponIndexData("", latitude, longitude);
      },
      fail: function(res) {
        console.log("定位失败");
        that.setData({
          isShowSelectSore: true
        });
      },
      complete: function() {}
    });
  },
  /**定位获取当前所在经纬度，根据经纬度去获取banner、广告涂、优惠券分类、服务项目、门店信息 */
  loadconfig: function() {
    var that = this;
    /**判断缓存里面有没有值 */
    var timestap = Date.parse(new Date());
    var expretimebanner = wx.getStorageSync("banner");
    var bannerdata = wx.getStorageSync("bannerdata");
    var cardtype = wx.getStorageSync("cardTypeList");
    var keyword = wx.getStorageSync("searchkeyword");
    //var storeinfo = wx.getStorageSync("storeinfo");
    var storeinfo = wx.getStorageSync("newstoreinfo");
    var ismember = wx.getStorageSync("ismember");

    if(storeinfo){ //获取优惠券插件
      that.data.storeInfo = storeinfo
      that.getCouponPlus()
    }

    //广东省走静态文件
    if (bannerdata && cardtype && expretimebanner < timestap) {
      if (storeinfo && storeinfo.StoreCode && storeinfo.BaiDuWeiDu && storeinfo.BaiDuJinDu) {
        if (storeinfo.Province == "广东省") //走静态文件
        {
          this.loadStaticIndexData(storeinfo.StoreCode, storeinfo.CompanyCode, storeinfo.BaiDuWeiDu, storeinfo.BaiDuJinDu);
        } else //还是走原来的逻辑
        {
          that.GetCouponIndexData(storeinfo.StoreCode, storeinfo.BaiDuWeiDu, storeinfo.BaiDuJinDu);
        }

      } else {
        wx.getLocation({
          type: 'gcj02',
          success: function(res) {
            /**纬度 */
            var latitude = res.latitude;
            /**经度 */
            var longitude = res.longitude;
            //调勇哥新写的获取用户最近的门店接口
            that.getUserNearyStore(latitude, longitude);
            //that.GetCouponIndexData("", latitude, longitude);
          },
          fail: function() {
            //让用户手动去选择门店
            /**定位失败 */
            wx.showModal({
              title: '温馨提示',
              content: '你的位置信息获取不到，请手动选择离你最近的门店信息',
              showCancel: false,
              success(res) {
                /**点击确定开启定位 */
                that.setData({
                  isShowSelectSore: true
                });
              }
            });
          },
          complete: function() {}
        });
      }
    } else {

      //如果是广东就静态化，非广东还是走原来的
      if (storeinfo.Province == "广东省") //走静态文件
      {
        that.setData({
          storeCompanyCode: storeinfo.CompanyCode
        })
        that.loadStaticIndexData(storeinfo.StoreCode, storeinfo.CompanyCode, storeinfo.BaiDuWeiDu, storeinfo.BaiDuJinDu);
      } else //还是走原来的逻辑
      {
        /**读取缓存的 */
        if (bannerdata && !that.data.isupdateshop) {
          // 0：广告图 1：视频 2:悬浮窗
          //筛选出悬浮窗
          var floatinfo = bannerdata.filter(item => item.BannerType == 2);
          //筛选出banner图
          var bannelist = bannerdata.filter(item => item.BannerType == 0 && item.Channel == 0);
          //筛选出广告图
          var advertList = bannerdata.filter(item => item.BannerType == 0 && item.Channel == 32);
          that.setData({
            bannerList: bannelist,
            showadimginfo: floatinfo,
            bannerCurrent: 0,
            advertList: advertList,
            current: 0
          });
          if (floatinfo.length > 0) {
            that.setData({
              showadimginfo: floatinfo
            });

            var otimestap = new Date().toLocaleString().substring(0, 10);
            var hctimestap = wx.getStorageSync('cdate');
            if (hctimestap != otimestap) //如果不是同一天就弹出 开屏图一天只弹一次 并且是当天的第一次进来就弹
            {
              if (that.data.showadimginfo[0].ShowType == 2 || that.data.showadimginfo[0].ShowType == 3) { //展示方式[1:展示悬浮图;2:展示开屏图;3:展示悬浮图和开屏图]

                if (that.data.showadimginfo[0].ShowType == 2) {
                  that.setData({
                    giftNo: that.data.showadimginfo[0].ActivityNo,
                    isShowScreen: true
                  });
                  // that.getopenScreenGiftBag();
                  var otimestap = new Date().toLocaleString().substring(0, 10);
                  wx.setStorageSync('cdate', otimestap); //标志缓存的时候
                } else {
                  that.setData({
                    isShowopenimg: true
                  });
                  var otimestap = new Date().toLocaleString().substring(0, 10);
                  wx.setStorageSync('cdate', otimestap); //标志缓存的时候
                }

              }
            }
          }

          /**读取优惠券分类缓存 */
          var cardTypeList = wx.getStorageSync("cardTypeList");
          if (cardTypeList != '') {
            if (cardTypeList.length > 0) {
              var typeid = cardTypeList[0].Id;
              if (cardTypeList[0].IsAll) {
                typeid = 0;
              }
              that.setData({
                cardTypeList: cardTypeList,
                currentType: typeid
              });

            } else {
              that.setData({
                cardTypeList: [],
                currentType: -1
              });
            }
          }

          if (storeinfo) {
            //门店信息
            that.setData({
              currStoreInfo: {
                storeName: storeinfo.StoreName,
                storeCode: storeinfo.StoreCode,
                storeAddress: storeinfo.Province + storeinfo.City + storeinfo.Town + storeinfo.DetailAddr,
                storelat: storeinfo.GaoDeWeiDu,
                storelng: storeinfo.GaoDeJinDu,
                distance: storeinfo.Distance,
                province: storeinfo.Province

              },
              storeCompanyCode: storeinfo.CompanyCode,
              storeInfo: storeinfo
            });
            /**新人礼包 */
            that.GetGiftBagActivity(storeinfo.City);
            app.currCity = storeinfo.City;
            app.latitude = storeinfo.BaiDuWeiDu;
            app.longitude = storeinfo.BaiDuJinDu;
            app.currProvince = storeinfo.Province;
            //记录全局用户信息
            //第三方游戏
            //app.globalData.loginUser.sessionId = user.sessionId;
            app.globalData.loginUser.isLogined = true;
            app.globalData.loginUser.isMember = ismember;
            app.globalData.loginUser.province = storeinfo.Province;
            app.globalData.loginUser.city = storeinfo.City;
            if (app.hwBus) {
              console.log("game init 2:", app.globalData.loginUser);
              app.hwBus.emit('init', true);
            }
            /**门店信息写入缓存 */
            wx.setStorageSync("storeinfo", that.data.currStoreInfo);
            if (storeinfo.StoreGroupList.length > 0) {
              if (storeinfo.StoreServiceGroup.length > 0) {
                that.setData({
                  serviceItems: storeinfo.StoreServiceGroup,
                  swiperitcss: "swiper-boxN"
                });
              } else {
                that.setData({
                  serviceItems: [],
                  swiperitcss: ""
                });
              }

              //门店组Id
              var groupidArr = storeinfo.StoreGroupList;
              if (groupidArr.length > 0) {
                that.setData({
                  storeGroupList: storeinfo.StoreGroupList
                });
                var jsonstr = JSON.stringify(groupidArr);
                that.setData({
                  groupJsonstr: jsonstr
                });
                /**根据优惠券分类id、门店号、门店组id加载优惠券列表信息 */
                that.getCouponActivityList(that.data.currentType, storeinfo.StoreCode, jsonstr);
              }


            } else {
              that.setData({
                LoadingDesc: ''
              });
            }
          }
          /**搜索关键字 */
          var searchkeywords = wx.getStorageSync("searchkeyword");
          if (searchkeywords) {
            that.setData({
              MadeWords: searchkeywords
            });
          }
          app.globalData.isYhqIndex = false;
        } else {
          var storeinfo = wx.getStorageSync("storeinfo");
          if (storeinfo && storeinfo.storeCode && storeinfo.storelat && storeinfo.storelng != '') {
            that.GetCouponIndexData(storeinfo.storeCode, storeinfo.storelat, storeinfo.storelng);
          } else {
            wx.getLocation({
              type: 'gcj02',
              success: function(res) {
                /**纬度 */
                var latitude = res.latitude;
                /**经度 */
                var longitude = res.longitude;
                that.getUserNearyStore(latitude, longitude);
              },
              fail: function() {
                that.setData({
                  isShowSelectSore: true
                });
                /**定位失败 */
                // wx.showModal({
                //   title: '温馨提示',
                //   content: '你的位置信息获取不到，请手动选择离你最近的门店信息',
                //   showCancel: false,
                //   success(res) {
                //     /**点击确定开启定位 */
                //     that.setData({
                //       isShowSelectSore: true
                //     });
                //   }
                // });
              },
              complete: function() {

              }
            });
          }
        }
      }
    }
  },
  /**读取配置数据:当还没定位到的时候读取上一次的定位数据，如果定位到了则读取当前定位到的数据 */
  GetCouponIndexData: function(sorecode, lat, lng) {
    var that = this;
    // myjCommon.getLoginUser(function(user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }
    var user = myjCommon.getCurrentUser()
      //记录全局用户信息:第三方游戏用到
      app.globalData.loginUser.sessionId = user.sessionId;
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetCouponIndexData",
        biz: {
          sessionId: user.sessionId,
          storeCode: sorecode,
          uLng: lng,
          uLat: lat,
          appid: 'wx55595d5cf709ce79'
        },
        success: function(res) {
          app.globalData.isYhqIndex = false;
          var timestap = Date.parse(new Date());
          if (res.BannerList.length > 0) {
            /**缓存banner图 缓存15分钟 */
            var expretion = timestap + 900000;
            wx.setStorageSync('banner', expretion)
            wx.setStorageSync("bannerdata", res.BannerList);

            // 0：广告图 1：视频 2:悬浮窗
            //筛选出悬浮窗
            var floatinfo = res.BannerList.filter(item => item.BannerType == 2);
            //筛选出banner图
            var bannelist = res.BannerList.filter(item => item.BannerType == 0 && item.Channel == 0);
            //筛选出广告图
            var advertList = res.BannerList.filter(item => item.BannerType == 0 && item.Channel == 32);
            that.setData({
              bannerList: bannelist,
              showadimginfo: floatinfo,
              bannerCurrent: 0,
              advertList: advertList
            });
            if (floatinfo.length > 0) {
              that.setData({
                showadimginfo: floatinfo
              });

              var otimestap = new Date().toLocaleString().substring(0, 10);
              var hctimestap = wx.getStorageSync('cdate');
              if (hctimestap != otimestap) //如果不是同一天就弹出 开屏图一天只弹一次 并且是当天的第一次进来就弹
              {
                if (that.data.showadimginfo[0].ShowType == 2 || that.data.showadimginfo[0].ShowType == 3) { //展示方式[1:展示悬浮图;2:展示开屏图;3:展示悬浮图和开屏图]

                  if (that.data.showadimginfo[0].ShowType == 2) {
                    that.setData({
                      giftNo: that.data.showadimginfo[0].ActivityNo,
                      isShowScreen: true
                    });
                    that.getopenScreenGiftBag();
                    var otimestap = new Date().toLocaleString().substring(0, 10);
                    wx.setStorageSync('cdate', otimestap); //标志缓存的时候
                  } else {
                    that.setData({
                      isShowopenimg: true
                    });
                    var otimestap = new Date().toLocaleString().substring(0, 10);
                    wx.setStorageSync('cdate', otimestap); //标志缓存的时候
                  }

                }
              }
            }
          }
          var cardTypeList = res.CardTypeList;
          //默认显示第一个分类的数据
          if (cardTypeList.length > 0) {
            var typeid = cardTypeList[0].Id;
            if (cardTypeList[0].IsAll) {
              typeid = 0;
            }
            that.setData({
              cardTypeList: cardTypeList,
              currentType: typeid
            });

            /**缓存优惠券分类 缓存30分钟 */
            wx.setStorageSync("cardTypeList", cardTypeList);

          } else {
            that.setData({
              cardTypeList: [],
              currentType: -1
            });
          }

          //搜索关键字
          if (res.MadeWords != "") {
            that.setData({
              MadeWords: res.MadeWords
            });
            /**缓存搜索关键字 缓存30分钟 */
            wx.setStorageSync("searchkeyword", res.MadeWords);
          } else {
            that.setData({
              MadeWords: ""
            });
          }

          //门店资料
          if (res.StoreInfo != null) {
            //门店信息
            that.setData({
              currStoreInfo: {
                storeName: res.StoreInfo.StoreName,
                storeCode: res.StoreInfo.StoreCode,
                storeAddress: res.StoreInfo.Province + res.StoreInfo.City + res.StoreInfo.Town + res.StoreInfo.DetailAddr,
                storelat: res.StoreInfo.GaoDeWeiDu,
                storelng: res.StoreInfo.GaoDeJinDu,
                distance: res.StoreInfo.Distance,
                province: res.StoreInfo.Province
              },
              storeCompanyCode: res.StoreInfo.CompanyCode,
              storeInfo: res.StoreInfo
            });

            /**门店信息写入缓存 */
            wx.setStorageSync("storeinfo", that.data.currStoreInfo);

            /**门店信息写入缓存 */
            wx.setStorageSync("newstoreinfo", res.StoreInfo);


            /**门店组信息 */
            if (res.StoreInfo.StoreGroupList.length > 0) {
              if (res.StoreInfo.StoreServiceGroup.length > 0) {
                that.setData({
                  serviceItems: res.StoreInfo.StoreServiceGroup,
                  swiperitcss: "swiper-boxN"
                });
              } else {
                that.setData({
                  serviceItems: [],
                  swiperitcss: ""
                });
              }
            }
            //门店组Id
            var groupidArr = res.StoreInfo.StoreGroupList;
            if (groupidArr.length > 0) {
              that.setData({
                storeGroupList: res.StoreInfo.StoreGroupList
              });
              var jsonstr = JSON.stringify(groupidArr);
              that.setData({
                groupJsonstr: jsonstr
              });
              /**根据优惠券分类id、门店号、门店组id加载优惠券列表信息 */
              that.getCouponActivityList(that.data.currentType, res.StoreInfo.StoreCode, jsonstr);
            }
            wx.setStorageSync("ismember", res.isMember);
            /**新人礼包 */
            that.GetGiftBagActivity(res.StoreInfo.City);
            app.currCity = res.StoreInfo.City;
            app.latitude = res.StoreInfo.BaiDuWeiDu;
            app.longitude = res.StoreInfo.BaiDuJinDu;
            app.currProvince = res.StoreInfo.Province;
            //记录全局用户信息
            //第三方游戏
            app.globalData.loginUser.isLogined = true;
            app.globalData.loginUser.isMember = res.isMember;
            app.globalData.loginUser.province = res.StoreInfo.Province;
            app.globalData.loginUser.city = res.StoreInfo.City;
            if (app.hwBus) {
              console.log("game init 2:", app.globalData.loginUser);
              app.hwBus.emit('init', true);
            }


            //保存门店信息
            that.saveLocationInfo(user.sessionId, res.StoreInfo.City, res.StoreInfo.Province,
              res.StoreInfo.BaiDuWeiDu, res.StoreInfo.BaiDuJinDu,0);
          } else //可能门店下架了  所以要从缓存清掉
          {
            //从缓存清掉这个门店  再重新调用定位方法
            wx.removeStorageSync(sorecode);
            that.setData({
              isShowSelectSore: true
            });
            //that.getUserLocationInfo(); //定位
          }

          //转发配置
          if (res.foword != null) {
            wx.setStorageSync("forward", res.foword);
          }
          that.getCouponPlus()
        },
        fail: function(msg) {
          // wx.showModal({
          //   title: '提示',
          //   content: "对不起，网络异常，请一会再重试。",
          //   showCancel: false,
          //   success: function (res) { }
          // });
         if(lat<=0 || lng<=0)
         {
           wx.getLocation({
             type: 'gcj02',
             success: function (res) {
               /**纬度 */
               var latitude = res.latitude;
               /**经度 */
               var longitude = res.longitude;
               that.GetCouponIndexData("", latitude, longitude);
             },
             fail: function () {
               that.setData({
                 isShowSelectSore: true
               });
               /**定位失败 */
               wx.showModal({
                 title: '温馨提示',
                 content: '你的位置信息获取不到，请手动选择离你最近的门店信息',
                 showCancel: false,
                 success(res) {
                   /**点击确定开启定位 */
                   that.setData({
                     isShowSelectSore: true
                   });
                 }
               });
             },
             complete: function () {

             }
           });
         }
      
        },
        complete: function(res) {
          wx.removeStorageSync("map");
          that.setData({
            LoadingDesc: ''
          });
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
          var timestap = Date.parse(new Date());
          var expretimedata = wx.getStorageSync("expretime");
          var storeinfo = wx.getStorageSync("storeinfo");

          if (!that.data.ischangestore) {
            //如果缓存提醒时间超过24小时则从新检测当前门店是否是最近的门店
            if (storeinfo && expretimedata < timestap) {

              wx.getLocation({
                type: 'gcj02',
                success: function(res) {
                  /**纬度 */
                  var latitude = res.latitude;
                  /**经度 */
                  var longitude = res.longitude;

                  //如果定位到的经纬度跟上一次定位到的经纬度距离大于1千米则弹出提示是否切换门店  如果点切换则读取当前定位到的数据
                  if (that.distance(latitude, longitude, lat, lng) > 1) {
                    wx.showModal({
                      title: '温馨提示',
                      content: '您当前不在"' + storeinfo.storeName + '"门店，是否切换到最近门店？',
                      success: function(res) {
                        if (res.confirm) {
                          that.setData({
                            ischangestore: true
                          });
                          /**重新去请求到展示最近的门店 */
                          that.GetCouponIndexData('', latitude, longitude);
                        } else if (res.cancel) {
                          var expretion = timestap + 86400000;
                          wx.setStorageSync('expretime', expretion)
                        }
                      }
                    });
                  }
                },
                fail: function(res) {},
                complete: function() {
                  //服务项目和分类都有的时候 动态计算swiper 面板指示点的高度
                  if (that.data.serviceItems.length > 0 && that.data.cardTypeList.length > 0) {
                    wx.getSystemInfo({
                      success: function(res) {
                        that.setData({
                          mainMinHeight: res.screenHeight - 165
                        });
                      }
                    });
                    //没有服务项目的时候
                  } else if (that.data.serviceItems.length <= 0 && that.data.cardTypeList.length > 0) {
                    wx.getSystemInfo({
                      success: function(res) {
                        that.setData({
                          mainMinHeight: res.screenHeight - 135
                        });
                      }
                    });
                  }
                }
              });
            }
          }
        }
      });
    // });
  },

  saveLocationInfo: function (sessionid, city, province, lat, lng, fromApp)
  {
    var that=this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.UpdateUserLocation",
      biz: {
        sessionId: sessionid,
        city: city,
        province: province,
        lat: lat,
        lng: lng,
        fromApp: that.data.fromApp
      },
      success: function (res) {
        console.log(res)
      },
      fail: function (msg) {
        console.log("出现异常：" + JSON.stringify(msg));

      },
      complete: function (res) {
      }
    });
  },
  /**读取配置数据:当还没定位到的时候读取上一次的定位数据，如果定位到了则读取当前定位到的数据 */
  // GetCouponIndexData: function(sorecode, lat, lng) {
  //   var that = this;
  //   myjCommon.getLoginUser(function(user) {
  //     if (!user.isLogin) {
  //       that.setData({
  //         isShowUserInfoBtn: true
  //       });
  //       return;
  //     }

  //     myjCommon.callApi({
  //       interfaceCode: "WxMiniProgram.Service.GetCouponIndexData",
  //       biz: {
  //         sessionId: user.sessionId,
  //         storeCode: sorecode,
  //         uLng: lng,
  //         uLat: lat
  //       },
  //       success: function(res) {
  //         //Banner
  //         if (res.BannerList.length > 0) {
  //           // 0：广告图 1：视频 2:悬浮窗
  //           //筛选出悬浮窗
  //           var floatinfo = res.BannerList.filter(item => item.BannerType == 2);
  //           //筛选出banner图
  //           var bannelist = res.BannerList.filter(item => item.BannerType == 0 && item.Channel == 0);
  //           //筛选出广告图
  //           var advertList = res.BannerList.filter(item => item.BannerType == 0 && item.Channel == 32);
  //           that.setData({
  //             bannerList: bannelist,
  //             showadimginfo: floatinfo,
  //             bannerCurrent: 0,
  //             advertList: advertList
  //           });
  //           if (floatinfo.length > 0) {
  //             that.setData({
  //               showadimginfo: floatinfo
  //             });

  //             var otimestap = new Date().toLocaleString().substring(0, 10);
  //             var hctimestap = wx.getStorageSync('cdate');

  //             if (hctimestap != otimestap) //如果不是同一天就弹出 开屏图一天只弹一次 并且是当天的第一次进来就弹
  //             {
  //               if (that.data.showadimginfo[0].ShowType == 2 || that.data.showadimginfo[0].ShowType == 3) {//展示方式[1:展示悬浮图;2:展示开屏图;3:展示悬浮图和开屏图]

  //                 if ( that.data.showadimginfo[0].ShowType == 2)
  //               {
  //                 that.setData({
  //                   giftNo: that.data.showadimginfo[0].ActivityNo,
  //                   isShowScreen:true
  //                 });
  //                   that.getopenScreenGiftBag();
  //                   var otimestap = new Date().toLocaleString().substring(0, 10);
  //                   wx.setStorageSync('cdate', otimestap); //标志缓存的时候
  //               }else
  //               {
  //                 that.setData({
  //                   isShowopenimg: true
  //                 });
  //                 var otimestap = new Date().toLocaleString().substring(0, 10);
  //                 wx.setStorageSync('cdate', otimestap); //标志缓存的时候
  //               }

  //               }
  //             }
  //           }
  //         }
  //         //默认显示第一个分类的数据
  //         if (res.CardTypeList.length > 0) {

  //           var typeid = res.CardTypeList[0].Id;
  //           if (res.CardTypeList[0].IsAll) {
  //             typeid = 0;
  //           }
  //           that.setData({
  //             cardTypeList: res.CardTypeList,
  //             currentType: typeid
  //           });
  //         }else
  //         {
  //           that.setData({
  //             cardTypeList: [],
  //             currentType: -1
  //           });
  //         }

  //         //搜索关键字
  //         if (res.MadeWords != "") {
  //           that.setData({
  //             MadeWords: res.MadeWords
  //           });
  //         }

  //         //门店资料
  //         if (res.StoreInfo != null) {

  //           //复制当前定位门店信息
  //           that.setData({
  //             currStoreInfo: {
  //               storeName: res.StoreInfo.StoreName,
  //               storeCode: res.StoreInfo.StoreCode,
  //               storeAddress: res.StoreInfo.Province + res.StoreInfo.City + res.StoreInfo.Town + res.StoreInfo.DetailAddr,
  //               storelat: res.StoreInfo.GaoDeWeiDu,
  //               storelng: res.StoreInfo.GaoDeJinDu,
  //               distance: res.StoreInfo.Distance,
  //               province: res.StoreInfo.Province,
  //               phone: res.StoreInfo.Telephone,
  //             },
  //             storeCompanyCode: res.StoreInfo.CompanyCode
  //           });
  //           wx.setStorageSync("storeinfo", that.data.currStoreInfo);
  //           //判断有无门店组
  //           if (res.StoreInfo.StoreGroupList.length > 0) {
  //             //门店组Id
  //             var groupidArr = res.StoreInfo.StoreGroupList;
  //             that.setData({
  //               storeGroupList: res.StoreInfo.StoreGroupList
  //             });
  //             if (res.StoreInfo.StoreServiceGroup.length > 0) {
  //               that.setData({
  //                 serviceItems: res.StoreInfo.StoreServiceGroup,
  //                 swiperitcss: "swiper-boxN"
  //               });
  //             }
  //             var jsonstr = JSON.stringify(groupidArr);
  //             that.setData({
  //               groupJsonstr: jsonstr
  //             });
  //             that.getCouponActivityList(that.data.currentType, res.StoreInfo.StoreCode, jsonstr);
  //           }

  //         } else //可能门店下架了  所以要从缓存清掉
  //         {
  //           //从缓存清掉这个门店  再重新调用定位方法
  //           wx.removeStorageSync(sorecode);
  //           that.getUserLocationInfo(); //定位
  //         }
  //       },
  //       fail: function(msg) {
  //         console.log("加载首页数据失败：" + JSON.stringify(msg));
  //         wx.showModal({
  //           title: '提示',
  //           content: "对不起，网络异常，请一会再重试。",
  //           showCancel: false,
  //           success: function(res) {
  //             that.GetCouponIndexData(sorecode, lat, lng);
  //           }
  //         });
  //       },
  //       complete: function(res) {
  //         that.setData({
  //           LoadingDesc:''
  //         });
  //         var timestap = Date.parse(new Date());
  //         var expretimedata = wx.getStorageSync("expretime");
  //         var storeinfo = wx.getStorageSync("storeinfo");

  //         if (!that.data.ischangestore) {
  //           //如果缓存提醒时间超过24小时则从新检测当前门店是否是最近的门店
  //           if (storeinfo && expretimedata < timestap) {

  //             wx.getLocation({
  //               type: 'gcj02',
  //               success: function(res) {
  //                 /**纬度 */
  //                 var latitude = res.latitude;
  //                 /**经度 */
  //                 var longitude = res.longitude;

  //                 //如果定位到的经纬度跟上一次定位到的经纬度距离大于1千米则弹出提示是否切换门店  如果点切换则读取当前定位到的数据
  //                 if (that.distance(latitude, longitude, lat, lng) > 1) {
  //                   wx.showModal({
  //                     title: '温馨提示',
  //                     content: '您当前不在"' + storeinfo.storeName + '"门店，是否切换到最近门店？',
  //                     success: function(res) {
  //                       if (res.confirm) {
  //                         that.setData({
  //                           ischangestore: true
  //                         });
  //                         that.GetCouponIndexData('', latitude, longitude);
  //                       } else if (res.cancel) {
  //                         var expretion = timestap + 86400000;
  //                         wx.setStorageSync('expretime', expretion)
  //                       }
  //                     }
  //                   });
  //                 }
  //               },
  //               fail: function(res) {},
  //               complete: function() {
  //                 //服务项目和分类都有的时候 动态计算swiper 面板指示点的高度
  //                 if (that.data.serviceItems.length > 0 && that.data.cardTypeList.length > 0) {
  //                   wx.getSystemInfo({
  //                     success: function(res) {
  //                       that.setData({
  //                         mainMinHeight: res.screenHeight - 165
  //                       });
  //                     }
  //                   });
  //                   //没有服务项目的时候
  //                 } else if (that.data.serviceItems.length <= 0 && that.data.cardTypeList.length > 0) {
  //                   wx.getSystemInfo({
  //                     success: function(res) {
  //                       that.setData({
  //                         mainMinHeight: res.screenHeight - 135
  //                       });
  //                     }
  //                   });
  //                 }
  //               }
  //             });
  //           }
  //         }
  //       }
  //     });
  //   });
  // },
  /**获取券列表信息 */
  getCouponActivityList: function(typeId, storeCode, storegroupstr) {
    var that = this;
    if (that.data.isCompleted) {
      return;
    }
    this.setData({
      isLoading: true
    });
    // myjCommon.getLoginUser(function(user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }
    var user = myjCommon.getCurrentUser();
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetCouponActivityList",
        biz: {
          sessionId: user.sessionId,
          typeId: typeId,
          storeCode: storeCode,
          storegroupList: storegroupstr,
          pageIndex: that.data.pageIndex,
          pageSize: that.data.pageSize,
          companyCode: that.data.storeCompanyCode
        },
        success: function(res) {
          console.log(res)
          var data = res.Data;
          var list = that.data.cardList.concat(data);
          that.setData({
            cardList: list
          });
          that.countdown("");
          //是否加载完
          var pCount = parseInt(res.Total / that.data.pageSize);
          if (res.Total % that.data.pageSize > 0) {
            pCount++;
          }
          if (that.data.pageIndex >= pCount) {
            that.setData({
              isCompleted: true
            });
            var isAll = that.data.cardTypeList.filter(item => item.IsAll);
            if (isAll.length > 0) //如果包含有全部分类则显示查看更多入口
            {
              that.setData({
                isMoreEntance: true,
                isencon: true
              });
            }
          }

        },
        fail: function(msg) {
          console.log("根据门店获取券信息失败：", msg);
        },
        complete: function(res) {
          that.setData({
            isLoading: false
          });

        }
      });
    // });
  },
  /**通过两点经纬度计算距离（KM） */
  distance: function(la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137; //地球半径
    s = Math.round(s * 10000) / 10000;
    return s;
  },


  searchData: function(event) {
    //搜索关键字
    var keyword = event.detail.value;
    this.setData({
      inputValue: ""
    });
    this.RecordSearcJournal(keyword);
    wx.navigateTo({
      url: '../search/search?searchvalue=' + keyword + "&searchtype=1",
    });
  },
  /**记录搜索商品到日志*/
  RecordSearcJournal: function(searchContent) {
    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.RecordSearcJournal",
        biz: {
          sessionId: user.sessionId,
          searchContent: searchContent,
          channel: "优惠券小程序"
        },
        success: function(res) {

        },
        fail: function(msg) {
          console.log("调用RecordSearcJournal失败：" + JSON.stringify(msg))
        },
        complete: function(res) {}
      });
    });
  },
  /**扫一扫 */
  scan: function() {
    var that = this;
    wx.scanCode({
      success: (res) => {
        var result = res.result;
        that.setData({
          isscan: true
        });
        wx.navigateTo({
          url: '../search/search?searchvalue=' + result + "&searchtype=0",
        });
      }
    })
  },
  /**跳到搜索 */
  href_search: function() {
    wx.navigateTo({
      url: '../search/search',
    });
  },
  /**更多 */
  more: function() {
    if (this.data.searchModel) {
      this.setData({
        searchModel: false
      });
    } else {
      this.setData({
        searchModel: true
      });
    }

  },
  /**跳到门店列表页 */
  moreStore: function() {
    wx.navigateTo({
      url: '../yhq_choose_store/yhq_choose_store',
    });
  },

  /**倒计时 */
  /* 毫秒级倒计时 */
  countdown: function(total_micro_second) {
    var that = this;
    var data = that.data.cardList;
    for (var i = 0; i < data.length; i++) {
      if (data[i].CardStatus == "立即领取" && data[i].CouponType != 2) {
        //计算百分比进度条
        if (((data[i].Stocks - data[i].ReStocks) / data[i].Stocks) * 100 < 1) {
          data[i].Process = 1;
        } else {
          data[i].Process = parseInt(((data[i].Stocks - data[i].ReStocks) / data[i].Stocks) * 100)
        }
      }
      if ((data[i].CardStatus == "未开始" || data[i].CardStatus == "抢购活动未开始") && data[i].PanicBuyBeginTime!=null) {
        var begintime_ms = Date.parse(new Date(that.getcurDate().replace(/-/g, '/'))); //begintime 为开始时间     
        //var begintime_ms = Date.parse(new Date(data[i].NowTime.replace(/-/g, '/')));
        var endTime = data[i].PanicBuyBeginTime.replace("T", " ");
        var endtime_ms = Date.parse(new Date(endTime.replace(/-/g, '/'))); // endtime 为结束时间 
        var timeJ = endtime_ms - begintime_ms;
        var timestr = that.dateformat(timeJ);
        data[i].hour = timestr.substring(0, 2);
        data[i].minute = timestr.substring(3, 5);
        data[i].second = timestr.substring(6, 8);
        total_micro_second = timeJ;
        if (data[i].hour == 'n') {
          data[i].hour = '00';

        }
        if (data[i].minute == 'n') {
          data[i].minute = '00';
        }
        if (data[i].second == 'n' || data[i].second == '00') {
          data[i].second = '00';
        }
        if (data[i].second == '00' && data[i].minute == '00' && data[i].hour == '00') {
          data[i].CardStatus = "立即领取";
          if (((data[i].Stocks - data[i].ReStocks) / data[i].Stocks) * 100 < 1) {
            data[i].Process = 1;
          } else {
            data[i].Process = parseInt(((data[i].Stocks - data[i].ReStocks) / data[i].Stocks) * 100)
          }
        }

      } else if (data[i].CardStatus == "未开始" && data[i].HBeginTime) {
        var begintime_ms = Date.parse(new Date(that.getcurDate().replace(/-/g, '/'))); //begintime 为开始时间  
        //var begintime_ms = Date.parse(new Date(data[i].NowTime.replace(/-/g, '/')));

        var endTime = data[i].HBeginTime.replace("T", " ");
        var endtime_ms = Date.parse(new Date(endTime.replace(/-/g, '/'))); // endtime 为结束时间 
        var timeJ = endtime_ms - begintime_ms;
        var timestr = that.dateformat(timeJ);
        data[i].hour = timestr.substring(0, 2);
        data[i].minute = timestr.substring(3, 5);
        data[i].second = timestr.substring(6, 8);
        total_micro_second = timeJ;
        if (data[i].hour == 'n') {
          data[i].hour = '00';
        }
        if (data[i].minute == 'n') {
          data[i].minute = '00';
        }
        if (data[i].second == 'n' || data[i].second == '00') {
          data[i].second = '00';
        }
        if (data[i].second == '00' && data[i].minute == '00' && data[i].hour == '00') {
          data[i].CardStatus = "立即领取";
          if (((data[i].Stocks - data[i].ReStocks) / data[i].Stocks) * 100 < 1) {
            data[i].Process = 1;
          } else {
            data[i].Process = parseInt(((data[i].Stocks - data[i].ReStocks) / data[i].Stocks) * 100)
          }
        }
      }
    }
    that.setData({
      cardList: data
    });

    // 渲染倒计时时钟
    that.setData({
      clock: that.dateformat(total_micro_second)
    });

    if (total_micro_second <= 0) {
      that.setData({
        clock: "00:00:00",
        hr: 0,
        minite: 0,
        second: 0
      });
      // timeout则跳出递归
      return;
    }
    setTimeout(function() {
      // 放在最后--
      //total_micro_second -= 10;
      that.countdown(total_micro_second);
    }, 1000);
    return that.dateformat(total_micro_second);
  },

  // 时间格式化输出，如3:25:19 86。每10ms都会调用一次
  dateformat: function(micro_second) {
    // 秒数
    var second = Math.floor(micro_second / 1000);
    // 小时位
    var hr = Math.floor(second / 3600) < 10 ? '0' + Math.floor(second / 3600) : Math.floor(second / 3600);
    // 分钟位
    var min = Math.floor((second - hr * 3600) / 60) < 10 ? '0' + Math.floor((second - hr * 3600) / 60) : Math.floor((second - hr * 3600) / 60);
    // 秒位
    var sec = (second - hr * 3600 - min * 60) < 10 ? '0' + (second - hr * 3600 - min * 60) : (second - hr * 3600 - min * 60) < 10 ? '0' + (second - hr * 3600 - min * 60) < 10 ? '0' + (second - hr * 3600 - min * 60) : (second - hr * 3600 - min * 60) : (second - hr * 3600 - min * 60) < 10 ? '0' + (second - hr * 3600 - min * 60) : (second - hr * 3600 - min * 60); // equal to => var sec = second % 60;
    // 毫秒位，保留2位
    var micro_sec = Math.floor((micro_second % 1000) / 10);
    return hr + ":" + min + ":" + sec;
  },
  getcurDate: function() {
    var timestamp =
      Date.parse(new Date());
    //返回当前时间毫秒数
    timestamp = timestamp / 1000;
    //获取当前时间
    var n = timestamp *
      1000;
    var date = new Date(n);
    //年
    var Y =
      date.getFullYear();
    //月
    var M = (date.getMonth() +
      1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //日
    var D = date.getDate() <
      10 ? '0' + date.getDate() :
      date.getDate();
    var hr = date.getHours();
    var minite = date.getMinutes();
    var secnde = date.getSeconds();
    return Y + "-" + M + "-" + D + " " + hr + ":" + minite + ":" + secnde;
  },
  /**滑动到下一页的服务项目 */
  roll: function() {
    this.setData({
      scrollHeight: 1000
    });
  },
  /**回到第一页的服务项目 */
  returnscorll: function() {
    this.setData({
      scrollHeight: 1
    });
  },
  /** 点击服务项目做相应的跳转*/
  href_service: function(e) {
    //触发动作: 1 无动作；2 弹窗；3 跳转URL；4弹窗跳转;5小程序
    var action = e.currentTarget.dataset.action;
    //小程序appid 
    var appid = e.currentTarget.dataset.appid;
    //跳转网页的地址
    var linkurl = e.currentTarget.dataset.linkurl;
    //频道url
    var pageurl = e.currentTarget.dataset.pageurl;
    //跳转频道页的频道id
    var channelid = e.currentTarget.dataset.channelid;


    if (action == 3) //跳转网页
    {
      wx.navigateTo({
        url: '../bannerWeb/bannerWeb?bannerUrl=' + linkurl
      });
    } else if (action == 5 && appid) //跳转小程序
    {
      if (appid == this.data.currAppid) {
        wx.redirectTo({
          url: pageurl
        });
      } else {
        wx.navigateToMiniProgram({
          appId: appid,
          path: pageurl,
          envVersion: 'release',
        });
      }
    } else if (action == 6) //跳转频道
    {
      wx.navigateTo({
        url: '../yhq_channel/yhq_channel?channel=' + channelid
      });
    }
  },
  changeStore: function() {
    this.setData({
      isShowSelectSore: false
    });
    wx.navigateTo({
      url: '../yhq_choose_store/yhq_choose_store',
    });
  },
  /**查看参与商品 */
  seeothergoods: function(e) {
    var crmno = e.detail.target.dataset.crmno;
    var that = this;
    that.setData({
      crmNo: crmno,
      isHowtast: false,
      isentyGoods: false,
      isnotentyGoods: false,
      seeOthergoodObj: null
    });
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return false;
      }
      //调用扫码api
      // 允许从相机和相册扫码
      wx.scanCode({
        success: (res) => {
          myjCommon.callApi({
            interfaceCode: "WxMiniProgram.Service.SearchGoodsByCrmNo",
            biz: {
              crmNo: crmno,
              productCode: res.result
            },
            success: function(res) {
              //that.loaddata();
              if (res.Code == 0) //有商品
              {
                wx.showToast({
                  title: res.Msg,
                })

              } else if (res.Code == 2) //非参与商品
              {
                that.setData({
                  isentyGoods: false,
                  isnotentyGoods: true
                });
              } else if (res.Code == 1) //参与商品
              {
                that.setData({
                  isentyGoods: true,
                  isnotentyGoods: false
                });
              }

              if (res.Result != null) {
                that.setData({
                  seeOthergoodObj: res.Result
                });
              }
              //that.loaddata();
            },
            fail: function(msg) {
              console.log("SearchGoodsByCrmNo失败：" + JSON.stringify(msg));
            },
            complete: function(res) {}
          });
        },
        fail: function(msg) {
          //that.loaddata();

        },
        complete: function(msg) {

        }
      })

    });
  },
  /**拖动悬浮图 */
  ballMoveEvent: function(e) {
    var touchs = e.touches[0];
    var pageX = touchs.pageX;
    var pageY = touchs.pageY;
    var that = this;

    if (pageX < 30) return;
    if (pageX > that.data.screenWidth - 30) return;
    // if (that.data.screenHeight - pageY <= 30) return; if (pageY <= 30) return

    //这里用right和bottom.所以需要将pageX pageY转换    
    var x = that.data.screenWidth - pageX - 30;
    var y = that.data.screenHeight - pageY - 30;
    that.setData({
      ballBottom: y,
      ballRight: x
    });
  },
  /**查看兑换码--跳到会员小程序礼品兑换记录页查看 */
  sdeepcode: function() {
    wx.navigateToMiniProgram({
      appId: 'wxc94d087c5890e1f8',
      path: 'pages/member_gift/member_gif'
    });
  },
  /**检查当前用户是否有可派发的券如果有根据手机号发券 */
  addCouponByMobile: function() {
    var that = this;
    myjCommon.getLoginUser(function(user) {
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
        success: function(res) {
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

          } 
          // else if (res.Code == "300") {
          //   wx.navigateTo({
          //     url: '../login/login',
          //   });
          // }
        },
        fail: function(msg) {
          console.log("根据手机号发券实际失败：" + JSON.stringify(msg));
        },
        complete: function(res) {}
      });
    });
  },
  /**跳到微信付款码页 */
  url_wxpay: function(e) {
    this.setData({
      noMemberTask: false
    });
    myjCommon.logFormId(e.detail.formId);
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.MPCouponMberPay",
      biz: {},
      success: function(res) {
        if (res.Code == "0") {
          wx.openOfflinePayView({
            'appId': res.Result.appId,
            'timeStamp': res.Result.timeStamp,
            'nonceStr': res.Result.nonceStr,
            'package': res.Result.package,
            'signType': res.Result.signType,
            'paySign': res.Result.paySign,
            'success': function(res) {},
            'fail': function(res) {
              console.log("哈哈")
              console.log(res)
            },
            'complete': function(res) {}
          });
        }
      },
      fail: function(msg) {
        console.log("MPMberPay失败：" + JSON.stringify(msg));
      },
      complete: function(res) {

      }
    });
  },
  /**获取开屏礼包信息 */
  getopenScreenGiftBag: function() {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetOpenScreenCoupes",
      biz: {
        giftBagId: that.data.giftNo,
        channel: that.data.channel
      },
      success: function(res) {
        if (res.Result != null) {
          that.setData({
            opengiftbagInfo: res.Result
          });
          if (res.Result.CouponList.length > 0) {
            that.setData({
              opengiftbagCoupons: res.Result.CouponList
            });
          }
        }
      },
      fail: function(msg) {
        console.log("获取转发管理配置失败：" + JSON.stringify(msg));
      }
    });
  },
  /**发放开屏礼包 */
  addopenScreenGiftBag: function() {
    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      //string sessionId, int giftBagId, int channel, int integral, string companyCode
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.AddOpenScreenGifitBag",
        biz: {
          sessionId: user.sessionId,
          giftBagId: that.data.giftNo,
          channel: that.data.channel,
          integral: that.data.opengiftbagInfo.ExchangeIntegralCount,
          companyCode: that.data.opengiftbagInfo.CompanyCode,
          dayCunt: that.data.opengiftbagInfo.PerPersonPerDayCount,
          totalCount: that.data.opengiftbagInfo.PerPersonPerDayTotalCount
        },
        success: function(res) {
          if (res.Code == "0") {
            that.setData({
              addOpenscreensucess: true
            });
            wx.showToast({
              title: '券将在3分钟内发放到您的账户，谢谢！',
            });
          } else if (res.Code == "306") {
            wx.showToast({
              title: res.Msg,
              icon: 'none'
            });
          } else {
            wx.showToast({
              title: res.Msg,
              icon: 'none'
            });
          }

        },
        fail: function(msg) {
          console.log("获取转发管理配置失败：" + JSON.stringify(msg));
          wx.showModal({
            title: '温馨提示',
            content: '领取异常请稍后再试',
            showCancel: 'false'
          })
        }
      });
    });
  },
  /**去使用 */
  tousecoupon: function() {
    wx.navigateToMiniProgram({
      appId: 'wxc94d087c5890e1f8',
      path: 'pages/member_center/member_center'
    });
  },
  /**创建人：黎梅芳 */
  /**创建日期：20190418 */
  /**描述： 获取佳纷权益发券信息*/
  getJFGrantCoupon: function() {
    var that = this;
    myjCommon.getLoginUser(function(user) {
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
        success: function(res) {
          if (res.Code == "0") {
            if (res.Result != null && res.Result > 0) {
              that.setData({
                isJfCoupons: true
              });
            }
          }

        },
        fail: function(msg) {
          console.log("调用GetJfMemberGrantCounponCntCurmonth失败" + JSON.stringify(msg));
        },
        complete: function(res) {}
      });
    });
  },
  /**创建人：黎梅芳 */
  /**创建日期：20190424 */
  /**描述：轻松点插件初始化 */
  takeiteasyinit: function(openid) {
    var that = this;
    /**
     * 初始化插件
     * 如果需要修改其中的参数，可再次调用该方法
     * 目前仅允许修改store_id
     */
    easyRec.init({
      // 微信支付分配的商户号mch_id(必须)
      mch_id: '1471539002',
      // 微信appid
      appid: 'wx55595d5cf709ce79',
      // openid(必须)/* wx.login()后拿到的openid */
      openid: openid,
      // 商户旗下门店的唯一编号(必须)
      store_id: '6666'
    });
  },
  /**创建人：黎梅芳 */
  /**创建日期：20190424 */
  /**描述：获取用户的openid */
  getUserOpenIdBySessionId: function(code) {
    var that = this;
    wx.login({
      success: function(lRes) {
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.GetWxOpenidByCode",
          biz: {
            code: lRes.code,
            targetCode: "coupon"
          }, // {targetCode: "coupon" },
          success: function(loginRes) {
            if (loginRes.Code && loginRes.Result != null) {
              /**初始化轻松点插件 */
              that.takeiteasyinit(loginRes.Result);
            }
          },
          fail: function() {
            console.log("初始化轻松点插件失败：获取不到openid");
          },
          complete: function() {}
        });
      },
      fail: function() {
        console.log("初始化轻松点插件失败：获取不到openid");
      },
      complete: function() {}
    });
  },
  /**创建人：黎梅芳 */
  /**创建日期：20190513 */
  /**描述：券到账提醒 */
  getCouponsArriveRemind() {
    var that = this;
    // myjCommon.getLoginUser(function(user) {
    //   if (!user.isLogin) {
    //     that.setData({
    //       isShowUserInfoBtn: true
    //     });
    //     return;
    //   }

      var user = myjCommon.getCurrentUser()
      if (!user.isLogin) { return;}
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.CouponsArriveRemindUser",
        biz: {
          sessionId: user.sessionId
        },
        success: function(res) {
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
        fail: function(msg) {
          console.log("调用CouponsArriveRemindUser失败" + JSON.stringify(msg));
        },
        complete: function(res) {}
      });
    // });
  },
  /**根据用户定位到的经纬度获取最近的一个门店 */
  getUserNearyStore: function(lat, lng) {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetIndexStore",
      biz: {
        ulng: lng,
        ulat: lat
      },
      success: function(res) {
        console.log("获取用户最近的一个门店");
        console.log(res)
        if (res.Code == "0") {
          if (res.Result != null) {
            /**门店信息写入缓存 */
            wx.setStorageSync("storeinfo", res.Result);

            /**门店信息写入缓存 */
            wx.setStorageSync("newstoreinfo", res.Result);
            that.setData({
              currStoreInfo: {
                storeName: res.Result.StoreName,
                storeCode: res.Result.StoreCode,
                storeAddress: res.Result.Province + res.Result.City + res.Result.Town + res.Result.DetailAddr,
                storelat: res.Result.BaiDuWeiDu,
                storelng: res.Result.BaiDuJinDu,
                distance: res.Result.Distance,
                province: res.Result.Province
              },
              storeCompanyCode: res.Result.CompanyCode,
              storeInfo: res.Result
            });
            
            if (res.Result.Province == "广东省") {
              //加载静态文件
              that.loadStaticIndexData(res.Result.StoreCode, res.Result.CompanyCode, res.Result.BaiDuWeiDu, res.Result.BaiDuJinDu);
            } else {
              that.GetCouponIndexData(res.Result.StoreCode, res.Result.BaiDuWeiDu, res.Result.BaiDuJinDu);
            }
          } else {
            that.GetCouponIndexData("", lat, lng);
          }
        } else {
          that.GetCouponIndexData("", lat, lng);
        }
      },
      fail: function(msg) {
        console.log("调用GetIndexStore失败" + JSON.stringify(msg));
        that.GetCouponIndexData("", lat, lng);
      },
      complete: function(res) {
        that.setData({
          LoadingDesc: ''
        });
      }
    });
  },
  /**静态文件 */
  loadStaticIndexData: function(storeCode, companycode, lat, lng) {
    if (storeCode) {
      var that = this;
      let staticDataPath = "";
      let storecodes = storeCode;
      if (storecodes.indexOf('粤') != -1) {
        storecodes = storecodes.replace('粤', '');
        //"https://mtest.myj.com.cn/Web/MPIndexData/"
        staticDataPath = "https://mimage.myj.com.cn/mpdata/index/" + companycode + storecodes + ".json?t=" + new Date().getTime().toString();
      } else {
        staticDataPath = "https://mimage.myj.com.cn/mpdata/index/" + storecodes + ".json?t=" + new Date().getTime().toString();
      }
      wx.request({
        url: staticDataPath,
        data: {},
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          console.log("加载静态文件")
          console.log(res);
          that.setData({
            LoadingDesc: ''
          });
          if (res.statusCode == 200) //success
          {
            if (res.data != null) {
              //1、BannerList 广告图
              //2、CardTypeList 分类信息
              //3、StoreInfo 门店信息
              //4、MadeWords  搜索关键字
              //5、Data  券信息
              if (res.data.BannerList.length > 0) //BannerList 广告图
              {
                var floatinfo = res.data.BannerList.filter(item => item.BannerType == 2);
                //筛选出banner图
                var bannelist = res.data.BannerList.filter(item => item.BannerType == 0 && item.Channel == 0);
                //筛选出广告图
                var advertList = res.data.BannerList.filter(item => item.BannerType == 0 && item.Channel == 32);
                that.setData({
                  bannerList: bannelist,
                  showadimginfo: floatinfo,
                  bannerCurrent: 0,
                  advertList: advertList
                });
                if (floatinfo.length > 0) {
                  that.setData({
                    showadimginfo: floatinfo
                  });
                }

                var otimestap = new Date().toLocaleString().substring(0, 10);
                var hctimestap = wx.getStorageSync('cdate');
                if (hctimestap != otimestap) //如果不是同一天就弹出 开屏图一天只弹一次 并且是当天的第一次进来就弹
                {
                  if (that.data.showadimginfo[0].ShowType == 2 || that.data.showadimginfo[0].ShowType == 3) { //展示方式[1:展示悬浮图;2:展示开屏图;3:展示悬浮图和开屏图]

                    if (that.data.showadimginfo[0].ShowType == 2) {
                      that.setData({
                        giftNo: that.data.showadimginfo[0].ActivityNo,
                        isShowScreen: true
                      });
                      // that.getopenScreenGiftBag();
                      var otimestap = new Date().toLocaleString().substring(0, 10);
                      wx.setStorageSync('cdate', otimestap); //标志缓存的时候
                    } else {
                      that.setData({
                        isShowopenimg: true
                      });
                      var otimestap = new Date().toLocaleString().substring(0, 10);
                      wx.setStorageSync('cdate', otimestap); //标志缓存的时候
                    }

                  }
                }
            
              } else {
                that.setData({
                  bannerList: [],
                  showadimginfo: null,
                  bannerCurrent: 0,
                  advertList: []
                });
              }

              if (res.data.CardTypeList.length > 0) //CardTypeList 分类信息
              {
                var cardTypeList = res.data.CardTypeList;
                if (cardTypeList.length > 0) {
                  var typeid = cardTypeList[0].Id;
                  if (cardTypeList[0].IsAll) {
                    typeid = 0;
                  }
                  that.setData({
                    cardTypeList: cardTypeList,
                    currentType: typeid
                  });
                }
              } else {
                that.setData({
                  cardTypeList: [],
                  currentType: 0
                });
              }

              if (res.data.MadeWords != '' || res.data.MadeWords != null) //搜索关键字
              {
                that.setData({
                  MadeWords: res.data.MadeWords
                });
              } else {
                that.setData({
                  MadeWords: ""
                });
              }
              if (res.data.StoreInfo != null) //门店信息
              {
                if (res.data.StoreInfo != null) {
                  var storeinfo = res.data.StoreInfo;
                  //门店信息
                  that.setData({
                    currStoreInfo: {
                      storeName: storeinfo.StoreName,
                      storeCode: storeinfo.StoreCode,
                      storeAddress: storeinfo.Province + storeinfo.City + storeinfo.Town + storeinfo.DetailAddr,
                      storelat: storeinfo.GaoDeWeiDu,
                      storelng: storeinfo.GaoDeJinDu,
                      distance: storeinfo.Distance,
                      province: storeinfo.Province
                    },
                    storeCompanyCode: storeinfo.CompanyCode,
                    storeInfo: storeinfo
                  });

                  /**门店组信息 */
                  if (storeinfo.StoreGroupList.length > 0) {
                    if (storeinfo.StoreServiceGroup.length > 0) {
                      that.setData({
                        serviceItems: storeinfo.StoreServiceGroup,
                        swiperitcss: "swiper-boxN"
                      });
                    } else {
                      that.setData({
                        serviceItems: [],
                        swiperitcss: ""
                      });
                    }

                    //门店组Id
                    var groupidArr = storeinfo.StoreGroupList;
                    if (groupidArr.length > 0) {
                      that.setData({
                        storeGroupList: storeinfo.StoreGroupList
                      });
                      var jsonstr = JSON.stringify(groupidArr);
                      that.setData({
                        groupJsonstr: jsonstr
                      });

                    }

                  }
                  /**新人礼包 */
                  that.GetGiftBagActivity(storeinfo.City);
                  app.currCity = storeinfo.City;
                  app.latitude = storeinfo.BaiDuWeiDu;
                  app.longitude = storeinfo.BaiDuJinDu;
                  app.currProvince = storeinfo.Province;
                  //记录全局用户信息
                  //第三方游戏
                  app.globalData.loginUser.isLogined = true;
                  app.globalData.loginUser.isMember = res.data.isMember;
                  app.globalData.loginUser.province = storeinfo.Province;
                  app.globalData.loginUser.city = storeinfo.City;
                  if (app.hwBus) {
                    console.log("game init 2:", app.globalData.loginUser);
                    app.hwBus.emit('init', true);
                  }
                } else {

                }
              } else {
                wx.getLocation({
                  type: 'gcj02',
                  success: function(res) {
                    /**纬度 */
                    var latitude = res.latitude;
                    /**经度 */
                    var longitude = res.longitude;
                    that.getUserNearyStore(latitude, longitude);
                  },
                  fail: function(res) {},
                  complete: function() {

                  }
                });
              }

              //券列表
              if (res.data.Data.length > 0) {
                var data = res.data.Data;
                var list = that.data.cardList.concat(data);
                that.setData({
                  cardList: list
                });
                that.countdown("");
                //是否加载完
                var pCount = parseInt(res.data.Total / that.data.pageSize);
                if (res.data.Total % that.data.pageSize > 0) {
                  pCount++;
                }
                if (that.data.pageIndex >= pCount) {
                  that.setData({
                    isCompleted: true
                  });
                  var isAll = that.data.cardTypeList.filter(item => item.IsAll);
                  if (isAll.length > 0) //如果包含有全部分类则显示查看更多入口
                  {
                    that.setData({
                      isMoreEntance: true,
                      isencon: true
                    });
                  }
                } else {
                  that.setData({
                    cardList: []
                  });
                }
              } else { //no data
                that.setData({
                  cardList: []
                });
              }
            } else //fail
            {
              that.GetCouponIndexData(storeCode, lat, lng);
            }
          } else //fail
          {
            that.GetCouponIndexData(storeCode, lat, lng);
          }

        },
        fail: function(msg) {
          console.log("加载静态文件失败：" + msg);
          that.setData({
            LoadingDesc: ''
          });
          that.GetCouponIndexData(storeCode, lat, lng);
        },
        complete: function() {
          wx.removeStorageSync("map");
        }
      })
    } else {
      that.GetCouponIndexData("", lat, lng);
      wx.removeStorageSync("map");
    }
  },
  GivingGifbagByStore: function(sessionid, storecode) {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetGiftBagActivityByStoreCode",
      biz: {
        sessionId: sessionid,
        channel: that.data.channel,
        storeCode: storecode
      },
      success: function(res) {
        console.log("GetGiftBagActivityByStoreCode结果：");
        console.log(res);
        if (res.Code == "0") {
          that.setData({
            giftStoreTast: true
          });
          if (res.Result && res.Result) {
            that.setData({
              giftStoreImg: res.Result
            });
          }
        } 
        // else if (res.Code == "300") {
        //   wx.navigateTo({
        //     url: '../login/login',
        //   });
        // }
      },
      fail: function(msg) {
        console.log("调用GetGiftBagActivityByStoreCode失败：" + JSON.stringify(msg));
      },
      complete: function(res) {}
    });
  },
  closeTaskStore: function() {
    this.setData({
      giftStoreTast: false
    });
  },
  /**关闭券到账提醒弹框*/
  closeRemindTask:function()
  {
    this.setData({
      couponRemindTast: false
    });
    /**标志已提醒过用户 */
    this.couponsArriveRemind();
  },
  couponsArriveRemind:function() {
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
  //获取优惠券插件
  getCouponPlus(){
    // 获取插件实例
    let that = this,
     coupon = requirePlugin('coupon-plugin');
    // 传入获取到的openid和活动act_id，初始化插件
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        wx.hideLoading();
        that.data.isSending = false;
        return false;
      }
      console.log(user)
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetActionIDByStoreCode",
        biz: {
          storeCode: that.data.storeInfo.StoreCode,
          sessionId: user.sessionId
        },
        success: function (res) {
          console.log(res)
          if (res.Code == 0) {
            if (res.Result) {
              var result = res.Result
              console.log(result)
              that.setData({
                act_id: result.actionId
              })
              coupon.init({
                openid: result.openId,
                act_id: result.actionId
              });
            }
          }
        },
        fail: function (msg) {
          console.log("优惠券插件" + JSON.stringify(msg));
        },
        complete: function (res) { }
      });
    })
    
  },

  closeUserInfoDialog() {
    this.setData({
      isShowUserInfoBtn: false
    });
  },
  /**
   * 显示公众号插件
   */
  showPublicPlug(){
    let showPublicPlugDate = wx.getStorageSync('showPublicPlugDate');
    let nowDate = new Date().toLocaleString().substring(0, 10);

    if(!showPublicPlugDate){
      this.setData({
        isShowPublicPlug:true
      });
      wx.setStorageSync('showPublicPlugDate', nowDate);
    }
    let isSameWeek = this.isSameWeek(new Date(showPublicPlugDate),new Date(nowDate));

    if(!isSameWeek){
      this.setData({
        isShowPublicPlug: true
      });
      wx.setStorageSync('showPublicPlugDate', nowDate);
    }
  },
  /**
   * 判断2个日期是否同一周
   */
  isSameWeek(oldDate,nowDate){
    let oneDayTime = 1000 * 60 * 60 * 24;
    let old_count = parseInt(oldDate.getTime() / oneDayTime);
    let now_other = parseInt(nowDate.getTime() / oneDayTime);
    return parseInt((old_count + 4) / 7) == parseInt((now_other + 4) / 7); 
  },
  /**
   * 关闭公众号插件
   */
  closePublicPlug(){
    this.setData({
      isShowPublicPlug:false
    });
  }

})