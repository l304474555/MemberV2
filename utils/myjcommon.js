// const accessTokenUrl = "http://192.168.0.227:9999/mp_token.ashx?grant_type=client_credential&partner_code=wxxiaochengxu&secret=e857tsd1f3sd7ras8r677ur";
// const apiUrl = "http://192.168.0.227:9999/mp_aip.ashx";
// const apiPartner = "wxxiaochengxu";

const accessTokenUrl = "https://servicedx.myj.com.cn/mp_token.ashx?grant_type=client_credential&partner_code=wxxiaochengxu&secret=e857tsd1f3sd7ras8r677ur";
const apiUrl = "https://servicedx.myj.com.cn/mp_aip.ashx";
const apiPartner = "wxxiaochengxu";

// const accessTokenUrl = "https://ceshiserver.myj.com.cn/mp_token.ashx?grant_type=client_credential&partner_code=myjapp&secret=ad526837e2504c11b13439986c710869";
// const apiUrl = "https://ceshiserver.myj.com.cn/mp_aip.ashx";
// const apiPartner = "wxxiaochengxu";

var util = {
  getUrlParams: function (url) {
    var data = {};
    if (!url) {
      return data;
    }
    var urlArr = url.split('?');
    if (urlArr.length < 2) {
      return data;
    }
    var psArr = urlArr[1].split("#")[0].split("&");
    var kvArr;
    for (var i = 0; i < psArr.length; i++) {
      kvArr = psArr[i].split('=');
      data[kvArr[0]] = kvArr[1];
    }
    return data;
  }
};


var myjConfig = {
  cardId: "pjs3_ti5rDuy9D2TMG6uFv9QdT7A",
  mcardActivated: false,   //会员卡是否已激活
  mpSource: 1,
  mpConfigCode: "coupon"
};

var _currentToken = {
  access_token: "",
  expires_at: new Date(),
  isValidity: function () {
    if (this.access_token == "") {
      return false;
    }
    var now = new Date();
    //now.setMinutes(now.getMinutes() + 10);
    console.log(this);
    return this.expires_at.getTime() > now.getTime();
  }
};

//获取Token
function getAccessToken(callback) {

  //回调处理
  var cbType = typeof callback;
  var onSuccess = function () {
    if (cbType == "function") {
      callback(_currentToken);
    }
    else if (cbType == "object") {
      callback.success(_currentToken);
    }
    return _currentToken;
  };
  var onFail = function (msg) {
    if (cbType == "object") {
      callback.fail(msg);
    }
  }

  //如果当前token未过期，直接使用
  if (_currentToken.isValidity()) {
    onSuccess();
  }
  else {
    //更新token
    wx.request({
      url: accessTokenUrl,
      success: function (data) {
        console.log("请求成功：" + JSON.stringify(data));
        console.log(data.data.Result);
        if (data.data.Code == "0") {
          _currentToken.access_token = data.data.Result.access_token;
          var now = new Date();
          _currentToken.expires_at = new Date(now.getTime() + data.data.Result.expires_in * 1000);
          onSuccess();
        }
        else {
          onFail({
            statusCode: data.data.Code,
            errMsg: data.data.Msg
          });
        }
      },
      fail: function (msg) {
        console.log("请求失败：" + JSON.stringify(msg));
        onFail(msg);
      }
    });
  }
}

