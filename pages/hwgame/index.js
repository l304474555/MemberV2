
// const behave = require('./util/behavior.js')
const app = getApp()
Page({
  data: {
    baseconfig: {},
    ready: false,
    gameReady: false,
    // 当前页面：loading、start、game
    currentTag: 'loading',
    gameShown: false,
    // 传给dialog全局组件的参数
    dialogShown: false,
    // 弹窗种类：fail、choose、win
    dialogType: 'fail',
    // 弹窗数据
    dialogData: [],
    // 入口位置
    entrance_position: '',
    // 传给loading的
    mounted: 'mounted',
  },
  onShareAppMessage() {
    if(this.data.dialogType === 'win' && this.data.dialogShown) {
      return {
        title: app.hwBaseConfig.share_title_win || '哇，我领到了限量券，你也快来试试手气！',
        imageUrl: app.hwBaseConfig.share_img_win,
        path: '/pages/yhq_index/yhq'
      }
    } else {
      return {
        title: app.hwBaseConfig.share_title || '大促！美宜佳21周年疯狂派券，手速领！',
        imageUrl: app.hwBaseConfig.share_img,
        path: '/pages/yhq_index/yhq'
      }
    }
    
  },
  onHide() {
    app.hwBgm.pause()
  },
  onUnload() {
    app.hwBgm.pause()
  },
  // behaviors: [behave],
  // 通过bridge来修改父组件的值
  bridge(data) {
    this.setData(data.detail)
  }
})