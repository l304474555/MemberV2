var myjCommon = require("../../../utils/myjcommon.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // sessionId: String,
    // activityId: Number,
    // mypriceUrl: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    last_index: 0, //上一回滚动的位置
    amplification_index: 0, //轮盘的当前滚动位置
    roll_flag: true, //是否允许滚动
    max_number: 8, //轮盘的全部数量
    speed: 300, //速度，速度值越大，则越慢 初始化为300
    finalindex: 5, //最终的奖励
    myInterval: "", //定时器
    max_speed: 40, //滚盘的最大速度
    minturns: 8, //最小的圈数为2
    runs_now: 0, //当前已跑步数
    //min_height:0,
    //活动处理↓
    lotteryActivityinfo: null,
    activityId: "", //活动号
    isMember: "", //非会员提示框
    NineTabBottomPhoto: "", //九宫格页面底图
    NineBottomPhoto: "", //九宫格底图
    ImmediatelyDrawIcon: "", //立即抽奖图标
    RulesIcon: "", //活动规则图标
    MyPrizeIcon: "", //我的奖品图标
    Box1: "", //第1个格
    Box2: "", //第2个格
    Box3: "", //第3个格
    Box4: "", //第4个格
    Box5: "", //第5个格
    Box6: "", //第6个格
    Box7: "", //第7个格
    Box8: "", //第8个格
    currenChance: "", //当前还剩免费几次抽奖机会
    GCcurrenChance: "", //当前积分还剩多少次抽奖机会
    isUseGold: false, //是否是积分抽奖
    currenGcCnt: 0, //当前的积分余额
    returnIcon: true,
    buttomlink: false,
    GCButtomlink: false,
    isShowUserInfoBtn: false,
    winRecortObj: null, //中奖对象
    isExpress: false, //填写快递信息弹框
    iscashTast: false, //中奖现金弹框
    isPrize: false, //奖品弹框
    isIntegral: false, //中奖积分弹框
    form_info: '', //表单值
    isreedcodetast: false, //兑换码奖品弹框
    isNotWin: false,
    logininfo: null,
    isShowView: false, //是否显示抽奖页面，false：不显示，true：显示，用于没存活动ID或者没有找到活动
    gender: ['女', '男'],
    genIndex: 0,
    sessionId: ""
  },
  attached: function() {
    //this.onLoad();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onShow: function(options) {
      // this.loadConfig();
      var that = this;
      if (that.data.activityId)
      {
        that.loadConfig();
      }else
      {
      wx.getStorage({
        key: 'aid',
        success: function(res) {
          console.log(res.data)
          that.setData({
            activityId: res.data
          });
          that.loadConfig();
        }
      });
      }
    },

    //开始滚动
    startrolling: function() {
      let that = this;
      myjCommon.getLoginUser(function(user) {
        if (!user.isLogin) {
          that.setData({
            isShowUserInfoBtn: true
          });
          return;
        }
        //当前可以点击的状态下
        if (that.data.roll_flag) {
          that.data.roll_flag = false;
          that.data.winRecortObj = null;
          //初始化步数
          that.data.runs_now = 0;
          myjCommon.callApi({
            interfaceCode: "WxMiniProgram.Service.OpenPrize_V2",
            biz: {
              sessionId: user.sessionId,
              aid: that.data.activityId,
              formId: ""
            },
            success: function(res) {
              console.log("抽奖结果")
              console.log(res);
              if (res.Code == "301") //非会员
              {
                that.setData({
                  isMember: true,
                  roll_flag: true
                });
                /**初始化注册会员组件方法 */
                that.regerter1 = that.selectComponent("#regerter");
                that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
                wx.hideShareMenu();
                return;
              } else if (res.Code == "109" || res.Code == "110" || res.Code == "111") //活动已结束
              {
                wx.showModal({
                  title: '温馨提示',
                  content: res.Msg,
                  cancel: false,
                  showCancel: false
                });
                that.setData({
                  roll_flag: true
                });
                return;
              } else if (res.Code == "102") //奖项已抽完
              {
                wx.showModal({
                  title: '温馨提示',
                  content: res.Msg,
                  cancel: false,
                  showCancel: false
                });
                that.setData({
                  roll_flag: true
                });
                return;
              } else if (res.Code == "103") //已经没有抽奖次数
              {
                wx.showModal({
                  title: '温馨提示',
                  content: res.Msg,
                  cancel: false,
                  showCancel: false
                });
                that.setData({
                  roll_flag: true
                });
                return;
              } else if (res.Code == "105") //金币不足
              {
                wx.showModal({
                  title: '温馨提示',
                  content: "您的积分不足，无法参与抽奖",
                  cancel: false,
                  showCancel: false
                });
                that.setData({
                  roll_flag: true
                });
                return;
              } else if (res.Code == "1010" || res.Code == "1011") //已满每天次数
              {
                wx.showModal({
                  title: '温馨提示',
                  content: res.Msg,
                  cancel: false,
                  showCancel: false
                });
                that.setData({
                  roll_flag: true
                });
                return;
              }

              //出现异常
              if (res.Code == "106" || res.Code == "105" || res.Code == "108") {
                wx.showModal({
                  title: '温馨提示',
                  content: '系统繁忙，请稍后再进来抽奖哦。',
                  cancel: false,
                  showCancel: false
                });
                that.setData({
                  roll_flag: true
                });
                return;
              } else if (res.Code == "107" )
              {
                wx.showModal({
                  title: '温馨提示',
                  content: res.Msg,
                  cancel: false,
                  showCancel: false
                });
                that.setData({
                  roll_flag: true
                });
                return;
              }
              //2.扣减抽奖机会
              //4.弹出中奖框  不中奖不弹框
              //中奖优惠券：弹框券；中奖的是积分：弹框积分;中奖的是快递  弹快递的弹框  
              if (res.Result.WinRecord != null) {
                that.setData({
                  winRecortObj: res.Result.WinRecord,
                  finalindex: res.Result.WinRecord.NineNo
                });
                that.rolling();
              }

            },
            fail: function(msg) {
              console.log("OpenPrize" + JSON.stringify(msg));
            },
            complete: function(res) {

            }
          });
        }
      });
    },
    onLoad: function(options) {
      if (options.aid!=undefined)
      {
        this.setData({
          activityId: options.aid
        });
        wx.setStorage({
          key: 'aid',
          data: options.aid,
        })
      }
    },
    /**加载基础信息：图片背景，规则，banner，抽奖次数 */
    loadConfig: function() {
      var that = this;
      myjCommon.getLoginUser(function(user) {
        if (!user.isLogin) {
          that.setData({
            isShowUserInfoBtn: true
          });
          return;
        }
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.GetLotteryInfo",
          biz: {
            sessionId: user.sessionId,
            aid: that.data.activityId
          },
          success: function(res) {
            console.log(res);
            if (res.Code == "301") //非会员
            {
              that.setData({
                isMember: true
              });
              /**初始化注册会员组件方法 */
              that.regerter1 = that.selectComponent("#regerter");
              that.regerter1.init(that.data.isMember, "wxc94d087c5890e1f8", "member_card");
              wx.hideShareMenu();
            } else if (res.Code != "1") {
              wx.showModal({
                title: '温馨提示',
                content: res.Msg,
                showCancel: false
              });
            }
            if (res.Result != null) {
              if (res.Result.LotteryInfo != null) {
                if (res.Result.LotteryInfo.DisplayMode != 3) {
                  that.setData({
                    isShowView: false
                  });
                  wx.showModal({
                    title: '温馨提示',
                    content: "这不是九宫格抽活动",
                    cancel: false,
                    showCancel: false
                  });
                } else {
                  that.setData({
                    isShowView: true
                  });
                }
                if (res.Result.LoginMobile != null) {
                  that.setData({
                    logininfo: res.Result.LoginMobile //登录用户信息
                  })
                }

                if (res.Result.WinPrize != null) {
                  for (var i = 0; i < res.Result.WinPrize.length; i++) {
                    if (res.Result.WinPrize[i].SeqNo == 1) {
                      that.setData({
                        Box1: res.Result.WinPrize[i].PosImg //第1个格
                      })
                    }
                    if (res.Result.WinPrize[i].SeqNo == 2) {
                      that.setData({
                        Box2: res.Result.WinPrize[i].PosImg //第2个格
                      })
                    }
                    if (res.Result.WinPrize[i].SeqNo == 3) {
                      that.setData({
                        Box3: res.Result.WinPrize[i].PosImg //第3个格
                      })
                    }
                    if (res.Result.WinPrize[i].SeqNo == 4) {
                      that.setData({
                        Box4: res.Result.WinPrize[i].PosImg //第4个格
                      })
                    }
                    if (res.Result.WinPrize[i].SeqNo == 5) {
                      that.setData({
                        Box5: res.Result.WinPrize[i].PosImg //第5个格
                      })
                    }
                    if (res.Result.WinPrize[i].SeqNo == 6) {
                      that.setData({
                        Box6: res.Result.WinPrize[i].PosImg //第6个格
                      })
                    }
                    if (res.Result.WinPrize[i].SeqNo == 7) {
                      that.setData({
                        Box7: res.Result.WinPrize[i].PosImg //第7个格
                      })
                    }
                    if (res.Result.WinPrize[i].SeqNo == 8) {
                      that.setData({
                        Box8: res.Result.WinPrize[i].PosImg //第8个格
                      })
                    }
                  }
                }

                that.setData({
                  NineTabBottomPhoto: res.Result.LotteryInfo.NineTabBottomPhoto, //九宫格页面底图
                  NineBottomPhoto: res.Result.LotteryInfo.NineBottomPhoto, //九宫格底图
                  ImmediatelyDrawIcon: res.Result.LotteryInfo.ImmediatelyDrawIcon, //立即抽奖图标
                  RulesIcon: res.Result.LotteryInfo.RulesIcon, //活动规则图标
                  MyPrizeIcon: res.Result.LotteryInfo.MyPrizeIcon, //我的奖品图标
                  lotteryActivityinfo: res.Result.LotteryInfo,
                });

                // 抽奖次数
                var count = 0;
                count = res.Result.DrawCnt;

                if (res.Result.LotteryInfo.IsUseGold) {

                  that.setData({
                    currenChance: count - res.Result.DrawCnt_GC,
                    isUseGold: res.Result.LotteryInfo.IsUseGold,
                    GCcurrenChance: res.Result.DrawCnt_GC,
                  });

                } else {
                  that.setData({
                    currenChance: count,
                    isUseGold: res.Result.LotteryInfo.IsUseGold
                  });
                }
                //活动规则
                if (res.Result.LotteryInfo.RuleContent != null) {
                  //规则放到缓存
                  wx.setStorage({
                    key: "rules",
                    data: res.Result.LotteryInfo.RuleContent
                  })
                }
              }
              that.setData({
                currenGcCnt: res.Result.GcCnt
              });

              //是否禁止转发
              if (res.Result.LotteryInfo.IsForbidForward) {
                //禁止转发
                wx.hideShareMenu({});
              }
            }
          },
          fail: function(msg) {
            console.log("GetLotteryInfo_nine" + JSON.stringify(msg));
          },
          complete: function(res) {
            that.setData({
              buttomlink: true,
              returnIcon: false
            });
          }
        });
      });
    },

    onShareAppMessage: function() {

      console.log("onShareAppMessage");
      if (!this.data.isShowUserInfoBtn && !this.data.isMember && this.data.logininfo != null && this.data.lotteryActivityinfo.IsSharingPower) {
        return {
          title: this.data.lotteryActivityinfo.SharingRemark,
          path: 'pages/yhq_squa_zl/yhq_squa_zl?activityId=' + this.data.activityId + '&shareMemberId=' + this.data.logininfo.memberId + '&actype=jgg'
        }
      }
      //
    },
    //滚动轮盘的动画效果
    rolling: function(amplification_index) {
      var that = this;
      this.data.myInterval = setTimeout(function() {
        that.rolling();
      }, this.data.speed);
      this.data.runs_now++; //已经跑步数加一
      this.data.amplification_index++; //当前的加一
      //获取总步数，接口延迟问题，所以最后还是设置成1s以上
      var count_num = this.data.minturns * this.data.max_number + this.data.finalindex - this.data.last_index;
      //上升期间
      if (this.data.runs_now <= (count_num / 3) * 2) {
        this.data.speed -= 30; //加速
        if (this.data.speed <= this.data.max_speed) {
          this.data.speed = this.data.max_speed; //最高速度为40；
        }
      }
      //抽奖结束
      else if (this.data.runs_now >= count_num) {
        clearInterval(this.data.myInterval);
        this.setData({
          last_index: this.data.finalindex,
          roll_flag: true
        });
        that.ShowPrizeInfo();

        // this.data.roll_flag = true;
      }
      //下降期间
      else if (count_num - this.data.runs_now <= 10) {
        this.data.speed += 20;
      }
      //缓冲区间
      else {
        this.data.speed += 10;
        if (this.data.speed >= 100) {
          this.data.speed = 100; //最低速度为100；
        }
      }
      if (this.data.amplification_index > this.data.max_number) { //判定！是否大于最大数
        this.data.amplification_index = 1;
      }
      this.setData(this.data);

    },
    ShowPrizeInfo: function() {
      var that = this;
      if (that.data.winRecortObj != null) {
        var winrecord = that.data.winRecortObj;
        //判断是否是积分抽奖 如果是积分抽奖  当前积分要减掉抽奖要的积分
        if (that.data.isUseGold) //积分抽奖
        {

          //扣减抽奖机会
          if (that.data.currenChance > 0) {
            that.setData({
              currenChance: (that.data.currenChance - 1)
            });
          } else {
            if (that.data.GCcurrenChance > 0) {
              that.setData({
                GCcurrenChance: (that.data.GCcurrenChance - 1),
                currenGcCnt: (that.data.currenGcCnt - that.data.lotteryActivityinfo.GoldConsumptionCnt)
              });
            }

          }
        } else {
          //扣减抽奖机会
          if (that.data.currenChance > 0) {
            that.setData({
              currenChance: (that.data.currenChance - 1)
            });
          }

        }

        var wlrid = 0;
        var prizeImg = '';
        var prizeName = '';
        if (winrecord.DistributeWay == 1) {
          wlrid = winrecord.WLRId;
          prizeImg = winrecord.PrizeImg;
          prizeName = winrecord.PrizeName;
        }
        /**中奖弹框 */
        //快递到家 弹出框让用户填写
        if (winrecord.DistributeWay == 1) {

          that.setData({
            "expressInfo.WLRId": wlrid,
            "expressInfo.PrizeImg": prizeImg,
            "expressInfo.PrizeName": prizeName
          });

          that.setData({
            isExpress: true
          });
        } else if (winrecord.DistributeWay == 3) //中奖优惠券
        {

          if (winrecord.CRMActionNo == "2") {
            //兑换码
            that.setData({
              isreedcodetast: true
            });
          } else //非兑换码
          {
            that.setData({
              isPrize: true
            });
          }

        } else if (winrecord.DistributeWay == 2) //不中奖 不用弹框
        {
          that.setData({
            isNotWin: true,
          });
        } else if (winrecord.DistributeWay == 4) //中奖积分
        {
          that.setData({
            isIntegral: true,
            currenGcCnt: (that.data.currenGcCnt + winrecord.GcCnt)
          });
        } else if (winrecord.DistributeWay == 5) //中奖现金
        {
          that.setData({
            iscashTast: true
          });
        }
        /**中奖弹框 */

      }

    },
    /**保存填写的快递信息 */
    savexpressinfo: function(e) {
      console.log(e);
      var id = e.currentTarget.dataset.id;
      var userName = e.detail.value["username"]; //姓名
      var mobile = e.detail.value["mobile"]; //电话
      var adress = e.detail.value["adress"]; //地址
      var that = this;
      if (userName == "" || mobile == "" || adress == "") {
        wx.showToast({
          title: '请填写完整的快递信息。',
          icon: 'none'
        });
        that.setData({
          isExpress: true
        });
        return;
      }

      if (!(/^1[34578]\d{9}$/.test(mobile))) {
        wx.showToast({
          title: '手机号格式填写错误。',
          icon: 'none'
        });
        return;
      } else if (mobile.length > 11) {
        wx.showToast({
          title: '请输入11位手机号。',
          icon: 'none'
        });
        that.setData({
          isExpress: true
        });
        return;
      }

      myjCommon.getLoginUser(function(user) {
        if (!user.isLogin) {
          wx.showModal({
            title: '提示',
            content: "登录失败，请稍后重试。",
            showCancel: false
          });
          return false;
        }
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.UpdateUserWinById",
          biz: {
            gCGuId: that.data.winRecortObj.GCGuId,
            aId: id,
            sessionId: user.sessionId,
            name: userName,
            mobile: mobile,
            address: adress
          },
          success: function(res) {
            if (res.Code == "1") //成功
            {
              wx.showToast({
                title: '保存成功',
                icon: 'none',
                success: function() {
                  that.setData({
                    isExpress: false,
                    form_info: ''
                  });
                }
              });
            } else {
              wx.showToast({
                title: res.Msg,
                icon: 'none'
              });
            }
          },
          fail: function(msg) {
            console.log("UpdateUserWinById" + JSON.stringify(msg));
          },
          complete: function(res) {
            that.setData({
              isExpress: false
            });
          }
        });
      });
    },
    /**保存抽取到现金的快递信息 */
    savecanshinfo: function(e) {
      console.log(e)
      // var id = e.currentTarget.dataset.id;
      var userName = e.detail.value["xjusername"]; //姓名
      var sex = e.detail.value["xjsex"]; //性别
      var mobile = e.detail.value["xjmobile"]; //电话
      var idnum = e.detail.value["xjidnum"]; //身份证号
      if (userName == '') //姓名为空
      {
        wx.showToast({
          title: '请填写您的姓名。',
          icon: 'none'
        });
        this.setData({
          iscashTast: true
        });
        return;
      } else if (sex == '') {
        wx.showToast({
          title: '请填写您的性别。',
          icon: 'none'
        });
        this.setData({
          iscashTast: true
        });
        return;
      } else if (mobile == '') {
        wx.showToast({
          title: '请填写您的手机号。',
          icon: 'none'
        });
        this.setData({
          iscashTast: true
        });
        return;
      } else if (!(/^1[34578]\d{9}$/.test(mobile))) {
        wx.showToast({
          title: '手机号格式填写错误。',
          icon: 'none'
        });
        this.setData({
          iscashTast: true
        });
        return;
      } else if (idnum == '') {
        wx.showToast({
          title: '请填写您的身份证号。',
          icon: 'none'
        });
        this.setData({
          iscashTast: true
        });
        return;
      } else if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idnum))) {
        wx.showToast({
          title: '身份证号格式填写错误。',
          icon: 'none'
        });

        this.setData({
          iscashTast: true
        });
        return;
      }

      var that = this;
      myjCommon.getLoginUser(function(user) {
        if (!user.isLogin) {
          wx.showModal({
            title: '提示',
            content: "登录失败，请稍后重试。",
            showCancel: false
          });
          return false;
        }

        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.UpdateUserWinCashInfoById",
          biz: {
            gCGuId: that.data.winRecortObj.GCGuId,
            aId: that.data.winRecortObj.WLRId,
            sessionId: user.sessionId,
            name: userName,
            mobile: mobile,
            sex: sex,
            idnum: idnum
          },
          success: function(res) {
            if (res.Code == "1") //成功
            {
              wx.showToast({
                title: '保存成功',
                icon: 'none',
                success: function() {
                  that.setData({
                    iscashTast: false,
                    form_info: ''
                  });
                }
              });
            } else { //失败
              wx.showToast({
                title: res.Msg,
                icon: 'none'
              });
            }
          },
          fail: function(msg) {
            console.log("UpdateUserWinCashInfoById" + JSON.stringify(msg));
          },
          complete: function(res) {
            that.setData({
              iscashTast: false
            });
          }
        });
      });
    },
    /**复制兑换码 */
    copyreedcode: function() {
      wx.setClipboardData({
        data: this.data.winRecortObj.MTicketNo,
        success: function(res) {
          wx.getClipboardData({
            success: function(res) {
              console.log(res.data) // data
            }
          })
        }
      });
    },
    /**领取会员卡*/
    getMemberCard: function(e) {
      this.setData({
        isMember: false
      });
      // myjCommon.logFormId(e.detail.formId);
      wx.reLaunch({
        url: '/pages/member_card/index?jumpPage=111',
      })
    },
    /**关闭非会员弹框 */
    closeTask: function() {
      this.setData({
        isMember: false
      });
    },
    getUserInfoBtnClick: function(e) {
      console.log(e);
      if (e.detail.errMsg == "getUserInfo:ok") {
        this.setData({
          isShowUserInfoBtn: false
        });
        this.loadConfig();
      }
    },

    /**关闭弹框 */
    tap_close: function(e) {
      let type = e.currentTarget.dataset.type
      if (type == 'coupon') {
        getApp().requestSubscribeMessage('Useticket', function () {
        })
      }
      this.setData({
        isPrize: false,
        isIntegral: false,
        isExpress: false,
        form_info: '',
        /**清空表单值 */
        isreedcodetast: false,
        isNotWin: false,
        iscashTast: false
      });
    },
    /**跳转到首页 */
    returnIndex: function() {
      wx.reLaunch({
        url: '/pages/member_index/member_index'
      })
    },
    /**跳转到活动规则页 */
    ActivityRule: function() {
      wx.navigateTo({
        url: '../luckdraw_rule/luckdraw_rule',
      });
    },
    /**跳转到奖品页 */
    MyPrize: function() {
      wx.navigateTo({
        url: '../luckdraw_prize/luckdraw_prize',
      });
    },
    //性别选择
    selectSexChange: function(e) {
      this.setData({
        genIndex: e.detail.value
      });
    }
  }


})