const zrender = require('../../util/zrender/zrender.js')
const zrenderHelper = require('../../util/zrender/zrender-helper.js')
// const behave = require('../../util/behavior.js')
const {calcPx, getgame_bgInfo, downLoadImg}  = require('../../util/util')
const { lottery, choose } = require('../../util/apis')
const cache = {
  isAnimateDone: true
}
const w = 340
const h = 336
const app = getApp()

Component({
  properties: {
    // 小程序中canvas层级最高，如果有弹窗的话，要diaplay：none掉canvas
    canvasShown: {
      type: Boolean,
      value: true
    }
  },
  data: {
    score: 0,
    balloonStyle: '',
    balloomScaleStyle: '',
    btnStyle: '',
    ballsStyle: '',
    ballStyle: '',
    pumpStyle: '',
    isBalloonActive: false,
    isBallActive: false,
    isPumpActive: false,
    isTips: true,
  },
  // behaviors: [behave],
  methods: {
    // goback有两个地方调用。
    // dom点击事件绑定和canvas点击事件绑定（热区判断）
    // 原因是，在移动设备上，canvas层级最高，是点击不到dom的。只能通过设置dom热区，判断是否点击到热区范围内，来触发对应的事件
    goBack() {
      this.replay()
      this.triggerEvent('bridge', {
        currentTag: 'start'
      })
    },
    init() {
      this.setData({
        // game_bg: 'https://mimage.myj.com.cn/MicroMallFileServer/Files/Excel/UploadExcel/201807/2e67cb6d86b6237d.jpg',
        game_bg: app.hwBaseConfig.game_bg,
        flyingtree: 'https://mimage.myj.com.cn/MicroMallFileServer/Files/Excel/UploadExcel/201807/834e646e09e94e1f.png',
        downcloud: 'https://mimage.myj.com.cn/MicroMallFileServer/Files/Excel/UploadExcel/201807/74e19efb600830e1.png',
        upcloud : 'https://mimage.myj.com.cn/MicroMallFileServer/Files/Excel/UploadExcel/201807/c5efa345b2f4290f.png',
        treecover : 'https://mimage.myj.com.cn/MicroMallFileServer/Files/Excel/UploadExcel/201807/42bba230773603c3.png'
      })
      downLoadImg({
        'game_progress': app.hwBaseConfig.game_progress,
        'game_ball_red': app.hwBaseConfig.game_ball_red,
        '+1': 'https://24haowan-cdn.shanyougame.com/dingzhi/myj21/images/+1.png',
        '+3': 'https://24haowan-cdn.shanyougame.com/dingzhi/myj21/images/+3.png',
        '+6': 'https://24haowan-cdn.shanyougame.com/dingzhi/myj21/images/+6.png',
        '+7': 'https://24haowan-cdn.shanyougame.com/dingzhi/myj21/images/+7.png',
        '+8': 'https://24haowan-cdn.shanyougame.com/dingzhi/myj21/images/+8.png',
        'icon_star': app.hwBaseConfig.game_star
      }).then(res => {        
        let imgCache = {}

        res.forEach(v => {
          Object.assign(imgCache, v)
        })
        this.setCache({
          isPressed: false,
          currentProgress: 0
        })

        Object.assign(cache, this.initCanvas(imgCache))
        
        this.initAudio()
        // // 到这里算是初始化完成了
        // // 如果不设setTimeout，iPhone 6s会报unhandled promise reject错误，垃圾
        // setTimeout(() => {
        //   app.hwBus.emit('gameReady', true)
        // }, 200);
      }).catch(() => {
        // app.hwBus.emit('gameReady', true)
      })
    },
    initCanvas(imgCache) {
      const {zrRatio ,bgRatio, x,y,bgWidth,bgHeight,scale, zrW, zrH} = getgame_bgInfo()
      let zr = zrenderHelper.call(this, 'canvas-1', zrW, zrH)
      let self = this
      // 要实现cover的效果
      
      // 画进度条
      let progress = new zrender.Image({
        style: {
          x: bgWidth*0.086 + x,
          y: bgHeight*0.264 + y,
          // image: '../../assets/game_progress.png',
          image: imgCache['game_progress'],
          width: bgWidth*0.088,
          height: bgHeight*0.173
        }
      })
      zr.add(progress)
      // 画进度条的遮挡块
      let progressCliper = new zrender.Rect({
        shape: {
          r: [bgWidth*0.088],
          x: bgWidth*0.086 + x,
          y: (bgHeight*0.264) + (bgHeight*0.173) * (100 - this.getCache('currentProgress')) * 0.01,
          width: bgWidth*0.088,
          height: bgHeight,
        },
        // style: {
        //   fill: 'transparent',
        //   stroke: '#ff0000'
        // }
      }) 

      progress.setClipPath(progressCliper)
      // zr.add(progressCliper)
      
      // 话dom气球
      this.setData({
        balloonStyle: `width: ${calcPx(w)}px; height: ${calcPx(h)}px; left: ${calcPx((750 - w - 6)/2)}px; top: ${bgHeight*0.5 - calcPx(h)}px; background-image: url(${app.hwBaseConfig.game_balloon});`,
        // dom按钮
        btnStyle: `width: ${calcPx(250)}px; height: ${calcPx(124)}px; left: ${calcPx((750 - 250)/2)}px; top: ${bgHeight*0.8 - calcPx(124)}px; background-image: url(${app.hwBaseConfig.game_btn})`,
        // 四个球球
        ballStyle: `width: ${bgWidth * 0.05}px;height: ${bgWidth * 0.05}px;background-image: url(${app.hwBaseConfig.game_ball_blue})`,
        // 打气效果
        pumpStyle: `width: ${bgWidth * 0.04}px;height: ${bgWidth * 0.04}px; left: ${bgWidth/2 - bgWidth * 0.023 + x}px; top: ${bgHeight*0.49 + y}px; background-image: url(${app.hwBaseConfig.game_ball_red})`
      })

      // 添加跳动文字
      // let zText = new zrender.Image({
      //   style: {
      //     x: 100,
      //     y: 100,
      //     width: calcPx(126),
      //     height: calcPx(91),
      //     opacity: 0,
      //     // image: '../../assets/+1.png'
      //     image: imgCache['+1']
      //   }
      // })
      // zr.add(zText)

      const spray = cb => {
        if(!self.getCache('isAnimateDone')) return
        // let tCb = cb
        self.setCache({
          isAnimateDone: false
        })
        var cnt = 12;
        // var centerTolerance = 0;
        // var radius = 10;
        var {particles} = this.getCache();
        if(!particles) particles = []

        var duration = 3000;
        // var color = Math.random() * 260;
        var maxVx = 1000 + Math.random() * 1500;
        var maxVy = 1000 + Math.random() * 1500;

        for (var i = 0; i < cnt; ++i) {
          (function () {
            // var x0 = x + centerTolerance * (Math.random() - 1);
            // var y0 = y + centerTolerance * (Math.random() - 1);
            // var opacity = Math.random() * 0.5 + 0.5;
            var particle
            if(particles.length < cnt) {
              particle = new zrender.Image({
                style: {
                  x: calcPx((750 - 40)/2),
                  y: bgHeight*0.4 - calcPx(40),
                  // image: '../../assets/icon_star.png',
                  image: imgCache['icon_star'],
                  width: 40,
                  height: 40,
                }
              })
              particles[i] = particle
              cache.particles = particles
            } else {
              particle = particles[i]
              particle.attr({
                style: {
                  x: calcPx((750 - 40)/2),
                  y: bgHeight*0.4 - calcPx(40),
                },
                position: [0, 0]
              })
            }
            zr.add(particle);
            
            particle._t = 0;
            // particle._opacity = opacity;

            var animator = particle.animate('');
            var vx = (Math.random() - 0.5) * maxVx;
            var vy = (Math.random() - 1.2) * maxVy;
            var ay = 8000;
            var t0 = 0;

            animator
              .when(duration, {
                _t: 1
              })
              .during(function (p, _t) {
                var dt = _t - t0;
                var x1 = p.position[0] + vx * dt;
                var y1 = p.position[1] + vy * dt;

                p.position = [x1, y1];
                // p.setStyle({
                //   opacity: p._opacity * (1 - _t)
                // });

                vy = vy + ay * dt;
                t0 = _t;
              })
              .done(function () {
                self.setCache({
                  isAnimateDone: true
                })
                // tCb()
                // 会回调很多次，所以调用一次之后，重设
                // tCb = () => null
              })
              .start();
          })();
        }
      }
      const drawText = text => {
        const { bgWidth } = this.getCache()
        const arr = [1,3,6,7,8]
        let rand = arr[Math.ceil(Math.random() * arr.length)-1]
        
        let zText = new zrender.Image({
          style: {
            x: bgWidth * 0.6,
            y: 100,
            width: calcPx(126),
            height: calcPx(91),
            opacity: 1,
            // image: '../../assets/+1.png'
            image: imgCache[`+${rand}`],
          }
        })
        zr.add(zText)

        zText.animateStyle(false)
          .when(600, {
            x: bgWidth * 0.7,
            y: 40,
            opacity: 0
          })
          .start()
          .done((e) => {
            zText = null
          })
      }
      // percentage: 0 ~ 100
      const setProgress = percentage => {
        this.setData({
          isTips: percentage === 0
        })
        progressCliper.animateTo({
          shape: {
            x: bgWidth*0.086 + x,
            y: (bgHeight*0.264) + (bgHeight*0.173) * (100 - percentage) * 0.01,
          }
        }, 200)
      }

      return {
        // zText,
        bgHeight,
        bgWidth,
        drawText,
        spray,
        setProgress,
        x,
      }
    },
    initAudio() {
      let click = wx.createInnerAudioContext()
      let zoomIn = wx.createInnerAudioContext()
      let boom = wx.createInnerAudioContext()
      click.src =  app.hwBaseConfig.music_click
      zoomIn.src = app.hwBaseConfig.music_zoom
      boom.src = app.hwBaseConfig.music_boom
      this.setCache({
        audioManager: {
          click,
          zoomIn,
          boom,
        }
      })
    },
    replay() {
      const {setProgress, balloon, bgHeight} = this.getCache()
      
      if(setProgress) {
        setProgress(0)
        // 有一个bug，第一次设的时候，不会裁剪
        setTimeout(() => {
          setProgress(0)
        }, 20);
      }
      // 重设气球
      setTimeout(() => {
        this.setCache({
          currentProgress: 0,
          isPressed: false
        })
        this.setData({
          balloomScaleStyle: '',
          score: 0,
        })
      }, 1000);

    },
    // 打气事件
    pressDown() {
      if(this.getCache('currentProgress') > 200 || this.getCache('isAnimate')) return

      const { spray, drawText, setProgress, audioManager} = this.getCache()

      // scale: 1 ~ 2
      let scale = ((this.getCache('currentProgress') + 10) + 100) * 0.01
      // scale: 1 ~ 1.5
      scale = scale * 0.5 + 0.5

      if(this.getCache('currentProgress') >= 100) {

        this.setData({
          // 获取60~99的随机数
          score: Math.floor(Math.random() * 40 + 60),
        })
        audioManager.boom.play()
        // 
        spray()

        // 气球飞走动画
        this.setData({
          balloomScaleStyle: `transform: scale(0.3, 0.3) translate(-1000rpx, -1500rpx);opacity: 0;`,
          isPumpActive: false
        })
          
        // 设置为300停止继续网上涨
        this.setCache('currentProgress', 300)

        setTimeout(() => {
          
          // 抽奖
          wx.showLoading()
          lottery().then(res => {
            wx.hideLoading()
            if(res.payload.giftList.length === 1) {
              // 如果只有一个，直接调抽奖接口
              choose(res.payload.giftList[0].uuid).then(() => {
                this.triggerEvent('bridge', {
                  dialogShown: true,
                  dialogData: [res.payload.giftList[0].gift_img],
                  dialogType: 'win'
                })
              }).catch(e => {        
                wx.showToast({
                  title: e.data.msg,
                  icon: 'none',
                  duration: 4000
                })
              })

            } else if (res.payload.giftList.length === 0) {
              this.triggerEvent('bridge', {
                dialogShown: true,
                dialogData: [],
                dialogType: 'fail'
              })
            } else {
              // 多个奖品，弹出选奖品弹窗
              this.triggerEvent('bridge', {
                dialogShown: true,
                dialogData: res.payload.giftList,
                dialogType: 'choose'
              })
              console.log(res.payload.giftList)
            }
            
            this.replay()
          }).catch(e => {
            wx.hideLoading()
            switch (e.data.code) {
              case '1102':
                this.triggerEvent('bridge', {
                  dialogShown: true,
                  dialogData: [],
                  dialogType: 'runout'
                })
                break;
              case '1103':
                this.triggerEvent('bridge', {
                  dialogShown: true,
                  dialogData: ['活动期间抽奖次数已用完'],
                  dialogType: 'runout'
                })
                break;
              default:
                wx.showToast({
                  title: e.data.msg,
                  icon: 'none',
                  duration: 4000
                })
                break;
            }
          })
        }, 2000);
        
        return
      } else {
          // 气球变大动画
          this.setData({
            balloomScaleStyle: `transform: scale(${scale}, ${scale})`
          })
      }

      audioManager.click.play()
      this.setCache('isAnimate', true)
      // 按钮按下
      this.setData({
        // isBalloonActive
        isBallActive: true,
        isBtnActive: true,
        isPumpActive: true
      })
      setTimeout(() => {
        this.setData({
          // isBalloonActive
          isBallActive: false,
          isBtnActive: false,
          isPumpActive: false
        })
      }, 200);
      setTimeout(() => {
        this.setCache('isAnimate', false)
      }, 300);

      drawText()
      
      setProgress(this.getCache('currentProgress') + 10)
      this.setCache({
        isPressed: false,
        currentProgress: this.getCache('currentProgress') + 10
      })

    },
    processEvent({x, y}, handler) {
      const {bgHeight} = this.getCache()
      // 返回按钮的热区
      const backRect = {
        x1: calcPx(10),
        y1: calcPx(52),
        x2: calcPx(163 + 10),
        y2: calcPx(65 + 52)
      }
      // 游戏按钮的热区
      const btnRect = {
        x1: calcPx((750 - 250)/2),
        y1: bgHeight*0.8 - calcPx(124),
        x2: calcPx((750 - 250)/2) + calcPx(250),
        y2: bgHeight*0.8 - calcPx(124) + calcPx(124)
      }

      // ios有个bug， 点不到dom，只能通过判断点击热点的地方来处理方法
      if(x >= backRect.x1 && x <= backRect.x2 && y >= backRect.y1 && y <= backRect.y2) {
        this.goBack()
      } else if (x >= btnRect.x1 && x <= btnRect.x2 && y >= btnRect.y1 && y <= btnRect.y2) {
        this.pressDown()
      }
    },
    touchstart(e) {
      this.processEvent(e.touches[0], this.pressDown)
    },
    // touchend(e) {
      // if(!this.getCache('isPressed')) {
      //   this.pressUp()
      // }
    // },
    getCache(name) {
      return name ? cache[name] : cache
    },
    setCache(key, value) {
      if(Object.prototype.toString.call(key) === '[object Object]') {
          // 如果是对象
        Object.assign(cache, key)
      } else {
        cache[key] = value
      }
    }
  },
  ready() {
    let self = this
    if(app.hwBaseConfig) {
      this.init()
    }
    
  },
  detached() {
    zrender.dispose()
  }
})
