// pages/brandDay/brandDay.js
let app = getApp();
const mapKey = 'WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP';
const yhqAppId = 'wx55595d5cf709ce79';
const appId = 'wxc94d087c5890e1f8';
const barCodeSign = 'myj_barcode_sign';
const createMpBarcode_interface = 'WxMiniProgram.Service.CreateMpBarcode';
const getBrandDetails_interface = 'WxMiniProgram.Service.GetBrandDetails';
const isMember_interface = 'WxMiniProgram.Service.IsMember'
const getBrandDayInfo_interface = 'WxMiniProgram.Service.GetBrandDayInfo';
const openBrand_interface = 'WxMiniProgram.Service.OpenBrand';
const checkBrandStock_interface = 'WxMiniProgram.Service.CheckBrandStockInRedis';
const prePay_interface = 'WxMiniProgram.Service.Prepay';
const checkBrandOrderStatus = 'WxMiniProgram.Service.CheckBrandOrderStatus';
const getMemberBrandDiscountCnt_interface = 'WxMiniProgram.Service.GetMemberBrandDiscountCnt';
import QQMapWX from '../../map/qqmap-wx-jssdk.js';
import myjCommon from '../../utils/myjcommon.js';
import wxParse from '../../wxParse/wxParse.js';
import md5 from '../../utils/md5.js';
import wxbarcode from '../../utils/barcode_index.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    brandDayInfo: null, //品牌日活动详情信息
    brandList: [], //品牌列表
    currUserInfo: null, //当前登录用户信息
    userInfo: null, //用户信息
    isShowUserInfoBtn: false, //授权弹出框
    cityName: null, //城市定位
    provinceName: null, //省份定位
    isSelectCity: false, //手动选择定位
    defaultAvatar: '../img/default.png', //用户默认头像
    memberStatus: null, //会员状态
    isBrandMember: false, //是否品牌会员
    isShowDetails: false, //是否查看详情弹框
    isShowBarCode: false, //是否展示会员码
    barCodeNum: '', //会员条形码编码
    isCodeError: false, //会员条形码是否加载错误
    noMemberTask: false,
    timeOutId: 0, //会员条形码定时刷新Id
    brandAmount: 0, //品牌金额
    checkStatus: [], //品牌勾选列表
    isBrandCheck: false, //是否勾选了品牌
    isAgreementCheck: false, //是否勾选了协议
    brandOrderStatusTimeOutId: 0, //定时检查品牌订单状态Id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onload...');
    let self = this;
    wx.showLoading({
      title: '加载中',
    });

    wx.getUserInfo({
      success(e) {
        self.setData({
          currUserInfo: e.userInfo
        });
        self.getUserLocationInfoV1();
      },
      fail(msg) {
        console.log(msg);
        self.setData({
          isShowUserInfoBtn: true
        });
        wx.hideLoading();
      }
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
    wx.showNavigationBarLoading();

    // page.setData({
    //   brandAmount: 0, //品牌金额
    //   checkStatus: [], //品牌勾选列表
    // });
    this.data.isBrandCheck = false;
    this.setData({
      isBrandCheck: false,
      brandAmount: 0,
      checkStatus: [],
      isBrandCheck: false,
      isCodeError: false, //会员条形码是否加载错误
      barCodeNum: '', //会员条形码编码
      isShowBarCode: false, //是否展示会员码
      isShowDetails: false, //是否查看详情弹框
      isBrandMember: false,
      brandList: [],
    });
    clearTimeout(this.data.brandOrderStatusTimeOutId);
    wx.hideLoading();
    this.onLoad();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh(); //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {


  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 获取用户信息确定按钮
   */
  getUserInfoBtnClick(e) {
    let self = this;

    if (e.detail.errMsg != 'getUserInfo:ok') {
      return;
    }
    self.getUserLocationInfoV1();
    wx.getUserInfo({
      success(e) {
        self.setData({
          currUserInfo: e.userInfo,
          isShowUserInfoBtn: false
        });
      }
    });
  },

  /**
   * 用户定位
   */
  getUserLocationInfoV1() {
    let self = this;
    let qqMapWx = new QQMapWX({
      key: mapKey
    });
    myjCommon.getLoginUser(user => {
      if (!user.isLogin) {
        self.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      self.getMember();

      if (app.globalData.currCity && app.globalData.currProvince) { //全局已经存在城市
        self.setData({
          cityName: app.globalData.currCity,
          provinceName: app.globalData.currProvince
        });
        self.loadBrandDayInfo(self.data.cityName);
        self.loadBarCodeInfo();
        return;
      }
      let cityName = wx.getStorageSync('membercity');
      let provinceName = wx.getStorageSync('memberprovince');

      if (cityName && provinceName) {
        self.setData({
          cityName: cityName,
          provinceName: provinceName
        });
        app.globalData.currCity = cityName;
        app.globalData.currProvince = provinceName;
        self.loadBrandDayInfo(cityName);
        self.loadBarCodeInfo();
        return;
      }
      wx.getLocation({
        type: 'wgs84',
        success(res) {
          let lat = res.latitude;
          let lng = res.longitude;
          qqMapWx.reverseGeocoder({
            location: {
              latitude: lat,
              longitude: lng
            },
            success(res) {
              app.globalData.currCity = res.result.address_component.city;
              app.globalData.currProvince = res.result.address_component.province;
              app.globalData.latitude = res.result.address_component.latitude;
              app.globalData.longitude = res.result.address_component.longitude;
              wx.setStorageSync('membercity', res.result.address_component.city);
              wx.setStorageSync('memberprovince', res.result.address_component.province);
              self.setData({
                cityName: res.result.address_component.city,
                provinceName: res.result.address_component.province
              });
              self.loadBrandDayInfo(self.data.cityName);
              self.loadBarCodeInfo();
            },
            fail(res) {
              self.setData({
                isSelectCity: true
              });
              wx.hideLoading();
            }
          });
        },
        fail(res) {
          wx.hideLoading();
          self.setData({
            isSelectCity: false
          });
          wx.navigateTo({
            url: '/pages/yhq_dw/yhq_dw?target=brandDay'
          });
        }
      });
    });
  },

  /**
   * 获取会员
   */
  getMember() {
    let self = this;
    myjCommon.getLoginUser(user => {
      if (!user.isLogin) {
        self.setData({
          isShowUserInfoBtn: true
        });
        wx.hideLoading();
        return;
      }
      // self.setData({
      //   defaultAvatar: user.userInfo.avatarUrl
      // });

      myjCommon.callApi({
        interfaceCode: isMember_interface,
        biz: {
          sessionId: user.sessionId
        },
        success(res) {
          if (res.Code == '301') {
            self.setData({
              noMemberTask: true,
              memberStatus: '301'
            });
            self.regerter1 = self.selectComponent('#regerter');
            self.regerter1.init(self.data.noMemberTask, app.globalData.currenAppid, 'member_card');
            return;
          }
          self.setData({
            memberStatus: '200'
          });
          app.globalData.isMember = true;
        },
        fail(msg) {
          console.log(`调用IsMember失败：${JSON.stringify(msg)}`);
        }
      });
    });
  },

  /**
   * 加载品牌日活动详情、品牌列表
   */
  loadBrandDayInfo(cityName) {
    console.log('loadBrandDayInfo');
    let self = this;
    myjCommon.getLoginUser(user => {
      if (!user.isLogin) {
        self.setData({
          isShowUserInfoBtn: true
        });
        wx.hideLoading();
        return;
      }
      self.setData({
        isShowUserInfoBtn: false,
        userInfo: user.userInfo
      });
      console.log('---WxMiniProgram.Service.GetBrandDayInfo---');

      myjCommon.callApi({
        interfaceCode: getBrandDayInfo_interface,
        biz: {
          cityName: cityName,
          sessionId: user.sessionId
        },
        success(res) {
          console.log('调用WxMiniProgram.Service.GetBrandDayInfo成功');

          if (res.Code == '-1') {
            console.log(`[code=-1]：${res.Msg}`);
            wx.showModal({
              title: '提示',
              content: '当前城市未开展品牌日活动，敬请期待',
              showCancel: false
            });
            self.setData({
              isBrandCheck: false,
              brandAmount: 0,
              checkStatus: [],
              isBrandCheck: false,
              isCodeError: false, //会员条形码是否加载错误
              barCodeNum: '', //会员条形码编码
              isShowBarCode: false, //是否展示会员码
              isShowDetails: false, //是否查看详情弹框
              isBrandMember: false,
              brandList: [],
              brandDayInfo: null,
            });
            return;
          }

          wx.setStorageSync('brandMemberAgreement', res.Result.BrandDayModel.MemberAgreement);
          wxParse.wxParse('rule', 'html', res.Result.BrandDayModel.ActivityRule, self, 1);

          let isBrandMember = false;
          let list = res.Result.BrandModels.map((item, i) => {
            if (item.IsOpen == 1) {
              isBrandMember = true;
            }
            // item.isFull = Number(item.Stock) <= 0;
            item.EndTime = item.EndTime.substring(0, 10);
            return item;
          });
          self.setData({
            brandDayInfo: res.Result.BrandDayModel,
            brandList: list,
            isBrandMember: isBrandMember
          });
        },
        fail(msg) {
          console.error(`调用WxMiniProgram.Service.GetBrandDayInfo失败：${JSON.stringify(msg)}`);
        },
        complete(res) {
          console.log('调用WxMiniProgram.Service.GetBrandDayInfo结束');
          wx.hideLoading();
        }
      });
    });
  },

  /**
   * 跳转到城市选择页面
   */
  changeCity() {
    this.setData({
      isSelectCity: false
    });
    wx.navigateTo({
      url: '/pages/yhq_dw/yhq_dw?target=brandDay'
    });
  },

  /**
   * 查看详情
   */
  viewDetails(event) {
    let self = this;
    let brandId = event.currentTarget.dataset.id;
    let state = event.currentTarget.dataset.state;
    let isFull = event.currentTarget.dataset.isfull;
    let isOpen = event.currentTarget.dataset.isopen;

    if (state == 3 || (isFull == 1 && isOpen != 1)) {
      return;
    }
    myjCommon.callApi({
      interfaceCode: getBrandDetails_interface,
      biz: {
        brandId
      },
      success(res) {
        if (res.Code != '0') {
          console.log(`[Code=${res.Code}]：${res.Msg}`);
          wx.showModal({
            title: '提示',
            content: res.Msg,
          });
          return;
        }
        wxParse.wxParse('article', 'html', res.Result, self, 1);
        self.setData({
          isShowDetails: true
        });
      },
      fail(msg) {
        console.error(`加载失败${JSON.stringify(msg)}`);
      }
    });
  },

  /**
   * 关闭查看详情弹出框
   */
  closeTask() {
    this.setData({
      isShowDetails: false
    });
  },

  /**
   * 展示会员码
   */
  showMemberCode() {
    if (this.data.memberStatus != '200') {
      wx.showModal({
        title: '提示',
        content: '需要先注册会员才能展示会员条形码',
      });
      return;
    }

    if (this.data.isShowBarCode) {
      this.setData({
        isShowBarCode: false
      });
      clearTimeout(this.data.timeOutId);
      return;
    }
    this.setData({
      isShowBarCode: true
    });
    this.loadBarCodeInfo();
  },

  /**
   * 加载条形码信息
   */
  loadBarCodeInfo() {
    let self = this;
    this.getBarCode();
    this.data.timeOutId = setTimeout(self.refreshBarCode, 30000);
  },

  /**
   * 获取后台生成的条形码
   */
  getBarCode() {
    let self = this;
    let provinceName = app.globalData.currProvince;

    if (!provinceName) {
      provinceName = '广东省';
    }
    myjCommon.getLoginUser(user => {
      if (!user.isLogin) {
        self.setData({
          isShowUserInfoBtn: true
        });
        return;
      }

      if (self.data.barCodeNum == '') {
        wx.showLoading({
          title: '会员条形码加载中...',
        });
      }
      let timeStamp = new Date().getTime();
      let signStr = user.sessionId + timeStamp + barCodeSign;
      let sign = md5.hexMD5(signStr);
      myjCommon.callApi({
        interfaceCode: createMpBarcode_interface,
        biz: {
          sessionId: user.sessionId,
          timeStamp: timeStamp,
          sign: sign,
          cityName: provinceName,
          storeCode: ''
        },
        success(res) {
          if (res.Code == '301') {
            self.setData({
              noMemberTask: true,
              memberStatus: '301',
              isCodeError: true
            });
            self.regerter1 = self.selectComponent('#regerter');
            self.regerter1.init(self.data.noMemberTask, app.globalData.currenAppid, 'member_card');
            return;
          }

          if (res.Code != '301' && res.Code != '0') {
            self.setData({
              isCodeError: true
            });
            return;
          }

          if (res.Result.barCode == '' || res.Result.barCode == null) {
            wx.showModal({
              title: '提示',
              content: '获取会员条形码失败,请稍后再试',
            });
            return;
          }
          self.setData({
            barCodeNum: res.Result.barCode,
            isCodeError: false
          });
          wx.nextTick(() => {
            wxbarcode.barcode('barcode', res.Result.barCode, 550, 110, (isSuccess, err) => {
              if (isSuccess) {
                return;
              }
              wxbarcode.barcode('barcode', res.Result.barCode, 550, 110, () => {
                self.setData({
                  isCodeError: true
                });
              });
            });
          });
        },
        fail(msg) {
          self.setData({
            isCodeError: true
          });
          console.error(`CreateMpBarcode失败：${JSON.stringify(msg)}`);
        },
        complete(res) {
          wx.hideLoading();
        }
      });
    });
  },

  /**
   * 刷新会员条形码
   */
  refreshBarCode() {
    let self = this;
    this.getBarCode();
    console.log('刷新会员条形码');
    this.data.timeOutId = setTimeout(self.refreshBarCode, 60000);
  },

  /**
   * 品牌复选框的选中、取消事件
   */
  checkboxChange(e) {
    let checkId = e.target.dataset.checkid;
    let brandAmount = this.data.brandAmount;
    let brandList = this.data.brandList;
    let isCheck = false;

    if (e.detail.value.length != 1) {
      brandAmount = Number(brandAmount) - Number(brandList[checkId].Amount);
      brandAmount = brandAmount.toFixed(2);
      this.setData({
        brandAmount: brandAmount,
        [`checkStatus[${checkId}]`]: false
      });
      this.data.checkStatus.map((item, i) => {
        if (item) {
          return isCheck = true;
        }
      });

      if (!isCheck) {
        this.data.isBrandCheck = false;
        this.setData({
          isBrandCheck: false
        });
      }
      return;
    }

    brandAmount = Number(brandAmount) + Number(brandList[checkId].Amount);
    brandAmount = brandAmount.toFixed(2);
    this.data.isBrandCheck = true;
    this.setData({
      brandAmount: brandAmount,
      [`checkStatus[${checkId}]`]: true,
      isBrandCheck: true
    });
  },

  /**
   * 协议复选框的选中、取消事件
   */
  agreementCheckBoxChange(e) {
    if (e.detail.value.length != 1) {
      this.data.isAgreementCheck = false;
      return;
    }
    this.data.isAgreementCheck = true;
  },

  /**
   * 开通品牌
   */
  openBrand() {
    let self = this;

    if (!this.data.isAgreementCheck) {
      wx.showModal({
        title: '提示',
        content: '请先查看并勾选品牌会员权益协议',
        showCancel: false
      });
      return;
    }

    if (!this.data.isBrandCheck) {
      wx.showModal({
        title: '提示',
        content: '请勾选需要开通的品牌',
        showCancel: false
      });
      return;
    }
    wx.showLoading({
      title: '开通中...',
    });
    myjCommon.getLoginUser(user => {
      if (!user.isLogin) {
        self.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      let brandIds = [];
      self.data.checkStatus.map((item, i) => {
        if (item) {
          return brandIds.push(self.data.brandList[i].Id);
        }
      });

      myjCommon.callApi({
        interfaceCode: openBrand_interface,
        biz: {
          sessionId: user.sessionId,
          brandAmount: self.data.brandAmount,
          brandDayId: self.data.brandDayInfo.Id,
          brandIdsJson: JSON.stringify(brandIds),
          companyCode: self.data.brandDayInfo.CompanyCode
        },
        success(res) {
          if (res.Code == '300') {
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: '登录已过期，请重新登录',
              showCancel: false,
              success(res) {
                self.setData({
                  isShowUserInfoBtn: true
                });
              }
            });
            return;
          }

          if (res.Code == '301') {
            wx.hideLoading();
            self.setData({
              noMemberTask: true,
              memberStatus: '301'
            });
            wx.showModal({
              title: '提示',
              content: '对不起，请先注册会员',
              showCancel: false,
              success(res) {
                self.regerter1 = self.selectComponent('#regerter');
                self.regerter1.init(self.data.noMemberTask, app.globalData.currenAppid, 'member_card');
              }
            })
            return;
          }

          if (res.Code != '0') {
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: res.Msg,
              showCancel: false
            });
            return;
          }
          self.prePay(res.Result, user.sessionId, brandIds);
        },
        fail(msg) {
          console.error(`调用接口OpenBrand失败：${JSON.stringify(msg)}`);
          wx.hideLoading();
        }
      });

    });
  },

  /**
   * 打开品牌会员协议
   */
  openAgreement() {
    wx.navigateTo({
      url: '/pages/brandMemberAgreement/brandMemberAgreement'
    });
  },

  /**
   * 预支付订单
   */
  prePay(orderNo, sessionId, brandIds) {
    let self = this;

    myjCommon.callApi({
      interfaceCode: prePay_interface,
      biz: {
        orderNo: orderNo,
        sessionId: sessionId
      },
      success(res) {
        if (res.Code == '300') {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '登录已过期，请重新登录',
            showCancel: false,
            success(res) {
              self.setData({
                isShowUserInfoBtn: true
              });
            }
          });
          return;
        }

        if (res.Code != '0') {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: res.Msg,
            showCancel: false
          });
          return;
        }
        let obj = JSON.parse(res.Result);
        obj.success = function () {
          wx.showLoading({
            title: '支付回调中',
          });
          self.data.brandOrderStatusTimeOutId = setTimeout(self.checkBrandOrderStatus, 500, orderNo, brandIds, sessionId);
        }
        wx.hideLoading();
        wx.requestPayment(obj);

      },
      fail(msg) {
        console.error(`调用接口Prepay失败：${JSON.stringify(msg)}`);
        wx.hideLoading();
      }
    });
  },

  /**
   * 定时检查品牌订单状态
   */
  checkBrandOrderStatus(orderNo, brandIds, sessionId) {
    let self = this;

    myjCommon.callApi({
      interfaceCode: checkBrandOrderStatus,
      biz: {
        orderNo: orderNo,
        brandDayId: self.data.brandDayInfo.Id,
        sessionId: sessionId
      },
      success(res) {
        if (res.Code != "0") {
          self.data.brandOrderStatusTimeOutId = setTimeout(self.checkBrandOrderStatus, 500, orderNo, brandIds, sessionId);
          return;
        }
        self.setData({
          isBrandCheck: false,
          brandAmount: 0,
          checkStatus: [],
          isBrandCheck: false
        });
        clearTimeout(self.data.brandOrderStatusTimeOutId);
        wx.hideLoading();
        wx.showModal({
          title: '支付成功',
          content: '开通成功,你所开通的品牌权益将会在5分钟后生效.',
          showCancel: false
        })
        self.onLoad();
      },
      fail(msg) {
        console.error(`调用接口CheckBrandOrderStatus失败：${JSON.stringify(msg)}`);
        wx.hideLoading();
      }
    });
  },

  /**
   * 打开抽奖页面
   */
  openDraw() {
    let self = this;

    wx.navigateToMiniProgram({
      appId: yhqAppId,
      path: self.data.brandDayInfo.PageUrl,
      envVersion: 'trial',
      success(res) { }
    });
  },

  /**
   * 返回会员小程序首页
   */
  returnHomePage() {
    wx.reLaunch({
      url: '/pages/member_index/member_index',
    });
    // wx.navigateToMiniProgram({
    //   appId: yhqAppId,
    //   path: '/pages/member_index_member_index',
    //   envVersion: 'release'
    // });
  },

  /**
   * 创建人：袁健豪
   * 创建时间：20191005
   * 描述：跳转到微信付款页面
   */
  toWeCharPayment() {
    // wx.switchTab({
    //   url: '../wetchat_payment/wetchat_payment',
    // });
    // wx.navigateTo({
    //   url: '../wechat_payment_new/wechat_payment_new',
    // })
    this.url_wxpay();
  },

  /**
   * 创建人：袁健豪
   * 创建时间：20191005
   * 描述：跳转到更多权益页面
   */
  toMoreEquity(e) {
    let jump = e.target.dataset.jump;
    let spid = e.target.dataset.spid;
    let appid = e.target.dataset.appid;
    let pagePath = e.target.dataset.pagepath;
    let channelPageId = e.target.dataset.channelpageid;
    let jumpLink = e.target.dataset.jumplink;

    //跳转小程序
    if (jump == 2) {
      //有配置appid和页面路径，如果没有配置页面路径就直接跳转对应appid的小程序的首页
      if (pagePath != undefined) {

        //判断是否是华东地区并且是抽奖链接
        var fanpaistr = "fanpai_lucky/fanpai_lucky";
        var nineboxstr = "ninebox_lucky/ninebox_lucky";
        // if ((app.currProvince == "上海市" || app.currProvince == "江苏省" || app.currProvince == "浙江省") && pagePath.indexOf(fanpaistr)!=-1)
        if (pagePath.indexOf(fanpaistr) != -1) {
          //获取活动号
          var activityNo = pagePath.substring(pagePath.indexOf('=') + 1);
          wx.removeStorageSync("aid");
          wx.setStorageSync("aid", activityNo);
          wx.navigateTo({
            url: '../components/fanpai_lucky/fanpai_lucky',
          });
          // } else if ((app.currProvince == "上海市" || app.currProvince == "江苏省" || app.currProvince == "浙江省") && pagePath.indexOf(nineboxstr)!=-1)
        } else if (pagePath.indexOf(nineboxstr) != -1) {
          //获取活动号
          var activityNo = pagePath.substring(pagePath.indexOf('=') + 1);
          wx.removeStorageSync("aid");
          wx.setStorageSync("aid", activityNo);
          wx.navigateTo({
            url: '../components/ninebox_lucky/ninebox_lucky',
          });
        } else {
          if (appid == appId) {
            wx.navigateTo({
              url: pagePath,
            });
          } else {
            wx.navigateToMiniProgram({
              appId: appid,
              path: pagePath,
              envVersion: 'release',
              success(res) {
                // 打开成功
              }
            });
          }
        }
      } else {
        wx.navigateToMiniProgram({
          appId: appid,
          envVersion: 'release',
          success(res) {
            // 打开成功
          }
        });
      }
    } else if (jump == 3) //跳转频道页
    {
      wx.navigateTo({
        url: '../yhq_channel/yhq_channel?channelId=' + channelPageId
      })
    } else if (jump == 4) //跳转其他页面
    {
      wx.navigateTo({
        url: '../bannerWeb/bannerWeb?bannerUrl=' + jumpLink
      });
    }
  },

  /**
   * 创建人：袁健豪
   * 创建时间：20191011
   * 描述：微信支付
   */
  url_wxpay() {
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
        wx.hideLoading();
      }
    });
  },

})