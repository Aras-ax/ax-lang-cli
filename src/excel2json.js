const { loadExcel, writeJson } = require('./util/index');
const path = require('path');

/**
 * excelPath, outPath, sheetName, key, value
 */
function excel2json(option) {

    let data = loadExcel(option.excelPath, option.sheetName);

    data = transferData(data, option.key, option.value);

    return writeJson(data, path.join(option.outPath, option.fileName || 'lang.json'));
}

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
            outData[item[keyIndex]] = item[valueIndex] || '';
        });
    }

    return outData;
}

module.exports = excel2json;