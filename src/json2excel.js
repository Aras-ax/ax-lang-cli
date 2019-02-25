const { loadJson, writeExcel } = require('./util/index');
const path = require('path');

function json2excel(jsonPath, outPath) {
    let exceldata = [
        ['EN', 'CN']
    ];
    loadJson(jsonPath).then(data => {
        if (Array.isArray(data)) {
            data = data.map(item => [item]);
        } else {
            for (let key in data) {
                exceldata.push([key, data[key]]);
            }
        }

        if (!path.extname(outPath)) {
            outPath = path.join(outPath, 'lang.excel');
        }

        return writeExcel(data, outPath, 'EN-CN');
    })
}

module.exports = json2excel;