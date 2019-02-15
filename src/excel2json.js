const { loadExcel, writeJson, formatKey } = require('./util/index');
const path = require('path');

/**
 * excelPath, outPath, sheetName, key, value
 */
function excel2json(option) {
    option.saveData = option.saveData === false ? false : true;
    let data = loadExcel(option.excelPath, option.sheetName);

    data = transferData(data, option.key, option.value);

    return writeJson(data, path.join(option.outPath, option.fileName || 'lang.json'));
}

/**
 * 提供value输出对象json, 不提供输出数组json
 */
function transferData(data, key, value = '') {
    let outData = value === '' ? [] : {},
        keyValueRow = data.shift();

    if (data.length === 0) {
        return outData;
    }

    if (value === '') {
        data.forEach(item => {
            outData.push(item[0]);
        })
    } else {
        let keyIndex = keyValueRow.indexOf(key),
            valueIndex = keyValueRow.indexOf(value);

        data.forEach(item => {
            let keyWorld = item[keyIndex],
                valueWorld = item[valueIndex];
            // 对重复的key进行重新编码
            while (outData[keyWorld] && outData[keyWorld] !== valueWorld) {
                keyWorld = formatKey(keyWorld);
            }
            // 将数据文件记录下来

            outData[keyWorld] = valueWorld;
        });
    }

    return outData;
}

module.exports = excel2json;