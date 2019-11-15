// pages/yhq_dw/yhq_dw.js
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
var myjCommon = require("../../utils/myjcommon.js");
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currCity: "", //当前所在的城市
    cityName: "",
    searchWord: "", //搜索关键字
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP",
    allCityList: [], //全部城市
    searchCityList: [], //搜索的城市
    ShowCityList: [], //用于展示的
    isShow: false, //当关键词搜索的时候不显示热门城市和定位城市
    isNoneData: false, //是否查询出数据
    fromApp: 1, //来源：1 优惠券小程序； 2 会员小程序
    areaList: [],
    lat: 0,
    lng: 0,
    isSerchcity: false,
    target: "", //用于标识是从首页过来还是从新店促销进来；根据这个标识选择城市后要跳回相应页面
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 实例化API核心类
    var demo = new QQMapWX({
      key: that.data.key // 必填
    });
    //获取地址栏参数
    var target = options.target;
    that.setData({
      target: target
    });
    //定位城市
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude; //经度
        var longitude = res.longitude; //纬度
        that.setData({
          lat: latitude,
          lng: longitude
        });
        //根据经纬度调用api获取城市
        demo.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function (res) {
            console.log("成功")
            console.log(res)
            that.setData({
              cityName: res.result.address_component.city
              
            });
            app.currCity = that.data.cityName;
            app.currProvince = res.result.address_component.province;
            app.globalData.currCity = that.data.cityName;
            app.globalData.currProvince = res.result.address_component.province;
          },
          fail: function (msg) {
            console.log("失败")
            console.log(msg)
          },
          complete: function (res) {
            console.log(res);
          }
        });
      },
    })

    //加载热门城市
    that.LoadHotCity();
  },
  //选择城市
  selectCity: function (event) {
    debugger
    var that = this;
    //选中城市
    var city = event.currentTarget.dataset.city;
    //省份
    var province = event.currentTarget.dataset.peovince;
    let companyCode = event.currentTarget.dataset.companycode;
    //把选择的城市，省份信息写入全局变量
    app.currCity = city;
    app.currProvince = province;
    app.companyCode = companyCode;
    app.globalData.currCity = city;
    app.globalData.currProvince = province;
    app.globalData.companyCode = companyCode;
    //把选择的城市，省份信息写入缓存
    wx.setStorageSync("membercity", city);
    wx.setStorageSync("memberprovince", province);
    wx.setStorageSync('companyCode', companyCode);

    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      wx.showLoading({
        title: '修改中',
        mask: true
      })
      //选择完城市跳回对应的页面
      wx.showToast({
        title: '修改城市成功！',
        icon: 'success',
        duration: 1000,
        success: function () {
          if (that.data.target == "applyfor") {

            wx.reLaunch({
              url: '../applyfor/index?target=applyfor'
            }) //延迟时间 这里是1.5秒  
          } else if (that.data.target == "service") {
            wx.navigateBack();
          } else if (that.data.target == "basketball")//篮球分换券
          {
            wx.navigateBack();
          } else if (that.data.target == 'brandDay') {
            let pages = getCurrentPages();
            let page = pages[pages.length - 2];
            let brandDayInfo = page.data.brandDayInfo;
            let img;

            if (brandDayInfo != null) {
              img = brandDayInfo.PageBgImage;
              brandDayInfo = {};
              brandDayInfo.PageBgImage = img;
            }
            page.setData({
              brandList: [],
              brandDayInfo: brandDayInfo,
              isBrandMember: false,
              isShowDetails: false, //是否查看详情弹框
              isShowBarCode: false, //是否展示会员码
              barCodeNum: '', //会员条形码编码
              isCodeError: false, //会员条形码是否加载错误
              brandAmount: 0, //品牌金额
              checkStatus: [], //品牌勾选列表
              isBrandCheck: false, //是否勾选了品牌
              isAgreementCheck: false,
            });
            clearTimeout(page.data.timeOutId);
            page.onLoad();
            wx.navigateBack();
          }
          else {
            wx.reLaunch({
              url: '../member_index/member_index'
            })
          }
        },
        fail: function (msg) {
          console.log("出现异常：" + JSON.stringify(msg));
          wx.showToast({
            title: '定位失败，请重新选择城市',
            icon: 'success',
            duration: 0
          });
          if (that.data.target == "applyfor") {
            setTimeout(function () {
              wx.reLaunch({
                url: '../applyfor/index'
              })

            }, 1500) //延迟时间 这里是1.5秒  
          } else if (that.data.target == 'brandDay') {
            let pages = getCurrentPages();
            let page = pages[pages.length - 2];
            let brandDayInfo = page.data.brandDayInfo;

            if (brandDayInfo != null) {
              img = brandDayInfo.PageBgImage;
              brandDayInfo = {};
              brandDayInfo.PageBgImage = img;
            }
            page.setData({
              brandList: [],
              brandDayInfo: brandDayInfo,
              isBrandMember: false,
              isShowDetails: false, //是否查看详情弹框
              isShowBarCode: false, //是否展示会员码
              barCodeNum: '', //会员条形码编码
              isCodeError: false, //会员条形码是否加载错误
              brandAmount: 0, //品牌金额
              checkStatus: [], //品牌勾选列表
              isBrandCheck: false, //是否勾选了品牌
              isAgreementCheck: false,
            });
            clearTimeout(page.data.timeOutId);
            page.onLoad();
            wx.navigateBack();
          } else {
            wx.reLaunch({
              url: '../member_index/member_index'
            })
          }
        },
        complete: function () {

        }

      });

      //把选择的定位信息保存到表里
      var demo = new QQMapWX({
        key: that.data.key // 必填
      });
      demo.geocoder({
        address: city,
        success: function (res) {
          var lat = res.result.location.lat; //经度
          var lng = res.result.location.lng; //纬度
          myjCommon.callApi({
            interfaceCode: "WxMiniProgram.Service.UpdateUserLocation",
            biz: {
              sessionId: user.sessionId,
              city: city,
              lat: lat,
              lng: lng,
              fromApp: that.data.fromApp,
              province: province
            },
            success: function (res) {
              console.log(res);
              //把修改城市后的值赋值到全局变量
              app.latitude = lat;
              app.longitude = lng;
              app.globalData.latitude = lat;
              app.globalData.longitude = lng;
            },
            fail: function (msg) {
              console.log("出现异常：" + JSON.stringify(msg));
              wx.hideLoading();
            },
            complete: function (res) {
            }
          });
        },
        fail: function (res) {
        },
        complete: function (res) {
        }
      });
    });
  },
  //关键字搜索
  searchBykeyword: function (e) {
    var that = this;
    //输入的关键字
    var keyWord = e.detail.value;
    that.setData({
      searchWord: keyWord,
      isSerchcity: true
    });
    if (keyWord == undefined || keyWord == '') {
      that.setData({
        ShowCityList: that.data.allCityList,
        isShow: false,
        isNoneData: false
      });
      return;
    }

    var province; //省份
    var city; //城市

    var items = [];
    var hotCitys = []; //热门城市
    var citysList = [];//搜索出来的城市
    var cityItems = []; //城市数组

    for (var i = 0; i < that.data.allCityList.length; i++) {
      //hotCitys = that.data.allCityList[i].hotCitys;
      for (var j = 0; j < that.data.allCityList[i].cityList.length; j++) {
        for (var k = 0; k < that.data.allCityList[i].cityList[j].Citys.length; k++) {
          if (that.data.allCityList[i].cityList[j].Citys[k].Name.indexOf(keyWord) >= 0) {
            // province = that.data.allCityList[i].cityList[j].Province;
            city = that.data.allCityList[i].cityList[j].Citys[k].Name;
            province = that.getProvince(that.data.allCityList[i].cityList[j].Citys[k]);
            citysList.push({
              Name: city,
              Province: province
            });
          }

        }
      }
      cityItems.push({
        // Province:province,
        Citys: citysList
      });

    }

    //没搜索到相关数据 显示提示语
    if (citysList.length <= 0) {
      that.setData({
        isNoneData: true
      });
    } else {
      that.setData({
        isNoneData: false
      });
    }

    items.push({
      hotCitys: hotCitys,
      cityList: cityItems,
    });

    that.setData({
      ShowCityList: items,
      isShow: true
    });
  },
  //加载热门城市
  LoadHotCity: function () {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetHotCity",
      biz: {},
      success: function (res) {
        console.log("热门城市")
        console.log(res)
        var hotcity = [];
        var cityItem = [];
        if (res.Result.HotCity != null) //热门城市
        {
          hotcity = res.Result.HotCity;
          that.setData({
            areaList: res.Result.CityList
          });
          for (var i = 0; i < hotcity.length; i++) {
            hotcity[i].Province = that.getProvince(hotcity[i]);
          }
        }
        if (res.Result.CityList != null) { //城市列表
          var ProList = res.Result.CityList;
          var provinceList;
          var provinceName;
          var items = [];
          for (var i = 0; i < ProList.length; i++) {
            if (ProList[i].CityList != null) {
              provinceList = ProList[i].CityList;
              provinceName = ProList[i].Name;
              if (provinceList) {
                items.push({
                  Province: provinceName,
                  Citys: provinceList
                });

              }
            }
          }
          cityItem.push({
            hotCitys: hotcity,
            cityList: items
          });
          that.setData({
            allCityList: cityItem,
            ShowCityList: cityItem
          });
        }
        console.log(that.data.allCityList)
      },
      fail: function (msg) {
        console.log("testApi失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
  },
  getProvince: function (area) {
    if (area.ParentNo == 0) {
      return area.Name;
    }
    var aList = this.data.areaList;
    var province = "";
    for (var i = 0; i < aList.length; i++) {
      if (aList[i].AreaNo == area.ParentNo) {
        province = aList[i].Name;
        break;
      }
    }
    return province;
  },
  //点gps定位回到当前所在的城市的店铺列表
  locationCurrCity: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      app.currCity = that.data.cityName;
      app.globalData.currCity = that.data.cityName;
      wx.setStorageSync('membercity', that.data.cityName);
      wx.setStorageSync('memberprovince', '');
      wx.setStorageSync('companyCode', '');
      app.companyCode = undefined;
      app.globalData.companyCode = undefined;
      wx.showToast({
        title: '修改城市成功！',
        icon: 'success',
        duration: 1000,
        success: function () {
          // setTimeout(function () {
          if (that.data.target == "applyfor") {
            setTimeout(function () {
              wx.reLaunch({
                url: '../applyfor/index?target=applyfor'
              })

            }, 1500) //延迟时间 这里是1.5秒  
          } else if (that.data.target == "basketball")//篮球分换券
          {
            wx.navigateBack();
          } else if (that.data.target == 'brandDay') {
            let pages = getCurrentPages();
            let page = pages[pages.length - 2];
            let brandDayInfo = page.data.brandDayInfo;

            if (brandDayInfo != null) {
              img = brandDayInfo.PageBgImage;
              brandDayInfo = {};
              brandDayInfo.PageBgImage = img;
            }
            page.setData({
              brandList: [],
              brandDayInfo: brandDayInfo,
              isBrandMember: false,
              isShowDetails: false, //是否查看详情弹框
              isShowBarCode: false, //是否展示会员码
              barCodeNum: '', //会员条形码编码
              isCodeError: false, //会员条形码是否加载错误
              brandAmount: 0, //品牌金额
              checkStatus: [], //品牌勾选列表
              isBrandCheck: false, //是否勾选了品牌
              isAgreementCheck: false,
            });
            clearTimeout(page.data.timeOutId);
            page.onLoad();
            wx.navigateBack();
          }
          else {
            wx.reLaunch({
              url: '../member_index/member_index'
            })
          }

          // }, 1500); //延迟时间 1.5秒
        },
        fail: function () {

        },
        complete: function () { }
      })
      //调用城市更新接口
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.UpdateUserLocation",
        biz: {
          sessionId: user.sessionId,
          city: that.data.cityName,
          province: app.currProvince,
          lat: that.data.lat,
          lng: that.data.lng,
          fromApp: that.data.fromApp
        },
        success: function (res) {

        },
        fail: function (res) {
          app.currCity = that.data.cityName;
          if (that.data.target == "applyfor") {
            setTimeout(function () {
              wx.reLaunch({
                url: '../applyfor/index?target=applyfor'
              })

            }, 1500) //延迟时间 这里是1.5秒  
          } else if (that.data.target == 'brandDay') {
            let pages = getCurrentPages();
            let page = pages[pages.length - 2];
            let brandDayInfo = page.data.brandDayInfo;

            if (brandDayInfo != null) {
              img = brandDayInfo.PageBgImage;
              brandDayInfo = {};
              brandDayInfo.PageBgImage = img;
            }
            page.setData({
              brandList: [],
              brandDayInfo: brandDayInfo,
              isBrandMember: false,
              isShowDetails: false, //是否查看详情弹框
              isShowBarCode: false, //是否展示会员码
              barCodeNum: '', //会员条形码编码
              isCodeError: false, //会员条形码是否加载错误
              brandAmount: 0, //品牌金额
              checkStatus: [], //品牌勾选列表
              isBrandCheck: false, //是否勾选了品牌
              isAgreementCheck: false,
            });
            clearTimeout(page.data.timeOutId);
            page.onLoad();
            wx.navigateBack();
          } else {
            wx.reLaunch({
              url: '../member_index/member_index'
            })
          }
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

  }
})