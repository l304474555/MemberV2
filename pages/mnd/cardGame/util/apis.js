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
    wx.request({
      url: data.url,
      data: data.data,
      method: data.method,
      header: data.header,
      success(res) {
        console.log(data.url, JSON.parse(JSON.stringify(res)))
        if (res.statusCode === 200) {
          resolve(responceInterceptor(res))
        } else {
          reject(responceInterceptor(res))
        }
      },
      fail(res) {
        console.error(data.url, JSON.parse(JSON.stringify(res)))
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


// const host = 'http://192.168.0.58:3000/v2'
const host = 'https://game.myj.com.cn/v2'
//登陆拿session
const getSessionId = (wxUserInfo, authCode) => ajax({
  url: `${host}/base/login`,
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
//登陆记录pvuv
const recordView = (unionid, game_id) => ajax({
  url: `${host}/base/view`,
  data: {
    user: unionid,
    game_id,
  },
  method: 'POST',
})
//获取游戏样式配置 
const getConfig = (game_id, sessionId) => ajax({
  url: `${host}/base/static`,
  data: {
    game_id,
    sessionId,
  },
  method: 'GET',
})
//获取卡片
const getCardStatus = (unionid, game_id) => ajax({
  url: `${host}/card/list`,
  data: {
    user: unionid,
    game_id,
  },
  method: 'GET',
})
//登陆自动获取卡片
const getFreeCard = (unionid, game_id) => ajax({
  url: `${host}/card/auto`,
  data: {
    user: unionid,
    game_id,
  },
  method: 'POST',
})
//分享助力
const boost = (game_id, from, help, help_name, help_head) => ajax({
  url: `${host}/card/share`,
  data: {
    game_id,
    from,
    help,
    help_name,
    help_head
  },
  method: 'POST',
})
//获取助力卡片
const getBoostCard = (from, help, game_id) => ajax({
  url: `${host}/share/self`,
  data: {
    game_id,
    from,
    help,
  },
  method: 'GET',
})
//助力好友列表
const getFriendsList = (unionid, game_id) => ajax({
  url: `${host}/share/friends`,
  data: {
    game_id,
    from: unionid,
  },
  method: 'GET',
})
//大礼包剩余数量
const getPrizeSum = (user, game_id) => ajax({
  url: `${host}/prize/remain`,
  data: {
    user,
    game_id,
  },
  method: "GET"
})
//查看新卡片的获取
const checkNewCard = (user, game_id) => ajax({
  url: `${host}/check/toast`,
  data: {
    user,
    game_id,
  },
  method: 'GET'
})
//领取卡片
const receiveCard = (user, type, game_id) => ajax({
  url: `${host}/check/toast`,
  data: {
    user,
    type,
    game_id,
  },
  method: "POST"
})
//兑换奖品
const exchangePrize = (user, game_id, pubOpenId, mode = null, lottery_id = null) => ajax({
  url: `${host}/prize/exchange`,
  data: {
    user,
    game_id,
    pubOpenId,
    mode,
    lottery_id,
  },
  method: 'POST'
})
//获得奖品列表
const getPrizeList = (user, game_id) => ajax({
  url: `${host}/prize/list`,
  data: {
    user,
    game_id,
  },
  method: 'GET'
})
//配置快递地址
const setAddress = (courier_name, courier_tel, courier_address, exchange_id, user) => ajax({
  url: `${host}/prize/address`,
  data: {
    courier_name,
    courier_tel,
    courier_address,
    exchange_id,
    user,
  },
  method: 'POST',
})
const gotCoupon = (game_id, user, pubOpenId, store, prize_id) => ajax({
  url: `${host}/prize/coupon`,
  data: {
    user,
    game_id,
    pubOpenId,
    store,
    prize_id
  },
  method: 'POST',
})
const getUserLeftLotteryChance = (data) => ajax({
  // url: `${host}/game/getUserLeftLotteryChance`,
  // todo 
  url: `https://game.myj.com.cn/v3/game/getUserLeftLotteryChance`,
  data,
  method: 'POST',
})
module.exports = {
  recordView,
  getConfig,
  getCardStatus,
  getFreeCard,
  boost,
  getBoostCard,
  getFriendsList,
  getPrizeSum,
  checkNewCard,
  receiveCard,
  exchangePrize,
  getPrizeList,
  setAddress,
  getSessionId,
  gotCoupon,
  getUserLeftLotteryChance
}