//调用api
function _callApi(opts) {
  if (typeof opts != "object") {
    console.log("error: opts must be an object.");
    return false;
  }
  if (!opts.interfaceCode) {
    console.log("error: interfaceCode could not be null.");
    return false;
  }
  if (typeof opts.biz == "undefined") {
    opts.biz = "";
  }
  if (typeof opts.success != "function") {
    opts.success = function (res) {
      console.log("request success: " + JSON.stringify(res));
    };
  }
  if (typeof opts.fail != "function") {
    opts.fail = function (msg) {
      console.log("request fail: " + JSON.stringify(msg));
    };
  }
  if (typeof opts.complete != "function") {
    opts.complete = function (res) {
      console.log("request complete: " + JSON.stringify(res));
    };
  }
  wx.request({
    url: apiUrl,
    data: {
      token: _currentToken.access_token,
      interface: opts.interfaceCode,
      biz: opts.biz
    },
    method: "POST",
    dataType: "json",
    success: function (res) {
      if (res.data.Code == "0") {
        var isSuccessed = false;
        var resultObj = null;
        try {
          resultObj = JSON.parse(res.data.Result);
          if (typeof (resultObj.Code) !== 'undefined' && resultObj.Code === "300") {
            //登录信息过期，重新登录
            // wx.navigateTo({
            //   url: '/pages/login/login',
            // });
            return false;
          }
          isSuccessed = true;
          //opts.success(JSON.parse(res.data.Result));
        }
        catch (ex) {
          //console.log(ex);
          //console.log(res.data.Result);
          var err = "返回数据转换异常：" + JSON.stringify(ex) + "-------data:" + JSON.stringify(res);
          if (opts.interfaceCode != "WxMiniProgram.Service.MPLog") {
            log(opts.interfaceCode, err);
          }
        }
        if (isSuccessed) {
          opts.success(resultObj);
        }
        else {
          var msg = {
            statusCode: "-1",
            errMsg: "服务器繁忙，请一会再试。"
          };
          opts.fail(msg);
        }
      }
      else if (res.data.Code == "10008") {
        //token 过期，重新获取token
        _currentToken.access_token = "";
        getAccessToken({
          success: function () {
            _callApi(opts);
          },
          fail: function (msg) {
            if (opts && opts.fail) {
              opts.fail(msg);
            }
          }
        });
      }
      else {
        var msg = {
          statusCode: res.data.Code,
          errMsg: res.data.Msg
        };
        opts.fail(msg);
      }
    },
    fail: function (msg) {
      opts.fail(msg);
      if (opts.interfaceCode != "WxMiniProgram.Service.MPLog") {
        log(opts.interfaceCode, JSON.stringify(msg));
      }
    },
    complete: function (res) {
      opts.complete(res);
    }
  });
}
//调用Api入口
function callApi(opts) {
  if (_currentToken && _currentToken.isValidity()) {
    _callApi(opts);
  }
  else {
    getAccessToken({
      success: function () {
        _callApi(opts);
      },
      fail: function (msg) {
        if (opts && opts.fail) {
          opts.fail(msg);
        }
      }
    });
  }
}

//**********登录信息**********/
//const _myjSidKey = "myj_session_id";
var _loginUser = {
  isLogin: false,
  sessionId: "",
  lastErrorCode: "",
  userInfo: {}
};
function getCurrentUser() {
  return _loginUser;
}
//重新登录
function relogin(callback) {
  _loginUser.isLogin = false;
  _loginUser.sessionId = "";
  _loginUser.lastErrorCode = "";
  logigByCode(callback);
}
//退出登录
function logout() {
  _loginUser.isLogin = false;
  _loginUser.sessionId = "";
  _loginUser.lastErrorCode = "";
}

