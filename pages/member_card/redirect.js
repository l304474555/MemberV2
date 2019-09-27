// pages/member_card/redirect.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOpenning : false,
    ttPage : "",
    storeinfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("会员卡onLoad");
    var that = this;
    var jump = options.jumpPage
    console.log(jump)
    that.setData(
      {
        ttPage: jump
      }
    );

   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  back:function () {
    // wx.switchTab({ url: "/pages/yhq_index/yhq" });
    if (this.data.ttPage == "2") {
      wx.redirectTo({
        url: '../yhq_channel/yhq_channel',
      })
    } else if (this.data.ttPage == "3") {
      wx.redirectTo({
        url: '../r_game/r_game',
      })
    }
    else {
      wx.switchTab({ url: "/pages/yhq_index/yhq" });
    }
  },
  toWxMemberCard: function () {
    console.log(wx.navigateToMiniProgram);
    var that = this;
    wx.navigateToMiniProgram({
      appId: "wxc94d087c5890e1f8",
      success: function (mRes) {
        that.setData({
          isOpenning:true
        });
        console.log("跳转会员小程序成功");
        console.log(mRes);
      },
      fail: function (err) {
        /**因为wx.navigateToMiniProgram这个组件已弃用要点双次才生效所以点单次失败的时候再回调一下 黎梅芳 2018.12.13 */
        if (err.errMsg =="navigateToMiniProgram:fail can only be invoked by user TAP gesture.")
        {
        wx.reLaunch({
          url: '../member_card/redirect',
        });
        }
        
        console.log("跳转会员小程序成功失败");
        console.log(err);
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let storeinfo = wx.getStorageSync("newstoreinfo");
    this.setData({
      storeinfo: storeinfo
    });

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    console.log("会员卡onShow"); 
    if (this.data.isOpenning) {
      this.setData({
        isOpenning:false
      });
      //this.data.isOpenning = false;
      this.back();
    }
    else {
      this.toWxMemberCard();
    }

   // this.toWxMemberCard();
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