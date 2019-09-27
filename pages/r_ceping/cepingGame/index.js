// const behave = require('./util/behavior.js')

import Bus from './util/bus'

import {
  visit,
  getConfig,
  getUserInfo,
  getUserLeftLotteryChance,
  share,
  getSessionId
} from '../cepingGame/util/apis'

const app = getApp()

app.$bus = new Bus()

Page({
  data: {
    router: '',
    toast: '',
    static: {
      color_page_bg: '#ffcdd6',
      img_icon_home: '',
      toast: {},
    },
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showGetUserInfo: false
  },
  onLoad({
    game_id = 42,
    // 二维码传参
    scene
  }) {
    //监听事件
    this.onBus(['finishGetUserInfo'])
    app.globalData.cepingGameConfig = {}
    this.lottery_id = null
    this.game_id = game_id || decodeURIComponent(scene) || 1
    if (this.game_id == 'undefined') {
      this.game_id = 1
    }
    console.log('game_id', game_id, decodeURIComponent(scene))
    this.checkGetUserInfo((res) => {
      if (res.authSetting['scope.userInfo']) {
        this.startLogin()
      } else {
        this.setData({
          showGetUserInfo: true
        })
      }
    })
    this.init()
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
      if (app.globalData.loginUser.sessionId) {
        this.tryToGetUserInfo()
        return
      }
      getSessionId(res, code).then(({
        payload: {
          data: {
            Result
          }
        }
      }) => {
        console.log('登录成功', Result)
        let result = JSON.parse(Result)
        if (result && result.Code == 0) {
          app.globalData.loginUser.sessionId = result.Result
          this.tryToGetUserInfo()
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
            cb && cb(res, code)
          }
        })
      }
    })
  },
  bindGetUserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({
        showGetUserInfo: false
      })
      this.startLogin()
    }
  },
  init(game_id = this.game_id) {
    const sessionId = app.globalData.loginUser.sessionId;
    // console.log('sessionId', sessionId)
    getConfig(game_id, sessionId).then(({
      payload
    }) => {
      payload.data = payload.data[0]
      this.lottery_id =  payload.data.lottery_id
      app.globalData.cepingGameConfig = Object.assign(app.globalData.cepingGameConfig,
        payload.data, {
          sessionId,
          photoSrc: '',
          router: '',
          toast: {},
          fromRouter: ''
        }
      )
      this.tryToGetUserInfo()
      const description = app.globalData.cepingGameConfig.description.split('\\n')
      this.setData({
        // router: 'home',
        // router: 'poster',
        router: 'loading',
        static: {
          color_page_bg: app.globalData.cepingGameConfig.color_page_bg,
          img_icon_home: app.globalData.cepingGameConfig.img_icon_home,
          toast: {
            img_icon_nochance: app.globalData.cepingGameConfig.img_icon_nochance,
            img_icon_nomember: app.globalData.cepingGameConfig.img_icon_nomember,
            img_icon_over: app.globalData.cepingGameConfig.img_icon_over,
            img_icon_upload: app.globalData.cepingGameConfig.img_icon_upload,
            img_icon_tip_raffle: app.globalData.cepingGameConfig.img_icon_tip_raffle,
            img_icon_close: app.globalData.cepingGameConfig.img_icon_close,
            img_icon_success: app.globalData.cepingGameConfig.img_icon_success,
            color_toast_btn_bg: app.globalData.cepingGameConfig.color_toast_btn_bg,
            color_toast_text: app.globalData.cepingGameConfig.color_toast_text,
            description
          }
        }
      })
    })
    //监听事件
    this.onBus(['router', 'toast'])
  },
  onBus(events) {
    events.forEach(event =>
      app.$bus.on(event, changeData => {
        if (event === 'finishGetUserInfo') {
          return
        }
        this.setData({
          [event]: changeData
        })
      })
    )
  },
  tryToGetUserInfo() {
    if (app.globalData.cepingGameConfig.user || !this.game_id || !this.lottery_id || !app.globalData.loginUser.sessionId) {
      return
    }
    getUserInfo(this.game_id, this.lottery_id, app.globalData.loginUser.sessionId).then(({payload})=> {
      app.globalData.cepingGameConfig = Object.assign(app.globalData.cepingGameConfig, payload)
      app.globalData.cepingGameConfig.qa = app.globalData.cepingGameConfig.qa.map(({
        qa
      }) => JSON.parse(qa));
      app.globalData.cepingGameConfig.user.left_game_chance = app.globalData.cepingGameConfig.limit_game_chance - app.globalData.cepingGameConfig.user.finish_times
      visit(this.game_id, app.globalData.cepingGameConfig.user.unionid)
      app.$bus.emit('finishGetUserInfo', true)
    })
  },
  onShareAppMessage() {
    // 分享后获得测评次数
    let {
      id,
      user: {
        unionid,
        is_share
      },
      text_shareTitle
    } = app.globalData.cepingGameConfig;
    is_share || share({
      game_id: id,
      unionid
    }).then(({
      payload
    }) => {
      app.globalData.cepingGameConfig.user.is_share = true
      app.$bus.emit('updateLotteryChance', payload.left_lottery_chance)
    })
    return {
      title: text_shareTitle || '此处需要配置分享文案',
      path: `pages/r_ceping/cepingGame/index?game_id=${id}`,
    }
  },
  back() {
    wx.switchTab({
      url: '/pages/yhq_index/yhq'
    })
  },
  onShow() {
    // 仅在从抽奖页回来后才更新剩余抽奖次数
    if (app.globalData.cepingGameConfig && app.globalData.cepingGameConfig.toLotery) {
      app.globalData.cepingGameConfig.toLotery = false
      const {
        id,
        user: {
          unionid
        },
        lottery_id
      } = app.globalData.cepingGameConfig
      getUserLeftLotteryChance({
        game_id: id,
        unionid,
        lottery_id
      }).then(({
        payload
      }) => {
        app.$bus.emit('updateLotteryChance', payload.left_lottery_chance)
      })
    }
  },
  // onHide() {
  //   //todo have seen cardToast and hide Mp 
  //   //receive all cards
  //   console.log('onHide')
  // }
})