//通过code获取openid方式登录
function logigByCode(callback) {
  wx.login({
    success: function (lRes) {
      callApi({
        interfaceCode: "WxMiniProgram.Service.MPLogin",
        biz: { code: lRes.code, targetCode: myjConfig.mpConfigCode },// {targetCode: "coupon" },
        success: function (loginRes) {
          console.log("MPLogin success");
          console.log(loginRes);
          _loginUser.lastErrorCode = loginRes.Code;
          if (loginRes.Code == "0") {
            //登录成功
            _loginUser.isLogin = true;
            _loginUser.sessionId = loginRes.Result;
            callback(_loginUser);
          } else if (loginRes.Code == "304") //新用户无法获取 unionId
          {
            wx.navigateTo({
              url: '/pages/login/login',
            });
          }
          else if (loginRes.Code == "4013") {
            //限制登录
            wx.showModal({
              title: '提示',
              content: loginRes.Msg,
              showCancel: false
            });
            _loginUser.isLogin = false;
            _loginUser.sessionId = "";
          }
          else if (loginRes.Code == "4014") {
            //业务改了，4014当做登录成功
            if (true) { //(ignoreError) {
              _loginUser.isLogin = true;
              _loginUser.sessionId = loginRes.Result;
              //_loginUser.userInfo = uRes.userInfo;
              callback(_loginUser);
            }
            else {
              _loginUser.isLogin = false;
              _loginUser.sessionId = "";
              wx.showModal({
                title: '提示',
                content: loginRes.Msg,
                showCancel: false,
                complete: function () {
                  wx.reLaunch({
                    url: '/pages/member_card/index',
                  });
                }
              });
            }
          }
          else {
            console.log("登录失败");
            console.log(loginRes);
            _loginUser.isLogin = false;
            _loginUser.sessionId = "";
            wx.showModal({
              title: '提示',
              content: "登录失败[" + loginRes.Code + "]，请一会再重试。",
              showCancel: false,
              complete: function () {
                logigByCode(callback);
              }
            });
          }
        },
        fail: function (msg) {
          console.log("网络异常，请检查网络后再试：" + JSON.stringify(msg));
          _loginUser.isLogin = false;
          _loginUser.sessionId = "";
          //callback(_loginUser);
          wx.showModal({
            title: '提示',
            content: "网络异常，请检查网络后再试。" + JSON.stringify(msg),
            showCancel: false,
            complete: function () {
              logigByCode(callback);
            }
          });
        }
      });
    },
    fail: function (msg) {
      wx.showModal({
        title: '提示',
        content: "微信通讯异常，请检查网络后再试。" + JSON.stringify(msg),
        showCancel: false,
        complete: function () {
          logigByCode(callback);
        }
      });
    }
  });
}

