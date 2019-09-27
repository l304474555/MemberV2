
// pages/yhq_index/yhq.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var WxParse = require('../../wxParse/wxParse.js');
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
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
    isOpenPage: false,
    currAppid: "wx55595d5cf709ce79", //当前小程序的appid
    clock: '',
    hr: 0, //倒计时：时。分。秒
    minite: 0,
    second: 0,
    isShowUserInfoBtn:false,
    isSending:false,
    /*专题页可放积分兑换功能需求 add by 黎梅芳 20190715*/
    currCity:'',//当前定位的城市
    LoadingDesc:'',
    isSelectCity:false,
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP",
    isEnave: false, //积分不足弹框
    isChange: false, //确认是否兑换弹框
    disabled: false,
    cardinfo: null, //券信息
    deducContent: '',
    forwardCnt: 0,
    province:'',
    isSucessTask:false
  },
  /**定位用户所在的城市 add by 黎梅芳 20190715 */
  location:function()
  {
   //先判断全局城市有没有如果有直接取全局城市，没有则重新定位
    if (app.globalData.currCity != '' && app.globalData.currProvince != '')
   {
     this.setData({
       currCity: app.globalData.currCity,
       province: app.globalData.currProvince
     });
   }else
   {
     let that=this;
     //调用微信api获取用户所在的经纬度，通过经纬度调用腾讯地图获得用户所在的城市
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          // 调用接口 根据经纬度去获取所在城市
          that.setData({
            LoadingDesc: "城市定位中，请稍候……"
          });
          var demo = new QQMapWX({
            key: that.data.key // 必填
          });
          demo.reverseGeocoder({
            location: {
              latitude: latitude,
              longitude: longitude
            },
            success: function (res) {
              that.setData({
                LoadingDesc: "",
                currCity: res.result.address_component.city,
                province: res.result.address_component.province
              });
              app.globalData.currCity = res.result.address_component.city;
              app.globalData.currProvince = res.result.address_component.province;
              app.globalData.latitude = res.result.address_component.latitude;
              app.globalData.longitude = res.result.address_component.longitude;
            },
            fail: function (res) { 
              that.setData({
                LoadingDesc: "",
                isSelectCity: true
              });
            },
            complete: function (res) {}
          });
        },
        fail: function (res) {
          that.setData({
            isSelectCity:true
          });
         },
        complete: function (res) { }
      });
   }
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
    //视频链接
    var videoUrl = event.currentTarget.dataset.videourl;
    //视频封面图片
    var poster = event.currentTarget.dataset.imageurl;
    //bannerId
    var bannerId = event.currentTarget.dataset.id;
    //频道id
    var channelid = event.currentTarget.dataset.channelid;

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
          biz: { sessionId: user.sessionId, bannerId: bannerId },
          success: function (res) {
            console.log(res)
          },
          fail: function (msg) {
            console.log("计算浏览人数失败：" + JSON.stringify(msg));
          },
          complete: function (res) {
          }
        })


        if (typeid > 1) {
          if (typeid == 4) {//跳转到网页
            wx.navigateTo({ url: '../bannerWeb/bannerWeb?bannerUrl=' + bannerUrl })
          } else if (typeid == 3)//频道页
          {
            app.channelId = channelid;
            wx.redirectTo({ 
              url: '../yhq_channel/yhq_channel',
              success:function()
              {
                console.log("哈哈哈")
              }
            });
            
          }
          else if (typeid == 2) {//跳转到小程序
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
          }
        }

      });

    } else if (bannertype == 1){
      wx.navigateTo({ url: '../yhq_video/yhq_video?videoId=' + bannerId })
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
    var that=this;
    var cardInfo = that.getCardInfo(cardId);
    
    console.log(cardInfo.CardStatus)
    if (cardInfo.CardStatus != "立即领取") {
      return;
    }
    if (coupontype == 2) { //广告区
      that.data.isSending = false;
      if (jump == "跳转小程序") {
        if (appid == that.data.currAppid) //跳转到当前小程序的其他页面
        {
          wx.reLaunch({
            url: pagepath,
            success: function () {
              console.log("success")
            }
          })
        } else //跳转到其他小程序
        {
          wx.navigateToMiniProgram({
            appId: appid,
            path: pagepath,
            envVersion: 'release',
            success(res) { }
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
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        wx.hideLoading();
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
          formId: formId },
        success: function (res) {
          if (res.Code == "0") {
            if (cardInfo.GiftType==2)//兑换码
            {
              wx.showModal({
                title: '领取成功',
                content: '请在美宜佳会员小程序--积分换券--礼品的“兑换记录”查看您的兑奖码',
                showCancel: false
              });
            }else
            {
              wx.showModal({
                title: '领取成功',
                content: "券将在3分钟内派发到您的账户上，请在“我的券”查看券信息，谢谢！",
                showCancel: false
              });
            }
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
            cardInfo.CardStatus = "已领取";
            if (that.data.objcoupe != null && that.data.objcoupe.Id == cardInfo.Id) {
              that.data.objcoupe.CardStatus = "已领取";
            }
            that.setData({
              cardList: that.data.cardList,
              objcoupe: that.data.objcoupe
            });
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
    }
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
      isChange:false,
      isSucessTask:false
    })
  },
  //载入券列表
  loadCardList: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
    if (that.data.pageIndex == 1) {
      that.setData({
        cardList: []
      });
    }
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetChannelCoupons",//获取频道券列表
      biz: { 
        channelId: app.channelId, 
        pageSize: that.data.pageSize, 
        pageIndex: that.data.pageIndex, 
        sessionId: user.sessionId 
        },
      success: function (res) {
        console.log(res);
        var list = that.data.cardList.concat(res.Data);
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
        }
      },
      fail: function (msg) {
        console.log("GetChannelCoupons失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
        that.setData({
          isLoading: false
        });
      }
    });
    });
  },


  //获取页面配置（广告）
  loadPageConfig: function () {
    var that = this;
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
        console.log(res);
        /**禁止转发 2018.05.23 */
        if(res.length > 0)
        {
          if (res[0].IsNoForward) {
            wx.hideShareMenu()
          }
        }
        that.setData({
          bannerList: res,
        });
        that.getLoginUserAndLoad();
      },
      fail: function (msg) {
        console.log("GetChannelBanner失败：" + JSON.stringify(msg));

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
      }
    });

  },
  getUserInfoBtnClick: function (e) {
    console.log(e);
    if (e.detail.errMsg == "getUserInfo:ok") {
      this.getLoginUserAndLoad();
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //测试
   // app.channelId = "f1300590148";
    console.log(options.channel)
    //获取频道参数:频道ID；
    if (options.channel != undefined) {
      app.channelId = options.channel;
    }
    /**加载广告图 */
    this.loadPageConfig();
    /**定位 */
    this.location();
  },
  setTicketStatus: function () {
    if (this.data.isOpenPage) {
      var list = this.data.cardList;
      var isChanged = false;
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (item.CardStatus != "未开始" && item.CardStatus != "立即领取") {
          continue;
        }
        var spArr = item.HBeginTime.split('T');
        var spDate = spArr[0].split('-');
        var spTime = spArr[1].split(':');
        var begin = new Date(spDate[0], spDate[1] - 1, spDate[2], spTime[0], spTime[1], spTime[2]).getTime();

        var now = new Date().getTime();
        if (item.CardStatus == "未开始") {
          if (begin <= now) {
            item.CardStatus = "立即领取";
            isChanged = true;
            //console.log("状态改变");
          }
        }
        else{
          var spArr1 = item.HEndTime.split('T');
          var spDate1 = spArr1[0].split('-');
          var spTime1 = spArr1[1].split(':');
          var end = new Date(spDate1[0], spDate1[1] - 1, spDate1[2], spTime1[0], spTime1[1], spTime1[2]).getTime(); //new Date(item.HEndTime).getTime();
          if(end <= now){
            item.CardStatus = "已结束";
            isChanged = true;
          }
        }
      }
      if (isChanged) {
        this.setData({
          cardList: list
        });
      }
      var that = this;
      setTimeout(function () {
        that.setTicketStatus();
      }, 1000);
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
    this.data.isOpenPage = true;
    this.setData({
      currentType: 0,
      pageIndex: 1,
      cardList: [],
      isLoading: true,
      isCompleted: false
    });
    console.log("index onShow");
    console.log(app.channelId);
    if (app.channelId != undefined) {
      this.loadCardList();
      this.setTicketStatus();
    }
    if (app.currCity)
    {
      this.setData({
        currCity: app.currCity,
        province: app.currProvince
      });
    }
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.data.isOpenPage = false;
    console.log("onHide");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.data.isOpenPage = false;
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
  /**倒计时 */
  /* 毫秒级倒计时 */
  countdown: function (total_micro_second) {
    var that = this;
    var data = that.data.cardList;
    for (var i = 0; i < data.length; i++) {
      if (data[i].CardStatus == "立即领取" && data[i].CouponType !=2) {
        //计算百分比进度条
        if (((data[i].Stocks - data[i].ReStocks) / data[i].Stocks) * 100 < 1) {
          data[i].Process = 1;
        } else {
          data[i].Process = parseInt(((data[i].Stocks - data[i].ReStocks) / data[i].Stocks) * 100)
        }
      }

      if (data[i].CardStatus == "未开始") {
        var begintime_ms = Date.parse(new Date(that.getcurDate().replace(/-/g, '/'))); //begintime 为开始时间
        var endtime_ms = Date.parse(new Date(data[i].BeginTime.replace(/-/g, '/')));   // endtime 为结束时间 
        var timeJ = endtime_ms - begintime_ms;
        var timestr = that.dateformat(timeJ);
        data[i].hour = timestr.substring(0, 2);
        data[i].minute = timestr.substring(3, 5);
        data[i].second = timestr.substring(6, 8);
        total_micro_second = timeJ;
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
    setTimeout(function () {
      // 放在最后--
      //total_micro_second -= 10;
      that.countdown(total_micro_second);
    }
      , 1000);
    return that.dateformat(total_micro_second);
  },

  // 时间格式化输出，如3:25:19 86。每10ms都会调用一次
  dateformat: function (micro_second) {
    // 秒数
    var second = Math.floor(micro_second / 1000);
    // 小时位
    var hr = Math.floor(second / 3600) < 10 ? '0' + Math.floor(second / 3600) : Math.floor(second / 3600);
    // 分钟位
    var min = Math.floor((second - hr * 3600) / 60) < 10 ? '0' + Math.floor((second - hr * 3600) / 60) : Math.floor((second - hr * 3600) / 60);
    // 秒位
    var sec = (second - hr * 3600 - min * 60) < 10 ? '0' + (second - hr * 3600 - min * 60) : (second - hr * 3600 - min * 60) < 10 ? '0' + (second - hr * 3600 - min * 60) < 10 ? '0' + (second - hr * 3600 - min * 60) : (second - hr * 3600 - min * 60) : (second - hr * 3600 - min * 60) < 10 ? '0' + (second - hr * 3600 - min * 60) : (second - hr * 3600 - min * 60);  // equal to => var sec = second % 60;
    // 毫秒位，保留2位
    var micro_sec = Math.floor((micro_second % 1000) / 10);
    return hr + ":" + min + ":" + sec;
  },
  getcurDate: function () {
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
    var M = (date.getMonth()
      + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //日
    var D = date.getDate()
      < 10 ? '0' + date.getDate() :
      date.getDate();
    var hr = date.getHours();
    var minite = date.getMinutes();
    var secnde = date.getSeconds();
    return Y + "-" + M + "-" + D + " " + hr + ":" + minite + ":" + secnde;
  },
  /**查看兑换码--跳到会员小程序礼品兑换记录页查看 */
  sdeepcode: function () {
    wx.navigateToMiniProgram({
      appId: 'wxc94d087c5890e1f8',
      path: 'pages/member_gift/member_gif'
    });
  },
  /**积分换券 */
  intergalex: function (event) {
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
  yesExcange: function (e) {
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
      function (user) {
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
              cityName: that.data.province,
              formId: that.data.formId
            }, //source:来源：1 优惠券小程序；2 会员小程序  formId:表单Id
            success: function (res) {
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
            fail: function (msg) {
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
            complete: function (res) {
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
  ncloseTast:function()
  {
    this.setData({
      isEnave:false,
      isJfCoupons:false
    });
  },
  //切换当前城市：跳转到选择城市列表
  changeCity: function () {
    this.setData({
      isSelectCity: false
    });
    wx.navigateTo({
      url: '../yhq_dw/yhq_dw?target=cahnnel'
    })
  }


})