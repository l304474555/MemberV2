var app = getApp();
var myjCommon = require("../../utils/myjcommon.js")
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex:1,
    pageSize:10,
    isCompelete:false,
    CouponList:[], //券列表
    storeCode:'',//门店号
    storeName:'',//门店名称
    isCoupondtlTast:false, //券详情弹框
    isShowUserInfoBtn:false,
    noMemberTask:false,//非会员弹框
    clock: '',
    hr: 0, //倒计时：时。分。秒
    minite: 0,
    second: 0,
    isSending: false,
    objcoupe:false,
    isSucessTask:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    options.storecode='0198'
    console.log(options.storecode);
    let storecode ='';
    if (options.storecode!=undefined)
    {
      storecode = options.storecode;
      this.setData({
        storeCode:options.storecode
      });
      this.getStoreName();
    }else
    {
      wx.showModal({
        title: '温馨提示',
        content: '抱歉，没有获取到门店号查不到相关券信息，请检查是否已设置门店号',
        showCancel:false
      });
    }
  },
  /**根据店铺代码获取店铺名称 */
  getStoreName:function()
  {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      console.log(user)
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.getStoreName",
        biz: { storeCode: that.data.storeCode, sessionId:user.sessionId },
        success: function (res) {
          console.log("获取门店名称")
          console.log(res)
         if(res.Code=="0")
         {
           that.setData({
             storeName: res.Result
           });
         } else if (res.Code == "301") //非会员
         {
           that.setData({
             noMemberTask:true
           });
           return;
         }
        },
        fail: function (msg) {
          console.log("获取门店名称失败----getStoreName：" + JSON.stringify(msg));
        },
        complete: function (res) {
          that.getCounponList();
        }
      });
    });
  },
  /**获取券列表 */
  getCounponList:function()
  {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      console.log(user)
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetShopActivityList",
        biz: {
          storeCode: that.data.storeCode,
          pageSize: that.data.pageSize,
          pageIndex: that.data.pageIndex,
          sessionId:user.sessionId
         },
        success: function (res) {
          console.log("券列表")
          console.log(res);
          if (res.Data.length <= 0) {
            res.Data = [];
            that.setData({
              isCompelete: true
            });
          }
          //分页加载
          var list = that.data.CouponList.concat(res.Data)
          that.setData({
            CouponList: list,
          })
          that.countdown("");
          //是否加载完
          var pCount = parseInt(res.Total / that.data.pageSize);
          if (res.Total % that.data.pageSize > 0) {
            pCount++;
          }
          if (that.data.pageIndex >= pCount) {
            that.setData({
              isCompelete: true
            });
          }

        },
        fail: function (msg) {
          console.log("获取券列表失败----GetShopActivityList：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  }
  ,
  //取得卡片信息
  getCardInfo: function (cardId) {
    var list = this.data.CouponList;
    var obj;
    for (var i = 0; i < list.length; i++) {
      obj = list[i];
      if (obj.ActivityId == cardId) {
        break;
      }
    }
    return obj;
  },
  //领取卡片
  getCard: function (event) {
    if (this.data.isSending) {
      return;
    }
    this.data.isSending = true;
    var that = this;
    var cardId = event.detail.target.dataset.cardid;
    var companycode = event.detail.target.dataset.companycode;
    var formId = event.detail.formId;
    var cardInfo = null;
    if (that.data.objcoupe) {
      cardInfo = that.data.objcoupe;
    } else {
      cardInfo = that.getCardInfo(cardId);
    }
    if (cardInfo.CardStatus != "立即领取") {
      this.data.isSending = false;
      return;
    }
   
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
          that.data.isSending = false;
          return false;
        }

        var mflag = "0";

        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.AddShop_Coupon",
          biz: {
            sessionId: user.sessionId,
            activityNo: cardId,
            storeCode: that.data.storeCode,
            companyCode:companycode
          },
          success: function (res) {
            console.log(res)
            if (res.Code == "0") {
              that.setData({
                isSucessTask: true,
                isCoupondtlTast: false
              });
            } else if (res.Code == "300") {
              wx.navigateTo({
                url: '../login/login',
              });
            }
            else if (res.Code == "301") {
              //非会员
              that.setData({
                noMemberTask: true,
                isCoupondtlTast: false
              });
            }  else {
              wx.showModal({
                title: '领取失败',
                content: res.Msg,
                showCancel: false
              });
            }
            if (parseInt(res.Result, 10) < 1) {
              cardInfo.CardStatus = "已领取";
              if (that.data.objcoupe != null && that.data.objcoupe.ActivityId == cardInfo.ActivityId) {
                that.data.objcoupe.CardStatus = "已领取";
              }
              that.setData({
                CouponList: that.data.CouponList,
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
            that.data.isSending = false;
            wx.hideLoading();
          }
        });

      });
    
  },
  /**查看券详情 */
  opencoupe: function (event)
  {
    var id = event.currentTarget.dataset.id; //主键id
    var coupon = null;
    for (var i = 0; i < this.data.CouponList.length; i++) {
      var obj = this.data.CouponList[i];
      if (obj.ActivityId == id) {
        coupon = obj;
        break;
      }
    }
    if (coupon != null ) {
     // WxParse.wxParse('article', 'html', coupon.Remark, this, 1);
      this.setData({
        objcoupe: coupon,
        isCoupondtlTast: true
      });
     // return;
    }
  },
  /**根据id获取券详情 */
  getCouponInfo:function(id)
  {
    let couponInfo=null;
    for (var i = 0; i < this.data.CouponList.length;i++)
    {
      if (this.data.CouponList[i].Id==id)
      {
        couponInfo = this.data.CouponList[i];
        break;
      }
    }
    return couponInfo;
  },
  /**关闭券详情弹框 */
  closeTask:function()
  {
    this.setData({
      isCoupondtlTast: false,
      noMemberTask:false,
      isSucessTask:false
    });
  },
  //领取会员卡
  getMemberCard: function (e) {
    this.setData({
      noMemberTask: false
    });
    wx.reLaunch({
      url: '/pages/member_card/index',
    });
  },
  /**倒计时 */
  /* 毫秒级倒计时 */
  countdown: function (total_micro_second) {
    var that = this;
    var data = that.data.CouponList;
    for (var i = 0; i < data.length; i++) {
      if (data[i].CardStatus == "立即领取") {
        //计算百分比进度条
        if (((data[i].TicketCnt - data[i].ReStocks) / data[i].TicketCnt) * 100 < 1) {
          data[i].Process = 1;
        } else {
          data[i].Process = parseInt(((data[i].TicketCnt - data[i].ReStocks) / data[i].TicketCnt) * 100)
        }
      }

      if (data[i].CardStatus == "未开始") {
        var begintime_ms = Date.parse(new Date(that.getcurDate().replace(/-/g, '/'))); //begintime 为开始时间     
        var endTime = data[i].BeginDate
.replace("T", " ");
        var endtime_ms = Date.parse(new Date(endTime.replace(/-/g, '/')));   // endtime 为结束时间 
        var timeJ = endtime_ms - begintime_ms;
        var timestr = that.dateformat(timeJ);
        data[i].hour = timestr.substring(0, 2);
        data[i].minute = timestr.substring(3, 5);
        data[i].second = timestr.substring(6, 8);
        total_micro_second = timeJ;
      }

    }
    that.setData({
      CouponList: data
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
  getUserInfoBtnClick: function (e) {
    var that = this;
    if (e.detail.errMsg == "getUserInfo:ok") {
      that.getCounponList();
    }
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
    if (this.data.isCompelete)
    {
      return;
    }
    this.data.pageIndex++;
    this.getCounponList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  returnindex:function()
  {
    wx.reLaunch({
      url: '../yhq_index/yhq',
    });
  }
})