// pages/cepingGame/pages/home/home.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  lifetimes: {
    ready() {
      //初始化全局对象
      this.initGlobalData()
      this.fisrtPopRuleToast()
      app.$bus.on('updateLotteryChance', lottery_chance => {
        app.globalData.cepingGameConfig.user.left_lottery_chance = lottery_chance
        this.setData({
          lottery_chance
        })
      })
      app.$bus.on('updateGameChance', game_chance => {
        app.globalData.cepingGameConfig.user.left_game_chance = game_chance
        this.setData({
          game_chance
        })
      })
      // app.$bus.on('share', share => {
      //   this.setData({share})
      // })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // over: false,
    // finish: false,
    played: false,
    game_chance: 1,
    lottery_chance: 0,
    shared: false,
    static: {},
    isShowRule: false,
    animationName: 'bounceInUp',
    iconOpacity: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initGlobalData() {
      const {
        img_logo,
        img_home_bg,
        img_btn_start,
        img_btn_rule,
        img_btn_prize,
        img_btn_myPoster,
        img_bg_rule,
        img_btn_down,
        img_icon_close,
        color_toast_btn_bg,
        user: {
          left_lottery_chance,
          left_game_chance,
          // has_shared
        },
        record
      } = app.globalData.cepingGameConfig;
      app.globalData.cepingGameConfig.fromRouter = 'home'
      this.setData({
        static: {
          img_logo,
          img_home_bg,
          img_btn_start,
          img_btn_rule,
          img_btn_prize,
          img_btn_myPoster,
          img_bg_rule,
          img_btn_down,
          img_icon_close,
          color_toast_btn_bg
        },
        lottery_chance: left_lottery_chance,
        game_chance: left_game_chance,
        // finish: record && left_game_chance === 0,
        played: !!record,
        // shared: has_shared > 0
        // 
      })
    },
    stop() {},
    fisrtPopRuleToast() {
      app.$storage({
        key: 'showRule',
      }).then(({
        action
      }) => {
        action === 'set' && this.showRule()
      })
    },
    toMyPrize() {
      // 跳转到美宜佳的奖品中心
      const id = app.globalData.cepingGameConfig.lottery_id
      wx.navigateTo({
        url: '/pages/luckdraw_prize/luckdraw_prize?aid=' + id
      })
    },
    showToast(e) {
      if (typeof e !== 'string' && !e.target.dataset.toast) return;
      const type = typeof e === 'string' ? e : e.target.dataset.toast;
      app.$bus.emit('toast', {
        showType: type
      });
    },
    handleStart(e) {
      if (this.checkIsMember()) {
        app.globalData.userInfo = e.detail.userInfo
        // app.$bus.emit('toast', {showType: 'chooseImg', disableClose: true});
        // return;
        if (this.checkIsOver()) {
          this.showToast('over')
        } else if (this.data.played && this.data.game_chance === 0) {
          app.$bus.emit('router', 'poster')
        } else if (this.data.game_chance === 0) {
          this.showToast('nochance');
        } else {
          app.globalData.cepingGameConfig.user.left_game_chance--
          app.$bus.emit('router', 'question')
          // 每次进入测评页时都要清空record字段 防止分享加机会后渲染之前保存的数据
          app.globalData.cepingGameConfig.record = {}
        }
      }
    },
    handleLottery() {
      if (this.checkIsOver()) {
        this.showToast('over')
      } else {
        // 跳转到美宜佳抽奖页面
        const { lottery_url, lottery_id } = app.globalData.cepingGameConfig
        lottery_url ? wx.navigateTo({ url: lottery_url + lottery_id }) : console.log('没有配置抽奖路径')
        app.globalData.cepingGameConfig.toLotery = true
      }
      // } else {
      //   console.warn('not match handleLottery')
      // }
    },
    checkIsOver() {
      let {
        end_time
      } = app.globalData.cepingGameConfig
      // 修复ios不兼容2017-01-01 11:00:00格式获取时间戳
      end_time = end_time.replace(/-/g, '/');
      return (new Date(end_time).getTime() < new Date().getTime())
    },
    checkIsMember() {
      const isMember = app.globalData.cepingGameConfig.user.IsWxMember
      if (isMember) {
        return true;
      } else {
        this.showToast('registerGuide')
      }
    },
    showRule() {
      this.setData({
        isShowRule: true
      })
      setTimeout(() => {
        this.setData({
          iconOpacity: 1
        })
      }, 1000)
    },
    closeRule() {
      this.setData({
        animationName: 'bounceOutDown',
        iconOpacity: 0
      })
      setTimeout(() => {
        this.setData({
          isShowRule: false,
          animationName: 'bounceInUp'
        })
      }, 700)
    }
  }
})