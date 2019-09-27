//index.js
//获取应用实例
var app = getApp()
var myjUtil = require("../../utils/myjutil.js")
Page({
  data: {
    motto: 'Hello World',
    userInfo: {}
  },
  onLoad: function () {
    console.log('onLoad')
    //调用接口示例
    myjUtil.callApi({
      interfaceCode: "StoreGroupon.Service.GetUserOrderInfo",  //接口编号
      biz: { openId: "666666", orderNo: "636762340653770886" },  //业务参数
      success: function (res) {
        //调用成功回调
        console.log("接口调用成功：", res);
      },
      fail: function (msg) {
        //调用失败回调
        console.log("接口调用失败：", msg);
      },
      complete: function (res) {
        //调用完成回调（无论成功失败都回调）
        console.log("接口调用完成：", res);
      }
    });
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  testLink:function(){
    console.log("测试链接");
    wx.navigateTo({ url: '../bannerWeb/bannerWeb?bannerUrl=' + "https://mimage.myj.com.cn/frtest.htm" });
   
  }
})
