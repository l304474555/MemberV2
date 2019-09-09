// pages/brandDay/brandDay.js
let app = getApp();
const mapKey = 'WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP';
const barCodeSign = 'myj_barcode_sign';
const createMpBarcode_interface = 'WxMiniProgram.Service.CreateMpBarcode';
const getBrandDetails_interface = 'WxMiniProgram.Service.GetBrandDetails';
const isMember_interface = 'WxMiniProgram.Service.IsMember'
const getBrandDayInfo_interface = 'WxMiniProgram.Service.GetBrandDayInfo';
const openBrand_interface = 'WxMiniProgram.Service.OpenBrand';
const checkBrandStock_interface = 'WxMiniProgram.Service.CheckBrandStockInRedis';
const prePay_interface = 'WxMiniProgram.Service.Prepay';
const checkBrandOrderStatus = 'WxMiniProgram.Service.CheckBrandOrderStatus';
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
              self.loadBrandDayInfo(self.data.provinceName);
            },
            fail(res) {
              self.setData({
                isSelectCity: true
              });
            }
          });
        },
        fail(res) {
          self.setData({
            isSelectCity: false
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
          cityName: cityName
        },
        success(res) {
          console.log('调用WxMiniProgram.Service.GetBrandDayInfo成功');

          if (res.Code == '-1') {
            console.log(`[code=-1]：${res.Msg}`);
            wx.showModal({
              title: '提示',
              content: res.Msg,
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
            item.isFull = Number(item.Stock) <= 0;
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

      // let obj = {
      //   Id: 1,
      //   PageBgImage: '../img/brandDay/brand_member_card-min.png',
      //   OpenIcon: '../img/brandDay/foot_btn-min.png',
      //   DrawId: 1,
      //   DrawIcon: '../img/member_kf.png',
      //   MemberAgreement: '<p>测试</p>',
      //   ActivityRule: `<p>1.品牌活动的排序根据后台设置的排序来排列；每个品牌活动都有各自的权益说明，点击【查看详情】即可弹出框查看。</p><p>2.每个品牌都有开始活动时间和结束时间，当该品牌状态为未开通时，则显示 "未开通品牌，敬请期待" 。</p><p>3.每个品牌活动都有库存数，当开通该品牌的人数已达到品牌的库存数时，则未开通该品牌的用户前端显示 "很抱歉，该品牌已满员" ；已开通该品牌的用户前端显示 "已开通" 标识。</p>`,
      //   CompanyCode: 'GD'
      // };
      // wx.setStorageSync('brandMemberAgreement', obj.MemberAgreement);
      // wxParse.wxParse('rule', 'html', obj.ActivityRule, self, 1);
      // let list = [{
      //   Id: 1,
      //   Name: '测试品牌1',
      //   BeginTime: '2019-01-01',
      //   EndTime: '2019-12-31',
      //   State: 1,
      //   Stock: 100,
      //   Amount: 10,
      //   BgImage: '../img/brandDay/brand_icon-min.png',
      //   IsOpen: 1
      // }, {
      //   Id: 2,
      //   Name: '测试品牌2',
      //   BeginTime: '2019-01-01',
      //   EndTime: '2019-12-31',
      //   State: 1,
      //   Stock: 100,
      //   Amount: 20,
      //   BgImage: '../img/brandDay/brand_icon-min.png',
      //   IsOpen: 0
      // }, {
      //   Id: 3,
      //   Name: '测试品牌3',
      //   BeginTime: '2019-01-01',
      //   EndTime: '2019-12-31',
      //   State: 1,
      //   Stock: 100,
      //   Amount: 0.01,
      //   BgImage: '../img/brandDay/brand_icon-min.png',
      //   IsOpen: 0
      // }, {
      //   Id: 4,
      //   Name: '测试品牌4',
      //   BeginTime: '2019-01-01',
      //   EndTime: '2019-12-31',
      //   State: 1,
      //   Stock: 100,
      //   Amount: 10,
      //   BgImage: '../img/brandDay/brand_icon-min.png',
      //   IsOpen: 0
      // }, {
      //   Id: 5,
      //   Name: '测试品牌5',
      //   BeginTime: '2019-01-01',
      //   EndTime: '2019-12-31',
      //   State: 3,
      //   Stock: 100,
      //   Amount: 10,
      //   BgImage: '../img/brandDay/brand_icon-min.png',
      //   IsOpen: 0
      // }, {
      //   Id: 6,
      //   Name: '测试品牌6',
      //   BeginTime: '2019-10-01',
      //   EndTime: '2019-12-31',
      //   State: 3,
      //   Stock: 100,
      //   Amount: 10,
      //   BgImage: '../img/brandDay/brand_icon-min.png',
      //   IsOpen: 0
      // }, {
      //   Id: 7,
      //   Name: '测试品牌7',
      //   BeginTime: '2019-01-01',
      //   EndTime: '2019-12-31',
      //   State: 1,
      //   Stock: 0,
      //   Amount: 10,
      //   BgImage: '../img/brandDay/brand_icon-min.png',
      //   IsOpen: 0
      // }];
      // let isBrandMember = false;
      // list = list.map((item, i) => {
      //   if (item.IsOpen == 1) {
      //     isBrandMember = true;
      //   }
      //   item.isFull = Number(item.Stock) <= 0;
      //   return item;
      // });
      // self.setData({
      //   brandDayInfo: obj,
      //   brandList: list,
      //   isBrandMember: isBrandMember
      // });
      // wx.hideLoading();

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

    if (state == 3 || isFull) {
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
            wxbarcode.barcode('barcode', res.Result.barCode, 640, 150, (isSuccess, err) => {
              if (isSuccess) {
                return;
              }
              wxbarcode.barcode('barcode', res.Result.barCode, 640, 150, () => {
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
    this.data.timeOutId = setTimeout(self.refreshBarCode, 30000);
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
      brandAmount -= brandList[checkId].Amount;
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
    brandAmount += brandList[checkId].Amount;
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
        interfaceCode: checkBrandStock_interface,
        biz: {
          brandIdsJson: JSON.stringify(brandIds),
          brandDayId: self.data.brandDayInfo.Id
        },
        success(res) {
          if (res.Code == '-1') {
            wx.hideLoading();
            wx.showModal({
              title: '提示',
              content: res.Msg,
              showCancel: false
            });
            reutrn;
          }
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
        },
        fail(msg) {
          wx.hideLoading();
          console.error(`调用接口CheckBrandStockInRedis失败：${JSON.stringify(msg)}`);
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
  prePay(brandOrder, sessionId, brandIds) {
    let self = this;
    brandOrder.CreateTime = brandOrder.CreateTime.replace('+', '%2B');

    myjCommon.callApi({
      interfaceCode: prePay_interface,
      biz: {
        brandOrderJson: JSON.stringify(brandOrder),
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
        wx.hideLoading();
        wx.requestPayment(JSON.parse(res.Result));
        self.data.brandOrderStatusTimeOutId = setTimeout(self.checkBrandOrderStatus, 5000, brandOrder.OrderNo, brandIds);
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
  checkBrandOrderStatus(orderNo, brandIds) {
    let self = this;

    myjCommon.callApi({
      interfaceCode: checkBrandOrderStatus,
      biz: {
        orderNo: orderNo
      },
      success(res) {
        if (res.Code != "0") {
          self.data.brandOrderStatusTimeOutId = setTimeout(self.checkBrandOrderStatus, 2000, orderNo, brandIds);
          return;
        }
        clearTimeout(self.data.brandOrderStatusTimeOutId);
        self.onLoad();
      },
      fail(msg) {
        console.error(`调用接口CheckBrandOrderStatus失败：${JSON.stringify(msg)}`);
      }
    });
  },

  /**
   * 打开抽奖页面
   */
  openDraw() {
    let self = this;

    wx.navigateTo({
      url: self.data.brandDayInfo.PageUrl,
    });
  }

})