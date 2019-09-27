// pages/cardGame/components/share/show.js
import {
  boost,
  getFriendsList
} from '../../util/apis'
import {
  dateFormat
} from '../../util/util'

const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    boostCard: '',
    boostList: [],
    boostable: true,
    static: {},
    friendName: '',
    card_cover: '',
    clickable: true
  },
  ready() {
    //初始化卡片
    //初始化分享者的助力List
    this.initPage()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    initPage() {
      let boostable = true
      let {
        friendName,
        sharerBoostList,
        boostCard,
        staticConfig: {
          card_cover,
          bg_share,
          title_share,
          bg_character,
          btn_rule,
          btn_home,
          btn_back,
          btn_on,
          btn_off,
        },
        game_id,
        fromUnionid,
      } = app.globalData.cardGameConfig
      if (!boostCard) return 
        //没卡片 还没助力过
      if (Object.keys(boostCard).length === 0) {
        console.log('Object.keys is ok')
        boostCard = card_cover
        //有卡片 已经助力过经助力过
      } else {
        boostCard = boostCard[0].card_img
        boostable = false
      }
      console.log('boostCard', boostCard)
      const boostList = this._normalizeBoostList(sharerBoostList)
      this.setData({
        boostList,
        boostCard,
        boostable,
        friendName,
        static: {
          card_cover,
          bg_share,
          title_share,
          bg_character,
          bg_card__off: app.globalData.cardGameConfig.staticConfig['bg_card--off'],
          bg_card__on: app.globalData.cardGameConfig.staticConfig['bg_card--on'],
          btn_home,
          btn_back,
          btn_rule,
          btn_on,
          btn_off,
        }
      })
      app.$bus.on('backtoMP', () => {
        getFriendsList(fromUnionid, game_id).then(({code, payload}) => {
          if (code == 0) {
            const boostList = this._normalizeBoostList(payload)
            this.setData({boostList})
          }
        })
      })
    },
    openCard({detail: {userInfo}}) {
      const {
        game_id,
        user: {
          unionid
        },
        fromUnionid,
        staticConfig
      } = app.globalData.cardGameConfig
      const {
        avatarUrl,
        nickName
      } = userInfo
      const {clickable} = this.data
      if (!clickable) return
      this.setData({clickable: false})
      boost(game_id, fromUnionid, unionid, nickName, avatarUrl).then(({
        code,
        payload: {
          shareCard: {
            img,
            id,
            updated_at
          }
        }
      }) => {
        this.setData({clickable: true})
        //code 0 助力成功
        if (code == 0) this.setData({
          boostable: false,
          boostCard: img,
        }, () => {
          //update boost cardList
          const first_card_id = app.globalData.cardGameConfig.cards[0].id
          let {boostList} = this.data
          let time = dateFormat(new Date(updated_at), "yyyy.MM.dd hh:mm")
          let fontCard = staticConfig['font_card_' + (id - first_card_id + 1)]
          boostList.unshift({
            updated_at: time,
            help_head: avatarUrl,
            help_name: nickName,
            font_card_img: fontCard,
          })
          this.setData({
            boostList
          })
        })
      }).catch(({data: {code}}) => {
        this.setData({clickable: true})
        let prompt = {
          show: true,
          timeout: 2000
        }
        //code 6 分享者可领取卡片达到上限
        if (code == 6) {
          // prompt.lines = [
          //   '拆卡失败',
          //   '你的好友今日可领卡片数量已达上限～',
          //   '明天再来帮忙拆卡吧'
          // ]
          app.$bus.emit('toastList', [{
            type: 'tip',
            detail: '你的好友今日可领卡片数量已达上限～\n明天再来帮忙拆卡吧',
            btns: [{
              type: 'close',
              text: '我知道了',
            }]
          }], true, true)
        //code 7 已经帮这个分享者助力过
        } else if (code == 7) {
          // prompt.lines = [
          //   '已经帮这个分享者助力过',
          // ]
          app.$bus.emit('toastList', [{
            type: 'tip',
            detail: '您已经帮这个分享者助力过了',
            btns: [{
              type: 'close',
              text: '我知道了',
            }]
          }], true, true)
        } else if (code == 5) {
          // prompt.lines = [
          //   '拆卡失败',
          //   '卡片已经被领取完',
          // ]
          app.$bus.emit('toastList', [{
            type: 'tip',
            detail: '嘤嘤嘤，拆卡失败，\n卡片已经被领完～',
            btns: [{
              type: 'close',
              text: '我知道了',
            }]
          }], true, true)
        }
        app.$bus.emit('prompt', prompt)
      })
    },
    _normalizeBoostList(boostList) {
      const first_card_id = app.globalData.cardGameConfig.cards[0].id
      return boostList.map((boost) => {
        const {card_id} = boost
        boost.font_card_img = app.globalData.cardGameConfig.staticConfig['font_card_' + (card_id - first_card_id + 1)]
        boost.updated_at = dateFormat(new Date(boost.updated_at), "yyyy.MM.dd hh:mm")
        return boost
      })
    },
    play() {
      let router = 'cardGame'
      const {
        game_id
      } = app.globalData.cardGameConfig
      let hadIn = wx.getStorageSync(game_id + '-myj-hadIn')
      if (!hadIn) {
        router = 'rule'
        wx.setStorageSync(game_id + '-myj-hadIn', true)
      }
      app.$bus.emit('router', router)
    },
    toRule() {
      const {
        game_id
      } = app.globalData.cardGameConfig
      wx.setStorageSync(game_id + '-myj-hadIn', true)
      app.$bus.emit('router', 'rule-s')
    },
    toHome() {
      wx.switchTab({
       url: '/pages/yhq_index/yhq'
      })
    }
  }
})