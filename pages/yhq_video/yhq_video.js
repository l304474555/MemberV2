var myjCommon = require("../../utils/myjcommon.js");
const txvContext = requirePlugin("tencentvideo");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoId: "",
    isaotuplay:false
   },

/**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.txvContext = txvContext.getTxvContext('txv1');
    var vidioid = options.videoId;
    if (vidioid!=undefined)
    {
      this.setData({
        videoId: vidioid
      });
    }
  },
  play:function()
  {
    this.videoPlay();
    this.txvContext.play();
   
  },
  videoPlay: function () {//点击视频按钮记录浏览人数
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.BannerCount",
        biz: { sessionId: user.sessionId, bannerId: that.data.videoId },
        success: function (res) {
        }
      })
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