// import {
//   recordView,
//   getCardStatus,
//   getFriendsList,
//   getBoostCard,
//   getPrizeSum,
//   checkNewCard,
//   getPrizeList
// } from '../../util/apis'
// import {
//   dateFormat
// } from '../../util/util'
import {
  initStorage
} from '../../util/util'
const app = getApp()

let loadedImg = 0
Component({
  data: {
    percentage: 0,
    percentageText: 0,
    preloadImg: [],
    static: {},
    hadGetUserInfo: false,
    loaded: false
  },
  lifetimes: {
    attached() {
      this.setData({
        hadGetUserInfo: app.globalData.cepingGameConfig.user || false
      })
      app.$bus.on('finishGetUserInfo', changeData => {
        if (changeData) {
          this.setData({hadGetUserInfo: true});
          this.showNextPage();
        }
      })
      this.initGlobalData();
      this.initLoadQueue();
    }
  },
  methods: {
    initLoadQueue() {
      let loadQueue = [];
      const {
        cepingGameConfig
      } = app.globalData;
      for (let key in cepingGameConfig) {
        if (key.indexOf('img_') === 0 && cepingGameConfig[key]) {
          loadQueue.push(cepingGameConfig[key]);
        }
      }
      this.setData({
        preloadImg: loadQueue,
        static: {
          img_logo: cepingGameConfig.img_logo,
          img_loading_bg: cepingGameConfig.img_loading_bg
        }
      })
    },
    initGlobalData() {
      app.$storage = initStorage(app.globalData.cepingGameConfig.id);
    },
    imageOnLoad() {
      loadedImg++
      let percentage = loadedImg / this.data.preloadImg.length * 100;
      this.setData({
        percentage: percentage,
        percentageText: Math.floor(percentage)
      })
      if (this.data.preloadImg.length <= loadedImg) {
        //虚拟加载1s
        this.setData({loaded: true});
        setTimeout(()=> {
          this.showNextPage()
        }, 500);
      }
    },
    preDownImg() {
      // 下载二维码、用户照片和装饰
      const {
        img_qrcode = 'http://res.cdn.24haowan.com/dingzhi/myj_ceping/images/test_qrcode.png',
        img_bg_qrcode,
        record = { img: '' },
      } = app.globalData.cepingGameConfig
      // const map = ['img_bg_qrcode', 'photoSrc', 'resultImg', 'img_qrcode']
      // const data = this.data.preDownImg = [img_bg_qrcode, record.img, this._getResultImg(), img_qrcode]
      const map = ['img_bg_qrcode', 'photoSrc', 'img_qrcode']
      const data = this.data.preDownImg = [img_bg_qrcode, record.img, img_qrcode]
      data.forEach((key, index) => {
        key && key !== 'null' && app.$storage({
          type: 'img',
          key
        }).then(({ data }) => {
          const imgKey = map[index]
          app.globalData.cepingGameConfig[imgKey] = data[0]
        })
      });
      app.globalData.cepingGameConfig['resultImg'] = this._getResultImg()
    },
    calcRange(range, score) {
      const pre = range[0]
      const pos = range[range.length-1]
      const [low, high] = range.match(/\d+/g)
      // console.log(pre, low, high, pos)
      if (pre === '(') {
        if (+low >= +score) return false
      } else if (pre === '[') {
        if (+low > +score) return false
      }
      if (pos === ')') {
        if (+high <= +score) return false
      } else if (pos === ']') {
        if (+high < +score) return false
      }
      return true
    },
    _getResultImg() {
      if (app.globalData.cepingGameConfig.record && app.globalData.cepingGameConfig.record.img) {
        const { result, record: {score} } = app.globalData.cepingGameConfig
        for (let i = 0; i < result.length; i++) {
          let { img, range, description, title } = result[i]
          // range = JSON.parse(range)
          if (this.calcRange(range, score)) {
            app.globalData.cepingGameConfig.resultDes = description
            app.globalData.cepingGameConfig.resultDesTitle = title
            return img;
          }
        }
      }
    },
    showNextPage() {
      console.log(`hadGetUserInfo: ${this.data.hadGetUserInfo}, loaded: ${this.data.loaded}`)
      if (!this.data.hadGetUserInfo || !this.data.loaded) {
        return
      }
      app.globalData.cepingGameConfig.user.left_game_chance = 
        (+app.globalData.cepingGameConfig.limit_game_chance) - (+app.globalData.cepingGameConfig.user.finish_times)
      this.preDownImg();
      let router = 'home'
      // router = 'poster'
      app.$bus.emit('router', router)
      loadedImg = 0
    },
  },
})