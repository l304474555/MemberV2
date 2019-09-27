// 登录公共模块
var publicUrl ='https://line.myj.com.cn/api/LuYinAct';          //公共地址
var session= '';     //用户识别码，每次都要传
var myjCommon = require("myjcommon.js");

function getSetFn() {
  var that = this ;
  wx.getSetting({
    success: function (res) {
      console.log(res)
      if (res.authSetting['scope.record']) {  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        console.log('1225')
        wx.getUserInfo({
          success: function (res) {
            console.log(res)
            // 可以将 res 发送给后台解码出 unionId
            //存贮头像和昵称为全局变量
            wx.setStorageSync('nickName', res.userInfo.nickName);
            wx.setStorageSync('avatarUrl', res.userInfo.avatarUrl);
            that.setData({
              avatarUrl: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName,
            })
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            if (that.userInfoReadyCallback) {
              that.userInfoReadyCallback(res);
              wx.setStorageSync('nickName', res.userInfo.nickName);
              wx.setStorageSync('avatarUrl', res.userInfo.avatarUrl);
              that.setData({
                avatarUrl: res.userInfo.avatarUrl,
                nickName: res.userInfo.nickName,
              })
            }
          }, fail(res) {
            console.log(res)
          }
        })
      }
    }, fail(res) {
      console.log(res)
    }
  });
}


//login2
function getUserfn(session,fngetmyinfo){
  var that = this;
  wx.getSetting({
    success: function (res) {
      console.log(res)
      if (!res['scope.record']) {   //没授权
        // 设置询问
        wx.authorize({
          scope: 'scope.record',
          success(res) {
            wx.getUserInfo({
              success: function (res) {
                console.log(res)
                // 可以将 res 发送给后台解码出 unionId
                wx.setStorageSync('nickName', res.userInfo.nickName);
                wx.setStorageSync('avatarUrl', res.userInfo.avatarUrl);
                that.setData({
                  avatarUrl: res.userInfo.avatarUrl,
                  nickName: res.userInfo.nickName,
                })
                if (that.userInfoReadyCallback) {
                  that.userInfoReadyCallback(res);
                  wx.setStorageSync('nickName', res.userInfo.nickName);
                  wx.setStorageSync('avatarUrl', res.userInfo.avatarUrl);
                  that.setData({
                    avatarUrl: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName,
                  })
                }

                myjCommon.callApi({
                  interfaceCode: "WxMiniProgram.Service.LuYinAct",
                  biz: {
                    method: 'Login2',
                    session: session,
                    encryptedDataStr: res.encryptedData,
                    iv: res.iv
                  },
                  success: function (res) {
                    console.log(res);
                    if (res.data.errorCode == -4) {
                      wx.setStorageSync('loginSty', 4);     //-4 没有注册会员，需要注册会员
                      that.setData({
                        login: true
                      })
                    } else if (res.data.errorCode == 0) {
                      wx.setStorageSync('loginSty', 0);
                      that.setData({
                        login: true
                      })
                      //获取自己的信息
                      fngetmyinfo();

                    }
                    if (res.data.errorCode != 0 && res.data.errorCode != -4) {   // 0 正常
                      that.setData({
                        login: false
                      })
                    }
                  },
                  fail: function (msg) {
                  },
                  complete: function (res) {
                  }
                });

                /*
                wx.request({
                  url: that.data.publicUrl,
                  method: 'POST',
                  data: {
                    method: 'Login2',
                    session: session,
                    encryptedDataStr: res.encryptedData,
                    iv: res.iv,
                  },
                  header: { 'content-type': 'application/x-www-form-urlencoded' },
                  success: function (res) {
                    console.log(res);
                    if (res.data.errorCode == -4) {
                      wx.setStorageSync('loginSty', 4);     //-4 没有注册会员，需要注册会员
                      that.setData({
                        login: true
                      })
                    } else if (res.data.errorCode == 0) {
                      wx.setStorageSync('loginSty', 0);
                      that.setData({
                        login: true
                      })
                      //获取自己的信息
                      fngetmyinfo();

                    }
                    if (res.data.errorCode != 0 && res.data.errorCode != -4) {   // 0 正常
                      that.setData({
                        login: false
                      })
                    }
                  }
                })
                */
              },
              fail: function (res) {
                console.log(res)
                that.setData({
                  login: false
                })
              }
            })
          },
          fail() {
            that.setData({
              login: false
            })
          },
        })
      }
    }
  });

}



//login1
function logInFn(fngetmyinfo){
  var that = this;
  wx.login({
    success: function (res) {
      console.log(res)
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      //登录小程序
      if (res.code) {
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.LuYinAct",
          biz: {
            method: 'Login',
            code: res.code
          },
          success: function (res) {
            console.log(res)
            wx.setStorageSync('session', res.data.result);
            that.setData({
              session: res.data.result
            })
            if (res.data.errorCode == 0) {   // 0 正常
              wx.setStorageSync('loginSty', 0);
              that.getSetFn();
              that.setData({
                login: true
              })
              //获取自己的信息
              fngetmyinfo();

            } else if (res.data.errorCode == -4) {  //-4 没有注册会员，需要注册会员
              wx.setStorageSync('loginSty', 4);
              that.getSetFn();
            } else if (res.data.errorCode == -1) {    // -1 一般错误
              wx.setStorageSync('loginSty', 1);
              that.logInFn();
              wx.showModal({
                title: '提示',
                content: res.data.errorMsg,
                showCancel: false
              });
            } else if (res.data.errorCode == -2) {    // -1 一般错误
              wx.setStorageSync('loginSty', 2);
              that.getUserfn(res.data.result, fngetmyinfo);
            }
            // 获取用户信息
          },
          fail: function (msg) {
          },
          complete: function (res) {
          }
        });

        /*
        wx.request({
          url: publicUrl,
          method: 'GET',
          data: {
            method: 'Login',
            code: res.code,
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res)
            wx.setStorageSync('session', res.data.result);
            that.setData({
              session: res.data.result
            })
            if (res.data.errorCode == 0) {   // 0 正常
              wx.setStorageSync('loginSty', 0);
              that.getSetFn();
              that.setData({
                login: true
              })
              //获取自己的信息
              fngetmyinfo();

            } else if (res.data.errorCode == -4) {  //-4 没有注册会员，需要注册会员
              wx.setStorageSync('loginSty', 4);
              that.getSetFn();
            } else if (res.data.errorCode == -1) {    // -1 一般错误
              wx.setStorageSync('loginSty', 1);
              that.logInFn();
              wx.showModal({
                title: '提示',
                content: res.data.errorMsg,
                showCancel: false
              });
            } else if (res.data.errorCode == -2) {    // -1 一般错误
              wx.setStorageSync('loginSty', 2);
              that.getUserfn(res.data.result, fngetmyinfo);
            }
            // 获取用户信息

          }
        })
        */
      } else {
        that.setData({
          login: false
        })
      }
    }
  })

}


module.exports = {
  logInFn: logInFn
}




































