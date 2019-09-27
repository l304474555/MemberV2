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
    provinceName: "",
    searchWord: "", //搜索关键字
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP",
    allCityList: [], //全部城市
    searchCityList: [], //搜索的城市
    ShowCityList: [], //用于展示的
    isShow: false, //当关键词搜索的时候不显示热门城市和定位城市
    isNoneData: false, //是否查询出数据
    target: "", //用于标识是从首页过来还是从新店促销进来；根据这个标识选择城市后要跳回相应页面
    fromApp: 1, //来源：1 优惠券小程序； 2 会员小程序
    areaList: [] //载入的所有区域数据
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
      success: function(res) {
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
          coord_type: 3,
          success: function(res) {
            that.setData({
              cityName: res.result.address_component.city,
              provinceName: res.result.address_component.province
            });
          },
          fail: function(res) {
            console.log(res);
          },
          complete: function(res) {
            console.log(res);
          }
        });
      },
    })

    //加载热门城市
    that.LoadHotCity();
  },
  //选择城市
  selectCity: function(event) {
    var that = this;
    //选中城市
    var city = event.currentTarget.dataset.city;
    var province = event.currentTarget.dataset.province;
    app.currCity = city;
    app.currProvince = province;
    app.globalData.loginUser.province = province;
    app.globalData.loginUser.city = city;
    wx.showToast({
      title: '修改城市成功！',
      icon: 'success',
      duration: 2000,
      success: function () {
        // setTimeout(function() {
        if (that.data.target == "newshop") {
          wx.reLaunch({
            url: '../yhq_promotion/yhq_promotion'
          })
        } else if (that.data.target == "mycoupe") {
          wx.reLaunch({
            url: '../yhq_voucher/yhq_voucher'
          })
        } else if (that.data.target == "index") {
          wx.switchTab({
            url: '../yhq_index/yhq'
          })
        } else if (that.data.target == "applyfor") {
          wx.reLaunch({
            url: '../applyfor/index?target=applyfor'
          })
        }else
        {
          wx.navigateBack();
        }
        // }, 1500) //延迟时间 这里是1.5秒  

      },
      fail: function (msg) {
        console.log("出现异常：" + JSON.stringify(msg));
        wx.showToast({
          title: '定位失败，请重新选择城市',
          icon: 'success',
          duration: 0
        });
        wx.reLaunch({
          url: 'yhq_dw/yhq_dw'
        })
      },
      complete: function () {

      }

    })
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      //调用城市更新接口
      //1.根据选择的城市获取对应的经纬度然后更新到表里
      var demo = new QQMapWX({
        key: that.data.key // 必填
      });

      // 调用接口
      demo.geocoder({
        address: city,
        success: function(res) {
          var lat = res.result.location.lat; //经度
          var lng = res.result.location.lng; //纬度
          //把修改城市后的值赋值到全局变量
          app.latitude = lat;
          app.longitude = lng;
          myjCommon.callApi({
            interfaceCode: "WxMiniProgram.Service.UpdateUserLocation",
            biz: {
              sessionId: user.sessionId,
              city: city,
              province: province,
              lat: lat,
              lng: lng,
              fromApp: that.data.fromApp
            },
            success: function(res) {
              console.log(res)
              if (res.Code == "OK") {
              } else if (res.Code == "301") //非会员
              {
                if (that.data.target == "applyfor") {
                  wx.reLaunch({
                    url: '../applyfor/index?target=applyfor'
                  })
                } else {
                wx.switchTab({
                  url: '../yhq_index/yhq'
                })}
              }

            },
            fail: function(msg) {
              console.log("出现异常：" + JSON.stringify(msg));

            },
            complete: function(res) {


            }
          });
        },
        fail: function(res) {
          app.currCity = city;
          app.currProvince = province;
          app.globalData.loginUser.province = province;
          app.globalData.loginUser.city = city;
          
          wx.switchTab({
            url: '../yhq_index/yhq'
            })
          
        },
        complete: function(res) {}
      });

    });
  },
  //关键字搜索
  searchBykeyword: function(e) {
    var that = this;
    //输入的关键字
    var keyWord = e.detail.value;
    that.setData({
      searchWord: keyWord
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
    var citysList = []; //搜索出来的城市
    var cityItems = []; //城市数组

    for (var i = 0; i < that.data.allCityList.length; i++) {
      //hotCitys = that.data.allCityList[i].hotCitys;
      for (var j = 0; j < that.data.allCityList[i].cityList.length; j++) {
        for (var k = 0; k < that.data.allCityList[i].cityList[j].Citys.length; k++) {
          if (that.data.allCityList[i].cityList[j].Citys[k].Name.indexOf(keyWord) >= 0) {
            //province = that.data.allCityList[i].cityList[j].Province;
            var pro = that.data.allCityList[i].cityList[j].Province;
            //console.log("省份：", pro);
            city = that.data.allCityList[i].cityList[j].Citys[k].Name;
            citysList.push({
              Name: city,
              Province: pro
            });
          }

        }
      }
      cityItems.push({
        Province: province,
        Citys: citysList,
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
  LoadHotCity: function() {
    var that = this;
    wx.showLoading({
      title: '数据载入中...',
    })
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetHotCity",
      biz: {},
      success: function(res) {
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
          for(var i=0;i<hotcity.length;i++){
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
                for (var k = 0; k < provinceList.length; k++) {
                  provinceList[k].Province = provinceName;
                }
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
            ShowCityList: cityItem,
            areaList: ProList
          });
        }
        wx.hideLoading();
      },
      fail: function(msg) {
        console.log("testApi失败：" + JSON.stringify(msg));
        wx.hideLoading();
      },
      complete: function(res) {}
    });
  },
  getProvince: function(area) {
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
  locationCurrCity: function() {
    var that = this;
    app.currCity = that.data.cityName;
    app.currProvince = that.data.provinceName;
    app.globalData.loginUser.province = that.data.provinceName;
    app.globalData.loginUser.city = that.data.cityName;
    wx.showToast({
      title: '修改城市成功！',
      icon: 'success',
      duration: 2000,
      success: function () {
        // setTimeout(function () {
          if (that.data.target == "newshop") {
            wx.reLaunch({
              url: '../yhq_promotion/yhq_promotion'
            })
          } else if (that.data.target == "index") {
            wx.switchTab({
              url: '../yhq_index/yhq'
            })
          } else if (that.data.target == "mycoupe") {
            wx.reLaunch({
              url: '../yhq_voucher/yhq_voucher'
            })
          } else if (that.data.target == "applyfor") {
            wx.reLaunch({
              url: '../applyfor/index?target=applyfor'
            })
          }else
          {
            wx.navigateBack();
          }
        // }, 1500) //延迟时间 1.5秒
      },
      fail: function () {

      },
      complete: function () { }
    })

    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      //调用城市更新接口
      //1.根据选择的城市获取对应的经纬度然后更新到表里
      var demo = new QQMapWX({
        key: that.data.key // 必填
      });

      // 调用接口
      demo.geocoder({
        address: that.data.cityName,
        success: function(res) {
          var lat = res.result.location.lat; //经度
          var lng = res.result.location.lng; //纬度
          myjCommon.callApi({
            interfaceCode: "WxMiniProgram.Service.UpdateUserLocation",
            biz: {
              sessionId: user.sessionId,
              city: that.data.cityName,
              lat: lat,
              lng: lng,
              fromApp: that.data.fromApp
            },
            success: function(res) {
              if (res.Code == "OK") {
                


                
              } else {
                app.currCity = that.data.cityName;
                app.currProvince = that.data.provinceName;
                app.globalData.loginUser.province = that.data.provinceName;
                app.globalData.loginUser.city = that.data.cityName;
                if (that.data.target == "newshop") {
                  wx.reLaunch({
                    url: '../yhq_promotion/yhq_promotion'
                  })
                } else if (that.data.target == "index") {
                  wx.switchTab({
                    url: '../yhq_index/yhq'
                  })
                } else if (that.data.target == "mycoupe") {
                  wx.reLaunch({
                    url: '../yhq_voucher/yhq_voucher'
                  })
                } else if (that.data.target == "applyfor") {
                  wx.reLaunch({
                    url: '../applyfor/index?target=applyfor'
                  })
                }
              }

            },
            fail: function(res) {

            },
            complete: function(res) {

            }
          });
        },
        fail: function(res) {},
        complete: function(res) {}
      });

    });

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})