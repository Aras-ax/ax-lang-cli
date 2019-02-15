const { loadExcel, writeJson, formatKey } = require('./util/index');
const path = require('path');

/**
 * excelPath, outPath, sheetName, key, value
 */
function excel2json(option) {
    option.saveData = option.saveData === false ? false : true;
    let data = loadExcel(option.excelPath, option.sheetName);

    if (data.length === 0) {
        console.error(`数据为空，可能是sheetname不存在导致的`);
        return Promise.resolve([]);
    }
    data = transferData(data, option.key, option.value);

    if (option.outPath) {
        let outPath = path.join(option.outPath, option.fileName || 'lang.json');

        return writeJson(data, outPath).then((data) => {
            console.log(`Excel to Json文件已写入地址：${outPath}`);
            return data;
        }).catch((error) => {
            console.error(`Excel to Json失败，${error}`);
            return {};
        });
    } else {
        console.log(`Excel to Json成功，无需保存到本地`);
        return Promise.resolve(data);
    }
}

/**
 * 提供value输出对象json, 不提供输出数组json
 */
function transferData(data, key, value = '') {
    let outData = value === '' ? [] : {},
        keyValueRow = data.shift();
    let keyIndex = keyValueRow.indexOf(key),
        valueIndex = keyValueRow.indexOf(value);

    if (data.length === 0) {
        return outData;
    }

    if (value === '') {
        data.forEach(item => {
            let value = trim(item[keyIndex]),
                i = 0;
            while (!value && i < item.length) {
                value = trim(item[i++]);
            }
            outData.push(value);
        })
    } else {
        data.forEach(item => {
            let keyWorld = trim(item[keyIndex]),
                valueWorld = trim(item[valueIndex]);

            keyWorld = keyWorld || valueWorld;
            valueWorld = valueWorld || keyWorld;

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

function trim(str) {
    if (!str) {
        return str;
    }
    return str.replace(/^(\s+)|(\s+)$/, '').replace(/ +/g, ' ').replace(/\r\n/g, '\n');
}

module.exports = excel2json;