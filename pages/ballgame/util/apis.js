import bus from './bus.js';

// 封装ajax请求
const ajax = ({ url, data, method, header }) => {
    data = requestInterceptor({ url, data, method, header })
    return new Promise((resolve, reject) => {
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
                wx.hideLoading()
            }
        })
    })
}

// request拦截器
const requestInterceptor = config => {
    config.header = config.header || {};
    Object.assign(config.header, {
        'Content-Type': 'application/json'
    })
    return config;
}
// response拦截器
const responceInterceptor = config => {
//   console.log('response拦截器 config', config)
  if (config.statusCode === 200 && config.data.code === '0') {
    return config.data.payload || config.data
  } else {
    return {
      code: config.code,
      msg: config.errMsg,
      data: config.data
    }
  }
}

// const host = 'https://custom.24haowan.com'
// const host = 'http://192.168.0.124:3000'
const host = 'https://game.myj.com.cn'
// const host = 'http://gg.myj.com.cn:3000'

const login = (wxUserInfo, authCode) => ajax({
    method: 'POST',
    url: `${host}/v4/user/login`,
    data: {
        targetCode: 'coupon',
        authCode: authCode,
        iv: wxUserInfo.iv,
        rawData: wxUserInfo.rawData,
        signature: wxUserInfo.signature,
        encryptedData: wxUserInfo.encryptedData
    }
})

const getJwt = (sessionId) => ajax({
    method: 'POST',
    url: `${host}/v4/user/token`,
    data: {
        sessionId,
        nickname: bus.data.userInfo.name,
        headimgurl: bus.data.userInfo.headimgurl
    }
})

const boot = (id)=> ajax({
    method: 'GET',
    url: `${host}/v4/index/boot`,
    data: {
        id
    }
})

const integralList = (type, page = 1) => ajax({
    method: 'GET',
    url: `${host}/v4/index/integral`,
    header: {
        Authorization: `ab ${bus.data.token}`
    },
    data: {
        type,
        page
    }
})

export default {
    boot,
    login,
    getJwt,
    integralList
}