
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js")
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currCity:"",//当前所在城市
    coupeState: 1, //卡券状态
    coupeList: [], //我的券列表
    pageIndex: 1,//页号
    pageSize: 10, //页的大小
    selectColorall: '', //“所有券” 选中颜色设置
    selectColorwait: '',//“待使用” 选中颜色设置
    selectColoexpire: '',//“已过期” 选中颜色设置
    selectColoruse: '',//“已使用” 选中颜色设置
    userInfo:{}, //用户信息
    defaultAvatar: "../img/default.png", //用户默认头像
    isShowMiniNav: false,
    isCompleted:false,
    isLoading: false,
    isHowtast:false,//是否显示弹出框
    objcoupe: null, //现金券对象
    crmNo:'',
    isentyGoods: false,
    isnotentyGoods: false,
    currentClick:1,
    storeinfo:null
   // coupeDsc: "本优惠券只需到店购物时，直接微信支付即可自动抵扣！",
    //barcoude:"" //条形码
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
  jumpApplyFor:function(){
    wx.navigateTo({
      url: '../applyfor/index'
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let storeinfo = wx.getStorageSync("newstoreinfo");
    this.setData({
      storeinfo: storeinfo
    });
    
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    //this.getLoginUser();
    this.notice();

    // this.setData({
    //   coupeState: 1, //卡券状态
    //   coupeList: [], //我的券列表
    //   pageIndex: 1, //页号
    //   selectColorall: '',
    //   selectColorwait: 'color: #d1121a',
    //   selectColoexpire: '',
    //   selectColoruse: '',
    //   noMemberTask: false,
    //   noticeobj: null,
    //   noticeTask: false
    // });
    // this.setData({
      this.data.coupeState = 1, //卡券状态
      this.data.coupeList = [], //我的券列表
      this.data.pageIndex = 1, //页号
      this.data.selectColorall = '',
      this.data.selectColorwait = 'color: #d1121a',
      this.data.selectColoexpire = '',
      this.data.selectColoruse = '',
      this.data.noMemberTask = false,
      this.data.noticeobj = null,
      this.data.noticeTask = false
    // });
    this.loadData();
   
  },
  /**公告 */
  notice: function () {
    var that = this;
    wx.request({
      url: 'https://mimage.myj.com.cn/MicroMallFileServer/update.js?t=' + new Date().getTime().toString(),
      data: {
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success: function (res) {
        console.log(res.data);
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].Pages == "mycoupe" && res.data[i].Upgrade == 1) {
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
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  getUserInfoBtnClick: function (e) {
    console.log(e);
    if (e.detail.errMsg == "getUserInfo:ok") {
      this.loadData();
    }
  },
  loadData: function () {  //加载我的券
    var that = this;
    that.setData({
      isLoading: true
    });
    myjCommon.getLoginUser(function(user){
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        wx.hideLoading();
        return false;
      }
      if (that.data.isShowUserInfoBtn){
        that.setData({
          isShowUserInfoBtn: false
        });
      }
      if (!that.data.userInfo.nickName){
        that.setData({
          userInfo: user.userInfo
        });
      }
      wx.showLoading({
        title: '数据载入中...',
      });
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetUserCardList",
        biz: { sessionId: user.sessionId, status: that.data.coupeState, pageSize: that.data.pageSize, pageIndex: that.data.pageIndex },
        success: function (res) {
          wx.hideLoading();
          console.log(res)
          if(res.Code!=undefined && res.Code=="301")
          {
            that.setData({
              noMemberTask:true
            });
          }
          if (res.EntityList==null){
            res.EntityList = [];
          }
          //分页加载
          var list = that.data.coupeList.concat(res.EntityList);
          that.setData({
            coupeList: list
          })
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
          wx.hideLoading();
          console.log("testApi失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          // 隐藏导航栏加载框
          wx.hideNavigationBarLoading();

          
          // 停止下拉动作
          wx.stopPullDownRefresh();
          wx.hideLoading();
          //console.log("testApi完成：" + JSON.stringify(res));
          that.setData({
            isLoading: false
          });
        }
      });
    });
    
  },
  allCoupe: function () //所有券
  {
    var that = this;
    if (that.data.coupeState == 0) {
      return;
    }
    that.setData({
      coupeState: 0,
      pageIndex: 1,
      isShowMiniNav: false,
      isLoading:false,
      isCompleted:false,
      coupeList:[],
      selectColorwait: '',
      selectColoexpire: '',
      selectColoruse: '',
      selectColorall: 'color: #d1121a'
    })
    this.loadData()
  },
  waitUse: function () { //待使用
    var that = this;
    if (that.data.coupeState == 1) {
      return;
    }
    that.setData({
      coupeState:1,
      pageIndex: 1,
      isShowMiniNav:false,
      isLoading: false,
      isCompleted: false,
      coupeList: [],
      selectColorall: '',
      selectColoexpire: '',
      selectColoruse: '',
      selectColorwait: 'color: #d1121a'
    })
    this.loadData()
  },
  haveExpire: function () { //已过期
    var that = this;
    if (that.data.coupeState==2)
    {
      return;
    }
    that.setData({
      coupeState: 2,
      pageIndex: 1,
      isShowMiniNav: false,
      isLoading: false,
      isCompleted: false,
      coupeList: [],
      selectColoexpire: 'color: #d1121a',
      selectColorall: '',
      selectColorwait: '',
      selectColoruse: ''
    })
    this.loadData()
  },
  havaUse: function () { //已使用
    var that = this;
    if (that.data.coupeState == 3) {
      return;
    }
    that.setData({
      coupeState:3,
      pageIndex: 1,
      isShowMiniNav: false,
      isLoading: false,
      isCompleted: false,
      coupeList: [],
      selectColorall: '',
      selectColorwait: '',
      selectColoexpire: '',
      selectColoruse: 'color: #d1121a'
    })
    this.loadData()
  },
  getCoupe: function () //去领券(跳转到首页领券)
  {
    wx.reLaunch({
      url: '../yhq_index/yhq'
    })
  },
   opencoupe: function (event) {
    var that = this;
    var id = event.currentTarget.dataset.id; //主键id
    var recId = event.currentTarget.dataset.recid;
    var vibid = event.currentTarget.dataset.vibid;//crm活动号
    var target='yhq';
     if(id<=0 || id==null)
     {
       target='crm'
       id = vibid;
     }
    var coupe = null;
    for (var i = 0; i < this.data.coupeList.length; i++) {
      var obj = this.data.coupeList[i];
      if (obj.RecId == recId) {
        coupe = obj;
        break;
      }
    }
    if (coupe.Remark){
      WxParse.wxParse('article', 'html', coupe.Remark, that, 1);
      that.setData({
        objcoupe: coupe,//现金券对象
        isHowtast: true
      });
      return;
    }
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetCouponRemark",
      biz: { 
        id: id,
        target:target
      },
      success: function (res) {
        if(res.Code=="0")
        {
          if(res.Result)
          {
            WxParse.wxParse('article', 'html', res.Result, that, 1);
            that.setData({
              objcoupe: coupe,//现金券对象
              isHowtast: true
            });
          }
        }
        else
        {
          wx.showModal({
            title: '温馨提示',
            content: res.Msg,
            showCancel: false
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

  wechatpay:function(e) //打开微信支付调到“会员卡”
  {
    if(e.detail&&e.detail.formId){
      myjCommon.logFormId(e.detail.formId);
    }
    wx.reLaunch({
      url: '../member_card/index',
      objcoupe: null //现金券对象
    })
  },
  closeTask:function(e) //关闭提示框
  {
    if (e.detail && e.detail.formId) {
      myjCommon.logFormId(e.detail.formId);
    }
    var that = this;
    that.setData({
      isHowtast: false,
      objcoupe: null, //现金券对象
      noMemberTask: false,
      isnotentyGoods: false,
      isentyGoods: false
    });
;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作 */
  
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.notice();
    this.setData({
      coupeState: 1, //卡券状态
      coupeList: [], //我的券列表
      pageIndex: 1, //页号
      selectColorall: '',
      selectColorwait: 'color: #d1121a',
      selectColoexpire: '',
      selectColoruse: '',
      noMemberTask: false,
      noticeobj: null,
      noticeTask: false
    });
    this.loadData();
  },


  getLoginUser: function () {
  },
  /**
   * 页面上拉触底事件的处理函数 wx.stopPullDownRefresh();
   */
  onReachBottom: function () {
    if (this.data.isCompleted) {
      return;
    }
    this.data.pageIndex++;
    this.loadData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },
  //领取会员卡
  getMemberCard: function (e) {
    myjCommon.logFormId(e.detail.formId);
    wx.reLaunch({ url: "/pages/member_card/index" });
  },
  //切换当前城市：跳转到选择城市列表
  changeCity: function () {
    wx.navigateTo({
      url: '../yhq_dw/yhq_dw?target=mycoupe'
    })
  },
    getMemberCard: function (e) {
    this.setData({
      noMemberTask: false
    });
    wx.reLaunch({
      url: '/pages/member_card/index',
    })
  },
    /**查看参与商品 */
    seeothergoods: function (e) {
      var crmno = e.detail.target.dataset.crmno;
      console.log(crmno)
      var that = this;
      that.setData({
        crmNo: crmno,
        isHowtast: false,
        isentyGoods: false,
        isnotentyGoods: false,
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
                //that.loaddata();
                if (res.Code == 0) //有商品
                {
                  wx.showToast({
                    title: res.Msg,
                    icon:'none'
                  });

                } else if (res.Code == 2) //非参与商品
                {
                  that.setData({
                    isentyGoods: false,
                    isnotentyGoods: true
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
         
              },
              fail: function (msg) {
                console.log("SearchGoodsByCrmNo失败：" + JSON.stringify(msg));
              },
              complete: function (res) {
              }
            });
          },
          fail: function (msg) {
            that.loaddata();

          },
          complete: function (msg) {

          }
        })

      });
    },
  /**跳到微信付款码页 */
  url_wxpay: function (e) {
    this.setData({
      isHowtast: false
    });
    myjCommon.logFormId(e.detail.formId);
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.MPCouponMberPay",
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
  }
})