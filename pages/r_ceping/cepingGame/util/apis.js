// 封装ajax请求
const ajax = ({
  url,
  data,
  method,
  header
}) => {
  data = requestInterceptor({
    url,
    data,
    method,
    header
  })
  return new Promise((resolve, reject) => {
    // console.time(url)
    wx.request({
      url: data.url,
      data: data.data,
      method: data.method,
      header: data.header,
      success(res) {
        if (res.statusCode === 200) {
          resolve(responceInterceptor(res))
        } else {
          reject(responceInterceptor(res))
        }
      },
      fail(res) {
        reject(responceInterceptor(res))
      },
      complete() {
        console.log(url)
        // console.timeEnd(url)
        wx.hideLoading()
      }
    })
  })
}

// request拦截器
const requestInterceptor = config => config
// response拦截器
const responceInterceptor = config => {
  // console.log('response拦截器 config', config)
  if (config.statusCode === 200 && config.data.code === '0') {
    return config.data
  } else {
    return {
      code: config.code,
      msg: config.errMsg,
      data: config.data
    }
  }
}

// const host = 'http://192.168.0.65:3000/v2'
// const host = 'http://192.168.0.109:3000/v3'
const host = 'https://game.myj.com.cn/v3'
// //登陆记录pvuv
// const recordView = (sessionId, game_id) => ajax({
//   url: `${host}/base/view`,
//   data: {
//     user: sessionId,
//     game_id,
//   },
//   method: 'POST',
// })
// //获取游戏样式配置
const getSessionId = (wxUserInfo, authCode) => ajax({
  // url: `https://game.myj.com.cn/v2/base/login`,
  url: `${host}/game/login`,
  data: {
    targetCode: 'coupon',
    authCode: authCode,
    iv: wxUserInfo.iv,
    rawData: wxUserInfo.rawData,
    signature: wxUserInfo.signature,
    encryptedData: wxUserInfo.encryptedData
  },
  method: 'POST',
})

const visit = (game_id, unionid) => ajax({
  url: `${host}/game/visit`,
  data: {
    game_id,
    unionid
  },
  method: 'POST',
})

const getUserInfo = (game_id, lottery_id, sessionId) => ajax({
  url: `${host}/game/userInfo`,
  data: {
    game_id,
    lottery_id,
    sessionId,
  },
  method: 'POST',
})

const getConfig = (game_id, sessionId) => ajax({
  url: `${host}/game/static`,
  data: {
    game_id,
    sessionId,
  },
  method: 'POST',
})

const submitResult = (data) => ajax({
  url: `${host}/game/finish`,
  data,
  method: 'POST',
})

const uploadImg = (name, filePath, formData) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${host}/game/uploadImg`,
      name,
      filePath,
      formData,
      success: resolve,
      fail: reject
    })
  })
}

const uploadPostData = (data) => ajax({
  url: `${host}/game/uploadImgMsg`,
  data,
  method: 'POST',
})

const share = (data) => ajax({
  url: `${host}/game/shareGame`,
  data,
  method: 'POST',
})

const getUserLeftLotteryChance = (data) => ajax({
  url: `${host}/game/getUserLeftLotteryChance`,
  data,
  method: 'POST',
})

module.exports = {
  share,
  visit,
  getConfig,
  getUserInfo,
  uploadImg,
  submitResult,
  uploadPostData,
  getUserLeftLotteryChance,
  getSessionId
}