const { loadExcel, writeJson, formatKey, decodeKey } = require('./util/index');
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
        if (Array.isArray(data)) {
            let outPath = path.join(option.outPath, option.fileName || 'lang.json');

            return writeJson(data, outPath).then((data) => {
                console.log(`Excel to Json文件已写入地址：${outPath}`);
                return data;
            }).catch((error) => {
                console.error(`Excel to Json失败，${error}`);
                return {};
            });
        } else {
            let promiseList = [];
            option.outPath = path.join(option.outPath, 'lang');
            for (let key in data) {
                let outPath = path.join(option.outPath, `${key}.json`);

                promiseList.push(writeJson(data[key], outPath));
            }
            return Promise.all(promiseList).then((data) => {
                console.log(`Excel to Json文件已写入地址：${option.outPath}`);
                return data;
            }).catch((error) => {
                console.error(`Excel to Json失败，${error}`);
                return {};
            });
        }
    } else {
        console.log(`Excel to Json成功，无需保存到本地`);
        return Promise.resolve(data);
    }
}

/**
 * 提供value输出对象json, 不提供输出数组json
 * value为值对应的语言列，多个语言列用逗号隔开
 */
function transferData(data, key, value = '') {
    let outData = value === '' ? [] : {},
        keyValueRow = data.shift();
    let keyIndex = keyValueRow.indexOf(key);

    if (data.length === 0) {
        return outData;
    }

    if (!value) {
        data.forEach(item => {
            let value = trim(item[keyIndex]),
                i = 0;
            while (!value && i < item.length) {
                value = trim(item[i++]);
            }
            outData.push(value);
        })
        return outData;
    }

    // 多列解析，同时对重复的词条进行重新编码
    value = value.split(',');
    let valueIndex = {};
    // 获取每个值字段对应的excel的列索引
    value.forEach(item => {
        valueIndex[item] = keyValueRow.indexOf(item);
    });

    value.forEach(valItem => {
        let valIndex = valueIndex[valItem],
            decodeKeys = {},
            transData = {};

        data.forEach(dataItem => {
            let keyWorld = trim(dataItem[keyIndex]),
                valueWorld = trim(dataItem[valIndex]),
                repeatKey = '';

            keyWorld = keyWorld || valueWorld;
            valueWorld = valueWorld || keyWorld;

            // 重复判断
            if (transData[keyWorld] && transData[keyWorld] !== valueWorld) {
                let repeatKeys = decodeKeys[keyWorld] || [],
                    oldKey = keyWorld;

                repeatKeys.some(key => {
                    if (transData[key] === valueWorld) {
                        repeatKey = key;
                        // 更新原数，以便下次直接用新的key值进行转换
                        dataItem[keyIndex] = key;
                        return true;
                    }
                });

                if (repeatKey) {
                    return true;
                }

                keyWorld = formatKey(keyWorld);

                // 对重复的key进行重新编码
                while (outData[keyWorld]) {
                    keyWorld = formatKey(keyWorld);
                }
                repeatKeys.push(keyWorld);
                // 更新原数，以便下次直接用新的key值进行转换
                dataItem[keyIndex] = keyWorld;
                // 记录当前重新编码的词条
                decodeKeys[oldKey] = repeatKeys;
                // 同步修改已经转换好的语言
                syncKey(outData, oldKey, keyWorld);
            }

            transData[keyWorld] = valueWorld;
        });

        outData[valItem] = transData;
    });
    return outData;
}

function syncKey(obj, key, newKey) {
    for (let t in obj) {
        if (obj[t]) {
            obj[t][newKey] = obj[t][key];
        }
    }
}

function trim(str) {
    if (!str) {
        return str;
    }
    return str.replace(/^(\s+)|(\s+)$/, '').replace(/ +/g, ' ').replace(/\r\n/g, '\n');
}

module.exports = excel2json;