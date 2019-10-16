
var myjCommon = require("../../../utils/myjcommon.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    noMemberTask: false,//会员注册弹框
    appid:'',//小程序appid
    targetCode:'member_card'//小程序对应的编码
  }, 
  attached: function () {
 
   },

  /**
   * 组件的方法列表
   */
  methods: {
    /**创建人:黎梅芳 */
    /**创建日期：20190424 */
    /**描述：获得参数值方法 */
    init: function (ismember, appid, targetCode)
    {
      this.setData({
        noMemberTask: ismember,
        appid:appid,
        targetCode: targetCode
      })
    },
    /**创建人:黎梅芳 */
    /**创建日期：20190424 */
    /**描述：注册会员 */
    regesterByMobile: function (e) {
      var that = this;
      if (e.detail.errMsg != 'getPhoneNumber:ok') {
        that.setData({
          isMember: false
        });
        return;
      }
      wx.login({
        success: res => {
          myjCommon.getLoginUser(
            function (user) {
              if (!user.isLogin) {
                that.setData({
                  isShowUserInfoBtn: true
                });
                return false;
              }
              myjCommon.callApi({
                interfaceCode: "WxMiniProgram.Service.RegesMeberByMobile",
                biz: {
                  appId: that.data.appid,
                  authCode: res.code,
                  encryptedData: e.detail.encryptedData,
                  iv: e.detail.iv,
                  targetCode: that.data.targetCode,
                  sessionId: user.sessionId,
                  sourceCode: "wxuid"
                },
                success: function (res) {
                  if (res.IsSuccess) {
                    wx.showModal({
                      title: '温馨提示',
                      content: '注册成功！',
                      showCancel: false
                    });
                  }
                  else {
                    wx.showModal({
                      title: '温馨提示',
                      content: res.ErrorMsg,
                      showCancel: false
                    });
                  }

                }, fail: function (msg) {
                  that.setData({
                    noMemberTask: false
                  });
                  console.log("解密微信数据失败：" + JSON.stringify(msg));
                },
                complete: function (res) {
                }
              });
            });
        }, fail: function (msg) {
          that.setData({
            noMemberTask: false
          });

        }, complete: function () {
          that.setData({
            noMemberTask: false
          });
        }
      })

    },
     /**创建人:黎梅芳 */
    /**创建日期：20190424 */
    /**描述：关闭注册弹框 */
    closeModel:function()
    {
      this.setData({
        noMemberTask:false
      });
    }
  }
})
