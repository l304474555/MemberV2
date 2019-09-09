// pages/yhq_index/yhq.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据 650px
   */
  data: {
    userInfo: { isLogin: false },
    bannerList: [],
    actBanner: null,
    isShowBannerInfo: false,
    isShowGetCardInfo: false,
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
    channel: 1, //投放渠道
    GiftBag: "", //活动大礼包
    currGiftBagId: "", //当前礼包活动列表Id
    isBag: false,
    isBagsucess: false,  //礼包领取成功弹出框
    isNoMember: false,//不是会员弹出框 礼包
    currAppid: "wxc94d087c5890e1f8" //当前小程序appid
  },
  backIndex: function ()//返回首页
  {
    wx.switchTab({
      url: '../yhq_index/yhq',
    })
  },

  //显示banner跳转----
  renderBannerDialog: function (event) {
    var that=this;
    //类型：0.不跳转  1.跳转链接  2.优惠券小程序 3.会员小程序 4.外卖小程序
    var typeid = event.currentTarget.dataset.ptype;
    var bannerUrl = event.currentTarget.dataset.jumpurl;
    var url = event.currentTarget.dataset.url;
    var appid = event.currentTarget.dataset.appid;
    if (typeid == 4) {
      wx.navigateTo({
        url: '../bannerWeb/bannerWeb?bannerUrl=' + bannerUrl
      })
    } else if (typeid == 2) {
      if (appid == that.data.currAppid) //跳转到当前小程序的其他页面
      {
        wx.reLaunch({
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
  },

  closeBannerDialog: function () {
    this.setData({
      isShowBannerInfo: false,
      actBanner: null
    });
  },
  //取得卡片信息
  getCardInfo: function (cardId) {

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
  getCard: function (event) {
    var cardId = event.detail.target.dataset.cardid;
    var formId = event.detail.formId;
    var cardInfo = this.getCardInfo(cardId);
    console.log(cardInfo.CardStatus)
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
        //wx.showModal({
        //  title: '提示',
        //  content:"登录失败，请稍后重试。",
        //  showCancel:false
        //});
        that.setData({
          isShowUserInfoBtn: true
        });
        wx.hideLoading();
        return false;
      }
      var mflag = "0";
      //if (!wx.navigateToMiniProgram){
      //  mflag = "1";
      //}
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.AddUserCard",
        biz: { cardId: cardId, sessionId: user.sessionId, mflag: mflag, source: 1, formId: formId },
        success: function (res) {
          if (res.Code == "0") {
            wx.showModal({
              title: '领取成功',
              content: "请直接使用微信支付核销，每次支付仅限使用1张优惠券，此券仅限购买本品使用 。",
              showCancel: false
            });
            that.setData({
              isHowtast: false
            });
          }
          else if (res.Code == "301") {
            //非会员
            that.setData({
              isShowGetCardInfo: true,
              isHowtast: false
            });
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
              cardList: that.data.cardList,
              objcoupe: that.data.objcoupe
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
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });

    });
  },
  //关闭会员卡对话框
  closeGetCardModal: function () {
    this.setData({
      isShowGetCardInfo: false
    });
  },
  //领取会员卡
  getMemberCard: function (e) {
    myjCommon.logFormId(e.detail.formId);
    wx.reLaunch({ url: "/pages/member_card/index?jumpPage=2" });//'1'返回首页，“2”返回频道页
  },
  //点击查看卡券信息
  opencoupe: function (event) {
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
    })
  },
  //关闭提示框
  closeTask: function (e) {
    myjCommon.logFormId(e.detail.formId);
    var that = this;
    that.setData({
      objcoupe: null,
      isHowtast: false,
      isBagsucess: false,
      isNoMember: false,
      isBag: false

    })
  },
  //载入券列表
  loadCardList: function () {
    var that = this;
    var curUser = myjCommon.getCurrentUser();
    if (that.data.pageIndex == 1) {
      that.setData({
        cardList: []
      });
    }
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetChannelCoupons",//获取频道券列表
      biz: { channelId: app.channelId, pageSize: that.data.pageSize, pageIndex: that.data.pageIndex, sessionId: curUser.sessionId },
      success: function (res) {
        console.log(res);
        var list = that.data.cardList.concat(res.Data);
        that.setData({
          cardList: list
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
        console.log("加载失败：" + JSON.stringify(msg));
        /*
        wx.showModal({
          title: '页面加载失败',
          content: "目前太多人了﹋o﹋请稍后再试！",
          showCancel: false
        });
        */
      },
      complete: function (res) {

        //console.log("testApi完成：" + JSON.stringify(res));
        that.setData({
          isLoading: false
        });
      }
    });
  },


  //获取页面配置（广告）
  loadPageConfig: function () {
    var that = this;
    console.log("pp")
    console.log(that.data.channelId)
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        that.setData({
          mainMinHeight: res.screenHeight - 185
        });
      }
    });

    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetChannelBanner",//获取频道Banner
      biz: { channelId: app.channelId },
      success: function (res) {
        console.log(4546)
        console.log(res)
        that.setData({
          bannerList: res,
        });
        that.getLoginUserAndLoad();
      },
      fail: function (msg) {
        console.log("获取页面配置失败：" + JSON.stringify(msg));

        wx.hideLoading();
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });

  },

  getLoginUserAndLoad: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
      }
      else {
        that.setData({
          userInfo: user.userInfo,
          isShowUserInfoBtn: false
        });

        //    that.loadCardList();

      }
    });

  },
  getUserInfoBtnClick: function (e) {
    console.log(e);
    if (e.detail.errMsg == "getUserInfo:ok") {
      this.getLoginUserAndLoad();
    }
  },

  //弹出礼包活动 
  GetGiftBagActivity: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        //wx.showModal({
        //  title: '提示',
        //  content: "登录失败，请稍后重试。",
        //  showCancel: false
        //});
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetGiftBagActivity",
        biz: { sessionId: user.sessionId, channel: that.data.channel },
        success: function (res) {
          console.log("新人礼包")
          console.log(res);
          /*if (res.Code != null) {
            //不是会员，弹出“成为会员”弹出框
            if (res.Code == "301") {
              that.setData({
                isShowGetCardInfo: true
              })
              return;
            }
          }*/

          if (res.Result != null) {
            console.log(666)
            if (res.Result.length > 0) {
              that.setData({
                GiftBag: res.Result[0].ActivityName,
                currGiftBagId: res.Result[0].Id,
                isBag: true
              });
            }
          }

        },
        fail: function (msg) {
          console.log("礼包加载失败：" + JSON.stringify(msg));
          /*
          wx.showModal({
            title: '提示',
            content: "加载失败，请重试或与客服联系。" + JSON.stringify(msg),
            showCancel: false
          });
          */
        },
        complete: function (res) {
          console.log("礼包加载完成：" + JSON.stringify(res));
        }
      });
    });
  },
  //领取礼包
  getBag: function (e) {
    var fromId = e.detail.formId;
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        //wx.showModal({
        //  title: '提示',
        //  content: "登录失败，请稍后重试。",
        //  showCancel: false
        //});
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.AddMemberGiftBag",
        biz: { sessionId: user.sessionId, channel: that.data.channel, giftBagId: that.data.currGiftBagId, formId: fromId },
        success: function (res) {
          console.log(res);
          if (res.Code != null) {
            //不是会员，弹出“成为会员”弹出框
            if (res.Code == "301") {
              that.setData({
                isNoMember: true,
                isBag: false
              })
              return;
            }
          }

          if (res.Result.msg == "成功") {
            that.setData({
              isBag: false,
              isBagsucess: true
            })
          }
        },
        fail: function (msg) {
          console.log("领取失败：" + JSON.stringify(msg));
          wx.showModal({
            title: '领取失败',
            content: "目前太多人了﹋o﹋请稍后再试。",
            showCancel: false
          });
        },
        complete: function (res) {
          console.log("礼包领取完成：" + JSON.stringify(res));

        }
      });
    });
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("channelId:" + options.channel);
    //options.channel ="t432327716";
    //获取频道参数:频道ID；
    if (options.channel != undefined) {
      app.channelId = options.channel;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    this.setData({
      currentType: 0,
      pageIndex: 1,
      cardList: [],
      isLoading: true,
      isCompleted: false
    });
    this.loadPageConfig();
    this.GetGiftBagActivity();
    //this.getLoginUserAndLoad();
    console.log("index onShow");
    if (app.channelId != undefined) {
      this.loadCardList();
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("onHide");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload");
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    //console.log("下拉");
  },
  onPageScroll: function (obj) {
    //console.log(obj);
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
  onReachBottom: function (event) {
    if (this.data.isCompleted) {
      return;
    }
    this.data.pageIndex++;
    this.loadCardList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  imageLoad: function (e) {
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
    console.log(imgwidth, imgheight)
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
  bindchange: function (e) {
    this.setData({ current: e.detail.current })
  },


})