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
   isShowtast:false,
    lotterryinfo:null
  },
  attached: function () {
   },

  /**
   * 组件的方法列表
   */
  methods: {

    loadConfig: function (sessionid,openid,appid) {
      var that = this;
        //string sessionId,string openid,string appid
        myjCommon.callApi({
          interfaceCode: "WxMiniProgram.Service.AddBuyCntToday",
          biz: {
            sessionId: sessionid,
            openid: openid,
            appid: appid
          },
          success: function (res) {
            console.log("自定义组件")
            console.log(res);
            if(res.Code=="0")
            {
              that.setData({
                lotterryinfo: res.Result
              });
              setTimeout(function () {
                that.setData({
                  isShowtast: true
                });
              }, 3500);
            }
          },
          fail: function (msg) {

          },
          complete: function (res) {

          }
        });

    },
    tolucttery:function()
    {
      var topath = this.data.lotterryinfo.ProgramUrl;
      wx.navigateToMiniProgram({
        appId: "wx55595d5cf709ce79",
        path: topath,
        envVersion: 'trial',
        success(res) { }
      });
    },
    ncloseTast: function () {
      this.setData({
        isShowtast: false
      });
    }
  }
})
