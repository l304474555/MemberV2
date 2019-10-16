// pages/member_zx/member_zx.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSize: 10, //会员资讯列表：页的大小
    pageIndex: 1, //会员资讯列表：页号
    memInfoList: [], //会员资讯数组
    memAd: null, //广告图对象
    isCompleted: false //是否加载完数据
  },
  LoadMemInfomation: function () {
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

      if (that.data.pageIndex == 1) {
        that.setData({
          memInfoList: []
        });
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetMPImageContentList",
        biz: { sessionId: user.sessionId, cityName: app.currCity, pageSize: that.data.pageSize, pageIndex: that.data.pageIndex },
        success: function (res) {
          console.log(res)
          // if (res.Result.MPImageContent !=null && res.Result.MPImageContent.length > 0) {
          //   for (var i = 0; i < res.Result.MPImageContent.length; i++) {
          //     that.setData({
          //       memAd: res.Result.MPImageContent[i]
          //     });
          //     break;
          //   }
          // }
          if (res.Result.MPImageContent == null) {
            res.Result.MPImageContent = [];
          }
          //分页加载
          var list = that.data.memInfoList.concat(res.Result.MPImageContent)
          that.setData({
            memInfoList: list,
          })
          var pCount = parseInt(res.Result.TotalCount / that.data.pageSize);
          if (res.Result.TotalCount % that.data.pageSize > 0) {
            pCount++;
          }
          if (that.data.pageIndex >= pCount) {
            that.setData({
              isCompleted: true
            });
          }
        },
        fail: function (msg) {
          console.log("GetMPImageContentList失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  //会员尊享：点赞
  clickGreat: function (event) {
    //获取当前点赞的图标标识，根据标识来显示对应的图标
    var isCheck = event.currentTarget.dataset.ischeck;
    //图文Id
    var comId = event.currentTarget.dataset.comid;

   
    var typeSign = "";
    if (isCheck > 0) {
      typeSign = "0";
    } else if (isCheck <= 0) {
      typeSign = "1";
    } else {
      typeSign = "1";
    }

    var curUser = myjCommon.getCurrentUser();
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.LikeMPImageContent",
      biz: { sessionId: curUser.sessionId, imgid: comId, typeSign: typeSign },
      success: function (res) {
        that.LoadMemInfomation();
      },
      fail: function (msg) {
        console.log("LikeMPImageContent失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
      }
    });
  },
  //点击图文调到详情
  locationDtl: function (event) {
    var id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../member_tw/member_tw?id=' + id
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
 
  },
  loadbanner:function()
  {
    var that=this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }
      wx.showLoading({
        title: '载入中..请稍后',
      });


      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetMPImageContenBannerList",
        biz: { 
          sessionId: user.sessionId, 
          cityName: app.currCity
            },
        success: function (res) {
          console.log("banner");
          console.log(res)
          if(res.length>0)
          {
            that.setData({
              memAd:res[0]
            });
          }
          //memAd
        },
        fail: function (msg) {
          console.log("GetMPImageContentList失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
          wx.hideLoading();
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
    this.LoadMemInfomation();
    this.loadbanner();
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
    if (this.data.isCompleted) {
      return;
    }
    this.data.pageIndex++;
    this.LoadMemInfomation();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //回到顶部
  returnTop: function () {
    this.setData({
      pageIndex: 1,
      pageSize: 10,
      isCompleted: false,
      memInfoList: []
    });
    this.LoadMemInfomation();
  }
})