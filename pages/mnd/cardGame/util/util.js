
const filterProvince = (province, city) => {
    // 防止city: 重庆，province: 中国这种情况
    let val = province === '中国' ? city : province
    let res
    if(val.indexOf('黑龙江') !== -1 || val.indexOf('内蒙古') !== -1) {
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

export {
    filterProvince,
    dateFormat,
}