'use strict';

/*eg var args = require('getOption')(process.argv.splice(2));*/
//获取文件路径

module.exports = function(optionsArr) {

    var optionsObj = {};

    if (optionsArr.length > 0) {
        for (var l = 0, len = optionsArr.length; l < len; l++) {
            if (optionsArr[l].indexOf('=') > 1) {//如果是f=filename.txt
                let val = optionsArr[l].split('=')[1];
                val = val === "false" ? false : (val === "true" ? true : val);
                optionsObj[optionsArr[l].split('=')[0].replace(/-+/, '')] = val;
            } else if (optionsArr[l].indexOf('-') === 0) {//如果是 -f filename.txt
                optionsObj[optionsArr[l].substring(1)] = ((typeof optionsArr[l + 1] === 'string') 
                && optionsArr[l + 1].charAt(0) !== '-') ? (l+=1,optionsArr[l]) : true;
            } else {//如果是f
                optionsObj[optionsArr[l].split('=')[0].replace(/-+/, '')] = true;
            }
        }
        if (optionsObj.encode) {//如果有编码标志,则使用decodeURIComponent解码
            for (var opt in optionsObj) {
                try {
                    optionsObj[opt] = decodeURIComponent(optionsObj[opt]);
                } catch (e) {
                    continue;
                }
            }
        }

        return optionsObj;
    }
    return {
        h: true
    };
}