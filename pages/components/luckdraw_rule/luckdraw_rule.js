var myjCommon = require("../../../utils/myjcommon.js");
var WxParse = require('../../../wxParse/wxParse.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {

  },
  attached: function() {
    var that = this;
    wx.getStorage({
      key: 'rules',
      success: function(res) {
        WxParse.wxParse('rules', 'html', res.data, that, 1);
      }
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {

  },



})