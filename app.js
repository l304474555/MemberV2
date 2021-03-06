//app.js
var myjCommon = require("/utils/myjcommon.js");
import signPost from 'utils/signpost.js'
App({
  onLaunch: function () {
    this.getSubscribeMessageList()
  },
  /**创建人：刘嘉麒 */
  /**创建日期：20200103 */
  /**描述：获取订阅消息模板 */
  getSubscribeMessageList() {
    wx.request({
      url: 'https://mimage.myj.com.cn/mpdata/mscene/wxc94d087c5890e1f8.js?t=' + new Date().getTime().toString(),
      data: {},
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success: (res) => {
        console.error('订阅列表', res)
        // area = res.data
        getApp().globalData.templateList = res.data
        // getApp().requestSubscribeMessage(0)
      }
    })
  },
  /**创建人：刘嘉麒 */
  /**创建日期：20200103 */
  /**描述：开始订阅消息 */
  requestSubscribeMessage(type, cb = '') {
    // type 0 退款 1 支付回调 
    console.log('订阅消息列表', getApp().globalData.templateList)
    let list = getApp().globalData.templateList
    let SceneList = ''
    list.forEach(item => {
      if (item.SceneCode == type) {
        SceneList = item.SceneList
      }
    })
    let tmplIds = []
    for (let item of SceneList) {
      tmplIds.push(item.TemplateId)
    }
    try {
      wx.requestSubscribeMessage({
        tmplIds,
        success(res) {
          console.log('订阅消息调用成功', res)
        },
        fail(res) {
          console.log('订阅消息调用失败', res)
        },
        complete(res) {
          console.log(tmplIds)
          if (cb) {
            cb(res)
          }
        }
      })
    } catch (err) {
      console.log('err', err)
      if (cb) {
        cb(err)
      }
    }
  },
  toWxPay(){
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.MPMberPay",
      biz: {
      },
      success: function (res) {
        if (res.Code == "0") {
          wx.openOfflinePayView({
            'appId': res.Result.appId,
            'timeStamp': res.Result.timeStamp,
            'nonceStr': res.Result.nonceStr,
            'package': res.Result.package,
            'signType': res.Result.signType,
            'paySign': res.Result.paySign,
            'success': function (res) { },
            'fail': function (res) {
            },
            'complete': function (res) { }
          });
        }
      },
      fail: function (msg) {
        console.log("MPMberPay失败：" + JSON.stringify(msg));
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
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
    companyCode: ''
  },
  signPost,//验签请求
})