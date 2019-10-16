//app.js
var myjCommon = require("/utils/myjcommon.js");
App({
  onLaunch: function () {
    
  },
  onShow: function (options) {
    console.log("App onShow");
    console.log(options);
    //开卡小程序
    if (options.referrerInfo && options.referrerInfo.appId == "wxeb490c6f9b154ef9" && options.referrerInfo.extraData) {
      //会多次返回该数据，如果会员卡已激活，不进行操作
      if (myjCommon.myjConfig.mcardActivated) {
        return false;
      }
      myjCommon.getLoginUser(function (user) {
        if (!user.isLogin) {
          wx.showModal({
            title: '提示',
            content: "用户登录失败，请稍后再进入会员卡重试。",
            showCancel: false
          });
          wx.hideLoading();
          return false;
        }
        //激活会员卡
        wx.showLoading({
          title: '正在激活会员卡……',
          mask: true
        });
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.ActivateMemberCard",
          biz: {
            cardId: options.referrerInfo.extraData.card_id,
            cardCode: options.referrerInfo.extraData.code,
            activate_ticket: encodeURIComponent(options.referrerInfo.extraData.activate_ticket),
            sessionId: user.sessionId
          },
          success: function (res) {
            console.log(res);
            if (res.Code == "0") {
              myjCommon.myjConfig.mcardActivated = true;
              wx.showToast({
                title: '会员卡激活成功',
                icon: "success"
              });
            }
            else {
              wx.showModal({
                title: '激活失败',
                content: "抱歉，会员卡激活失败，请重新进入会员卡重试一次，谢谢。",
                showCancel: false
              });
            }
          },
          fail: function (msg) {
            wx.showModal({
              title: '激活失败',
              content: "抱歉，会员卡激活失败，请重新进入会员卡重试一次，谢谢。",
              showCancel: false
            });
            console.log("失败：" + JSON.stringify(msg));
          },
          complete: function (res) {
            wx.hideLoading();
          }
        });
      });
    }
  },
  /**创建人：liujiaqi */
  /**创建日期：20190716 */
  /**描述： 判断是否为新页面 1旧页面 2新页面*/
  checkNewPage(){
    let currProvince = this.currProvince
    let currCity = this.currCity
    console.log(currProvince)
    if (currProvince == '江苏省' || currProvince == '浙江省' || currCity == '苏州市' || currProvince == '上海市' || currCity == '上海市'){
      return 1
    } else {
      return 2
    }
  },
  globalData: {
    userInfo: null,
    isMember:false,
    currJifen:0,
    currCity: "",
    currProvince:"",
    channelId: "",
    latitude: "",
    longitude: "",
    isNewPage: 0,//是否为新版会员页面:0加载中，1旧页面，2新页面
    currenAppid: "wxc94d087c5890e1f8", //当前小程序appid
  }
})