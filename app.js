//app.js
var myjCommon = require("/utils/myjcommon.js");
/** 黎梅芳 20190424 轻松点插件接入 */
 import easyRec from 'utils/easyrec.js'
App({
  //录音抽奖用
  data: {
    publicUrl: 'https://line.myj.com.cn/api/LuYinAct', //公共地址
    avatarUrl: '', //用户头像
    nickName: '', //用户昵称 
    session: '', //用户识别码，每次都要传
    loginSty: '', //登录状态类型
    pageIndex: 1,
    HelpRet: [], //助力人
    id: '', //分享自己的ID
    haveReco: '', //有录音
    src: '', //录音地址
    login: true
  },
  onLaunch: function(options) {
    console.log("App onLaunch");
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    //录音抽奖用
    var that = this;
    that.data.pageIndex = options.pageIndex || that.data.pageIndex;
    //获取openid
   // that.getUserOpenIdBySessionId();
  },
  /**创建人：黎梅芳 */
  /**创建日期：20190424 */
  /**描述：轻松点插件初始化 */
  takeiteasyinit: function(openid) {
    var that=this;
    /**
     * 初始化插件
     * 如果需要修改其中的参数，可再次调用该方法
     * 目前仅允许修改store_id
     */
    easyRec.init({
      // 微信支付分配的商户号mch_id(必须)
      mch_id: '1471539002',
      // 微信appid
      appid: 'wx55595d5cf709ce79',
      // openid(必须)/* wx.login()后拿到的openid */
      openid: openid,
      // 商户旗下门店的唯一编号(必须)
      store_id: '6666'
    });
  },
   /**创建人：黎梅芳 */
  /**创建日期：20190424 */
  /**描述：获取用户的openid */
  getUserOpenIdBySessionId:function(code)
  {
    var that=this;
    wx.login({
      success: function (lRes) {
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.GetWxOpenidByCode",
          biz: { code: lRes.code, targetCode:"coupon" },// {targetCode: "coupon" },
          success: function (loginRes) {
            if (loginRes.Code && loginRes.Result!=null)
            {
              /**初始化轻松点插件 */
              that.takeiteasyinit(loginRes.Result);
            }
          },fail:function()
          {
            console.log("初始化轻松点插件失败：获取不到openid");
          },complete:function(){}
      });
      }, fail: function () {
        console.log("初始化轻松点插件失败：获取不到openid");
      }, complete: function () { }
    });
    
  },
  onShow: function(options) {
    console.log("App onShow");
    console.log(options);
    //开卡小程序
    if (options.referrerInfo && options.referrerInfo.appId == "wxeb490c6f9b154ef9" && options.referrerInfo.extraData) {
      //myjCommon.myjConfig.testContent = JSON.stringify(options);
      //return;
      //会多次返回该数据，如果会员卡已激活，不进行操作
      if (myjCommon.myjConfig.mcardActivated) {
        return false;
      }
      /*
      wx.showModal({
        title: '开卡提示',
        content: "内容：" + JSON.stringify(options),
      });
      */
      myjCommon.getLoginUser(function(user) {
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
          success: function(res) {
            console.log(res);
            if (res.Code == "0") {
              myjCommon.myjConfig.mcardActivated = true;
              wx.showToast({
                title: '会员卡激活成功',
                icon: "success"
              });
            } else {
              wx.showModal({
                title: '激活失败',
                content: "抱歉，会员卡激活失败，请重新进入会员卡重试一次，谢谢。",
                showCancel: false
              });
            }
            /*
            wx.showModal({
              title: '激活成功',
              content: JSON.stringify(res),
              showCancel: false
            });
            */
          },
          fail: function(msg) {
            wx.showModal({
              title: '激活失败',
              content: "抱歉，会员卡激活失败，请重新进入会员卡重试一次，谢谢。",
              showCancel: false
            });
            console.log("失败：" + JSON.stringify(msg));
          },
          complete: function(res) {
            wx.hideLoading();
            /*
            myjCommon.relogin(function(){
              console.log("重新登录");
            });
            */
            //var loginUser = myjCommon.getCurrentUser();
            //loginUser.isLogin=false;
            //loginUser.sessionId = "";
          }
        });
      });
    }
  },
  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function(res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  globalData: {
    userInfo: null,
    currCity: "",
    currProvince: "",
    channelId: "",
    latitude: "",
    longitude: "",
    loginUser: {
      sessionId: "", //登录会话Id
      isLogined: false, //是否已登录
      isMember: false, //是否会员
      province: '', //所在省份
      city: '' //所在城市

    },
    madewords: "", //搜索栏提示语
    timeout: 60000, //缓存过期时间：10分钟（单位：毫秒） 600000
    isYhqIndex:false
  },
  getSetFn: function(successFn) {
    wx.getSetting({
      success: function(res) {
        console.log(res)
        if (res.authSetting['scope.record']) { // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: function(res) {
              console.log(res)
              // 可以将 res 发送给后台解码出 unionId
              //存贮头像和昵称为全局变量
              wx.setStorageSync('nickName', res.userInfo.nickName);
              wx.setStorageSync('avatarUrl', res.userInfo.avatarUrl);
              successFn()
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (that.userInfoReadyCallback) {
                that.userInfoReadyCallback(res);
                wx.setStorageSync('nickName', res.userInfo.nickName);
                wx.setStorageSync('avatarUrl', res.userInfo.avatarUrl);
                successFn()
              }
            },
            fail(res) {
              console.log(res)
            }
          })
        }
      },
      fail(res) {
        console.log(res)
      }
    });
  },
  getUserfn: function(session, trylogin, successFn, getmyinfo) {
    var that = this;
    wx.getSetting({
      success: function(res) {
        console.log(res)
        wx.getUserInfo({
          success: function(res) {
            console.log(res)
            // 可以将 res 发送给后台解码出 unionId
            wx.setStorageSync('nickName', res.userInfo.nickName);
            wx.setStorageSync('avatarUrl', res.userInfo.avatarUrl);
            successFn()
            if (that.userInfoReadyCallback) {
              that.userInfoReadyCallback(res);
              wx.setStorageSync('nickName', res.userInfo.nickName);
              wx.setStorageSync('avatarUrl', res.userInfo.avatarUrl);
              successFn()
            }
            wx.request({
              url: that.data.publicUrl,
              method: 'POST',
              data: {
                method: 'Login2',
                session: session,
                encryptedDataStr: res.encryptedData,
                iv: res.iv,
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: function(res) {
                console.log(res);
                console.log(2)
                if (res.data.errorCode == -4) {
                  wx.setStorageSync('loginSty', 4); //-4 没有注册会员，需要注册会员
                  trylogin(true)
                  getmyinfo();
                } else if (res.data.errorCode == 0) {
                  wx.setStorageSync('loginSty', 0);
                  trylogin(true)
                  //获取自己的信息
                  console.log("seteasd")
                  getmyinfo();

                }
                if (res.data.errorCode != 0 && res.data.errorCode != -4) { // 0 正常
                  trylogin(false)
                }
              }
            })
          },
          fail: function(res) {
            console.log(res)
            trylogin(false)
          }
        })
      }
    });

  },
  logInFn: function(trylogin, successFn, getmyinfo) {
    var that = this;
    wx.login({
      success: function(res) {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //登录小程序
        if (res.code) {
          wx.request({
            url: that.data.publicUrl,
            method: 'POST',
            data: {
              method: 'Login',
              code: res.code,
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function(res) {
              console.log(res)
              wx.setStorageSync('session', res.data.result);
              if (res.data.errorCode == 0) { // 0 正常
                wx.setStorageSync('loginSty', 0);
                that.getSetFn(successFn);
                that.getUserfn(res.data.result, trylogin, successFn, getmyinfo);
                trylogin(true)
                //获取自己的信息
                getmyinfo();
              } else if (res.data.errorCode == -4) { //-4 没有注册会员，需要注册会员
                wx.setStorageSync('loginSty', 4);
                that.getSetFn(successFn);
                that.getUserfn(res.data.result, trylogin, successFn, getmyinfo);
                trylogin(true)
                getmyinfo();
              } else if (res.data.errorCode == -1) { // -1 一般错误
                wx.setStorageSync('loginSty', 1);
                that.logInFn(trylogin, successFn, getmyinfo);
              } else if (res.data.errorCode == -2) { // -1 一般错误
                wx.setStorageSync('loginSty', 2);
                that.getUserfn(res.data.result, trylogin, successFn, getmyinfo);
              }
              // 获取用户信息

            }
          })
        } else {
          trylogin(false)
        }
      }
    })

  }
})