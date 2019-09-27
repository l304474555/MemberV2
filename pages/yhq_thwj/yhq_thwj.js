var app = getApp();
var myjCommon = require("../../utils/myjcommon.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currUserInfo: null, //当前登录用户信息
    isShowUserInfoBtn: false,
    channelId: 0,
    numberOnePlayerInfo: [],
    backgroundimg:'',
    currAppid: 'wx55595d5cf709ce79',
    playCnt: 0
  },
  getUserInfoBtnClick: function(e) {
    var that = this;
    if (e.detail.errMsg == "getUserInfo:ok") {
      wx.getUserInfo({
        success: function(e) {
          that.setData({
            currUserInfo: e.userInfo,
            isShowUserInfoBtn: false
          });
        }
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //options.channelId = 'y46802761'
    if (options.channelId != undefined) {
      this.setData({
        channelId: options.channelId
      });
      this.loadActivityInfo();
      this.addPlayLog();
    }
    
  },
  /**加载活动信息 */
  loadActivityInfo: function() {
    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetLotteryActivityGameConfig",
        biz: {
          channelId: that.data.channelId
        },
        success: function(res) {
          console.log(res)
          if (res.Result != null) {
            that.setData({
              numberOnePlayerInfo: res.Result.ActivityList,
              playCnt: res.Result.PlayCnt,
              backgroundimg: res.Result.BackgroundImg
            });
          }
        },
        fail: function(msg) {
          console.log("GetLotteryActivityGameConfig" + JSON.stringify(msg));
          wx.showToast({
            title: '系统繁忙，请稍后再来。',
            icon: 'none'
          })
        },
        complete: function(res) {}
      });
    });
  },
  addPlayLog: function () {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        wx.showModal({
          title: '提示',
          content: "登录失败，请稍后重试。",
          showCancel: false
        });
        return false;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.AddToPlayCout",
        biz: {
          sessionId:user.sessionId,
          activityId: that.data.channelId
        },
        success: function (res) {
         console.log(res)
        },
        fail: function (msg) {
          console.log("AddToPlayCout" + JSON.stringify(msg));
       
        },
        complete: function (res) { }
      });
    });
  },
  /**跳转 */
  toPage: function(e) {
    var item = e.currentTarget.dataset.item;
    //jump:跳转链接【1：不跳转:2：跳转小程序，3：跳转链接】
    if (item.Jump == 2) //跳转小程序
    {
      if (item.AppId == this.data.currAppid) {
        wx.navigateTo({
          url: item.PagePath,
        });
      } else {
        wx.navigateToMiniProgram({
          appId: item.AppId,
          path: item.PagePath
        });
      }
    } else if (item.Jump == 3) //跳转链接
    {
      wx.navigateTo({
        url: '../bannerWeb/bannerWeb?bannerUrl=' + item.JumpUrl
      })
    }else if(item.Jump==4)//跳转推文
    {
      wx.navigateTo({
        url: '../bannerWeb/bannerWeb?bannerUrl=' + item.JumpUrl
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    wx.getUserInfo({
      success: function(e) {
        console.log(e)
        that.setData({
          currUserInfo: e.userInfo
        });
      },
      fail: function(msg) {
        that.setData({
          isShowUserInfoBtn: true
        });
      }
    });
  },

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

  },
  /**返回优惠券首页 */
  returnIndex:function()
  {
    wx.reLaunch({
      url: '/pages/yhq_index/yhq'
    })
  }
})