//直接登录
function loginByUserInfo(uData, callback) {
  wx.login({
    success: function (lRes) {
      console.log("wx.login success");
      console.log(lRes);
      wx.getUserInfo({
        withCredentials: true,
        success: function (uRes) {
          console.log("wx.getUserInfo success");
          console.log(uRes);
          //return;
          callApi({
            interfaceCode: "WxMiniProgram.Service.MPLoginV2",
            biz: { targetCode: myjConfig.mpConfigCode, authCode: lRes.code, rawData: encodeURIComponent(uRes.rawData), signature: uRes.signature, encryptedData: uRes.encryptedData, iv: uRes.iv },// {targetCode: "coupon" },
            success: function (loginRes) {
              console.log("MPLoginV2 success");
              console.log(loginRes);
              _loginUser.lastErrorCode = loginRes.Code;
              if (loginRes.Code == "0") {
                //登录成功
                _loginUser.isLogin = true;
                _loginUser.sessionId = loginRes.Result;
                _loginUser.userInfo = uRes.userInfo;
                callback(_loginUser);
              } else if (loginRes.Code == "300") //登录信息过期
              {
                wx.navigateTo({
                  url: '/pages/login/login',
                });
              }
              else if (loginRes.Code == "304") {


                wx.showModal({
                  title: '提示',
                  content: "获取微信用户信息不完整，请确保不要拒绝授权申请，再重试。",
                  showCancel: false
                });

              }
              else if (loginRes.Code == "4013") {
                wx.showModal({
                  title: '提示',
                  content: loginRes.Msg,
                  showCancel: false
                });
                _loginUser.isLogin = false;
                _loginUser.sessionId = "";
              }
              else if (loginRes.Code == "4014") {
                //业务改了，4014当做登录成功
                _loginUser.isLogin = true;
                _loginUser.sessionId = loginRes.Result;
                _loginUser.userInfo = uRes.userInfo;
                callback(_loginUser);
              }
              else {
                console.log("登录失败");
                console.log(loginRes);
                _loginUser.isLogin = false;
                _loginUser.sessionId = "";
                wx.showModal({
                  title: '提示',
                  content: "登录失败[" + loginRes.Code + "]，请确保不要拒绝授权申请，再重试。",
                  showCancel: false
                });
              }
            },
            fail: function (msg) {
              console.log("小程序登录失败：" + JSON.stringify(msg));
              _loginUser.isLogin = false;
              _loginUser.sessionId = "";
              wx.showModal({
                title: '提示',
                content: "网络异常，请检查网络后再重试。" + JSON.stringify(msg),
                showCancel: false
              });
            }
          })
        },
        fail: function (msg) {
          log("小程序授权失败", JSON.stringify(msg));
          _loginUser.isLogin = false;
          _loginUser.sessionId = "";
          wx.showModal({
            title: '提示',
            content: "小程序授权失败，请确认授权后再重试。" + JSON.stringify(msg),
            showCancel: false
          });
        }
      });
    },
    fail: function (msg) {
      //console.log("小程序授权失败：" + JSON.stringify(msg));
      log("小程序授权失败", JSON.stringify(msg));
      _loginUser.isLogin = false;
      _loginUser.sessionId = "";
      wx.showModal({
        title: '提示',
        content: "小程序授权失败，请确认授权后再重试。" + JSON.stringify(msg),
        showCancel: false
      });
    }
  });
}
//取前当前的登录信息
function getLoginUser(callback) {
  //检查状态并登录
  var checkAndLogin = function () {
    wx.checkSession({
      success: function () {
        console.log("wx.checkSession success.");
        callback(_loginUser);
      },
      fail: function () {
        console.log("wx.checkSession fail.");
        //当前状态已失效，重新登录
        _loginUser.isLogin = false;
        _loginUser.sessionId = "";
        logigByCode(callback);
      }
    });
  };

  if (_loginUser.isLogin) {
    //如果当前的登录信息存在，就直接使用
    checkAndLogin();
  }
  else {
    logigByCode(callback);
  }
};

function log(category, msg) {
  //取消记录服务端log
  console.log(msg);
  /*
  callApi({
    interfaceCode: "WxMiniProgram.Service.MPLog",
    biz: { category: category, msg: msg },
    success: function () {
    },
    fail: function (msg) {
      console.log("日志记录失败：" + JSON.stringify(msg));

    }
  });
  */
}

//********记录用户提交formId ******* */
function logFormId(formId) {
  if (!formId) {
    return;
  }
  try {
    getLoginUser(function (user) {
      callApi({
        interfaceCode: "WxMiniProgram.Service.LogMPFormId",
        biz: { sessionId: user.sessionId, mpSource: myjConfig.mpSource, formId: formId },
        success: function (data) {
        },
        fail: function (msg) {
          console.log("记录用户提交formId：" + JSON.stringify(msg));
        }
      });
    });
  }
  catch (e) {

  }
}

/**转发管理 */
function forward(callback) {
  var forwardinfo = null;
  callApi({
    interfaceCode: "WxMiniProgram.Service.GetForwardInfoByAppid",
    biz: { appid: "wx55595d5cf709ce79" },
    success: function (res) {
      if (res.Result != null) {
        forwardinfo = res.Result;
      }
      callback(forwardinfo);
    },
    fail: function (msg) {
      console.log("获取转发管理配置失败：" + JSON.stringify(msg));
    }
  });
}

module.exports = {
  util: util,
  myjConfig: myjConfig,
  getAccessToken: getAccessToken,
  callApi: callApi,
  getLoginUser: getLoginUser,
  getCurrentUser: getCurrentUser,
  relogin: relogin,
  loginByUserInfo: loginByUserInfo,
  logout: logout,
  log: log,
  logFormId: logFormId,
  forward: forward
};