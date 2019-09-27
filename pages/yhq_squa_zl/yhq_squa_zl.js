// pages/yhq_zl/yhq_zl.js
var app = getApp();
var myjCommon = require("../../utils/myjcommon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    friendRankList:[],//好友榜
    activityInfo:null, //活动信息
    activityId:0, //抽奖活动号
    shareMemberId:0, //分享者ID
    userInfo:null,//当前用户的信息
    nofrienfzlw:'',

    /**弹框 */
    isShowUserInfoBtn:false,
    helperSuccess:false,
    isNoMember:false,
    isrepeat:false,
    issharefriend:false,
    actype:'',
    isurlrule:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    //options.activityId=268;
     //options.shareMemberId = '2275805';
    console.log("助力")
    console.log(options.shareMemberId)
    console.log(options.activityId)
    if (options.activityId != undefined && options.shareMemberId != undefined && options.actype != undefined) //活动号
    {
      that.setData({
        activityId:options.activityId,
        shareMemberId: options.shareMemberId,
        actype: options.actype
      });
      //获取当前用户信息
      wx.getUserInfo({
        success: function (e) {
          that.setData({
            userInfo: e.userInfo
          });
        },
        fail: function (msg) {
          // that.setData({
          //   isShowUserInfoBtn:true
          // });
        }
      });
      that.getHelperRecords();
    }else
    {
      wx.showModal({
        title: '温馨提示',
        content: '没有相关活动信息。',
        showCancel:false
      });
    }
    
  },
  /**获取好友助力榜 */
  getHelperRecords:function()
  {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return false;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.GetHelperRecords",
        biz: { 
              sessionId: user.sessionId, 
              shareMemberId: that.data.shareMemberId,
              activityId: that.data.activityId
             },
        success: function (res) {
          console.log(res)
          if(res.Result!=null)
          {
            //好友助力榜
            if (res.Result.HelperRecord.length>0)
            {
              for (var i = 0; i < res.Result.HelperRecord.length; i++) {
                res.Result.HelperRecord[i].CreateDate = res.Result.HelperRecord[i].CreateDate.replace(/T/g, ' ');
              }
              that.setData({
                friendRankList: res.Result.HelperRecord
              });
             
            }else
            {
              that.setData({
                nofrienfzlw: '暂无好友帮你助力！'
              });
            }
            if (res.Result.LotteryInfo!=null)
            {
              that.setData({
                activityInfo: res.Result.LotteryInfo
              });
              //活动规则
              wx.setStorage({
                key: "rules",
                data: res.Result.LotteryInfo.RuleContent
              })
            }

          }
        },
        fail: function (msg) {
          console.log("获取好友助力榜失败---GetHelperRecords：" + JSON.stringify(msg));
        },
        complete: function (res) {
          console.log("已完成")
        }
      });
    });
  },
  /**点击助力 */
  helper:function()
  {
    var that = this;
    myjCommon.getLoginUser(function (user) {
      if (!user.isLogin) {
        that.setData({
          isShowUserInfoBtn: true
        });
        return false;
      }
      if (that.data.userInfo==null)
      {
        that.setData({
          isShowUserInfoBtn:true
        });
        return;
      }
      myjCommon.callApi({
        interfaceCode: "WxMiniProgram.Service.HelperAssis",
        biz: {
          activityId: that.data.activityId,
          shareMerberId: that.data.shareMemberId,
          sessionId: user.sessionId,
          helpHeardUrl: that.data.userInfo.avatarUrl,
          helpNicName: that.data.userInfo.nickName
        },
        success: function (res) {
          console.log(res)
          if (res.Code == "1" && res.Result.code != "309" && res.Code!="301")
          {
            that.setData({
              helperSuccess:true
            });
            that.getHelperRecords();
          } else if (res.Code=="301") //非会员
          {
            that.setData({
              isNoMember:true
            });
            wx.hideShareMenu();
            return;
          } else if (res.Code == "-109")
          {
            that.setData({
              issharefriend:true
            });
          }
          else if (res.Result.code=="309") //重复助力
          {
            that.setData({
              isrepeat: true
            });
          }
        },
        fail: function (msg) {
          console.log("助力失败--HelperAssis失败：" + JSON.stringify(msg));
        },
        complete: function (res) {
        }
      });
    });
  },
  closeTst:function()
  {
    this.setData({
      helperSuccess:false,
      isrepeat:false
    });

  },
  /**授权 */
  getUserInfoBtnClick: function (e) {
    var that = this;
    that.setData({
      isShowUserInfoBtn:false
    });
    if (e.detail.errMsg == "getUserInfo:ok") {
      that.setData({
        userInfo: e.detail.userInfo
      });
      that.getHelperRecords();
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
  //  */
  // onReady: function () {

  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getHeight();
    // this.setData({
    //   friendRankList:[]
    // });
  },
  /**返回优惠券首页 */
  returnIndex:function()
  {
    wx.switchTab({
      url: '../yhq_index/yhq',
    });
  },
  /**跳到规则页 */
  returnRule:function()
  {
    this.setData({
      isurlrule:true
    });
    wx.navigateTo({
      url: '../luckdraw_rule/luckdraw_rule',
    });
  },
  /**我也要玩 */
  wantoplay:function()
  {
    if (this.data.actype=='luck') //翻牌
    {
      wx.reLaunch({
        url: '../yhq_luckdraw/yhq_luckdraw?activityid=' + this.data.activityId,
      });
    } else if (this.data.actype == 'jgg') //九宫格
    {
      wx.reLaunch({
        url: '../yhq_ninebox/yhq_ninebox?activityid=' + this.data.activityId,
      });
    }
   
  },
  closeTast:function()
  {
    this.setData({
      isNoMember: false,
      isrepeat: false,
      issharefriend:false
    });
  },
  //领取会员卡
  getMemberCard: function (e) {
    this.setData({
      isNoMember: false
    });
    wx.reLaunch({
      url: '/pages/member_card/index',
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    if (this.data.activityId != '' && this.data.shareMemberId>0)
    {
      return {
        title: this.data.activityInfo.SharingRemark,
        path: '/pages/yhq_squa_zl/yhq_squa_zl?activityId=' + this.data.activityId + '&shareMemberId=' + this.data.shareMemberId + '&actype=' + this.data.actype,
        success: (res) => {
          this.getHelperRecords();
        },
        fail: (res) => {
          console.log("转发失败", res);
        }
 // 路径，传递参数到指定页面。
      }
    
     }
   
  },
  util: function (obj) {
    var continueTime = (parseInt(obj.list / obj.container) + 1) * 18000;
    var setIntervalTime = 50 + continueTime;

    var animation = wx.createAnimation({
      duration: 200, //动画时长
      timingFunction: "linear", //线性
      delay: 0 //0则不延迟
    });
    this.animation = animation;
    animation.translateY(obj.container).step({ duration: 50, timingFunction: 'step-start' }).translateY(-obj.list).step({ duration: continueTime });
    this.setData({
      animationData: animation.export()
    })
    setInterval(() => {
      animation.translateY(obj.container).step({ duration: 50, timingFunction: 'step-start' }).translateY(-obj.list).step({ duration: continueTime });
      this.setData({
        animationData: animation.export()
      })
    }, setIntervalTime)
  },
  getHeight() {
    var obj = new Object();
    //创建节点选择器
    var query = wx.createSelectorQuery();
    query.select('.container').boundingClientRect()
    query.select('.list').boundingClientRect()
    query.exec((res) => {
      obj.container = res[0].height; // 框的height
      obj.list = res[1].height; // list的height
      // return obj;
      this.util(obj);
    })
  },
  ncloseTast:function()
  {
    this.setData({
      helperSuccess:false
    });
  }
})