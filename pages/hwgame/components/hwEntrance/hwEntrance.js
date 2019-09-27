const {getConfig, boot} = require('../../util/apis')
const {dateFormat} = require('../../util/util')
import Bus from '../../util/bus'

let app = getApp()
let startPoint = {};
const systemInfo = wx.getSystemInfoSync()
const entranceSize = 150*systemInfo.windowWidth/750
let offsetX, offsetY

Component({
  data: {
    baseConfig: {},
    ready: false,
    // entrance_position: '',
    // 用于预加载
    isAd: false,
    bgIcon: '',
    bg: '',
    isTransition: true,
    translateX: 0,
    translateY: systemInfo.windowHeight*0.7,
  },
  ready() {
    console.log('hwgame entrance ready');
    if(!app.hwBus) {
      console.log('new Bus');
      
      app.hwBus = new Bus()
    }
    app.hwBus.on('init', (e) => {
      // this.imageOnLoad()
      console.log('hwgame boot', app.globalData.loginUser);
      
      Promise.all([getConfig(), boot()]).then(res => {
        console.log('hwgame', res)

        const {baseConfig} = res[0].payload
        app.hwBaseConfig = baseConfig

        const {day_start, day_end} = baseConfig
        let adKey = dateFormat(new Date(), 'MM-dd')

        let isAd = false
        if(baseConfig.is_ad === 'true') {
          isAd = adKey != wx.getStorageSync('hwIsAd_' + baseConfig.game_id)
        
          if(isAd) {
            wx.setStorage({
              key: 'hwIsAd_' + baseConfig.game_id,
              data: adKey
            })
          }
        }

        let {is_entrance} = baseConfig;
        if(baseConfig.is_entrance == 'false'){
          is_entrance = false;
        }

        this.setData({
          baseConfig,
          ready: isInTimeRange(day_start, day_end),
          isAd,
          is_entrance,
          // entrance_position: this.convertPosition(config.entrance_position),
          bg: baseConfig.loading_bg,
          bgIcon: baseConfig.loading_icon
        })

        const userInfo = res[1].payload.data
        app.hwUserInfo = userInfo

        // 开启游戏
        this.triggerEvent('bridge', {
          gameShown: true
        })

      }).catch(e => {
        console.log('boot error', e);
        // 一旦有错，则重设入口，
        this.setData({
          ready: false,
          isAd: false,
          bg: '',
          bgIcon: ''
        })
      })
    })
    

    // 这样要求格式必须是hh:mm格式的
    function isInTimeRange(day_start, day_end) {
      
      let tS = parseInt('1' + day_start.split(':').join(''))
      let tE = parseInt('1' + day_end.split(':').join(''))
      let tN = parseInt('1' + dateFormat(new Date(), 'hh:mm').split(':').join(''))
      return tS < tN && tE > tN
      
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    goGame() {
      wx.navigateTo({
        url: '../hwgame/index'
      })
    },
    closeAdd() {
      this.setData({
        isAd: false
      })
    },
    // convertPosition(config) {
    //   let result = ''
    //   switch(config) {
    //     case 'lt': result = 'left: 0; top: 0'
    //     break;
    //     case 'lb': result = 'left: 0; bottom: 0'
    //     break;
    //     case 'rt': result = 'right: 0; top: 0'
    //     break;
    //     case 'rb': result = 'right: 0; bottom: 0'
    //     break;
    //     default: result = 'top: 0; left: 0'
    //     break;
    //   }
    //   return result
    // },
    buttonStart(e){
      this.setData({
        isTransition: false
      })
      startPoint = e.touches[0]
      offsetX = startPoint.clientX - this.data.translateX
      offsetY = startPoint.clientY - this.data.translateY
    },
    buttonMove(e){
      var endPoint = e.touches[e.touches.length-1]

      this.setData({
        translateX: endPoint.clientX - offsetX,
        translateY: endPoint.clientY - offsetY
      })
    },
    buttonEnd(){
      //贴边
      this.setData({
        isTransition: true
      })
      const ratioY = ((this.data.translateY + entranceSize/2)-systemInfo.windowHeight/2)/systemInfo.windowHeight
      const ratioX = ((this.data.translateX + entranceSize/2)-systemInfo.windowWidth/2)/systemInfo.windowWidth
      // console.log(ratioY, ratioX)
      if(ratioY > ratioX && ratioY < -ratioX) {
        // left
        this.setData({
          translateX: 0
        })
      } else if (ratioY < ratioX && ratioY < -ratioX) {
        // up
        this.setData({
          translateY: 0
        })
      } else if (ratioY > ratioX && ratioY > -ratioX) {
        // down
        this.setData({
          translateY: systemInfo.windowHeight - entranceSize
        })
      } else {
        // right
        this.setData({
          translateX: systemInfo.windowWidth - entranceSize
        })
      }
    },

  }
})
