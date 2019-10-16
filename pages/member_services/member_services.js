// pages/member_services/member_services.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList:[], //banner图片
    noteList: [],//公告
    modelList: [],//模块
    key: "WJFBZ-QVMWX-DKE4Y-7R7MN-TZN7H-3GFBP", //地图key
    isSelectCity:false,
    imgheights:[],//swipe图片高度
    current:0,//当前选择的图片
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },
  onShow:function()
  {
    this.getUserLocationInfo();//获取定位地址
  },
  getUserLocationInfo(){
    var that = this;
    var demo = new QQMapWX({
      key: that.data.key // 必填
    });
    if (app.currCity != undefined) { //全局已经存在城市
      that.GetMemberServicesInfo();
    } else {
      wx.showLoading({
        title: '定位中..请稍后',
      });
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          demo.reverseGeocoder({
            location: {
              latitude: latitude,
              longitude: longitude
            },
            success: function (res) {
             
              app.currCity = res.result.address_component.city;
              app.currProvince = res.result.address_component.province;
              app.latitude = res.result.address_component.latitude,
              app.longitude = res.result.address_component.longitude;
              that.GetMemberServicesInfo();
            },
            fail: function (res) {
              that.setData({
                isSelectCity: true
              });
            },
            complete: function (res) {
              wx.hideLoading();
            }
          });
        },
        fail: function (res) {
          that.setData({
            isSelectCity: true
          });
        },
        complete: function (res) {
          wx.hideLoading();
        }
      });
    }
  },
//服务页配置
  GetMemberServicesInfo(){
    let that = this;
    wx.showLoading({
      title: '数据载入中...',
    });
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.GetMemberServicesInfo",
      biz: {
        cityName: app.currCity,
        provinceName: app.currProvince,
        channel: 1
      },
      success: function (res) {
        if (res.Code == 0) {
          console.log(res)
          that.setData({
            bannerList: res.Result.banners,
            noteList: res.Result.noticeList,
            modelList: res.Result.serviceMudulesList
          });
        }
      },
      fail: function (msg) {
        console.log("调用GetMemberServicesInfo失败" + JSON.stringify(msg));
      },
      complete: function (res) {
      wx.hideLoading();
      }
    });
  },
  //点击model
  tapModel(e){
    let that = this, item = e.target.dataset.item;
    if (item) {
      //跳转小程序
      if (item.Jump == 2) {
        //有配置appid和页面路径，如果没有配置页面路径就直接跳转对应appid的小程序的首页
        if (item.PagePath != undefined) {
          if (item.AppId == app.globalData.currenAppid) { wx.navigateTo({ url: item.PagePath }); return; }
          wx.navigateToMiniProgram({
            appId: item.AppId,
            path: item.PagePath,
            envVersion: 'release',
            success(res) {
            }
          });
        }
      } else if (item.Jump == 4) {//跳转其他页面
        wx.navigateTo({
          url: '../bannerWeb/bannerWeb?bannerUrl=' + item.JumpLink
        })
      }
    }
  },
  /**跳转到选择城市页面 */
  changeCity: function () {
    this.setData({
      isSelectCity: false
    });
    wx.navigateTo({
      url: '/pages/yhq_dw/yhq_dw?target=service'
    });
  },
  imageLoad: function (e) {
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
    //console.log(imgwidth, imgheight)
    //计算的高度值  
    var viewHeight = 750 / ratio;
    var imgheight = viewHeight
    var imgheights = this.data.imgheights
    //把每一张图片的高度记录到数组里  
    imgheights.push(imgheight)
    this.setData({
      imgheights: imgheights,
    })
  },
  bindchange: function(e) {
    console.log(e)
    this.setData({
      current: e.detail.current
    })
  },
  
})