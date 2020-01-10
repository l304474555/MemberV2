/** liujiaqi 20190920 md5加密请求 */
import myjcommon from './myjcommon.js'
import md5 from './md5.js'
const BASIC_URL = myjcommon.signUrl;
//密钥
const SECRET_KEY = 'myj123'
//获取时间戳
let timestamp = function () {
  return timestampToTime(new Date().getTime());
};
//获取guid
let getUuid = function () {
  let s = [];
  let hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  let uuid = s.join("");
  return uuid;
}

function timestampToTime(timestamp) {
  var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  // var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m + s;
}

//调用api
function callApi(opts) {
  if (typeof opts != "object") {
    console.log("error: opts must be an object.");
    return false;
  }
  if (typeof opts.biz == "undefined") {
    opts.biz = "";
  }
  if (typeof opts.url == "undefined") {
    opts.url = "";
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
  let uuid = getUuid()
  let nowTimesTamp = timestamp()
  let parm = {
    "timestamp": nowTimesTamp,
    "nonceStr": uuid,
    "sign": md5.hexMD5(nowTimesTamp + uuid + SECRET_KEY),
    ...opts.biz
    //biz: opts.biz
  };
  wx.request({
    url: BASIC_URL + opts.url,
    data: parm,
    method: "POST",
    dataType: "json",
    success: function (res) {
      opts.success(res.data)
    },
    fail: function (msg) {
      opts.fail(msg);
    },
    complete: function (res) {
      opts.complete(res.data);
    }
  });
}
function get(url, data = {}, contentType) {
  return request(url, data, 'GET', contentType);
};
function post(url, data = {}, contentType) {
  return request(url, data, 'POST', contentType);
};
module.exports = {
  get,
  post,
  callApi
};