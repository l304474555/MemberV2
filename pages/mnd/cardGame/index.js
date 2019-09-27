// const behave = require('./util/behavior.js')

import Bus from './util/bus'

import {
  getConfig,
  getSessionId
} from '../cardGame/util/apis'

const app = getApp()

app.$bus = new Bus()

Page({
  data: {
    // 当前页面：loading、rule、cardGame、share
    router: '',
    //toast数据
    toast: {
      show: false,
      title: 'title',
      detail: 'detail',
      btns: [{
          text: '按钮1',
          type: 'ok'
        },
        {
          text: '按钮2',
          type: 'fail'
        },
      ]
    },
    //提示框
    prompt: {
      show: false,
      lines: [],
      timeout: 2000,
    },
    //弹窗
    toastList: [],
    //奖品中心
    prizeCenter: {},
    //渲染数据加载flag
    loaded: false,
    game_id: 1,
    showGetUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    onLoadData: {
      unionid: '',
      name: '',
      game_id: 1
    }
  },
  // test game_id
  onLoad({
    unionid = '',
    name = '',
    game_id = 108
  }) {
    this.setData({
      onLoadData: {
        unionid,
        name,
        game_id
      }
    })
    if (!Object.entries) {
      console.log('Polyfill Object.entries')
      Object.entries = function (obj) {
        var ownProps = Object.keys(obj),
          i = ownProps.length,
          resArray = new Array(i); // preallocate the Array
        while (i--) {
          resArray[i] = [ownProps[i], obj[ownProps[i]]]
        }
        return resArray
      }
    }
    console.log('app.globalData', app.globalData)
    this.checkGetUserInfo((res) => {
      if (!res.authSetting['scope.userInfo']) {
        this.setData({
          showGetUserInfo: true
        })
      } else {
        this.startLogin()
      }
    })
  },
  checkGetUserInfo(cb) {
    wx.getSetting({
      success(res) {
        cb(res)
      }
    })
  },
  startLogin() {
    this.wxLogin((res, code) => {
      getSessionId(res, code).then(({
        payload: {
          data: {
            Result
          }
        }
      }) => {
        console.log(Result)
        let result = JSON.parse(Result)
        console.log(result)
        if (result && result.Code == 0) {
          app.globalData.loginUser.sessionId = result.Result
          this.init()
        }
      })
    })
  },
  wxLogin(cb) {
    wx.login({
      success: ({
        code
      }) => {
        wx.getUserInfo({
          withCredentials: true,
          success: res => {
            // 可以将 res 发送给后台解码出 unionId
            app.globalData.cardUserInfo = res.userInfo
            cb && cb(res, code)
          }
        })
      }
    })
  },
  init() {
    // unionid = 'oauOww_TLqEmseovXfgyYHvT7iJU'
    // name = 'test'
    // game_id = 31
    const {
      sessionId
    } = app.globalData.loginUser
    getConfig(this.data.onLoadData.game_id, sessionId).then(({
      payload
    }) => {
      app.globalData.cardGameConfig = payload
      console.log(app.globalData.cardGameConfig)
      this.setData({
        router: 'loading'
      })
      //从分享入口进来拿到被助力者的unionid
      const userUnionid = app.globalData.cardGameConfig.user.unionid
      if (this.data.onLoadData.unionid && this.data.onLoadData.unionid !== userUnionid) {
        app.globalData.cardGameConfig.fromUnionid = this.data.onLoadData.unionid
        app.globalData.cardGameConfig.friendName = this.data.onLoadData.name
      }
    })
    //监听事件 
    this.onBus(['loaded', 'router', 'prompt', 'toastList', 'prizeCenter'])
  },
  onBus(events) {
    events.forEach(event =>
      app.$bus.on(event, (changeData, add = false, fromShare = false) => {
        const oldData = this.data[event]
        if (add && Array.isArray(changeData) && Array.isArray(oldData)) {
          if (fromShare) {
            changeData.push(...oldData)
          } else {
            changeData.unshift(...oldData)
          }
        }
        this.setData({
          [event]: changeData
        })
      })
    )
  },
  onShareAppMessage() {
    console.log('app.globalData share', JSON.parse(JSON.stringify(app.globalData)))
    const {
      game_id,
      user: {
        unionid,
        nickName
      },
      staticConfig: {
        shareTitle,
        share_img
      }
    } = app.globalData.cardGameConfig
    const {
      nickName: _nickName
    } = app.globalData.cardUserInfo
    const name = nickName.length > 0 ? nickName : _nickName
    console.log('分享链接', `pages/mnd/cardGame/index?unionid=${unionid}&name=${name}&game_id=${game_id}`)
    return {
      title: shareTitle,
      imageUrl: share_img,
      path: `pages/mnd/cardGame/index?unionid=${unionid}&name=${name}&game_id=${game_id}`,
    }
  },
  onShow() {
    const {
      loaded
    } = this.data
    loaded && app.$bus.emit('backToMP')
  },
  bindGetUserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({
        showGetUserInfo: false
      })
      this.startLogin()
    }
  }
})