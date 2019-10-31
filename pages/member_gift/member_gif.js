// pages/member_gift/member_gif.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var WxParse = require('../../wxParse/wxParse.js');
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
var utils = require('../../utils/util.js');
const couponAppId = 'wx55595d5cf709ce79';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isMember:false,
    pageIndex: 1,
    pageSize: 10,
    isCompleted: false,
    coupeType: 3, //劵类型 0：支付劵 1：优惠劵 2：广告区3：实物礼品
    exchangeRecordList: [], //兑换记录列表
    rename:'', //收件人信息
    readdress:'', //收货地址
    remobile:'', //收件人号码
    endtime:'', //活动结束时间
    reckey:"",
    ideditexpress:false, //可编辑的快递弹框
    notexpress:false, //不可编辑的快递弹框
    objcoupe:null,
    isHowtast:false,
    isreedcodetast:false, //兑换码弹框
    reedcode:'' //兑换码
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
    this.setData({
      pageIndex:1,
      isCompleted:false,
      exchangeRecordList:[],
      reedcode:''
    });
    this.getMaterial();
  },
  getMaterial: function () {
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
        interfaceCode: "WxMiniProgram.Service.GetExchangeRecord",
        biz: { sessionId: user.sessionId, coupeType: that.data.coupeType, pageSize: that.data.pageSize, pageIndex: that.data.pageIndex },
        success: function (res) {
          console.log("兑换记录列表");
          console.log(res)
         if(res.Code=="301") //非会员
        {
          that.setData({
            isMember: true
          });
           /**初始化注册会员组件方法 */
           that.regerter1 = that.selectComponent("#regerter");
           that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
          return;
        }
          if (res.Result.ExchangRecord.length ==null) {
            res.Result = [];
          }
          //分页加载
          var list = that.data.exchangeRecordList.concat(res.Result.ExchangRecord)
          
          that.setData({
            exchangeRecordList: list,
          })


          var pCount = parseInt(res.Result.TotalRecord / that.data.pageSize);
          if (res.Result.TotalRecord % that.data.pageSize > 0) {
            pCount++;
          }
          if (that.data.pageIndex >= pCount) {
            that.setData({
              isCompleted: true
            });
          }
        },
        fail: function (msg) {
          console.error("GetExchangeRecord失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  /**打开快递信息弹框 */
  expressinfo:function(e)
  {
    //收件人
    var reName = e.currentTarget.dataset.rename;
    //收件地址
    var reAddress = e.currentTarget.dataset.readdress;
    //收件人号码
    var reMobile = e.currentTarget.dataset.remobile;
    //活动结束时间
    var endtime = e.currentTarget.dataset.endtime;
    //唯一键
    var reckey = e.currentTarget.dataset.reckey;
    this.setData({
      reckey: ''
    });
    
    //如果已经填写过有值 则直接显示到弹框上
    if (reName!='')
    {
      this.setData({
        rename:reName
      });

    }
    if (reAddress!='')
    {
      this.setData({
        readdress: reAddress
      });
    }
    if (reMobile != '') {
      this.setData({
        remobile: reMobile
      });
    }
    if(reckey!='')
    {
      this.setData({
        reckey:reckey
      });
    }
    var now = this.getcurDate();

    var dateTmp = now.replace(/-/g, '/')   //为了兼容IOS，需先将字符串转换为'2018/9/11 9:11:23'
    var timesnowtamp = Date.parse(dateTmp) 
    var endtime = endtime.replace(/-/g, '/')
    var endtimesta = Date.parse(endtime)

    if(endtime!=null)
    {
      //活动进行中 可以填写快递信息
      if (endtimesta > timesnowtamp)
      {
        this.setData({
          ideditexpress:true
        });
      }else //活动已结束 则不能再填写快递信息
      {
        this.setData({
          notexpress: true
        });
      }
    }
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
    var M = (date.getMonth() +
      1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //日
    var D = date.getDate() <
      10 ? '0' + date.getDate() :
      date.getDate();
    var hr = date.getHours();
    var minite = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    var secnde = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + "-" + M + "-" + D + " " + hr + ":" + minite + ":" + secnde;
  },
  /**保存快递信息 */
  savexpressinfo:function(e)
  {
    console.log(e);
    var userName = e.detail.value["username"]; //姓名
    var mobile = e.detail.value["mobile"]; //电话
    var adress = e.detail.value["adress"]; //地址
    var that = this;
    if (userName == "" || mobile == "" || adress == "") {
      wx.showToast({
        title: '请填写完整的快递信息。',
        icon: 'none'
      });
      that.setData({
        isExpress: true
      });
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(mobile))) {
      wx.showToast({
        title: '手机号格式填写错误。',
        icon: 'none'
      });
      that.setData({
        isExpress: true
      });
      return;
    } else if (mobile.length > 11) {
      wx.showToast({
        title: '请输入11位手机号。',
        icon: 'none'
      });
      that.setData({
        isExpress: true
      });
      return;
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
          if (res.Code = "ok") {
            wx.showToast({
              title: res.Msg,
              duration: 3000
            });
            that.setData({
              ideditexpress:false,
              pageIndex: 1,
              isCompleted: false,
              exchangeRecordList: [],
              reedcode: ''
            });
            that.getMaterial();
          }else if(res.Code=="301") //非会员
          {
            that.setData({
              isMember:true
            });
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
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
    this.getMaterial();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**关闭弹框 */
  closeTast:function()
  {
    this.setData({
      isHowtast:false,
      isMember:false,
      notexpress:false,
      isreedcodetast:false,
      reedcode:''
    });
  },
  ncloseTast: function () {
    this.setData({
      notexpress:false,
      ideditexpress:false,
      isreedcodetast:false
    });
    //清空弹框信息
    this.setData({
      rename: '', //收件人信息
      readdress: '', //收货地址
      remobile: '' //收件人号码
    });
  },
  //点击券打开券详情弹出框
  OpenCoupe: function (event) {
    var that = this;
    var id = event.currentTarget.dataset.id;
    var coupe = null;
    
      for (var i = 0; i < this.data.exchangeRecordList.length; i++) {
        var obj = this.data.exchangeRecordList[i];
        if (obj.Id == id) {
          coupe = obj;
          break;
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
      biz: { id: id },
      success: function (res) {
        WxParse.wxParse('article', 'html', res, that, 1);
        if (coupetype == 3) //实物弹框
        {
          that.setData({
            objcoupe: coupe,
            ismeritask: true

          });
        } else //优惠券弹框
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
  /**查看兑换码 */
  detailreedcode: function (e) {
    var reedcode = e.currentTarget.dataset.reedcode;
    this.setData({
      isreedcodetast: true,
      reedcode:reedcode
    });
  },
  /**复制兑换码 */
  copyreedcode:function()
  {
    wx.setClipboardData({
      data: this.data.reedcode,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) // data
          }
        })
      }
    });
  },

  /**
   * 创建人：袁健豪
   * 创建时间：20191025
   * 描述：立即查看卡片
   */
  openGameCard(e) {
    let url = e.currentTarget.dataset.url;

    if (!url) {
      return;
    }
    wx.navigateToMiniProgram({
      appId: couponAppId,
      path: url
    });
  }
})