// pages/search/search.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSize: 10, //页的大小
    pageIndex: 1, //页号
    channel: 0,  //渠道 0：优惠劵 1：会员 2：优惠劵和会员 3：其它 4：优惠劵和其它 5：会员和其它 6：优惠劵，会员和其它
    isCompleted: false, //是否加载完数据
    seachvalue: "", //搜索关键字
    searchtype: 0, //搜索类型：1 关键字 0 扫一扫
    usercoupeList: [], //用户的券列表
    coupeList: [], //券列表
    objcoupe: null, //优惠券详情
    isHowtast: false, //是否显示优惠券详情弹框
    usercoupe: null, //优惠券详情
    isHowusertast: false,
    isShowGetCardInfo:false, //非会员弹框
    isbind:false, //解绑旧账号
    currentCity:'',// 当前所在城市
    crmNo:'', //参与商品活动号
    isShowUserInfoBtn:false, //授权弹框
    isentyGoods:false, //参与商品弹框
    isnotentyGoods:false, //非参与商品弹框
    seeOthergoodObj:null, //查看参与商品信息
    minHeight:0 ,
    issearchhasdata:true,
    inputValue:"",
    madewords:"",
    clock: '',
    hr: 0, //倒计时：时。分。秒
    minite: 0,
    second: 0,
    israndoncard:false, //随机显示5条可领数据时隐藏“其他可领优惠券”

    //积分换券 2018.10.18
    isEnave: false, //积分不足弹框
    isChange: false, //确认是否兑换弹框
    disabled: false,
    cardinfo: null, //券信息
    deducContent: '',
    isShowSelectSore: false, //定位失败弹框选择门店
    storegroupList:''//门店组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("关键字：" + options)
    // options.fromohterstorecode ='粤10000';
    // options.fromohtergoods ='61000049'

    if (options.searchvalue != undefined) {
      this.setData({
        seachvalue: options.searchvalue,
        searchtype: options.searchtype,
        inputValue: options.searchvalue
      });
      this.loaddata();
    } //从其他小程序传进来的门店号和商品代码 add by 黎梅芳 20190801
    else if (options.fromohterstorecode != undefined && options.fromohtergoods!=undefined)
    {
      this.setData({
        storeCode: options.fromohterstorecode,
        seachvalue: options.fromohtergoods,
        searchtype:0
      });
      this.loaddata();
    }
    else
    {
      this.setData({
        madewords: app.madewords
      });
    }
    // var pages = getCurrentPages();
    // var prevPage = pages[pages.length - 2]; //获取上一页的信息:订单数据
    // if (prevPage.data.storeGroupList!='') {
    //   this.setData({
    //     storegroupList: prevPage.data.storeGroupList
    //   });
    // }
  },
  /**关键字搜索 */
  searchData:function(event)
  {
    var keyword = event.detail.value;
    if(keyword!=undefined)
    {
      this.setData({
        seachvalue:keyword,
        inputValue:keyword,
        searchtype: 1,
        issearchhasdata:true,
        coupeList:[],
        usercoupeList:[],
        pageIndex:1

      });
      this.loaddata();
    }
    this.RecordSearcJournal(keyword);
  },
  /**记录搜索商品到日志*/
  RecordSearcJournal: function (searchContent) {
    var that = this;
    myjCommon.getLoginUser(function (user) {
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
        success: function (res) {

        },
        fail: function (msg) {
          console.log("调用RecordSearcJournal失败：" + JSON.stringify(msg))
        },
        complete: function (res) {
        }
      });
    });
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
    console.log("onshow")
   this.setData({
     usercoupeList: [], //用户的券列表
     coupeList: [],
     pageSize: 10, //页的大小
     pageIndex: 1,
     isCompleted:false
   });
   if (app.currCity!=undefined)
   {
     this.setData({
       currentCity:app.currCity
     });
   }else
   {
     var storeinfo = wx.getStorageSync("newstoreinfo");
     if (storeinfo && storeinfo.City)
     {
       app.currCity = storeinfo.City
     }
   }
   console.log(this.data.currentCity)
  },/**扫一扫 */
  scan:function()
  {
    var that=this;
    wx.scanCode({
      success: (res) => {
        console.log("扫一扫结果")
        console.log(res)
        var result=res.result;
        that.setData({
          seachvalue:result,
          searchtype:0,
          inputValue:"",
          pageIndex:1
        });
        that.loaddata();
      },
      fail:function(res)
      {
        that.loaddata();
      },
      complete:function()
      {}
    })
  },
  /**查询数据 */
  loaddata: function () {
    var that = this;
    that.setData({
      issearchhasdata:true
    });
    
    var storeCode='';
    if (that.data.storeCode) {
      storeCode = that.data.storeCode
    }else
    {
    var storeinfo = wx.getStorageSync("storeinfo");
    if (storeinfo != '') {
      storeCode = storeinfo.storeCode;
    }else{
        that.setData({
          isShowSelectSore:true
        })
        return;
    }
    }

    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return false;
      }
     /* wx.showLoading({
        title: '数据加载中...',
      });*/

      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetSearchCouponList",
        biz: { 
          sessionId: user.sessionId, 
          storeCode: storeCode, 
          type: that.data.searchtype, 
          searchValue: that.data.seachvalue, 
          pageSize: that.data.pageSize, 
          pageIndex: that.data.pageIndex, 
          channel: that.data.channel 
          },
        success: function (res) {
          console.log("搜索商品")
          console.log(res)
          if (res.Result != null) {
            if (res.Result.UData.length > 0) {
              that.setData({
                usercoupeList: res.Result.UData,
                minHeight: 65
              });

            }else{
              usercoupeList: []
            }
            if (res.Result.Data.length > 0) {
              var list = that.data.coupeList.concat(res.Result.Data);
              that.setData({
                coupeList: list
              });
              that.countdown("");
              //是否加载完
              var pCount = parseInt(res.Result.Total / that.data.pageSize);
              if (res.Result.Total % that.data.pageSize > 0) {
                pCount++;
              }
              if (that.data.pageIndex >= pCount) {
                that.setData({
                  isCompleted: true,
                  minHeight: 64
                });
              }

            } else {
              that.setData({
                coupeList: []
              });
              //随机显示5条未抢光的数据
              that.gettop5coupon();
            }

            if (res.Result.Data.length <= 0 && res.Result.UData.length<=0)
            {
              that.setData({
                issearchhasdata:false,
                minHeight:53,
                coupeList: []
              });
            }
          }
      
        },
        fail: function (msg) {
          console.log("GetSearchCouponList失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
         
        }
      });
    });
  },
  /**当未查询到相关商品时随机显示5条数据 */
  gettop5coupon:function()
  {
    var that=this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetTop5CardListData",
        biz: {
          sessionId: user.sessionId,
          cityName: app.currCity,
          channel:0
        },
        success: function (res) {
          console.log(res)
         if(res.Data.length>0)
         {
           that.setData({
             coupeList:res.Data,
             israndoncard:true,
             isCompleted:true
           });
         }

        },
        fail: function (msg) {
          console.log("随机取5条数据GetTop5CardListData失败：" + JSON.stringify(msg));
        },
        complete: function (res) { }
      })
     
    });
  },
  /**查看券详情 */
  openusercoupe:function(event)
  {
    var that = this;
    var id = event.currentTarget.dataset.id; //主键id
    var target = event.currentTarget.dataset.target;
    var vibid = event.currentTarget.dataset.vibid;//crm活动号
    var coupon = null;
    var target = 'yhq';
    if (id <= 0 || id == null) {
      target = 'crm'
      id = vibid;
    }
    for (var i = 0; i < this.data.usercoupeList.length; i++) {
      var obj = this.data.usercoupeList[i];
      if (obj.Id == id) {
        coupon = obj;
        break;
      }
    }
    if (coupon != null && coupon.Remark) {
      WxParse.wxParse('article', 'html', coupon.Remark, that, 1);
      console.log(coupon)
      that.setData({
        usercoupe: coupon,
        isHowusertast: true
      });
      return;
    }
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetCouponRemark",
      biz: { id: id,
        target: target },
      success: function (res) {
        if (coupon != null) {
          coupon.Remark = res;
        }
        WxParse.wxParse('article', 'html', res.Result, that, 1);
        that.setData({
          usercoupe: coupon,
          isHowusertast: true
        })
      },
      fail: function (msg) {
        console.log("加载失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });

  },
  //点击查看卡券信息
  opencoupe: function (event) {
    var that = this;
    var id = event.currentTarget.dataset.id; //主键id
    var vibid = event.currentTarget.dataset.vibid;//crm活动号
    var coupon = null;
    var target = 'yhq';
    if (id <= 0 || id == null) {
      target = 'crm'
      id = vibid;
    }
    var coupon = null;

      for (var i = 0; i < that.data.coupeList.length; i++) {
        var obj = that.data.coupeList[i];
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
      biz: { id: id,
        target: target },
      success: function (res) {
        if (coupon != null) {
          coupon.Remark = res;
        }
        WxParse.wxParse('article', 'html', res.Result, that, 1);
        that.setData({
          objcoupe: coupon,
          isHowtast: true
        })
        console.log("券详情")
        console.log(coupon)
      },
      fail: function (msg) {
        console.log("加载失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });

    console.log(coupon)
  },
  /**关闭优惠券弹框 */
  closeTask: function () {
    this.setData({
      isHowtast: false,
      isHowusertast:false,
      isnotentyGoods:false,
      isentyGoods:false,
      isSucessTask:false,
      isChange:false
    });
  },
  //取得卡片信息
  getCardInfo: function (cardId) {
    var list = this.data.coupeList;
    
    var obj;
    for (var i = 0; i < list.length; i++) {
      obj = list[i];
      if (obj.Id == cardId) {
        break;
      }
    }
    return obj;
  },
  /**查看参与商品 */
  seeothergoods:function(e)
  {
    var crmno = e.detail.target.dataset.crmno;
    console.log(crmno)
    var that = this;
    that.setData({
      crmNo:crmno,
      isHowtast:false,
      isHowusertast:false,
      isentyGoods:false,
      isnotentyGoods:false,
      seeOthergoodObj:null
    });
    myjCommon.getLoginUser(function (user) {
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
          console.log("扫描结果")
          console.log(res)
          myjCommon.callApi({
            interfaceCode: "WxMiniProgram.Service.SearchGoodsByCrmNo",
            biz: { crmNo: crmno, productCode: res.result },
            success: function (res) {
              console.log("参与商品")
              console.log(res)
              that.loaddata();
                 if(res.Code==0) //有商品
                 {
                   wx.showToast({
                     title: res.Msg,
                   })
                   
                 }else if(res.Code==2) //非参与商品
                 {
                   that.setData({
                     isentyGoods: false,
                     isnotentyGoods:true
                   });
                 }
                 else if (res.Code == 1) //参与商品
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
            fail: function (msg) {
              console.log("SearchGoodsByCrmNo失败：" + JSON.stringify(msg));
            },
            complete: function (res) {
            }
          });
        },
        fail:function(msg)
        {
          that.loaddata();

        },
        complete:function(msg)
        {

        }
      })
    
    });
  },
  //领券
  getCard: function (event) {
    var that = this;
    var cardId = event.detail.target.dataset.cardid;
    var formId = event.detail.formId;
    var cardInfo = that.getCardInfo(cardId);

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
    if (cardInfo.CardStatus != "立即领取") {
      return;
    }
    if (coupontype == 2) {//广告区
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
            success(res) {
            }
          });
        }
      }
      if (jump == "跳转频道页") {
        that.setData({
          isHowtast: false
        });
        wx.reLaunch({ url: '../yhq_channel/yhq_channel?channel=' + channelpageId })
      }
      if (jump == "跳转链接") {
        that.setData({
          isHowtast: false
        });
        wx.redirectTo({ url: '../bannerWeb/bannerWeb?bannerUrl=' + bannerUrl })
      }
    }
    else {
      wx.showLoading({
        title: '正在提交……',
        mask: true
      });
      var that = this;
      //关闭券详情弹框
      that.setData({
        isHowtast: false
      });
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
          biz: { cardId: cardId, sessionId: user.sessionId, mflag: mflag, source: 1, formId: formId },
          success: function (res) {
            if (res.Code == "0") {
              that.setData({
                isSucessTask: true //领取成功弹框
              });
            }
            else if (res.Code == "301") {
              //非会员
              that.setData({
                isShowGetCardInfo: true,
                isHowtast: false
              });
            }
            else if (res.Code == "4014") {
              that.setData({
                isbind: true
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
               // that.data.usercoupeList.push(that.data.objcoup);
              }
              that.setData({
                coupeList: that.data.coupeList,
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
    }
  },
  //切换当前城市：跳转到选择城市列表
  changeCity: function () {
    var that=this;
    wx.navigateTo({
      url: '../yhq_dw/yhq_dw?target=index',
      success:function()
      {
        that.setData({
          isCompleted:false
        });

    setTimeout(function () {
      that.loaddata();
    }, 2000);
       
      },fail:function()
      {

        that.setData({
          isCompleted:false
        });
        that.loaddata();
      },complete:function()
      {

      }
    })
  },
  //领取会员卡
  getMemberCard: function (e) {
    this.setData({
      isShowGetCardInfo: false
    });
   // myjCommon.logFormId(e.detail.formId);
    //wx.switchTab({ url: "/pages/member_card/index" });
    wx.reLaunch({
      url: '/pages/member_card/index',
    })
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
    if (this.data.isCompleted) {
      return;
    }
    this.data.pageIndex++;
    this.loaddata();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**倒计时 */
  /* 毫秒级倒计时 */
  countdown: function (total_micro_second) {
    var that = this;
    var data = that.data.coupeList;
    for (var i = 0; i < data.length; i++) {
      if (data[i].CardStatus == "立即领取" && data[i].CouponType <= 1) {
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
      coupeList: data
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
  /**积分换券 */
  intergalex: function (event) {
    //获取券信息
    let cardinfo = event.detail.target.dataset.cardinfo;
    //1、弹出确认是否兑换弹框
    this.setData({
      isHowtast:false,
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
        var cardInfo = that.getCardInfo(that.data.cardinfo.Id); //根据id获取券对象
        if (cardInfo == null) {
          wx.showModal({
            title: '提示',
            content: '兑换暂不能兑换，请稍后再来兑换哦！',
            showCancel: false
          });
          console.log("券id:" + that.data.cardinfo.Id);
          console.log(cardInfo);
        } else {
          console.log("兑换所需的积分：" + that.data.cardinfo.Integral)
          //开始兑换
          myjCommon.callApi({
            interfaceCode: "WxMiniProgram.Service.GCChangeMPCoupon",
            biz: {
              sessionId: user.sessionId,
              cardId: that.data.cardinfo.Id,
              GCCnt: that.data.cardinfo.Integral,
              source: 1, //1 优惠券小程序；2 会员小程序
              cityName: app.currProvince,
              formId: that.data.formId
            },//source:来源：1 优惠券小程序；2 会员小程序  formId:表单Id
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

                that.setData({
                  isSucessTask: true,
                  isChange: false
                });
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

      }
    );
  },
  /**积分换券关闭框 */
  ncloseTast: function () {
    this.setData({
      isEnave: false
    });
  },
  changeStore: function () {
    this.setData({
      isShowSelectSore: false
    });
    wx.navigateTo({
      url: '../yhq_choose_store/yhq_choose_store',
    });
  },
  /**跳到微信付款码页 */
  url_wxpay: function (e) {
    this.setData({
      noMemberTask: false
    });
    myjCommon.logFormId(e.detail.formId);
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.MPCouponMberPay",
      biz: {},
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
              console.log("哈哈")
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

      }
    });
  },
})