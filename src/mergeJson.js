const { mergeObject, loadJson, writeJson } = require('./util/index');

function merge(obj, ...others) {
    let outData = Object.assign(Object.prototype.toString.call(obj) === '[object Object]' ? {} : [], obj);
    if (others) {
        others.forEach(itemObj => {
            outData = mergeObject(outData, itemObj);
        });
    }
    return outData;
}

function mergeJson(main, file, outPath) {
    let promises = [];
    file.split(',').forEach(item => {
        promises.push(loadJson(item));
    });
    promises.push(loadJson(main));

    return Promise.all(promises).then(data => {
        return merge(...data);
    }).then(data => {
        return writeJson(data, outPath).then((data) => {
            console.log(`Excel to Json文件已写入地址：${outPath}`);
            return data;
        }).catch((error) => {
            console.error(`Excel to Json失败，${error}`);
            return {};
        });
    });
}

module.exports = mergeJson;