import { mergeObject, loadJson, writeJson, LOG_TYPE, log, partMerge } from './util/index';
import path from 'path';

function merge(obj, ...others) {
    let outData = Object.assign(Object.prototype.toString.call(obj) === '[object Object]' ? {} : [], obj);
    if (others) {
        others.forEach(itemObj => {
            outData = mergeObject(outData, itemObj);
        });
    }
    return outData;
}

// action: 1 部分合并
function mergeJson(main, file, outPath, action = 1) {
    let promises = [];
    file.split(',').forEach(item => {
        promises.push(loadJson(item));
    });
    promises.push(loadJson(main));

    return Promise.all(promises).then(data => {
        if (action == 1) {
            return partMerge(data[0], data[1]);
        }
        return merge(...data);
    }).then(data => {
        if (!path.extname(outPath)) {
            outPath = path.join(outPath, 'merge.json');
        }

        return writeJson(data, outPath).then((data) => {
            log(`Merge Json 文件已写入地址-${outPath}`);
            return data;
        }).catch((error) => {
            log(`Merge Json 失败，${error}`, LOG_TYPE.ERROT);
            return {};
        });
    });
}


export default mergeJson;