// pages/yhq_index/yhq.js
var myjCommon = require("../../utils/myjcommon.js");
var address = require('../../utils/city.js');
var WxParse = require('../../wxParse/wxParse.js');
var util = require('../../utils/util.js');
var app = getApp();
const jxAppId = 'wx572796b93d5c783b';
const takeOutAppId_HN = 'wx64286f463c42df55';
const takeOutAppId_HZ = 'wx36dc7878ec18111b';
const jxMyVoucherPath = 'pages/couponCenter/couponCenter?active=2';
const takeOutMyVoucherPath = 'pages/my_coupon/my_coupon';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    menuType: 0,
    status: 1,
    isVisible: false,
    animationData: {},
    animationAddressMenu: {},
    addressMenuIsShow: false,
    value: [0, 0, 0],
    provinces: [],
    citys: [],
    areas: [],
    province: '',
    city: '',
    mobile: '',
    userInfo: {}, //用户信息
    defaultAvatar: "../img/default.png", //用户默认头像
    manageAccount: '',//账号管理中的信息
    tags: [],//个性标签
    userPoint: 0, //用户当前积分
    isShowTast: false,//账号管理弹框
    selectColorwait: '',
    selectColoexpire: '',
    selectColoruse: '',
    coupeState: 1, //卡券状态
    coupeList: [], //我的券列表
    pageIndex: 1,//页号 
    pageSize: 10, //页的大小
    selectColorall: '', //“所有券” 选中颜色设置
    selectColorwait: '',//“待使用” 选中颜色设置
    selectColoexpire: '',//“已过期” 选中颜色设置
    selectColoruse: '',//“已使用” 选中颜色设置
    isCompleted: false,
    isLoading: false,
    isHowtast: false,//是否显示弹出框
    objcoupe: null, //现金券对象
    isShowSenbtn: false, //发送验证码按钮显示控制
    isShowEditbtn: false,//手机号“修改”按钮控制
    myTags: [],//个人标签
    isShowUserName: false, //控制姓名是否可填
    isShowUserMobile: false,//控制手机号是否可填
    editMobile: '',
    selected: true,//选中“我的券”
    selected1: false, //选中“我的积分”
    PpageSize: 10, //积分明细页的大小
    PpageIndex: 1, //积分明细页号
    PointList: [], //积分集合
    PisCompleted: false, //标识是否已加载完数据
    selectType: 0, //积分筛选类型：0 全部   1：获得  2使用,
    selectMonthTask: false,
    monthList: [],
    isMember: false,
    isnotMember: false,
    isShowUserInfoBtn: false,
    /**佳纷会员  demi 2019.01.07 */
    jfUserInfo: null,
    openbeforimg: '',//开通佳纷会员前图标
    openbeforafter: '', //开通佳纷会员后显示的图标
    openbeforafterlogo: '',
    ordinaryMember: '',
    currProvince: '',
    //悬浮窗 2019.04.11
    ballBottom: 240,
    ballRight: 120,
    floatheight: 430, //浮动图标位置
    tuodongheight: 650,
    tuodongwidth: 300,
    showadimginfo: null, //悬浮窗
  },

  selected: function (e) {//选中”我的券“

    this.setData({
      selected1: false,
      selected: true,
      coupeList: [],
      pageIndex: 1,
      isCompleted: false
    })
    this.loadData();
  },
  selected1: function (e) {//选中”我的积分“
    this.setData({
      selected: false,
      selected1: true,
      PpageSize: 10, //积分明细页的大小
      PpageIndex: 1, //积分明细页号
      PointList: [], //积分集合
      monthList: [],
      PisCompleted: false //标识是否已加载完数据
    });
    this.GetIntegralDtl(this.data.selectType);
  },

  getLoginUser: function () {//获得用户信息
    var that = this;
    myjCommon.getLoginUser(function (user) {
      console.log("登录成功。");
    });
    wx.getUserInfo({
      success: function (res) {
        console.log(res)
        var userInfo = res.userInfo
        userInfo.isLogin = true;
        that.setData({
          userInfo: userInfo
        });
      }
    });
  },

  GetMemberCardConfig: function () { //获取会员卡小程序相关配置信息(个性标签)
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
        interfaceCode: "WxMiniProgram.Service.GetMemberCardConfig",
        biz: { sessionId: user.sessionId, cityName: app.currProvince },
        success: function (res) {
          if (res.Result != null) {
            //去掉最后一个字符
            var strTags = res.Result.CardInfo.Tags || "";
            var spTags = strTags.split('$');
            var items = [];
            var tag;
            for (var i = 0; i < spTags.length; i++) {
              tag = spTags[i];
              if (tag) {
                items.push({
                  Tag: tag,
                  isSelected: false
                });
              }
            }
            that.setData({
              tags: items,
              userPoint: res.Result.TotalCnt
            });
          }

          //that.GetMemberInfo();
        },
        fail: function (msg) {
          console.log("a调用api失败" + JSON.stringify(msg));
        },
        complete: function (res) {
          that.getJFUserInfo();
          wx.hideNavigationBarLoading();
          // 停止下拉动作
          wx.stopPullDownRefresh();
        }
      });
    });

  },
  editUserName: function () //用户名 修改
  {
    var that = this;
    that.setData({
      isShowUserName: false
    });

  },
  locaindex: function ()//点击账号管理出现弹框
  {
    wx.reLaunch({
      url: '../member_index/member_index',
    })
  },

  clickCancel: function ()// 编辑账号信息取消框
  {
    var that = this;
    that.setData({
      isShowTast: false,
      isShowSenbtn: false,
      isShowEditbtn: true,
    })
  },
  GetMemberInfo: function ()//获取会员信息
  {
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
        interfaceCode: "WxMiniProgram.Service.GetMemberInfo",
        biz: { sessionId: user.sessionId },
        success: function (res) {
          if (res.Result.Birthday == "0001-01-01T00:00:00") {
            that.setData({
              date: util.formatTime(new Date)
            })
          }

          //发送验证码按钮控制
          if (res.Result.Mobile != null) {
            that.setData({
              isShowEditbtn: true
            })
          } else {
            that.setData({
              isShowSenbtn: true
            })
          }
          if (res.Result.Nickname != null) {
            that.setData({
              isShowUserName: true
            })
          }
          if (res.Result.Mobile != null) {
            that.setData({
              isShowUserMobile: true
            })
          }

          if (res.Result.ProvinceName != null && res.Result.CityName != null) {
            that.setData({
              areaInfo: res.Result.ProvinceName + '，' + res.Result.CityName + '',
            })
          } else {
            areaInfo: null
          }
          if (res.Result.MemberId != 0) {
            //以“$”拆分成数组
            var spTags;
            var items = [];
            var tag;
            if (res.Result.Tags != null) {
              spTags = res.Result.Tags.split('$');
            }
            //给选中的那些标签加上背景色
            for (var k = 0; k < that.data.tags.length; k++) {
              for (var i = 0; i < spTags.length; i++) {
                if (that.data.tags[k].Tag == spTags[i]) {
                  that.data.tags[k].isSelected = true;
                } else {
                  that.data.tags[k].isSelected = false;
                }

              }
            }
            that.setData({
              manageAccount: res.Result,
              date: res.Result.Birthday.substring(0, 10),
              province: res.Result.ProvinceName,
              city: res.Result.CityName,
              tags: that.data.tags,
              myTags: spTags,
              userPoint: res.Result.TotalCnt
            })
          }
        },
        fail: function (msg) {
          console.log("调用GetMemberInfo失败" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.ttarget != undefined) {
      var target = options.ttarget;
      if (target == "coin") {
        this.setData({
          selected1: true,
          selected: false
        });
      } else {
        this.setData({
          selected: true,
          selected1: false
        });
      }
    } else {
      this.setData({
        selected: true,
        selected1: false
      });
    }
    this.getLoginUser();
  },

  loadData: function () {  //加载我的券
    var that = this;
    that.setData({
      isLoading: true
    });
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
        interfaceCode: "WxMiniProgram.Service.GetUserCardList",
        biz: { sessionId: user.sessionId, status: that.data.coupeState, pageSize: that.data.pageSize, pageIndex: that.data.pageIndex },
        success: function (res) {
          if (res.EntityList == null) {
            res.EntityList = [];
          }
          //分页加载
          var list = that.data.coupeList.concat(res.EntityList)
          that.setData({
            coupeList: list,
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
          console.log("testApi失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
          wx.hideNavigationBarLoading();
          // 停止下拉动作
          wx.stopPullDownRefresh();
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
    that.setData({
      coupeState: 0,
      pageIndex: 1,
      isShowMiniNav: false,
      isLoading: false,
      isCompleted: false,
      coupeList: [],
      selectColorwait: '',
      selectColoexpire: '',
      selectColoruse: '',
      selectColorall: 'color: #d1121a'
    })
    this.loadData();
  },
  waitUse: function () { //待使用
    var that = this;
    that.setData({
      coupeState: 1,
      pageIndex: 1,
      isShowMiniNav: false,
      isLoading: false,
      isCompleted: false,
      coupeList: [],
      selectColorall: '',
      selectColoexpire: '',
      selectColoruse: '',
      selectColorwait: 'color: #d1121a'
    })
    this.loadData();
  },
  haveExpire: function () { //已过期
    var that = this;
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
    this.loadData();
  },
  havaUse: function () { //已使用
    var that = this;
    that.setData({
      coupeState: 3,
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
    this.loadData();
  },
  getCoupe: function () //去领券(跳转到首页领券)
  {
    wx.reLaunch({
      url: "pages/member_center/member_center",
    })
  },
  opencoupe: function (event) {
    var that = this;
    var id = event.currentTarget.dataset.id; //主键id
    var vibid = event.currentTarget.dataset.vibid;//crm活动号
    var target = 'yhq';
    if (id <= 0 || id == null) {
      target = 'crm'
      id = vibid;
    }
    var coupe = null;
    for (var i = 0; i < this.data.coupeList.length; i++) {
      var obj = this.data.coupeList[i];
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
      biz: {
        id: id,
        target: target
      },
      success: function (res) {
        if (res.Code == "0") {
          if (res.Result) {
            WxParse.wxParse('article', 'html', res.Result, that, 1);
            that.setData({
              objcoupe: coupe,//现金券对象
              isHowtast: true
            });
          }
        }
        else {
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

  //选中个人标签
  /*selectedTags: function (event) {
    var tag = event.target.dataset.tag; //当前选中的标签
    var item = null;
    var list = this.data.tags;
    for (var i = 0; i < list.length; i++) {
      if (this.data.tags[i].Tag == tag) {
        item = this.data.tags[i];
        break;
      }
    }
    if (item != null) {
      item.isSelected = !item.isSelected;
      this.setData({
        tags: list
      })
    }
  },*/
  //发送短信获取验证码
  /*sendMsg: function () {
    var that = this;
    var mobile = that.data.mobile;
    //获取发送的手机号
    myjCommon.callApi({
      interfaceCode: "ConsumerApp.Service.SendMobileValidateMessage",
      biz: { mobile: mobile, supplyType: "A", codeType: 1 },
      success: function (res) {
        wx.showModal({
          title: '提示',
          content: res.Msg,
          showCancel: false
        });
      },
      fail: function (msg) {
        console.log("调用api失败" + JSON.stringify(msg));
      },
    })
  },*/
  //手机：修改  切换成发送验证码  输入框变为可使用
  /*editmobile: function (e) {
    //data-mobile
    var mobile = e.target.dataset.mobile
    this.setData({
      isShowSenbtn: true, //发送验证码按钮显示控制 
      isShowEditbtn: false,
      isShowUserMobile: false,
      mobile: mobile
    });

  },*/


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
      coupeState: 1, //卡券状态
      coupeList: [], //我的券列表
      monthList: [],
      pageIndex: 1, //页号
      PpageIndex: 1,
      selectColorall: '',
      selectColorwait: 'color: #d1121a',
      selectColoexpire: '',
      selectColoruse: ''
    });
    this.GetMemberCardConfig();
    this.loadData();
    this.GetIntegralDtl(this.data.selectType);
    if (app.currProvince != undefined) {
      this.setData({
        currProvince: app.currProvince
      });
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '获取不到您的位置信息，为了更好的体验美宜佳会员服务，请选择您当前所在的城市。',
        showCancel: true,
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/yhq_dw/yhq_dw',
            });
          }
        },
        fail: function () {

        }
      });
    }
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
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
        console.log(that.data.tuodongwidth)
      }

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
    //在标题栏中显示加载
    wx.showNavigationBarLoading();
    this.setData({
      coupeState: 0, //卡券状态
      coupeList: [], //我的券列表
      monthList: [],
      pageIndex: 1, //页号
      PpageIndex: 1,
      selectColorall: 'color: #d1121a',
      selectColorwait: '',
      selectColoexpire: '',
      selectColoruse: ''
    }, () => {
      this.GetMemberCardConfig();
      this.loadData();
      this.GetIntegralDtl(this.data.selectType);
    });

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.selected) //我的券选中
    {
      if (this.data.isCompleted) {
        return;
      }
      this.data.pageIndex++;
      this.loadData();
    } else {
      if (this.data.PisCompleted) {
        return;
      }
      this.data.PpageIndex++;
      this.GetIntegralDtl(this.data.selectType);
    }
  },

  /**
     * 用户点击右上角分享
     */
  onShareAppMessage: function () {

  },
  EditUserinfo: function () {
    var that = this;
    that.setData({
      isShowTast: true,

    })
  },
  clcoseTast: function () {
    var that = this;
    that.setData({
      isShowTast: false,
      isShowSenbtn: false,
      isShowEditbtn: true,
      isHowtast: false,
      isShowUserName: true,
      isShowUserMobile: true
    })
  },
  //绑定日期事件
  bindDateChange: function (e) {
    var that = this;
    this.setData({
      date: e.detail.value
    })
  },
  // 显示
  showMenuTap: function (e) {
    //获取点击菜单的类型 1点击状态 2点击时间 
    var menuType = e.currentTarget.dataset.type
    // 如果当前已经显示，再次点击时隐藏
    if (this.data.isVisible == true) {
      this.startAnimation(false, -200)
      return
    }
    this.setData({
      menuType: menuType
    })
    this.startAnimation(true, 0)
  },
  hideMenuTap: function (e) {
    this.startAnimation(false, -200)
  },
  // 执行动画
  startAnimation: function (isShow, offset) {
    var that = this
    var offsetTem
    if (offset == 0) {
      offsetTem = offset
    } else {
      offsetTem = offset + 'rpx'
    }
    this.animation.translateY(offset).step()
    this.setData({
      animationData: this.animation.export(),
      isVisible: isShow
    })
  },
  // 选择状态按钮
  selectState: function (e) {
    this.startAnimation(false, -200)
    var status = e.currentTarget.dataset.status
    this.setData({
      status: status
    })
  },

  sureDateTap: function () {
    this.data.pageNo = 1
    this.startAnimation(false, -200)
  },
  // 点击所在地区弹出选择框
  selectDistrict: function (e) {
    var that = this
    if (that.data.addressMenuIsShow) {
      return
    }
    that.startAddressAnimation(true)
  },
  // 执行动画
  startAddressAnimation: function (isShow) {
    var that = this
    if (isShow) {
      that.animation.translateY(0 + 'vh').step()
    } else {
      that.animation.translateY(40 + 'vh').step()
    }
    that.setData({
      animationAddressMenu: that.animation.export(),
      addressMenuIsShow: isShow,
    })
  },
  // 点击地区选择取消按钮
  cityCancel: function (e) {
    this.startAddressAnimation(false)
  },
  // 点击地区选择确定按钮
  citySure: function (e) {
    var that = this
    var city = that.data.city
    var value = that.data.value
    that.startAddressAnimation(false)

    // 将选择的城市信息显示到输入框
    var areaInfo = that.data.provinces[value[0]].name + '，' + that.data.citys[value[1]].name + " "//+ that.data.areas[value[2]].name
    that.setData({
      areaInfo: areaInfo,
      province: that.data.provinces[value[0]].name,
      city: that.data.citys[value[1]].name
    })
  },
  hideCitySelected: function (e) {
    this.startAddressAnimation(false)
  },
  // 处理省市县联动逻辑
  cityChange: function (e) {
    var value = e.detail.value
    var provinces = this.data.provinces
    var citys = this.data.citys
    var areas = this.data.areas
    var provinceNum = value[0]
    var cityNum = value[1]
    var countyNum = value[2]
    if (this.data.value[0] != provinceNum) {
      var id = provinces[provinceNum].id
      this.setData({
        value: [provinceNum, 0, 0],
        citys: address.citys[id],
        areas: address.areas[address.citys[id][0].id],
      })
    } else if (this.data.value[1] != cityNum) {
      var id = citys[cityNum].id
      this.setData({
        value: [provinceNum, cityNum, 0],
        areas: address.areas[citys[cityNum].id],
      })
    } else {
      this.setData({
        value: [provinceNum, cityNum, countyNum]
      })
    }
  },
  //保存填写完的手机号
  getmobilenember: function (e) {
    var that = this;
    var mobile = e.detail.value;
    that.setData({
      mobile: mobile
    })
  },
  wechatpay: function () //打开微信支付调到“会员卡”
  {
    wx.switchTab({
      url: '../member_card/index',
      objcoupe: null //现金券对象
    })
  },
  GetIntegralDtl: function (selectType) {
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
      wx.showLoading({
        title: '数据载入中...',
      });
      debugger
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetIntegralDtl",
        biz: {
          sessionId: user.sessionId,
          provinceName: app.currProvince,
          coinType: that.data.selectType,
          pageSize: that.data.PpageSize,
          pageIndex: that.data.PpageIndex
        },
        success: function (res) {
          console.log("积分流水")
          console.log(res)
          if (res.Code == "301") {
            that.setData({
              isMember: true,
              isnotMember: true
            });
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
            return;
          } else if (res.Code == "305") //查询不到CompanyCode
          {
            return;
          }
          that.setData({
            isMember: false,
            isnotMember: false
          });

          if (res.Result.length <= 0) {
            return;
          }


          //分页加载 item.uModel.OperateTime
          var list = that.data.monthList.concat(res.Result);

          that.setData({
            monthList: list,
          })

          var pCount = parseInt(res.Result.TotalRecord / that.data.PpageSize);
          if (res.Result.TotalRecord % that.data.PpageSize > 0) {
            pCount++;
          }
          if (that.data.PpageIndex >= pCount) {
            that.setData({
              PisCompleted: true
            });
          }

        },
        fail: function (msg) {
          console.log("调用GetIntegralDtl失败" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
          wx.hideNavigationBarLoading();
          // 停止下拉动作
          wx.stopPullDownRefresh();
        }
      });
    });
  },
  //领取会员卡
  getMemberCard: function (e) {
    this.setData({
      isMember: false
    });
    wx.switchTab({ url: "/pages/member_card/index" });
  },
  //筛选积分数据 
  SelectCoin: function (e) {
    var selectType = e.currentTarget.dataset.typeselect;
    this.setData({
      PpageIndex: 1,
      monthList: [],
      selectType: selectType,
      selectMonthTask: false,
      isCompleted: false
    });
    this.GetIntegralDtl(selectType);
  },
  showSeleTask: function () {
    this.setData({
      selectMonthTask: true
    });
  },
  closeT: function () {
    this.setData({
      selectMonthTask: true
    });
  },
  closeTask: function () {
    this.setData({
      isMember: false
    });

  },
  //跳转至账户编辑页面
  AcountIndex: function () {
    wx.navigateTo({
      url: '../member_account/member_account?target=center'
    })
  },
  /**佳纷会员  demi 2019.01.07 */
  getJFUserInfo: function () {
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
          if (res.Code == "301") {
            that.setData({
              isMember: true,
              isnotMember: true
            });
            /**初始化注册会员组件方法 */
            that.regerter1 = that.selectComponent("#regerter");
            that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
            return;
          }
          if (res.Result != null) {
            that.setData({
              jfUserInfo: res.Result
            });
          } else {
            ordinaryMember: '普通会员'
          }
        },
        fail: function (msg) {
          console.log("调用IsJFMember失败" + JSON.stringify(msg));
        },
        complete: function (res) {
          that.setData({
            openbeforimg: '../img/fun_membertips.png',//开通佳纷会员前图标
            openbeforafter: 'https://mimage.myj.com.cn/MicroMallFileServer/Files/EditorPic/201907/a68742b4dec1e26f.png', //开通佳纷会员后显示的图标
            openbeforafterlogo: '../img/fun_logo.png'
          });
        }
      });
    });
  },
  /**开通佳纷会员 */
  openJFMember: function () {
    wx.navigateTo({
      url: '../jiafen_openidex/jiafen_openidex',
    });
  },
  /**跳转到个人中心 */
  nagativeCenter: function () {
    wx.navigateTo({
      url: '../jiafen_memberinfo/jiafen_memberinfo',
    });
  },
  jumpToApplyFor: function () {
    wx.navigateTo({
      url: '../applyfor/index',
    });

  },
  /**打开微信支付 */
  url_wxpay: function () {
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.MPMberPay",
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
            },
            'complete': function (res) { }
          });
        }


      },
      fail: function (msg) {
        console.log("MPMberPay失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
  },
  /**
   * 创建人：袁健豪
   * 创建时间：20191007
   * 描述：跳转到美宜佳选小程序的“我的券”页面
   */
  toJiaXuan() {
    wx.navigateToMiniProgram({
      appId: jxAppId,
      path: jxMyVoucherPath
    });
  },
  /**
   * 创建人：袁健豪
   * 创建时间：20191007
   * 描述：跳转到外卖小程序“我的优惠券”页面
   */
  toTakeOut() {
    let appId = takeOutAppId_HZ;

    if (app.currProvince.indexOf('广东') > -1 || app.currProvince.indexOf('上海') > -1 || app.currProvince.indexOf('浙江') > -1 || app.currProvince.indexOf('江苏') > -1) {
      appId = takeOutAppId_HN;
    }
    wx.navigateToMiniProgram({
      appId: appId,
      path: takeOutMyVoucherPath
    });
  }
})

