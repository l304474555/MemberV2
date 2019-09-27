let app = getApp()
const util = {
    calcPx(num) {
        let w
        if(app.hwBaseConfig.windowWidth) {
            w = app.hwBaseConfig.windowWidth
        } else {
            w = wx.getSystemInfoSync().windowWidth
            app.hwBaseConfig.windowWidth = w
        }
        
        return num * w / 750
    },
    // canvas 基于背景定位的一些数据
    getgame_bgInfo(bgH = 1206, bgW = 750) {
        const {windowWidth: zrW, windowHeight: zrH} = wx.getSystemInfoSync()
        const zrRatio = zrW / zrH
        
        const bgRatio = bgH / bgW

        let x,y,bgWidth,bgHeight,scale

        if(zrRatio > bgRatio) {
            // 背景图比较高, 宽度相同
            scale = zrW / bgW
            x = 0
            y = (bgH * scale - zrH) * -0.5
            bgWidth = zrW
            bgHeight = bgH * scale
        } else {
            // 背景图比较宽，高度相同
            scale = zrH / bgH
            x = (bgW * scale - zrW) * -0.5
            y = 0
            bgWidth = bgW * scale
            bgHeight = zrH
        }

        // 分别是：
        // zrRatio: 画布比例
        // bgRatio: 背景图比例
        // x: 背景图x值
        // y: 背景图y值
        // bgWidth: 背景图设置后宽度
        // bgHeight: 背景图设置后高度
        // scale: 设置后背景图压缩比例
        return {
            zrRatio ,bgRatio, x,y,bgWidth,bgHeight,scale, zrW, zrH
        }
    },
    // ios的canvas drawImage时无法加载网络图片，需要先下载到本地
    downLoadImg(urlList) {
        let promiseArr = []
        Object.keys(urlList).forEach((v, i) => {
            promiseArr.push(new Promise((resolve, reject) => {
                wx.getImageInfo({
                    src: urlList[v],
                    success(res) {
                        let temp = {}
                        temp[v] = res.path                        
                        resolve(temp)
                    }, 
                    fail(err) {
                        reject(err)
                    }
                })
            }))
            
        })

        return Promise.all(promiseArr)
        
    },
    filterProvince(province, city) {
        // 防止city: 重庆，province: 中国这种情况
        let val = province === '中国' ? city : province
        let res
        if(val.indexOf('黑龙江') !== -1 || val.indexOf('内蒙古') !== -1) {
            res = val.slice(0, 3)
        } else {
            res = val.slice(0, 2)
        }
        return res
    },
    // * hwsdk.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
    dateFormat (date, format) {
        if (format === undefined) {
            format = date;
            date = new Date();
        }
        var map = {
            "M": date.getMonth() + 1, //月份
            "d": date.getDate(), //日
            "h": date.getHours(), //小时
            "m": date.getMinutes(), //分
            "s": date.getSeconds(), //秒
            "q": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
            var v = map[t];
            if (v !== undefined) {
                if (all.length > 1) {
                    v = '0' + v;
                    v = v.substr(v.length - 2);
                }
                return v;
            } else if (t === 'y') {
                return (date.getFullYear() + '').substr(4 - all.length);
            }
            return all;
        });
        return format;
    },
}

module.exports = util