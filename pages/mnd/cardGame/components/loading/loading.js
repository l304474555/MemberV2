import {
  recordView,
  getCardStatus,
  getFriendsList,
  getBoostCard,
  getPrizeSum,
  checkNewCard,
  getPrizeList
} from '../../util/apis'
import {
  dateFormat
} from '../../util/util'

const app = getApp()


let loadedImg = 0
Component({
  data: {
    percentage: 0,
    preloadImg: [],
    static: {},
    heart: [{
        type: 'heart_blue',
        animation: 'heart-animate 1.5s linear 1.2s infinite',
        left: '10%'
      },
      {
        type: 'heart_pink',
        animation: 'heart-animate2 1.5s linear .3s infinite',
        left: '20%'
      },
      {
        type: 'heart_pink',
        animation: 'heart-animate3 1.5s linear .8s infinite',
        left: '30%'
      },
      {
        type: 'heart_blue',
        animation: 'heart-animate2 1.5s linear .5s infinite',
        left: '60%'
      },
      {
        type: 'heart_pink',
        animation: 'heart-animate 1.5s linear 1s infinite',
        left: '70%'
      },
      {
        type: 'heart_blue',
        animation: 'heart-animate3 1.5s linear .5s infinite',
        left: '80%'
      }
    ]
  },
  ready() {
    //初始化全局对象
    this.initGlobalData()
    console.log('globalData', app.globalData)
  },
  methods: {
    initGlobalData() {
      const {
        game_id,
        user: {
          unionid
        },
        fromUnionid,
        staticConfig,
        loadQueue
      } = app.globalData.cardGameConfig
      let args = [unionid, game_id]
      //PV UV
      recordView(...args)
      //loading请求数据
      let promises = [
        getCardStatus,
        getFriendsList,
        getPrizeSum,
        checkNewCard,
        getPrizeList
      ]
      //从分享页进来
      if (fromUnionid) {
        promises.push(
          getFriendsList.bind(this, fromUnionid, game_id),
          getBoostCard.bind(this, fromUnionid, unionid, game_id)
        )
      }
      Promise.all(promises.map((promise) => promise(...args))).then((res) => {
        Object.assign(app.globalData.cardGameConfig, {
          //卡片
          cards: this._normalizeCards(res[0].payload),
          //自己的好友助力列表
          selfBoostList: res[1].payload,
          //大礼包数量
          prizes: res[2].payload,
          //获取卡片列表
          cardList: res[3].payload,
          //获得的奖品列表
          prizeList: this._normalizePrizeList(res[4].payload),
          //分享者的好友助力列表
          sharerBoostList: res[5] && res[5].payload,
          //助力卡片
          boostCard: res[6] && res[6].payload,
        })
        //懒加载
        this.setData({
          preloadImg: loadQueue
        })
      })
      //处理全局需要的静态数据
      if (staticConfig.length > 0) {
        app.globalData.cardGameConfig.staticConfig = staticConfig.reduce((acm, {
          key,
          value
        }) => {
          acm[key] = value
          return acm
        }, {})
        if (app.globalData.cardGameConfig && app.globalData.cardGameConfig.staticConfig && app.globalData.cardGameConfig.staticConfig.lottery_id) {
          app.globalData.cardGameConfig.lotteryMode = true
        } else {
          app.globalData.cardGameConfig.lotteryMode = false
        }
      }
      //
      const {
        logo,
        bg_loading,
        loading_bar,
        heart_blue,
        heart_pink,
        activityTitile
      } = app.globalData.cardGameConfig.staticConfig
      this.setData({
        static: {
          logo,
          bg_loading,
          loading_bar,
          heart_blue,
          heart_pink
        }
      })
      wx.setNavigationBarTitle({
        title: activityTitile
      })
    },
    imageOnLoad() {
      loadedImg++
      this.setData({
        percentage: loadedImg / this.data.preloadImg.length * 100
      })
      if (this.data.preloadImg.length <= loadedImg) {
        app.$bus.emit('loaded', true)
        //虚拟加载2s
        setTimeout(this.showNextPage, 2000);
      }
    },
    _normalizeCards(cards) {
      cards.forEach((card) => {
        card.num = +card.num
      })
      return cards
    },
    _normalizePrizeList({
      exchange,
      prize
    }) {
      let read = []
      return exchange.reduce((acm, myPrize) => {
        const {
          prize_id
        } = myPrize
        let _prize
        if (read[prize_id]) {
          _prize = read[prize_id]
        } else {
          _prize = prize.find(({
            id
          }) => id === prize_id)
          read[prize_id] = _prize
        }
        acm.push(Object.assign({}, _prize, myPrize))
        return acm
      }, []).sort(({
        id: a
      }, {
        id: b
      }) => b - a)
    },
    showNextPage() {
      const {
        fromUnionid
      } = app.globalData.cardGameConfig
      let router = 'cardGame'
      fromUnionid && (router = 'share')
      if (router == 'cardGame') {
        const {
          game_id
        } = app.globalData.cardGameConfig
        let hadIn = wx.getStorageSync(game_id + '-myj-hadIn')
        if (!hadIn) {
          router = 'rule'
          wx.setStorageSync(game_id + '-myj-hadIn', true)
        }
      }
      app.$bus.emit('router', router)
      loadedImg = 0
    },
  },
})