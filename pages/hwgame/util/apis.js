let app = getApp()

import { filterProvince } from './util.js'
// 封装ajax请求
const ajax = ({url, data, method, header}) => {
  data = requestInterceptor({ url, data, method, header })
  return new Promise((resolve, reject) => {
    wx.request({
      url: data.url,
      data: data.data,
      method: data.method,
      header: data.header,
      success(res) {
        if(res.statusCode === 200) {
          resolve(responceInterceptor(res))
        } else {
          reject(responceInterceptor(res))
        }
      }, 
      fail(res) {
        reject(responceInterceptor(res))
      },
      complete() {
        wx.hideLoading()
      }
    })
  })
}
// request拦截器
const requestInterceptor = config => config
// response拦截器
const responceInterceptor = config => {
  if(config.statusCode === 200 && config.data.code === '0') {
    return config.data
  } else {
    return {
      code: config.code,
      msg: config.errMsg,
      data: config.data
    }
  }
}


// const host = 'http://wjh.24haowan.com:3000'
const host = 'https://game.myj.com.cn'

const commitUV = () => {
  return ajax({
    url: `${host}/myj/game/count`,
    data: {
      unionid: app.hwUserInfo.unionid
    },
    method: "POST"
  })
}

const getConfig = () => {
  return ajax({
    url: `${host}/myj/game/base`,
    data: {
      province: filterProvince(app.globalData.loginUser.province, app.globalData.loginUser.city)
    },
    method: "POST"
  })
}

const boot = () => {
  return ajax({
    url: `${host}/myj/game/boot`,
    data: {
      sessionId: app.globalData.loginUser.sessionId,
    },
    method: "POST"
  })
}

const lottery = () => {
  try{
    return ajax({
      url: `${host}/myj/game/lottery`,
      method: "POST",
      data: {
        unionid: app.hwUserInfo.unionid,
        province: filterProvince(app.globalData.loginUser.province, app.globalData.loginUser.city),
      }
    })
  }catch(e) {
    wx.hideLoading()
  }

}

const choose = uuid => {
  try {
    return ajax({
      url: `${host}/myj/game/pick`,
      method: "POST",
      data: {
        uuid,
        unionid: app.hwUserInfo.unionid,
        province: filterProvince(app.globalData.loginUser.province, app.globalData.loginUser.city),
      }
    })
  } catch (error) {
    wx.hideLoading()
  }
 
}

module.exports = {
  getConfig,
  lottery,
  choose,
  commitUV,
  boot
}