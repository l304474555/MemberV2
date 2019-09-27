const filterProvince = (province, city) => {
    // 防止city: 重庆，province: 中国这种情况
    let val = province === '中国' ? city : province
    let res
    if (val.indexOf('黑龙江') !== -1 || val.indexOf('内蒙古') !== -1) {
        res = val.slice(0, 3)
    } else {
        res = val.slice(0, 2)
    }
    return res
}

const dateFormat = (date, format) => {
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
}

function initStorage(prefix = '') {
    return ({
        type = 'flag',
        key,
        data,
        cache = true
    }) => {
        return new Promise((resolve, reject) => {
            if (!key) return reject();
            data = data || key
            key = `${prefix}_24_${key}`
            wx.getStorage({
                key,
                success({
                    data
                }) {
                    // type !== 'flag' && console.log('get ', `'${key}': ${data}`);
                    // console.log('get', `'${key}': ${data}`)
                    return resolve({
                        action: 'get',
                        data
                    })
                },
                fail({
                    errMsg
                }) {
                    // console.log('storege errMsg', errMsg)
                    // if (errMsg === 'getStorage:fail data not found') {
                    switch (type) {
                        case 'flag':
                            wx.setStorage({
                                key,
                                data,
                            })
                            // console.log('set ', `'${key}': ${data}`);
                            return resolve({
                                action: 'set',
                                data
                            });
                            // break;
                        case 'img':
                            data = (Array.isArray(data) ? data : [data]).filter(d => d)
                            const res = []
                            const downLoadLength = data.length
                            let downLoadedSum = 0
                            // console.log('data', data)
                            data.forEach((url, index) => {
                                url = url.replace('http://mimage.myj.com.cn/', 'https://mimage.myj.com.cn/')
                                url = url.replace('http://res.cdn.24haowan.com/', 'https://res.cdn.24haowan.com/')
                                if (url.indexOf('wxfile://') == 0) {
                                    res[index] = url
                                    if (++downLoadedSum === downLoadLength) {
                                        wx.setStorage({
                                            key,
                                            data: res,
                                        })
                                        // console.log('set ', `'${key}': ${res}`);
                                        return resolve({
                                            action: 'set',
                                            data: res
                                        });
                                    }
                                } else {
                                    wx.downloadFile({
                                        url,
                                        success({
                                            statusCode,
                                            tempFilePath
                                        }) {
                                            // console.log('statusCode', key + statusCode)
                                            // console.log('tempFilePath', tempFilePath)
                                            if (statusCode === 200) {
                                                res[index] = tempFilePath
                                                if (++downLoadedSum === downLoadLength) {
                                                    if (cache) {
                                                        wx.setStorage({
                                                            key,
                                                            data: res,
                                                        })
                                                    }
                                                    // console.log('set ', `'${key}': ${res}`);
                                                    return resolve({
                                                        action: 'set',
                                                        data: res
                                                    });
                                                }
                                            }
                                        },
                                        fail({
                                            errMsg
                                        }) {
                                            wx.showModal({
                                                title: '下载图片出错',
                                                content: errMsg
                                            })
                                            console.log(errMsg + url + data + key)
                                        }
                                    })
                                }
                            })
                            break;
                        default:
                            break;
                    }
                    // }
                }
            })
        })
    }
}

export {
    filterProvince,
    dateFormat,
    initStorage
}