let easyRec, easyRecWrap = {}
try {
  easyRec = requirePlugin('WXPayMpEasyRec')
  easyRec.setLogger(console)
  
  // 调试配置，正式上线前请务必去掉
  easyRec.enableDebug({
    // 是否打印调试日志
    log: false,
    // 是否强制弹出授权
    forceAuth: false,
   
    mock: {
      '/recoapp/easyrec/gethostentity': {
        "result_code": "SUCCESS",
        "result_msg": "OK",
        "host_entity_info": {
          "entity": "东莞市糖酒集团美宜佳便利店有限公司",
          "appid": "wx55595d5cf709ce79"
        }
      },
    }
  })
} catch (e) {
  console.log("轻松点插件报错")
  console.error(e.message, e.stack)
}

for (let method of ['init', 'report', 'purchase', 'getEasyRecGoods', 'getBuyAgainGoods']) {
  easyRecWrap[method] = (...args) => {
    return easyRec && easyRec[method] && easyRec[method](...args)
  }
}

export default easyRecWrap