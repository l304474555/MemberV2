// const behave = require('../../util/behavior.js')
// const {getgame_bgInfo}  = require('../../util/util')
// const musicManager = wx.getBackgroundAudioManager()
const app = getApp()
Component({
  data: {
    rota: false,
    title: '',
    musicBg: '',
    bgSubtitle: '',
    isRule: false,
    bg_rule: '',
    bg_start: ''
  },
  ready() {
    // 没有登录跳转到登录界面
    console.log('hwIsMenber', app.globalData.loginUser, app.globalData.loginUser.isMember);
    if(!app.globalData.loginUser.isMember) {
      wx.reLaunch({
        url: '/pages/member_card/index',
      })
      return
    }
    // console.log('app.hwBgm', app.hwBgm)
    if(!app.hwBgm) {
      app.hwBgm = wx.createInnerAudioContext()
      app.hwBgm.autoplay = true
      app.hwBgm.loop = true
      app.hwBgm.src = app.hwBaseConfig.bgm
      app.hwBgm.myPaused = false

      this.setData({
        musicBg: app.hwBaseConfig.music_on,
        rota: true
      })
    } else {
      // console.log('app.hwBgm.paused', app.hwBgm.paused)
      if(app.hwBgm.myPaused) {
        this.setData({
          musicBg: app.hwBaseConfig.music_off,
          rota: false
        })
      } else {
        this.setData({
          musicBg: app.hwBaseConfig.music_on,
          rota: true
        })
      }
    }
    
    // 根据省份设置不同的副标题    
    // if(app.hwBaseConfig.province === '广东') {
      this.setData({
        bgSubtitle: app.hwBaseConfig.inner_subtitle
      })
    // } else {
    //   this.setData({
    //     bgSubtitle: app.hwBaseConfig.outer_subtitle
    //   })
    // }
    
    this.setData({
      title: app.hwBaseConfig.game_title?app.hwBaseConfig.game_title:'https://24haowan-cdn.shanyougame.com/dingzhi/myj21/images/bg_title.png',
      bg_rule: app.hwBaseConfig.bg_rule,
      bg_start: app.hwBaseConfig.bg_start
    })
    
  },
  // behaviors: [behave],
  methods: {
    goGame() {
      this.triggerEvent('bridge', {
        currentTag: 'game'
      })
    },
    showRule() {
      this.setData({
        isRule: true
      })
    },
    hideRule() {
      this.setData({
        isRule: false
      })
    },
    goBack() {
      // wx.navigateTo({
      //   url: '../index/index'
      // })
      // 美宜佳跳转首页
      wx.switchTab({
        url: '/pages/yhq_index/yhq'
      })
    },
    triggerMusic() {
      // console.log('app.hwBgm.paused', app.hwBgm.paused)
      
      // 微信的自己的paused字段有问题，自己定义
      if(app.hwBgm.myPaused) {
        app.hwBgm.play()
        app.hwBgm.myPaused = false
        this.setData({
          musicBg: app.hwBaseConfig.music_on,
          rota: true
        })
      } else {
        app.hwBgm.pause()
        app.hwBgm.myPaused = true
        this.setData({
          musicBg: app.hwBaseConfig.music_off,
          rota: false
        })
      }
    }

  }
})
