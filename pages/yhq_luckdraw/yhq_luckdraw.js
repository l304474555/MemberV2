// pages/yhq_luckdraw/yhq_luckdraw.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPrize: false, //奖品弹框
    isIntegral: false, //中奖积分弹框
    isExpress: false, //填写快递信息弹框
    iscashTast: false, //抽取到现金填写信息弹框
    backgroundImg: "", //页面底图
    activityType: "", //活动类型：积分抽奖、直接抽奖
    prizeType: "", //中奖类型：优惠券（支付券和M券），快递到家，积分，不中奖
    dataimg: [], //翻牌前图片
    databeforimg: [],
    afterImg: "", //翻牌后图片
    afterClickCard: ["10000"], //已翻过的牌
    currenIntegral: 0, //当前积分
    currenChance: "", //普通抽奖机会
    interCnt: "", //积分抽奖机会
    lotteryActivityinfo: null,
    currenGcCnt: 0, //当前的积分余额
    isMember: "", //非会员提示框
    activityId: "", //活动号
    winRecortObj: null, //中奖对象
    prizeArr: [], //中奖数组
    openIndex: 0, //
    isUseGold: false, //是否是积分抽奖
    form_info: '', //表单值
    isShowUserInfoBtn: false,
    imgclass: '',
    buttomlink: false,
    disable: false,
    expressInfo: {
      WLRId: 0,
      PrizeImg: '',
      PrizeName: ''
    },
    returnIcon: true,
    isreedcodetast: false, //兑换码奖品弹框
    logininfo: null,
    gender: ['女', '男'],
    genIndex: 0,
    /**2.19.03.23 头号玩家 */
    isShowTastList: false, //任务栏列表
    statusList: [],
    isAddSuccess: false,
    prizecurrStoreInfo: {
      TakeGoodsStoreName: '',
      TakeOutStore: '',
      TakeGoodsStoreAddress: '',
      TakeGoodsStorePhone: ''
    },
    isShowExchangeBtn: false //是否显示立即兑换按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("onload");
    var activityid = options.activityid; //活动号
    // var activityid = "5230"; //活动号
    console.log("活动号" + activityid)

    if (activityid != undefined) {
      this.setData({
        activityId: activityid
      });
      this.loadConfig();
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},
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
              //卡牌正面图
              var beforimg = res.Result.LotteryInfo.FrontView;

              //组成6这张图的数组
              //var beforimgArr = [beforimg, beforimg, beforimg, beforimg, beforimg, beforimg];
              var beforimgArr = [];
              for (var k = 0; k < 6; k++) {
                beforimgArr.push({
                  img: beforimg,
                  seletcClass: ''
                });
              }

              //底图
              var bottomPhoto = "";
              if (res.Result.LotteryInfo.BottomPhoto != null) {
                bottomPhoto = res.Result.LotteryInfo.BottomPhoto;
              }
              that.setData({
                lotteryActivityinfo: res.Result.LotteryInfo,
                afterImg: res.Result.LotteryInfo.RearView, //卡牌背面图IsUseGold
                dataimg: beforimgArr,
                databeforimg: beforimgArr,
                activityId: res.Result.LotteryInfo.ActivityId,
                backgroundImg: bottomPhoto //活动底图
              });


              // 普通抽奖次数
              var count = 0;
              count = res.Result.DrawCnt;
              //积分抽奖机会
              var intergcnt = res.Result.DrawCnt_GC;

              if (res.Result.LotteryInfo.IsUseGold) {

                that.setData({
                  currenChance: count - res.Result.DrawCnt_GC,
                  isUseGold: res.Result.LotteryInfo.IsUseGold,
                  interCnt: res.Result.DrawCnt_GC,
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
            //当前用户信息
            if (res.Result.LoginMobile != null) {
              that.setData({
                logininfo: res.Result.LoginMobile //登录用户信息
              })
            }

            //是否禁止转发
            if (res.Result.LotteryInfo != null && res.Result.LotteryInfo.IsForbidForward) {
              //禁止转发
              wx.hideShareMenu({});
            }
          }
        },
        fail: function(msg) {
          console.log("GetLotteryInfo" + JSON.stringify(msg));
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
  /**翻牌抽奖 */
  Luckdraw: function(e) {
    var that = this;
    if (that.data.disable) {
      return;
    } else {
      that.setData({
        disable: true
      });
    }
    if (that.data.currenChance == 0 && that.data.interCnt == 0) {
      that.setData({
        disable: false
      });
      return;
    }
    /* if (that.data.currenChance <= 0) {
        wx.showModal({
          title: '温馨提示',
          content: '您的抽奖机会已经用完。',
          cancel: false,
          showCancel: false
        });
        return;
      }*/
    //1.当前翻牌的是第几张
    var index = e.currentTarget.dataset.index;
    //循环找出这张牌是否已经翻过，如果已经翻过则不能再执行抽奖和扣减次数的操作
    for (var k = 0; k < that.data.afterClickCard.length; k++) {
      if (index == that.data.afterClickCard[k]) {
        return;
      }
    }
    //2.改变背景图 标识这张牌已经翻开了
    //把翻开的那张找出来组成新的翻牌图片数组 
    var newImg = that.data.dataimg;
    for (var i = 0; i < newImg.length; i++) {
      if (index == i) {
        newImg[i].img = that.data.afterImg;
        newImg[i].seletcClass = 'pin'
        break;
      } else {
        continue;
      }
    }
    setTimeout(function() {
      that.setData({
        dataimg: newImg
      });
    }, 200);

    //调用抽奖接口
    myjCommon.getLoginUser(function(user) {
      console.log(user.sessionId)
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true,
          disable: false
        });
        return;
      }

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
              disable: false
            });
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
              disable: false
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
              disable: false
            });
            return;
          } else if (res.Code == "1010" || res.Code == "1011") {
            wx.showModal({
              title: '温馨提示',
              content: res.Msg,
              cancel: false,
              showCancel: false
            });
            that.setData({
              disable: false
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
              disable: false
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
              disable: false
            });
            return;
          }

          //出现异常
          if (res.Code == "106" || res.Code == "107" || res.Code == "105" || res.Code == "108") {
            wx.showModal({
              title: '温馨提示',
              content: '系统繁忙，请稍后再进来抽奖哦。',
              cancel: false,
              showCancel: false
            });
            that.setData({
              disable: false
            });
            return;
          }


          //2.扣减抽奖机会
          //4.弹出中奖框  不中奖不弹框
          //中奖优惠券：弹框券；中奖的是积分：弹框积分;中奖的是快递  弹快递的弹框  
          if (res.Result.WinRecord != null) {
            that.setData({
              winRecortObj: res.Result.WinRecord
            });

            var winrecord = res.Result.WinRecord;
            //判断是否是积分抽奖 如果是积分抽奖  当前积分要减掉抽奖要的积分
            if (that.data.isUseGold) //积分抽奖
            {
              //扣减抽奖机会
              if (that.data.currenChance > 0) {
                that.setData({
                  currenChance: (that.data.currenChance - 1)
                });
              } else {
                if (that.data.interCnt > 0) {
                  that.setData({
                    interCnt: (that.data.interCnt - 1),
                    currenGcCnt: (that.data.currenGcCnt - that.data.lotteryActivityinfo.GoldConsumptionCnt)
                  });
                }

              }

            } else {
              that.setData({
                currenChance: (that.data.currenChance - 1)
              });
            }




            setTimeout(function() {
              /**把中奖信息追加到新数组用于前台展示 */
              var prizear = that.data.prizeArr;
              prizear.push({
                index: index,
                prizeName: that.data.winRecortObj.PrizeName,
                prizeImg: that.data.winRecortObj.PrizeImg
              });
              /**设置奖品图片和标题的翻转 */
              that.setData({
                imgclass: "in"
              });

              //记录这张表已经翻过
              that.data.afterClickCard.push(index);
              that.setData({
                prizeArr: that.data.prizeArr
              });


              var wlrid = 0;
              var prizeImg = '';
              var prizeName = '';
              if (winrecord.DistributeWay == 1) {
                wlrid = winrecord.WLRId;
                prizeImg = winrecord.PrizeImg;
                prizeName = winrecord.PrizeName;
              }

              setTimeout(function() {
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

                    if (winrecord.GoodTicket){
                      that.setData({
                        isShowExchangeBtn: true
                      });
                    }
                  } else //非兑换码
                  {
                    that.setData({
                      isPrize: true
                    });
                  }


                } else if (winrecord.DistributeWay == 2) //不中奖 不用弹框
                {

                } else if (winrecord.DistributeWay == 4) //中奖积分
                {
                  that.setData({
                    isIntegral: true,
                    currenGcCnt: (that.data.currenGcCnt + winrecord.GcCnt)
                  });
                } else if (winrecord.DistributeWay == 5) //现金
                {
                  that.setData({
                    "expressInfo.WLRId": wlrid,
                    "expressInfo.PrizeImg": prizeImg,
                    "expressInfo.PrizeName": prizeName
                  });

                  that.setData({
                    iscashTast: true
                  });
                }
                /**中奖弹框 */

                /**如果6张牌已经翻完则把牌重新盖回去 ：因为有抽奖次数大于6的情况 这是抽到：不中奖的情况 */
                if (that.data.afterClickCard.length >= 7 && winrecord.DistributeWay == 2) {

                  setTimeout(function() {
                    that.setData({
                      dataimg: that.data.databeforimg,
                      afterClickCard: ["10000"],
                      prizeArr: []
                    });
                  }, 1100); //延迟时间 这里是1秒 

                }
                that.setData({
                  disable: false
                });
              }, 750);
            }, 500);

          }

        },
        fail: function(msg) {
          console.log("OpenPrize" + JSON.stringify(msg));
        },
        complete: function(res) {

        }
      });
    });

  },
  /**保存填写的快递信息 */
  savexpressinfo: function(e) {
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
      that.setData({
        iscashTast: true
      });
      return;
    } else if (sex == '') {
      wx.showToast({
        title: '请填写您的性别。',
        icon: 'none'
      });
      that.setData({
        iscashTast: true
      });
      return;
    } else if (mobile == '') {
      wx.showToast({
        title: '请填写您的手机号。',
        icon: 'none'
      });
      that.setData({
        iscashTast: true
      });
      return;
    } else if (!(/^1[34578]\d{9}$/.test(mobile))) {
      wx.showToast({
        title: '手机号格式填写错误。',
        icon: 'none'
      });
      that.setData({
        iscashTast: true
      });
      return;
    } else if (idnum == '') {
      wx.showToast({
        title: '请填写您的身份证号。',
        icon: 'none'
      });
      that.setData({
        iscashTast: true
      });
      return;
    } else if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idnum))) {
      wx.showToast({
        title: '身份证号格式填写错误。',
        icon: 'none'
      });

      that.setData({
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
          that.setData({
            form_info: ''
          });
          if (res.Code == "1") //成功
          {
            wx.showToast({
              title: '保存成功',
              icon: 'none',
              success: function() {
                that.setData({
                  iscashTast: false
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
  /**跳转到活动规则页 */
  ActivityRule: function() {
    wx.navigateTo({
      url: '/pages/luckdraw_rule/luckdraw_rule',
    })
  },
  /**跳转到奖品页 */
  MyPrize: function() {
    wx.navigateTo({
      url: '/pages/luckdraw_prize/luckdraw_prize?aid=' + this.data.activityId,
    })
  },
  /**跳转到首页 */
  returnIndex: function() {
    wx.reLaunch({
      url: '/pages/yhq_index/yhq'
    })
  },
  /**领取会员卡*/
  getMemberCard: function(e) {
    this.setData({
      isMember: false
    });
    // myjCommon.logFormId(e.detail.formId);
    wx.reLaunch({
      url: '/pages/member_card/index',
    })
  },
  /**关闭弹框 */
  tap_close: function() {
    this.setData({
      isPrize: false,
      isIntegral: false,
      isExpress: false,
      form_info: '',
      /**清空表单值 */
      isreedcodetast: false,
      iscashTast: false,
      isAddSuccess: false,
      isShowExchangeBtn: false
    });

    /**如果翻到最后一张牌要把牌重新盖回去  因为用户的抽奖次数有大于6的情况 */
    if (this.data.afterClickCard.length >= 7) {
      this.setData({
        dataimg: this.data.databeforimg,
        afterClickCard: ["10000"],
        prizeArr: []
      });
    }

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作*/

  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    if (!this.data.isShowUserInfoBtn && this.data.logininfo != null && this.data.lotteryActivityinfo.IsSharingPower) {
      return {
        title: this.data.lotteryActivityinfo.SharingRemark,
        path: 'pages/yhq_squa_zl/yhq_squa_zl?activityId=' + this.data.activityId + '&shareMemberId=' + this.data.logininfo.memberId + '&actype=luck'
      }
    }
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
  //性别选择
  selectSexChange: function(e) {
    this.setData({
      genIndex: e.detail.value
    });
  },
  /**头号玩家 2019.03.22 */
  toWxMiniprogram: function(e) {
    var type = e.currentTarget.dataset.type;
    var appid = "";
    if (type == 0) //美宜佳选
    {
      appid = "wx572796b93d5c783b";
    } else if (type == 1) //外卖
    {
      appid = "wx64286f463c42df55";
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
        interfaceCode: "WxMiniProgram.Service.AddBuyCntRecord",
        biz: {
          sessionId: user.sessionId,
          activityId: that.data.activityId,
          appid: appid
        },
        success: function(res) {
          if (res.Code == "0") {
            that.addBuycnt(user.sessionId, "", appid);
            // wx.navigateToMiniProgram({
            //   appId: appid,
            //   envVersion: 'trial'
            // });
            // that.setData({
            //   isShowTastList:false
            // });
          } else if (res.Code == "301") {
            that.setData({
              isMember: true
            });
            wx.hideShareMenu();
          } else {
            wx.showToast({
              title: '跳转失败，请稍后再试。',
              icon: 'none'
            });
          }
        },
        fail: function(msg) {
          console.log("AddBuyCntRecord" + JSON.stringify(msg));
        },
        complete: function(res) {}
      });
    });
  },
  /**任务栏 */
  toStatBar: function() {
    this.getTastStatus();
  },
  closeTast: function() {
    this.setData({
      isShowTastList: false
    });
  },
  /**查询任务完成状态 */
  getTastStatus: function() {
    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetTastStatus",
        biz: {
          sessionId: user.sessionId,
          appid: '["wx572796b93d5c783b", "wx64286f463c42df55"]',
          activityId: that.data.activityId
        },
        success: function(res) {
          console.log("查询状态")
          console.log(res)
          if (res.Code == "0") {

            //已完成
            that.setData({
              statusList: res.Result
            });
          } else //未完成
          {}
        },
        fail: function(msg) {
          console.log("调用：GetTastStatus 失败。")
          console.log(JSON.stringify(msg));

        },
        complete: function(res) {
          that.setData({
            isShowTastList: true
          });
        }
      });
    });
  },
  addBuycnt: function(sessionid, openid, appid) {
    var that = this;
    myjCommon.callApi({
      interfaceCode: "WxMiniProgram.Service.AddBuyCntToday",
      biz: {
        sessionId: sessionid,
        openid: openid,
        appid: appid
      },
      success: function(res) {
        if (res.Code == "0") {
          that.loadConfig();
          that.getTastStatus();
          wx.navigateToMiniProgram({
            appId: appid,
            envVersion: 'release'
          });
          setTimeout(function() {
            that.setData({
              isAddSuccess: true
            });
          }, 5000);
        }
      },
      fail: function(msg) {},
      complete: function(res) {

      }
    });

  },
  /**选择门店 */
  chooseStore: function() {
    wx.navigateTo({
      url: '/pages/yhq_choose_store/yhq_choose_store?lucky=lucky&groupid=' + this.data.winRecortObj.CouponGroupId,
    })
  },
  coupon_close: function() {
    let that = this;
    if (that.data.sureing) {
      wx.showToast({
        title: '正在处理中...请勿重新操作',
        icon: 'none'
      });
    } else {
      if (that.data.winRecortObj.TakeGoodStore) {
        if (that.data.prizecurrStoreInfo.TakeGoodsStoreName == '') {
          wx.showToast({
            title: '请选择提货门店，方可获得优惠券哦',
            icon: 'none'
          });
        } else {
          that.updateChooseStoreStatus();
        }
      } else {
        that.setData({
          isPrize: false
        });
      }
    }
  },
  /**当用户选择了门店，把门店保存到表里然后给用户发券 */
  updateChooseStoreStatus: function() {
    var that = this;
    myjCommon.getLoginUser(function(user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return;
      }

      var storeInfo = that.data.prizecurrStoreInfo;
      if (storeInfo.TakeOutStore == '') {
        return;
      }
      if (that.data.winRecortObj.GCGuId == '') {
        return;
      }
      var storeInfoStr = JSON.stringify(storeInfo);

      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.UpdateChooseStoreStatus",
        biz: {
          sessionId: user.sessionId,
          gCGuId: that.data.winRecortObj.GCGuId,
          storeInfo: storeInfoStr
        },
        success: function(res) {
          console.log("更改发券值");
          console.log(res)
          if (res.Code == "0") {
            wx.showToast({
              title: '领取成功！',
            });
          }
        },
        fail: function(msg) {},
        complete: function(res) {
          that.setData({
            isPrize: false
          })
        }
      });
    });

  },
  close: function() {
    this.setData({
      isPrize: false
    });
  },
  /**
   * 立即兑换
   */
  exchangeNow(){
      wx.navigateToMiniProgram({
        appId: 'wx572796b93d5c783b',
        path: 'pages/myCoupon/myCoupon'
      });
    
  }
})