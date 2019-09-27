

const accessTokenUrl = "https://servicedx.myj.com.cn/mp_token.ashx?grant_type=client_credential&partner_code=xiaopao&secret=8276362471e44d2983bce667cb975562";
const apiUrl = "https://servicedx.myj.com.cn/mp_aip.ashx";
const apiPartner = "xiaopao";



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
          isSuccessed = true;
          //opts.success(JSON.parse(res.data.Result));
        }
        catch (ex) {
          //console.log(ex);
          //console.log(res.data.Result);
          var err = "返回数据转换异常：" + JSON.stringify(ex) + "-------data:" + JSON.stringify(res);
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



module.exports = {
  util: util,
  getAccessToken: getAccessToken,
  callApi: callApi
};