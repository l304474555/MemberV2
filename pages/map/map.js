// pages/map/map.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currStoreInfo: {
      storeName: '',
      storeCode: '',
      storeAddress: '',
      storelat: 0.00,
      storelng: 0.00,
    },
    markers: [],
    polyline: [],
    pageSize: 10,
    pageIndex: 1,
    lat: 0.00,
    lng: 0.00,
    markWidth: 25,
    markHeiht: 25,
    mapHeigt: 300
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let height = 0;
    if (wx.getSystemInfoSync().windowHeight<=610)
    {
      height = wx.getSystemInfoSync().windowHeight-130;
    }else
    {
      height = wx.getSystemInfoSync().windowHeight - 140;
    }
    this.setData({
      mapHeigt: height
    });

    //一进来显示定位到的门店
    var storeinfo = wx.getStorageSync("storeinfo");
    if (storeinfo != '') {
      this.setData({
        currStoreInfo: storeinfo
      });
    }
    this.loadStoreInfo();
  },
  loadStoreInfo: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        /**纬度 */
        var latitude = res.latitude;
        /**经度 */
        var longitude = res.longitude;
        that.setData({
          lat: latitude,
          lng: longitude
        });
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.GetStoreListData",
          biz: {
            keyWords: '',
            pageIndex: 1,
            pageSize: 20,
            uLng: longitude,
            uLat: latitude
          },
          success: function (res) {
            console.log(res)
            var width=0;
            var height=0;
            if (res.EntityList.length > 0) {
              var list = res.EntityList;
              let markarr = [];
              for (var i = 0; i < list.length; i++) {
                if (list[i].StoreCode == that.data.currStoreInfo.storeCode)
                {
                 width=50;
                 height=50;
                }else
                {
                  width = that.data.markWidth;
                  height = that.data.markHeiht;
                }
                markarr.push({
                  iconPath: "../img/location.png",
                  id: i,
                  title: list[i].StoreName || '',
                  latitude: list[i].GaoDeWeiDu,
                  longitude: list[i].GaoDeJinDu,
                  width: width,
                  height: height,
                  callout: {
                    content: list[i].Province + list[i].City + list[i].DetailAddr,
                    color: list[i].StoreCode
                  },
                  province: list[i].Province,
                  companycode: list[i].CompanyCode
                });
              }
 
              that.setData({
                markers: markarr
              });
            }
          },
          fail: function (msg) {
            console.log(JSON.stringify(msg))
          },
          complete: function (res) {
            wx.hideLoading();
          }
        });
      }, fail: function () {
        //设置一个弹框，如果定位失败则这个弹框一直弹着不让关闭
        wx.showModal({
          title: '温馨提示',
          content: '无法获得您的定位，请返回手动搜索门店。',
          showCancel:false,
          success:function(res)
          {
            if(res.confirm)
            {
              wx.redirectTo({
                url: '../yhq_choose_store/yhq_choose_store',
              });
            }
          }
        })
      },
      complete: function () { }
    });
  },
  /**点击标记点图标放大 */
  markertap: function (e) {
    let storename = '';
    let storecode = '';
    let storeaddress = '';
    let lat = 0.00;
    let lng = 0.00;
    let province="";
    let companycode="";
    var markId = e.markerId;
    var markArr = this.data.markers;
    for (var i = 0; i < markArr.length; i++) {
      markArr[i].width = 25;
      markArr[i].height = 25;
      for (var k = 0; k < markArr.length; k++) {
        if (markArr[k].id == markId) {
          console.log(markArr[k])
          markArr[k].width = 50;
          markArr[k].height = 50;
          storename = markArr[k].title;
          storecode = markArr[k].callout.color;
          storeaddress = markArr[k].callout.content;
          lat = markArr[k].latitude;
          lng = markArr[k].longitude;
          province = markArr[k].province;
          companycode = markArr[k].companycode
          break;
        } else {
          continue;
        }
      }
    }

    this.setData({
      markers: markArr,
      currStoreInfo: {
        storeName: storename,
        storeCode: storecode,
        storeAddress: storeaddress,
        storelat: lat,
        storelng: lng
      }
    });
    var storeinfo={};
    storeinfo.storeCode = storecode;
    storeinfo.storeName = storename;
    storeinfo.storeAddress = storeaddress;
    storeinfo.storelat = lat;
    storeinfo.storelng = lng;
    storeinfo.province=province;
    storeinfo.companycode=companycode;
    wx.setStorageSync("storeinfo", storeinfo);
    wx.setStorageSync("map", "map");
  },
  /**选择门店 */
  updateStore: function () {

    wx.showToast({
      title: '保存成功！',
      icon: 'success',
      success: function () {
        setTimeout(function () {
        wx.switchTab({
          url: '../yhq_index/yhq',
        });
        },1500);
      }
    });
  },
  /**定位失败跳到门店列表页让他搜索 */
  yesbtn:function()
  {
    wx.redirectTo({
      url: '../yhq_choose_store/yhq_choose_store',
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