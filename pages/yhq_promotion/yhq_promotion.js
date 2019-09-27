// pages/yhq_promotion/yhq_promotion.js
var app = getApp();
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
var myjCommon = require("../../utils/myjcommon.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currCity: "", //当前所在的城市
    cityName:"", //当前页面的城市
    defaultAvatar: "../img/default.png", //默认头像
    userInfo: {}, //用户信息
    ShopInfoList:[], //店铺列表信息
    pageSize:5, //页的大小
    pageIndex:1, //页号
    pageIndexN: 1,
    lat:0,
    lng:0,
    isCompleted:false,
    isCompletedN:false, //标识数据是否已经加载完
    key:"WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP",
    targetQ:"load", //标识是否是首次加载
    isHasData:true, //是否有有数
    isSelectCity:false, //定位失败提示框
    shopPagesize:10, //附近5公里店铺分页大小
    shopPageindex: 1, //附近5公里店铺页号
    isshopCompleted:false, //标识附近5公里的店铺数据是否已加载完
    NearryShopInfo:[], //附近5公里店铺列表
    noticeobj: null,
    noticeTask: false,
    storeinfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  //根据经度、纬度加载店铺信息列表
  LoadShopData:function(weidu,jingdu)
  {
    var that=this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetNearStoreByLngAndLat",
      biz: {lng: jingdu, lat: weidu, pageSize: that.data.pageSize, pageIndex: that.data.pageIndex},
      success: function (res) {
     
        if (res.EntityList.length <= 0) {
          res.EntityList = [];
          that.setData({
            isHasData:false
          });
        }
        for (var i = 0; i < res.EntityList.length;i++)
        {
          if (res.EntityList[i].Distance>=1)
          {
            res.EntityList[i].Distance = parseFloat(res.EntityList[i].Distance).toFixed(2) +'km';
          }else
          {
            res.EntityList[i].Distance = (res.EntityList[i].Distance * 1000 ).toFixed(0) + 'm';
          }
        }

        //分页加载
        var list = that.data.ShopInfoList.concat(res.EntityList)
        that.setData({
          ShopInfoList: list,
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
      }
    });
  },
  //根据经度、纬度加载店铺信息列表
  LoadShopDataByArea:function (city,weidu, jingdu) {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetNearStoreByAreaName",
      biz: { areaName: city, lng: jingdu, lat: weidu },
      success: function (res) {
        if (res.EntityList.length<=0) {
          res.EntityList = [];
          that.setData({
            isHasData: false,
            isCompletedN: true
          });
        }
        for (var i = 0; i < res.EntityList.length; i++) {
          //Distance
          if (res.EntityList[i].Distance >= 1) {
            res.EntityList[i].Distance = parseFloat(res.EntityList[i].Distance).toFixed(2) + 'km'
          } else {
            res.EntityList[i].Distance = (res.EntityList[i].Distance * 1000).toFixed(0) + 'm'
          }
        }
        //分页加载
        var list = that.data.ShopInfoList.concat(res.EntityList)
        that.setData({
          ShopInfoList: list,
        })
  
        /*
        var pCount = parseInt(res.TotalCount / that.data.pageSize);
        if (res.TotalCount % that.data.pageSize > 0) {
          pCount++;
        }
        if (that.data.pageIndexN >= pCount) {
          that.setData({
            isCompletedN: true
          });
        }*/

      },
      fail: function (msg) {
        console.log("testApi失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
  },
  //加载附近5公里的店铺信息
  LoadNearStoreByAreaNameOr5: function (city, weidu, jingdu)
  {
    var that = this;
    wx.showLoading({
      title: '数据加载中...',
    })

    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetNearStoreByAreaNameOr5",
      biz: { areaName: city, lng: jingdu, lat: weidu, pageSize: that.data.shopPagesize, pageIndex: that.data.shopPageindex },
      success: function (res) {
        console.log(res)
        if (res.EntityList.length <= 0) {
          res.EntityList = [];
          that.setData({
            isHasData: false
          });
        }
        for (var i = 0; i < res.EntityList.length; i++) {
          //Distance
          if (res.EntityList[i].Distance >= 1) {
            res.EntityList[i].Distance = parseFloat(res.EntityList[i].Distance).toFixed(2) + 'km'
          } else {
            res.EntityList[i].Distance = (res.EntityList[i].Distance * 1000).toFixed(0) + 'm'
          }
        }
        //分页加载
        var list = that.data.NearryShopInfo.concat(res.EntityList)
        that.setData({
          NearryShopInfo: list,
        })
        var pCount = parseInt(res.TotalCount / that.data.shopPagesize);
        if (res.TotalCount % that.data.shopPagesize > 0) {
          pCount++;
        }
        if (that.data.shopPageindex >= pCount) {
          that.setData({
            isshopCompleted: true
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
  },
  //跳转到选择城市页面
  locaSelectCity:function()
  {
    wx.navigateTo({
      url: '../yhq_dw/yhq_dw?target=newshop'
    })
  },
  //点击 “立刻进入” 进入到所在店的券活动页面
  locaShopInfo:function(event)
  {
    //店铺Id
    var shopid = event.currentTarget.dataset.shopid;
    //店铺名称
    var shopName = event.currentTarget.dataset.shopname;
    wx.navigateTo({
      url: '../yhq_shop/yhq_shop?shopcode=' + shopid + '&shopName=' + shopName
    })
  },
  //点击距离打开在地图所在位置
  openMap:function(event)
  {
    var that=this;
    //纬度
    var weidu =parseFloat(event.currentTarget.dataset.weidu);
    //经度
    var jingdu = parseFloat( event.currentTarget.dataset.jingdu);
        wx.openLocation({
          latitude:weidu,
          longitude: jingdu,
          scale: 28
        })
  },
  //无新店促销数据回到优惠券首页
  locationIndex:function()
  {
    wx.reLaunch({
      url: '../yhq_index/yhq'
    })
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
    let storeinfo = wx.getStorageSync("newstoreinfo");
    this.setData({
      storeinfo: storeinfo
    });
    
    var that=this;
    that.notice();
    //清除缓存
    wx.removeStorageSync('city');
    wx.removeStorageSync('currCity'); //城市

    if (app.currCity!=undefined)
    {
      //显示当前定位到的城市
      that.setData({
        currCity: app.currCity,
        pageIndexN:1,
        shopPageindex:1,
        ShopInfoList:[],
        NearryShopInfo:[],
        isCompletedN:false,
        isshopCompleted:false,
        lat:0,
        lng:0
      });

      var demo = new QQMapWX({
        key: that.data.key // 必填
      });
       //获取当前的经纬度
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          var latitude = res.latitude; //经度
          var longitude = res.longitude; //纬度
          that.setData({
            lat: latitude,
            lng: longitude,
            isSelectCity:false
          });
          that.LoadShopDataByArea(app.currCity, latitude, longitude);
          that.LoadNearStoreByAreaNameOr5(app.currCity, latitude, longitude);
        },
        fail: function (res) {
          if (app.latitude != undefined && app.longitude != undefined) {
            that.setData({
              lat: app.latitude,
              lng: app.longitude
            });
            that.LoadShopDataByArea(app.currCity, app.latitude, app.longitude);
            that.LoadNearStoreByAreaNameOr5(app.currCity, app.latitude, app.longitude) 
          }
          else {
            that.setData({
              isSelectCity: true
            })
          }

        },
        complete: function (res) {
          console.log(res);
        }
      })
       //根据城市获取附近2公里的庆店信息
    }else
    {
    //如果全局城市为空，跳到选择城市页面让它选择城市
      that.setData({
        isSelectCity: true
      });
    }
   

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
          if (res.data[i].Pages == "home" && res.data[i].Upgrade == 1) {
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   /* if (this.data.targetQ=="load")
   {
      if (this.data.isCompleted) {
        return;
      }
     
      this.data.pageIndex++;
      this.LoadShopData(this.data.lat, this.data.lng);
   }else
   {
      if (this.data.isCompletedN) {
        return;
      }
      this.data.pageIndexN++;
      this.LoadShopDataByArea(this.data.currCity, this.data.lat, this.data.lng);
   }*/

    /*if (this.data.isCompletedN) {
      return;
    }
    this.data.pageIndexN++;
    this.LoadShopDataByArea(this.data.currCity, this.data.lat, this.data.lng);*/

    //加载附近5公里门店
    if (this.data.isshopCompleted) {
      return;
    }
    this.data.shopPageindex++;
    this.LoadNearStoreByAreaNameOr5(this.data.currCity, this.data.lat, this.data.lng);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //切换当前城市：跳转到选择城市列表
  changeCity: function () {
    this.setData({
      isSelectCity: false
    });
    wx.navigateTo({
      url: '../yhq_dw/yhq_dw?target=newshop'
    })
  }
})