// components/process.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    percent: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    gt50Class: "",
    rotationDegrees: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },
  ready: function () {
    var percent = this.properties.percent;
    var gt50Class = percent > 50 ? "gt50" : "";
    var rotationMultiplier = 3.6;
    var rotationDegrees = rotationMultiplier * percent;
    this.setData({
      gt50Class: gt50Class,
      rotationDegrees: rotationDegrees
    });
   }
})
