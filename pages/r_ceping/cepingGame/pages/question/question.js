// pages/cepingGame/pages/question/question.js
import {
  submitResult
} from '../../util/apis'
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  lifetimes: {
    attached() {
      let {
        globalData: {
          cepingGameConfig
        }
      } = app;
      let qa = JSON.parse(JSON.stringify(cepingGameConfig.qa));
      this.setData({
        btnTip: `下一页(1/${qa.length})`,
        qa: qa,
        static: {
          img_answer_bg: cepingGameConfig.img_answer_bg,
          img_answer_bg_selected: cepingGameConfig.img_answer_bg_selected,
          img_btn_bg: cepingGameConfig.img_btn_bg,
          img_btn_bg_disable: cepingGameConfig.img_btn_bg_disable,
          img_qa_bg: cepingGameConfig.img_qa_bg,
          img_qa_bg_top: cepingGameConfig.img_qa_bg_top
        }
      });
      app.globalData.cepingGameConfig.fromRouter = 'question'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    qIndex: 0,
    aIndex: -1,
    qa: [],
    tip: {
      text: '需要进行选择才能进入下一页',
      show: false,
      timeout: null
    },
    btnTip: '下一页(1/N)',
    qaAnimClass: 'qa-enter',
    end: false,
    clickAble: true,
    static: {},
    scale: 1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    stop() {},
    selectAnswer(e) {
      const index = e.target.dataset.index;
      if (index >= 0) {
        const qaKey = `qa[${this.data.qIndex}].aIndex`;
        this.setData({
          [qaKey]: index,
          aIndex: index
        });
        if (this.data.qIndex + 1 === this.data.qa.length) {
          this.setData({
            tip: {
              text: '你的祝福准备就绪',
              show: true
            }
          })
          return;
        }
      }
    },
    calcRange(range, score) {
      const pre = range[0]
      const pos = range[range.length - 1]
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
    next(e) {
      // 点击缩放
      this.setData({
        scale: 1.05
      })
      setTimeout(() =>
        this.setData({
          scale: 1
        }), 500)
      // 防止在最后一题的时候点击两次
      if (!this.data.clickAble) return;
      if (this.data.aIndex < 0) {
        // 没有选择答案，显示提示
        clearTimeout(this.data.tip.timeout);
        let timeout = setTimeout(() => {
          this.setData({
            tip: {
              show: false,
              timeout: null
            }
          })
        }, 3000)
        this.setData({
          tip: {
            text: this.data.end ? '需要进行选择才能完成测评' : '需要进行选择才能进入下一页',
            show: true,
            timeout: timeout
          }
        })
        return;
      }
      // 下一页，先存在一个变量，不直接改变原下标，避免动画还没执行内容就先变了
      let tQIndex = this.data.qIndex + 1;
      // 已经是最后一题了
      if (tQIndex === this.data.qa.length) {
        // this.data.end = true
        this.data.clickAble = false
        // 取出答案 统计分数
        let score = 0
        let answer = this.data.qa.map(item => {
          score += +item.answer[item.aIndex].score;
          return item.answer[item.aIndex].text;
        })
        // 上传数据
        // submitResult({
        //   game_id: +app.globalData.cepingGameConfig.id,
        //   name: app.globalData.cepingGameConfig.name,
        //   unionid: app.globalData.cepingGameConfig.user.unionid,
        //   score,
        //   answer,
        // }).then(({
        //   payload
        // }) => {
        //   // 更新测评次数
        //   app.$bus.emit('updateGameChance', payload.left_game_chance)
        //   app.$bus.emit('updateLotteryChance', payload.lottery_chance)
        //   app.globalData.cepingGameConfig.user.left_lottery_chance = payload.lottery_chance
        // })
        // 下载装饰图片
        const {
          result
        } = app.globalData.cepingGameConfig
        for (let i = 0; i < result.length; i++) {
          let {
            img,
            range,
            description,
            title
          } = result[i]
          // console.log(range, score)
          if (this.calcRange(range, score)) {
            // console.log('result_' + i, img)
            app.$storage({
              type: 'img',
              key: 'result_' + i,
              data: img,
              cache: false
            }).then(({
              data
            }) => {
              app.globalData.cepingGameConfig.resultImg = data[0];
              app.globalData.cepingGameConfig.resultDes = description;
              app.globalData.cepingGameConfig.resultDesTitle = title
              // 弹出上传图片弹窗
              app.$bus.emit('toast', {
                showType: 'chooseImg',
                disableClose: true,
                noAnimation: true,
                callBack: function (src) {
                  console.log('上传图片')
                  // 上传数据
                  submitResult({
                    game_id: +app.globalData.cepingGameConfig.id,
                    name: app.globalData.cepingGameConfig.name,
                    unionid: app.globalData.cepingGameConfig.user.unionid,
                    score,
                    answer,
                  }).then(({
                    payload
                  }) => {
                    // 更新测评次数
                    app.$bus.emit('updateGameChance', payload.left_game_chance)
                    app.$bus.emit('updateLotteryChance', payload.lottery_chance)
                    app.globalData.cepingGameConfig.user.left_lottery_chance = payload.lottery_chance
                  })
                }
              });
              // console.log('show chooseImg')
            })
            return;
          }
        }
        wx.showToast({
          title: `${score}分没有匹配到图片`,
          icon: 'loading',
          duration: 50000
        })
        console.warn(`${score}分没有匹配到图片`);
        return;
      }
      // 设置离开动画，隐藏按钮上面的提示，取出答案选中状态
      this.setData({
        qaAnimClass: 'qa-leave',
        tip: {
          show: false,
          timeout: null
        }
      });
      // 按钮文案
      let btnTip = `下一页(${tQIndex + 1}/${this.data.qa.length})`
      // 如果下一页是最后一题，设置最后一题为true，修改按钮文案
      if (tQIndex + 1 === this.data.qa.length) {
        this.setData({
          end: true
        })
        btnTip = '挑选图片';
      }
      // 两百毫秒后替换问题（避免还没离开问题就变了）
      setTimeout(() => {
        this.setData({
          qIndex: tQIndex
        });
      }, 200);
      // 500毫秒后离开动画结束，执行进入动画
      setTimeout(() => {
        this.setData({
          qaAnimClass: 'qa-enter',
          aIndex: -1,
          btnTip: btnTip
        });
      }, 500);
    },
  }
})