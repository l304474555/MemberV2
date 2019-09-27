// pages/cardGame/components/rule/rule.js

const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    from: {
      type: String,
      value: 'rule'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    static: {},
    animation: 'rule-animate .3s linear forwards'
  },
  ready() {
    this.init()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      const {bg_rule, btn_close, bg_ruleContent} = app.globalData.cardGameConfig.staticConfig
      this.setData({
        static: {
          bg_rule,
          btn_close,
          bg_ruleContent,
        }
      })
    },
    navToCardGame() {
      this.setData({
        animation: 'rule-close-animate .3s linear forwards'
      })
      setTimeout(()=> {
        let router = 'cardGame'
        const {from} = this.properties
        if (from === 'rule-s') {
          router = 'share'
        }
        app.$bus.emit('router', router)
        this.setData({
          animation: 'rule-animate .3s linear forwards'
        })
      }, 300)
    }
  }
})
