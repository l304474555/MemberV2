// pages/luckdraw_prize/luckdraw_prize.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myPrizeList: [], //我的奖品
    isExpress: false, //快递信息填写框
    iscashTast: false, //现金快递信息弹框
    isExpressInfo: false, //已填好的快递信息弹框
    pageSize: 10, //页的大小
    pageIndex: 1, //页号
    isCompleted: false,
    aid: 0,
    userName: "",
    mobile: "",
    adress: "",
    memberAppid: "wxc94d087c5890e1f8",
    yhqAppid: "wx55595d5cf709ce79",
    wxrecorid: "",
    isreedcodetast: false, //兑换码弹框
    reedcode: '', //兑换码
    winuserinfo: {
      userName: '',
      mobile: '',
      sex: '',
      idnum: '',
      address: ''
    },
    gender: ['女', '男'],
    genIndex: 0,
    guid: '',
    storeCode: '',
    prizecurrStoreInfo: {
      TakeGoodsStoreName: '',
      TakeOutStore: '',
      TakeGoodsStoreAddress: '',
      TakeGoodsStorePhone:''
    },
    dataItem:null,
    itemTast:false,
    gcuid:'',
    isShowExchangeBtn: false //是否显示立即兑换按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var aaid = options.aid;
    console.log(aaid)
    if (aaid != undefined) {
      wx.setStorageSync("aaid", aaid);
      this.data.aid = aaid;
      this.myPrize(this.data.aid);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
      
    // var aid = wx.getStorageSync("aiid");
    // if (aid!='')
    // {
    //   var that=this;
    //   that.setData({
    //     myPrizeList: [], //我的奖品
    //     isExpress: false, //快递信息填写框
    //     iscashTast: false, //现金快递信息弹框
    //     isExpressInfo: false, //已填好的快递信息弹框
    //     pageSize: 10, //页的大小
    //     pageIndex: 1, //页号
    //     isCompleted: false,
    //     userName: "",
    //     mobile: "",
    //     adress: "",
    //     memberAppid: "wxc94d087c5890e1f8",
    //     yhqAppid: "wx55595d5cf709ce79",
    //     wxrecorid: "",
    //     isreedcodetast: false, //兑换码弹框
    //     reedcode: '', //兑换码
    //     winuserinfo: {
    //       userName: '',
    //       mobile: '',
    //       sex: '',
    //       idnum: '',
    //       address: ''
    //     },
    //     gender: ['女', '男'],
    //     genIndex: 0,
    //   }, () => {
    //     that.myPrize(aid);
    //   })
   
    // }

    
  },
  /**
   * 获取我的奖品
   */
  myPrize: function(aid) //获取我的奖品
  {
    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }
      
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetUserWinList",
        biz: {
          aId: aid,
          sessionId: user.sessionId,
          pageSize: that.data.pageSize,
          pageIndex: that.data.pageIndex
        },
        success: function(res) {
          console.log("奖品")
          console.log(res)
          if (res.Result.WinList.length <= 0) {
            res.Result.WinList = [];
          }
          //分页加载
          var list = that.data.myPrizeList.concat(res.Result.WinList)
          that.setData({
            myPrizeList: list,
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
        fail: function(msg) {
          console.log("GetUserWinList" + JSON.stringify(msg));
        },
        complete: function(res) {
          wx.hideNavigationBarLoading();
          // 停止下拉动作
          wx.stopPullDownRefresh();
        }
      });
    });
  },
  /**查看详情 */
  detail: function(e) {
    //派发方式{到店取货":0,"快递到家":1,"不中奖":2,"优惠券":3,"积分":4,"现金":5}
    var distributeWay = e.currentTarget.dataset.buteway;
    var userName = e.currentTarget.dataset.name;
    var mobile = e.currentTarget.dataset.mobile;
    var adress = e.currentTarget.dataset.address;
    var id = e.currentTarget.dataset.id;
    var endTime = e.currentTarget.dataset.endtime; //兑换结束时间
    var reedcode = e.currentTarget.dataset.reedcode; //兑换码
    var wininfo = e.currentTarget.dataset.wininfo; //中奖信息
    var gCuid = e.currentTarget.dataset.guid; //中奖信息
    let goodTicket = e.currentTarget.dataset.goodticket;  //是否佳选券

    if (id != undefined) {
      this.setData({
        wxrecorid: id,
        gcuid: gCuid
      });
    }

    if (distributeWay == 1) //快递
    {
      if (userName != "" && mobile != "" && adress != "") {
        this.setData({
          userName: userName,
          mobile: mobile,
          adress: adress
        });
      }
      //当前时间 
      var myDate = new Date().getTime(); //获取系统当前时间
      var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000;
      var currentime = util.formatTime(timestamp, 'Y-M-D h:m');

      //如果兑换时间已结束则不能在修改地址
      if ((userName != "" && mobile != "" && adress != "") && endTime < currentime) {
        this.setData({
          isExpressInfo: true
        });
      } else {
        if (userName != "" && mobile != "" && adress != "") {
          this.setData({
            userName: userName,
            mobile: mobile,
            adress: adress
          });
        } else {
          this.setData({
            userName: "",
            mobile: "",
            adress: ""
          });
        }
        this.setData({
          isExpress: true
        });
      }
    } else if (distributeWay == 3) //券 跳转到小程序 我的券页面
    {
      if (reedcode != undefined) {
        this.setData({
          reedcode: reedcode,
          isreedcodetast: true
        });

        if (goodTicket){
          this.setData({
            isShowExchangeBtn:true
          });
        }
      } else {
        wx.reLaunch({
          url: '/pages/yhq_voucher/yhq_voucher',
        });
      }
    } else if (distributeWay == 4) //跳转到会员“我的积分"页面
    {
      wx.navigateToMiniProgram({
        appId: this.data.memberAppid,
        path: '/pages/member_center/member_center?ttarget=coin',
        success(res) {}
      });
    } else if (distributeWay == 5) //现金
    {
      if (wininfo.UserSex == "男") {
        this.setData({
          genIndex: 1
        });
      } else {
        this.setData({
          genIndex: 0
        });
      }
      this.setData({
        winuserinfo: {
          userName: wininfo.UserName,
          mobile: wininfo.Mobile,
          sex: wininfo.UserSex,
          idnum: wininfo.UserIDNum,
          address: ''
        }
      }, () => {
        this.setData({
          iscashTast: true
        });
      });
    }
  },
  /**保存填写的快递信息 */
  savexpressinfo: function(e) {
    //WLRId
    console.log(this.data.wxrecorid)
    var userName = e.detail.value["username"]; //姓名
    var mobile = e.detail.value["mobile"]; //电话
    var adress = e.detail.value["adress"]; //地址

    if (userName == "") {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return;
    } else if (mobile == "") {
      wx.showToast({
        title: '请输入电话',
        icon: 'none'
      })
      return;
    } else if (adress == "") {
      wx.showToast({
        title: '请输入收件地址',
        icon: 'none'
      })
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(mobile))) {
      wx.showToast({
        title: '手机号格式填写错误。',
        icon: 'none'
      });
      return;
    } else if (mobile.length > 11) {
      wx.showToast({
        title: '请输入11位手机号。',
        icon: 'none'
      });

      return;
    }

    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.UpdateUserWinById",
        biz: {
          gCGuId: that.data.gcuid,
          aId: that.data.wxrecorid,
          sessionId: user.sessionId,
          name: userName,
          mobile: mobile,
          address: adress
        },
        success: function(res) {
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000,
            success: function() {
              that.setData({
                isExpress: false,
                userName: "",
                mobile: "",
                adress: ""
              });

              /**重新读取修改后的信息  打开弹框刷新 */
              that.setData({
                pageSize: 10,
                pageIndex: 1,
                myPrizeList: [],
                isCompleted: false
              });
              that.myPrize(that.data.aid);
            }
          });


        },
        fail: function(msg) {
          console.log("UpdateUserWinById" + JSON.stringify(msg));
        },
        complete: function(res) {}
      });
    });
  },

  /**保存抽取到现金的快递信息 */
  savecanshinfo: function(e) {
    console.log(this.data.wxrecorid, )
    var userName = e.detail.value["xjusername"]; //姓名
    var sex = e.detail.value["xjsex"]; //性别
    var mobile = e.detail.value["xjmobile"]; //电话
    var idnum = e.detail.value["xjidnum"]; //身份证号
    if (userName == '') //姓名为空
    {
      wx.showToast({
        title: '请填写您的姓名。',
        icon: 'none'
      });
      this.setData({
        iscashTast: true
      });
      return;
    } else if (sex == '') {
      wx.showToast({
        title: '请填写您的性别。',
        icon: 'none'
      });
      this.setData({
        iscashTast: true
      });
      return;
    } else if (mobile == '') {
      wx.showToast({
        title: '请填写您的手机号。',
        icon: 'none'
      });
      this.setData({
        iscashTast: true
      });
      return;
    } else if (!(/^1[34578]\d{9}$/.test(mobile))) {
      wx.showToast({
        title: '手机号格式填写错误。',
        icon: 'none'
      });
      this.setData({
        iscashTast: true
      });
      return;
    } else if (idnum == '') {
      wx.showToast({
        title: '请填写您的身份证号。',
        icon: 'none'
      });
      this.setData({
        iscashTast: true
      });
      return;
    } else if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idnum))) {
      wx.showToast({
        title: '身份证号格式填写错误。',
        icon: 'none'
      });

      this.setData({
        iscashTast: true
      });
      return;
    }
    //this.setData
    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.UpdateUserWinCashInfoById",
        biz: {
          gCGuId: that.data.gcuid,
          aId: that.data.wxrecorid,
          sessionId: user.sessionId,
          name: userName,
          mobile: mobile,
          sex: sex,
          idnum: idnum
        },
        success: function(res) {
          console.log(res)
          that.setData({
            form_info: ''
          });
          if (res.Code == "1") //成功
          {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000,
              success: function() {
                that.setData({
                  iscashTast: false,
                  winuserinfo: {
                    userName: '',
                    mobile: '',
                    sex: '',
                    idnum: '',
                    address: ''
                  },
                });

                /**重新读取修改后的信息  打开弹框刷新 */
                that.setData({
                  pageSize: 10,
                  pageIndex: 1,
                  myPrizeList: [],
                  isCompleted: false
                });
                that.myPrize(that.data.aid);
              }
            });


          } else { //失败
            that.setData({
              iscashTast: true
            });
            wx.showToast({
              title: res.Msg,
              icon: 'none'
            });
          }
        },
        fail: function(msg) {
          console.log("UpdateUserWinCashInfoById" + JSON.stringify(msg));
        },
        complete: function(res) {
          that.setData({
            iscashTast: false
          });
        }
      });
    });
  },
  /**关闭弹框 */
  closetask: function() {
    this.setData({
      isExpressInfo: false,
      isreedcodetast: false,
      reedcode: '',
      isShowExchangeBtn:false
    });
  },
  close:function()
  {
    this.setData({
      itemTast: false
    });
  },
  closekuadi: function() {
    this.setData({
      userName: "",
      mobile: "",
      adress: "",
      isExpress: false,
      iscashTast: false
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    // 隐藏导航栏加载框
    this.setData({
      myPrizeList: [], //我的奖品
      isExpress: false, //快递信息填写框
      iscashTast: false, //现金快递信息弹框
      isExpressInfo: false, //已填好的快递信息弹框
      pageSize: 10, //页的大小
      pageIndex: 1, //页号
      isCompleted: false,
      userName: "",
      mobile: "",
      adress: "",
      memberAppid: "wxc94d087c5890e1f8",
      yhqAppid: "wx55595d5cf709ce79",
      wxrecorid: "",
      isreedcodetast: false, //兑换码弹框
      reedcode: '', //兑换码
      winuserinfo: {
        userName: '',
        mobile: '',
        sex: '',
        idnum: '',
        address: ''
      },
      gender: ['女', '男'],
      genIndex: 0,
      isShowExchangeBtn:false
    });
    this.myPrize(this.data.aid);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.isCompleted) {
      return;
    }
    this.data.pageIndex++;
    this.myPrize(this.data.aid);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**复制兑换码 */
  copyreedcode: function() {
    wx.setClipboardData({
      data: this.data.reedcode,
      success: function() {
        wx.getClipboardData({
          success: function(res) {
            console.log(res.data) // data
          }
        })
      }
    });
  },
  /**关闭中奖现金弹框 */
  tap_close: function() {
    this.setData({
      iscashTast: false
    });
  },
  //性别选择
  selectSexChange: function(e) {
    this.setData({
      genIndex: e.detail.value
    });
  },
  choosestore: function(e) {
    wx.removeStorageSync("guid");
    wx.removeStorageSync("aiid");
    let guid = e.currentTarget.dataset.guid;
    let coupongrouid = e.currentTarget.dataset.coupongrouid;
    wx.setStorageSync("guid", guid);
    wx.setStorageSync("aiid", this.data.aid);
    wx.navigateTo({
      url: '/pages/yhq_choose_store/yhq_choose_store?lucky=prize&groupid=' + coupongrouid
    });
   
  },
  detailCoupon:function(e)
  {
    this.setData({
      dataItem:null
    });
    console.log(e)
    let item = e.currentTarget.dataset.item;
    var that=this;
    
    if(item!=null)
    {
      that.setData({
        dataItem: item
      },()=>{
        that.setData({
        itemTast: true
        });
      });
    }
  },
  seeMycoupon:function()
  {
    this.setData({
      itemTast:false
    });
    wx.switchTab({
      url: '/pages/yhq_voucher/yhq_voucher',
    });
  },
  /**
   * 立即兑换
   */
  exchangeNow() {
    wx.navigateToMiniProgram({
      appId: 'wx572796b93d5c783b',
      path: 'pages/myCoupon/myCoupon'
    });

  }

})