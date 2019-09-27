// pages/cardGame/components/cardGame/cardGame.js
import {
  getFreeCard,
  exchangePrize,
  getPrizeSum,
  checkNewCard,
  getFriendsList,
  getUserLeftLotteryChance
} from '../../util/apis'

import {
  dateFormat
} from '../../util/util'

const LOTTERY_CHANCE_KEY = 'LOTTERY_CHANCE_KEY'

const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    cards: [],
    boostList: [],
    prizes: {},
    static: {},
    isMember: false,
    clickable: true,
    lottery_sum: 0,
    reverse: false
  },

  ready() {
    //初始化卡片状态、助力列表和大礼包数量
    this.initPage()
    // app.globalData.cardGameConfig.staticConfig.mode = 'lottery'
    // app.globalData.cardGameConfig.staticConfig.lottery_url = '/pages/yhq_ninebox/yhq_ninebox?activityid=1159'
    // console.log('app.globalData.cardGameConfig.staticConfig', app.globalData.cardGameConfig.staticConfig)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    initPage() {
      const {
        selfBoostList,
        staticConfig: {
          card_cover,
          bg_game,
          bg_cards,
          btn_home,
          btn_back,
          btn_rule,
          btn_off,
          btn_on,
          btn_prizeCenter,
          game_title,
          mode,
          lottery_id,
          buyToast
        },
        cards,
        prizes,
        cardList,
        game_id,
        user: {
          unionid,
          IsWxMember
        },
        config: {
          free_limit
        },
        left_lottery_times,
      } = app.globalData.cardGameConfig
      // wx.setClipboardData({
      //   data: unionid,
      //   success: function(res) {
      //     wx.showModal({
      //       title: '提示',
      //       content: '复制成功',
      //       success: function(res) {
      //         if (res.confirm) {
      //           console.log('确定')
      //         } else if (res.cancel) {
      //           console.log('取消')
      //         }
      //       }
      //     })
      //   }
      // })
      console.log('buyToast', buyToast);

      const boostList = this._normalizeBoostList(selfBoostList)
      const lottery_sum = left_lottery_times ? left_lottery_times.Result : 0
      this.setData({
        boostList,
        cards,
        prizes,
        lottery_sum,
        static: {
          card_cover,
          bg_game,
          bg_cards,
          btn_home,
          btn_back,
          btn_rule,
          btn_on,
          btn_off,
          btn_prizeCenter,
          game_title,
          free_limit,
          mode
        },
        isMember: IsWxMember,
        showTip: app.globalData.cardGameConfig.lotteryMode,
        reverse: game_id == 65
      })

      this._popLotteryChance()
      this._popToastListByCardList(cardList)
      //监听返回到小程序
      app.$bus.on('backToMP', () => {
        //更新获取卡片数量
        checkNewCard(unionid, game_id).then(({
          code,
          payload
        }) => {
          if (code == 0) {
            let {
              cards
            } = this.data
            const newCards = this._popToastListByCardList(payload)
            console.log(JSON.stringify(newCards))
            newCards.forEach(({
              card_id,
              num
            }) => {
              console.log(cards.find(({
                id
              }) => id === card_id).num)
              cards.find(({
                id
              }) => id === card_id).num += num
              console.log(cards.find(({
                id
              }) => id === card_id).num)
            })
            this.setData({
              cards
            })
            this._updateExchange(unionid, game_id)
          }
        })
        //更新好友助力列表
        getFriendsList(unionid, game_id).then(({
          code,
          payload
        }) => {
          if (code == 0) {
            const boostList = this._normalizeBoostList(payload)
            this.setData({
              boostList
            })
          }
        })
        //刷新剩余抽奖次数
        getUserLeftLotteryChance({
          game_id,
          unionid,
          lottery_id
        }).then(({
          payload
        }) => {
          this.setData({
            lottery_sum: payload.left_lottery_chance
          })
        })
      })
      //是会员自动获取免费卡片
      if (this.data.isMember) {
        let {
          cards
        } = this.data
        for (let i = 0; i < cards.length; ++i) {
          if (cards[i].type == 0) {
            this.handleCardTap({
              target: {
                dataset: {
                  index: i
                }
              }
            }, true)
          }
        }
      }
    },
    _getCardStr(cards) {
      //统计卡数
      let cardSum = {}
      cards.forEach(({
        name,
        card_id
      }) => {
        if (cardSum[card_id]) {
          cardSum[card_id].num++
        } else {
          cardSum[card_id] = {
            name,
            num: 1,
            card_id
          }
        }
      })
      //拼接字符串
      let str = ''
      let _cards = []
      Object.values(cardSum).forEach(({
        name,
        num,
        card_id
      }) => {
        str += `\n"${name}"卡片${num}张`
        _cards.push({
          num,
          card_id
        })
      })
      return {
        str,
        img: cards[0].img,
        newCards: _cards
      }
    },
    popPrizeCenter() {
      if (!this.data.isMember) return
      if (app.globalData.cardGameConfig.lotteryMode) {
        const lottery_id = app.globalData.cardGameConfig.staticConfig.lottery_id
        // 重定向链接
        wx.navigateTo({
          url: '/pages/luckdraw_prize/luckdraw_prize?aid=' + lottery_id,
          success() {
            // 重定向过去了
          }
        })
      } else {
        app.$bus.emit('prizeCenter', {
          show: true,
        })
      }
    },
    exchange() {
      if (!this.data.isMember) return
      const {
        game_id,
        user: {
          unionid,
          pubOpenId
        },
        staticConfig: {
          mode,
          lottery_id,
          lottery_url
        }
      } = app.globalData.cardGameConfig
      //是否可以兑换礼品
      if (!this.data.prizes.chance && mode !== 'lottery') return
      // wx.showLoading({
      //   title: '兑换中',
      //   mask: true
      // })
      if (!this.data.clickable) return
      this.setData({
        clickable: false
      })
      exchangePrize(unionid, game_id, pubOpenId, mode, lottery_id).then(({
        code,
        payload
      }) => {
        // wx.hideLoading()
        this.setData({
          clickable: true
        })
        if (code == 0) {
          //消耗卡片
          let {
            cards
          } = this.data
          cards.forEach(card => {
            card.num = card.num - 1
          })
          this.setData({
            cards
          })
          //获得奖品弹窗
          let toastList = []
          const prizeType = payload.type
          //增加抽奖机会模式
          if (mode === 'lottery') {
            // const toast = {
            //   type: 'exchangeSuccess',
            //   detail: `恭喜你成功获得了一次抽奖机会！，立马抽奖赢大礼吧！`,
            //   btns: [{
            //     text: '立刻抽奖',
            //     type: 'toLotteryUrl',
            //   }],
            // }
            // toastList.push(toast)
            // wx.setStorage({
            //   key: LOTTERY_CHANCE_KEY + game_id,
            //   data: 'lottery'
            // })
            wx.navigateTo({
              url: lottery_url,
              success() {
                wx.removeStorage({
                  key: LOTTERY_CHANCE_KEY + game_id
                })
              }
            })
          } else {
            switch (prizeType) {
              // 获得虚拟奖品
              case 0:
                toastList.push({
                  type: 'exchangeSuccess',
                  detail: `恭喜你成功获得了${payload.name}奖品，快去奖品中心查看相关信息吧！`,
                  btns: [{
                    text: '查看奖品',
                    type: 'showPrizeCenter',
                  }],
                })
                break;
              // 获得要选择门店的优惠券
              // newType
              case 3:
                toastList.push({
                  type: 'selectStore',
                  btns: [{
                    text: '确定',
                    type: 'getCoupon',
                  }],
                  prize: {
                    id: payload.exchange_id,
                    name: payload.name,
                  }
                });
                app.$bus.emit('selectCoupon', payload.exchange_id, payload.name)
                break;
              // 获得真实奖品
              default:
                toastList.push({
                  type: 'exchangeSuccess',
                  detail: `恭喜你成功获得了${payload.name}奖品，快去奖品中心查看相关信息吧！`,
                  btns: [{
                    text: '填写地址',
                    type: 'showExpress',
                  }],
                })
                break;
            }
          }

          app.$bus.emit('prompt', {
            show: true
          })
          app.$bus.emit('toastList', toastList)
          //添加获得的奖品
          app.$bus.emit('getPrize', payload)
          //
          this._updateExchange(unionid, game_id)
        }
      }).catch(err => {
        // wx.hideLoading()
        this.setData({
          clickable: true
        })
        console.log('exchange err', err)
        if (mode === 'lottery') {
          wx.navigateTo({
            url: lottery_url,
            success() {
              wx.removeStorage({
                key: LOTTERY_CHANCE_KEY + game_id
              })
            }
          })
        } else {
          //剩余礼包礼包数量等于0，弹出兑奖失败弹窗
          if (err.data.code == 5) {
            app.$bus.emit('prompt', {
              show: true
            })
            app.$bus.emit('toastList', [{
              type: 'tip',
              detail: '很遗憾，礼包数量有限，现已被领完。下次手速要更快一点噢',
              btns: [{
                text: '确认',
                type: 'close',
              }]
            }])
          }
        }
      })
    },
    _updateExchange(unionid, game_id) {
      getPrizeSum(unionid, game_id).then(({
        code,
        payload
      }) => {
        code == 0 && this.setData({
          prizes: payload
        })
      })
    },
    //管理卡片点击事件
    handleCardTap({
      target: {
        dataset: {
          index
        }
      }
    }, auto = false) {
      if (!this.data.isMember || index === undefined) return;
      const {
        game_id,
        user: {
          unionid
        },
        config: {
          free_limit,
        }
      } = app.globalData.cardGameConfig
      let {
        cards
      } = this.data
      let {
        type,
        check,
        img,
        name,
      } = cards[index]
      //type: 0：免费获得，1：分享获得，2：购物获得
      switch (type) {
        case 0:
          //判断是否获得过
          if (check) {
            if (auto) {
              console.log('领取过了卡片，不再自动领取')
              return
            }
            app.$bus.emit('prompt', {
              show: true,
              lines: [
                '您已经领取过了该卡片'
              ],
              timeout: 1000,
            })
            app.$bus.emit('prompt', {
              show: true
            })
            app.$bus.emit('toastList', [{
              type: 'tip',
              detail: '您已经领取过了该卡片',
              btns: [{
                type: 'close',
                text: '确认',
              }]
            }])
            return
          }
          if (free_limit == 0) return;
          if (!this.data.haveAutoGet) {
            this.data.haveAutoGet = true
            getFreeCard(unionid, game_id).then(({
              code
            }) => {
              if (code == 0) {
                const addToList = true
                app.$bus.emit('prompt', {
                  show: true
                })
                app.$bus.emit('toastList', [{
                  type: 'getCard',
                  text: `恭喜你获得${free_limit}张"${name}"卡片`,
                  img,
                  btns: [{
                    type: 'close',
                    text: '领取'
                  }]
                }], addToList)
                //更新卡片
                cards[index].num = cards[index].num + +free_limit
                cards[index].check = true
                this.setData({
                  cards
                })
                this._updateExchange(unionid, game_id)
              }
            }).catch(({
              data: {
                code
              }
            }) => {
              //卡片没有库存
              if (code == 5 && !auto) {
                app.$bus.emit('prompt', {
                  show: true
                })
                app.$bus.emit('toastList', [{
                  type: 'tip',
                  detail: '很遗憾，该种卡片数量有限，已被领完。\n下次手速要更快一点噢~',
                  btns: [{
                    type: 'close',
                    text: '确认',
                  }]
                }])
              }
            })
          } else {
            const addToList = true
            app.$bus.emit('prompt', {
              show: true
            })
            app.$bus.emit('toastList', [{
              type: 'getCard',
              text: `恭喜你获得${free_limit}张"${name}"卡片`,
              img,
              btns: [{
                type: 'close',
                text: '领取'
              }]
            }], addToList)
            //更新卡片
            cards[index].num = cards[index].num + +free_limit
            cards[index].check = true
            this.setData({
              cards
            })
            this._updateExchange(unionid, game_id)
          }
          break;
        case 1:
          app.$bus.emit('prompt', {
            show: true
          })
          app.$bus.emit('toastList', [{
            type: 'tip',
            detail: '这张卡片好友互动助力后有机会获得噢~',
            btns: [{
              type: 'share'
            }]
          }])
          break;
        case 2:
          app.$bus.emit('prompt', {
            show: true
          })
          const {
            buyToast
          } = app.globalData.cardGameConfig.staticConfig
          app.$bus.emit('toastList', [{
            type: 'tip',
            detail: buyToast || '购物可获得此卡片',
            btns: [{
              type: 'close',
              text: '确认',
            }]
          }])
          break;
      }
    },
    //生成获得卡片弹窗list 并返回获得新卡片的id和num
    _popToastListByCardList(allCards) {
      const _sort = ({
        date: a
      }, {
        date: b
      }) => (new Date(b).getTime()) - (new Date(a).getTime())
      let hasCard = false
      let order = []
      let cardToastList = Object.entries(allCards).reduce((acm, allCard) => {
        const type = allCard[0]
        const cards = allCard[1]
        if (cards.length === 0) return acm;
        hasCard || (hasCard = true)
        cards.sort(_sort)
        order.push({
          date: cards[0].date,
          type
        })
        acm[type] = cards
        return acm
      }, {}) || {}
      //有获得卡片
      let newCards = []
      if (hasCard) {
        const toastList = order.reduce((acm, {
          type
        }) => {
          let cards = cardToastList[type]
          //限制串卡片显示bug
          const {
            game_id
          } = app.globalData.cardGameConfig
          cards = cards.filter(({
            game_id: id
          }) => +id == game_id)
          console.log('toast cards', cards)
          let toast
          if (!cards) return acm
          const len = cards.length
          if (len === 0) return acm
          //没有卡片库存弹窗
          if (type === 'limit') {
            let str = ''
            cards.forEach(({
              name
            }) => {
              if (str.indexOf(name) === -1) str += `"${name}"和`
            })
            str = str.slice(0, -1)
            toast = {
              type: 'tip',
              detail: `很遗憾，本次购物无获得卡片${str}`,
              btns: [{
                text: '我知道了',
                type: 'receive',
              }],
              card_type: type,
            }
            acm.push(toast)
            return acm
          }
          if (len === 1) {
            const {
              name,
              help_name,
              card_id,
              img
            } = cards[0]
            toast = {
              type: 'getCard',
              text: `恭喜获得"${name}"卡片一张`,
              btns: [{
                text: '领取',
                type: 'receive',
              }],
              img,
              card_type: type,
            }
            if (type === 'share') {
              toast.friend = `你的好友${help_name}帮你拆出一张"${name}"卡片`
              toast.text = ''
            }
            newCards.push({
              card_id,
              num: 1
            })
          } else {
            const {
              str,
              img,
              newCards: _newCards
            } = this._getCardStr(cards)
            toast = {
              type: 'getCard',
              text: `恭喜获得${str}`,
              btns: [{
                text: '一键领取',
                type: 'receive',
              }],
              card_type: type,
              prompt: {
                show: true,
                lines: [`已领取${str}`],
                timeout: 1500
              },
              img,
            }
            console.log(toast.prompt.lines)
            newCards = newCards.concat(_newCards)
          }
          acm.push(toast)
          return acm
        }, [])
        app.$bus.emit('prompt', {
          show: true
        })
        app.$bus.emit('toastList', toastList)
      }
      return newCards
    },
    _normalizeBoostList(boostList) {
      console.log(JSON.parse(JSON.stringify(boostList)))
      const first_card_id = app.globalData.cardGameConfig.cards[0].id
      return boostList.map((boost) => {
        const {
          card_id
        } = boost
        boost.font_card_img = app.globalData.cardGameConfig.staticConfig['font_card_' + (card_id - first_card_id + 1)]
        console.log(first_card_id, (first_card_id - card_id + 1), boost.font_card_img)
        boost.updated_at = dateFormat(new Date(boost.updated_at), "yyyy.MM.dd hh:mm")
        return boost
      })
    },
    //非会员弹窗
    toastRegister() {
      if (this.data.isMember) return
      app.$bus.emit('prompt', {
        show: true
      })
      app.$bus.emit('toastList', [{
        type: 'register',
        detail: '很抱歉，您还不是美宜佳的注册会员。现在立即注册会员便可参与活动兑换大奖哦，赶紧去注册吧',
        btns: [{
            text: '免费注册',
            type: 'register'
          },
          {
            text: '返回',
            type: 'close'
          }
        ]
      }])
    },
    toHome() {
      wx.switchTab({
        url: '/pages/yhq_index/yhq'
      })
    },
    toRule() {
      app.$bus.emit('router', 'rule')
    },
    _popLotteryChance() {
      const {
        game_id
      } = app.globalData.cardGameConfig
      const data = wx.getStorageSync(LOTTERY_CHANCE_KEY + game_id)
      // console.log('wx.getStorageSync(LOTTERY_CHANCE_KEY)', data)
      data && app.$bus.emit('toastList', [data], true)
    },
    toMyjGame() {
      wx.navigateTo({
        url: app.globalData.cardGameConfig.staticConfig.lottery_url,
      })
    }
  }
})