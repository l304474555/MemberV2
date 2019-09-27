// const behave = require('../../util/behavior.js')
const config = require('../../util/config')
const {getConfig, boot, commitUV } = require('../../util/apis')

const app = getApp()
let loadedImg = 0
Component({
  data: {
    percentage: 0,
    preloadImg: [],
    bg: '',
    bgIcon: ''
  },
  ready() {
    
    // app.hwBus.on('gameReady', this.imageOnLoad)

    if(!app.hwBaseConfig || !app.hwUserInfo) {
      Promise.all([getConfig(), boot()]).then(res => {
        console.log('hwgame', res)

        app.hwBaseConfig = res[0].payload.baseConfig
        app.hwUserInfo = res[1].payload.data

        this.init()
      })
    } else {
      this.init()
    }
  },
  // behaviors: [behave],
  methods: {
    init() {
      wx.setNavigationBarTitle({
        title: app.hwBaseConfig.activity_name
      })
      let preloadConfigImg = []
      Object.keys(app.hwBaseConfig).forEach(v => {
        if(typeof(app.hwBaseConfig[v]) !== 'string') return;
        if(app.hwBaseConfig[v].indexOf('.png') !== -1 || app.hwBaseConfig[v].indexOf('.gif') !== -1 || app.hwBaseConfig[v].indexOf('.jpg') !== -1 || app.hwBaseConfig[v].indexOf('.jpeg') !== -1) {
          preloadConfigImg.push(app.hwBaseConfig[v])
        }
      })

      this.setData({
        percentage: 0,
        preloadImg: config.preloadImg.concat(preloadConfigImg),
        bg: app.hwBaseConfig.loading_bg,
        // bgIcon: app.hwBaseConfig.loading_icon
        bgIconTree: "https://mimage.myj.com.cn/MicroMallFileServer/Files/Excel/UploadExcel/201807/f908cbd4389336cd.png",
        bgIconHouse: "https://mimage.myj.com.cn/MicroMallFileServer/Files/Excel/UploadExcel/201807/d18969af4e47313d.png",
        bgIconFloor: "https://mimage.myj.com.cn/MicroMallFileServer/Files/Excel/UploadExcel/201807/b132a264d89956ed.png",
      })
      
      loadedImg=0

      // 开启游戏
      commitUV()
      this.triggerEvent('bridge', {
        gameShown: true
      })
    },
    imageOnLoad() {      
      loadedImg++
      this.setData({
        percentage: loadedImg/this.data.preloadImg.length * 100
      })
      // 加一是为了游戏加载
      if(this.data.preloadImg.length <= loadedImg) {
        setTimeout(() => {
          this.triggerEvent('bridge', {
            currentTag: 'start'
          })
        }, 2000);
      }
    }
  },
  detached() {
    // app.hwBus.on('gameReady', this.imageOnLoad)
  }
})
