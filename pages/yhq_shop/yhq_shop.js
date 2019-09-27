var app = getApp();
var myjCommon = require("../../utils/myjcommon.js")
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currCity:"", //当前城市
    currShopName:"",//店铺名称
    currShopCode: "", //当前店铺代码
    defaultAvatar: "../img/default.png", //默认头像
    userInfo: {}, //用户信息
    pageSize: 10, //页的大小
    pageIndex: 1, //页号
    coupeList: [], //庆店券列表
    isNearyDataCompleted: false, //标识是否加载完数据
    isCompleted:false,
    isShowGetCardInfo: false, //马上成为会员弹框
    isHowtast:false,
    objcoupe:null,
    shopCoupeList:[], //单店券列表
    target:"",
    isshowTask: false //是否显示没有商品的提示语
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //店铺代码
    var shopcode = options.shopcode;
    var shopName = options.shopName;
    if (shopcode != undefined) //地址栏有参数
    {
      this.setData({
        currShopCode: shopcode,
        currShopName: shopName
      });
    }
   
  },
  //加载庆店的券信息列表
  LoadCoupe: function (shopcode) {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      console.log(user)
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }
   
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetStoreCoupon",
        biz: { sessionId: user.sessionId, shopCode: shopcode},
        success: function (res) {
          console.log("券列表")
          console.log(res)
          if (res.EntityList.length<=0) {
            res.EntityList = [];
            that.setData({
              isNearyDataCompleted:true
            });
            
          }
          //分页加载
          var list = that.data.coupeList.concat(res.EntityList)
          that.setData({
            coupeList: list,
          })

        },
        fail: function (msg) {
          console.log("testApi123失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  //获取单店铺券
  LoadShopCoupe: function (shopcode)
  {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }
      wx.showLoading({
        title: '加载中...',
      })
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetStoreCouponOrStore",
        biz: { sessionId: user.sessionId, shopCode: shopcode, pageSize: that.data.pageSize, pageIndex: that.data.pageIndex },
        success: function (res) {
         
          if (res.EntityList == null) {
            res.EntityList = [];
          }
          if (res.EntityList.length<=0) {
            that.setData({
              isshowTask:true
            });
            
          }
          //分页加载
          var list = that.data.shopCoupeList.concat(res.EntityList)
          that.setData({
            shopCoupeList: list,
          })
          var pCount = parseInt(res.TotalCount / that.data.pageSize);
          if (res.TotalCount % that.data.pageSize > 0) {
            pCount++;
          }
          if (that.data.pageIndex >= pCount) {
            that.setData({
              isCompleted: true
            });
          }

        },
        fail: function (msg) {
          console.log("testApi失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });
    });
  },
  
  //取得优惠券信息
  getCardInfo: function (cardId) {
    var list = this.data.coupeList;
    var obj;
    for (var i = 0; i < list.length; i++) {
      obj = list[i];
      if (obj.AcitivityId == cardId) {
        break;
      }
    }
    return obj;
  },
  //取得附近店优惠券信息
  getNearyCardInfo: function (cardId) {
    var list = this.data.shopCoupeList;
    var obj;
    for (var i = 0; i < list.length; i++) {
      obj = list[i];
      if (obj.Id == cardId) {
        break;
      }
    }
    return obj;
  },
  //领取店庆优惠券
  getCard: function (event) {
    var cardId = event.detail.target.dataset.cardid;
    var formId = event.detail.formId;
    var target = event.detail.target.dataset.target;
    var cardInfo =null;
    if (target == "anniversary" || this.data.target =="anniversary")
    {
      cardInfo = this.getCardInfo(cardId);
    }else
    {
      cardInfo = this.getNearyCardInfo(cardId);
    }
  

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
      var mflag = "0";
      console.log(cardId)
      console.log(that.data.currShopCode)
     
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.AddStoreUserCard",
        biz: { crmactionNo: cardId, store: that.data.currShopCode, sessionId: user.sessionId, mflag: mflag, source: 1, formId:formId}, //source:1 优惠券小程序；2 会员小程序
        success: function (res) {
          console.log(res)
          if (res.Code == "0") {
            wx.showModal({
              title: '领取成功',
              content: "领取成功！到店使用微信支付即可自动享受优惠。",
              showCancel: false
            });
          } else if (res.Code == "301") {
            //非会员
            that.setData({
              isShowGetCardInfo: true
            });
          }
          
          else {
            wx.showModal({
              title: '领取失败',
              content: res.Msg,
              showCancel: false
            });
          }
          if (res.Code == "0") {
            cardInfo.CardStatus = "已领取";
            if (that.data.objcoupe != null && that.data.objcoupe.AcitivityId == cardInfo.AcitivityId) {
              that.data.objcoupe.CardStatus = "已领取";
            }
             that.setData({
               coupeList: that.data.coupeList,
               objcoupe: that.data.objcoupe
             });
           }
        },
        fail: function (msg) {
          console.log("testApi失败：" + JSON.stringify(msg));
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
  },
  //领取优惠券
  getNearryCard: function (event) {
    var cardId = event.detail.target.dataset.cardid;
    var formId = event.detail.formId;
    var target = event.detail.target.dataset.target;
    var cardInfo = null;
    if (target == "anniversary") {
      cardInfo = this.getCardInfo(cardId);
    } else {
      cardInfo = this.getNearyCardInfo(cardId);
    }


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
      var mflag = "0";
      console.log(cardId)
      console.log(that.data.currShopCode)

      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.AddUserCard",
        biz: { cardId: cardId, sessionId: user.sessionId, mflag: mflag, source: 1, formId: formId }, //source:1 优惠券小程序；2 会员小程序
        success: function (res) {
          console.log(res)
          if (res.Code == "0") {
            wx.showModal({
              title: '领取成功',
              content: "领取成功！到店使用微信支付即可自动享受优惠。",
              showCancel: false
            });
          } else if (res.Code == "301") {
            //非会员
            that.setData({
              isShowGetCardInfo: true
            });
          }

          else {
            wx.showModal({
              title: '领取失败',
              content: res.Msg,
              showCancel: false
            });
          }
          /*if (res.Code == "0") {*/
            cardInfo.CardStatus = "已领取";
            if (that.data.objcoupe != null && that.data.objcoupe.AcitivityId == cardInfo.AcitivityId) {
              that.data.objcoupe.CardStatus = "已领取";
            }
            that.setData({
              shopCoupeList: that.data.shopCoupeList,
              objcoupe: that.data.objcoupe
            });
         /* }*/
        },
        fail: function (msg) {
          console.log("testApi失败：" + JSON.stringify(msg));
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
  },
  //领取会员卡
  getMemberCard: function (event) {
    wx.reLaunch({ url: "/pages/member_card/index" });
  },
  //关闭弹框
  closeGetCardModal: function () {
    this.setData({
      isShowGetCardInfo: false
    });
  },
  //点击查看卡券信息
  opencoupe: function (event) {
    var article = '';
    var id = event.currentTarget.dataset.id; //主键id
    var target = event.currentTarget.dataset.target;
    var coupe = null;

    var anniversaryList = this.data.coupeList;//店庆
    var nearyList = this.data.shopCoupeList;//附近优惠
    if (target =="anniversary")
    {
      for (var i = 0; i < anniversaryList.length; i++) {
        var obj = anniversaryList[i];
        if (obj.Id == id) {
          coupe = obj;
          article = obj.ActivityDetails;
          break;
        }
      }
    }else
    {
      for (var i = 0; i < nearyList.length; i++) {
        var obj = nearyList[i];
        if (obj.Id == id) {
          coupe = obj;
          article = obj.Remark;
          break;
        }
      }
    }
  
    if (article == null) {
      article = "";
    }
    WxParse.wxParse('article', 'html', article, this, 1);
    var that = this;
    that.setData({
      objcoupe: coupe,
      isHowtast: true,
      target:target
    })
    console.log(coupe)
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
     //展示这个店的活动券
    // 读取当前城市
    var city = app.currCity;
    this.setData({
      currCity: city,
      pageIndex:1,
      isCompleted:false,
      coupeList:[],
      shopCoupeList:[]
    });

    //展示单店的活动券
    this.LoadShopCoupe(this.data.currShopCode);
    this.LoadCoupe(this.data.currShopCode);
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
    this.LoadShopCoupe(this.data.currShopCode);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },//关闭弹框
  closeTask:function()
  {
    this.setData({
      isHowtast: false
    });
  }
  ,
  //切换当前城市：跳转到选择城市列表
  changeCity: function () {
    wx.navigateTo({
      url: '../yhq_dw/yhq_dw?target=index'
    })
  }, //跳回首页
  locationIndex:function()
  {
    wx.reLaunch({
      url: '../yhq_index/yhq'
    })
  }
})