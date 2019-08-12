import fs from 'fs';
import path from 'path';
import xlsx from 'node-xlsx';

const LOG_TYPE = {
    WARNING: 1,
    ERROR: 2,
    LOG: 3,
    DONE: 4
};

/**
 * 对字符串重新编码，字符串前面加上8位的特殊编码
 * @param {String} key 需要进行重新编码的字符串 
 */
function formatKey(key) {
    let arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        code = '{0}#{1}{2}{3}#',
        l = arr.length;

    key = decodeKey(key);
    return code.replace(/\{0\}/g, arr[Math.floor(Math.random() * l)]).replace(/\{1\}/g, arr[Math.floor(Math.random() * l)]).replace(/\{2\}/g, arr[Math.floor(Math.random() * l)]).replace(/\{3\}/g, arr[Math.floor(Math.random() * l)]) + key;
}

/**
 * 对重新编码的字符串进行解码
 * @param {String} key 需要解码的字符串
 */
function decodeKey(key) {
    if (!key) {
        return '';
    }

    return key.replace(/^[a-zA-Z]\#[a-zA-Z][a-zA-Z][a-zA-Z]\#/g, '');
}

function getDirname(filePath) {
    if (path.extname(filePath) !== '') {
        return path.dirname(filePath);
    }
    return filePath;
}

/**
 * 异步加载json文件
 * 返回Promise，
 * @param {String} src 文件绝对路径
 */
function loadFile(src) {
    return new Promise((resolve, reject) => {
        fs.readFile(src, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(data);
        });
    });
}

/**
 * 异步加载json文件
 * 返回Promise，参数为Object
 * @param {String} src 文件绝对路径
 */
function loadJson(src) {
    return loadFile(src).then((data) => {
        return JSON.parse(data);
    }).catch(err => {
        log(err.error, LOG_TYPE.error);
        return {};
    });
}

/**
 * 同步加载json文件
 * 返回Promise，参数为Object
 * @param {String} src 文件绝对路径
 */
function loadJsonSync(src) {
    try {
        return JSON.parse(fs.readFileSync(src));
    } catch (e) {
        return {};
    }
}

function writeJson(data, outPath) {
    createFolder(path.dirname(outPath));
    return new Promise((resolve, reject) => {
        fs.writeFile(outPath, JSON.stringify(data, '', 2), (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

var styles = {
    'bold': ['\x1B[1m', '\x1B[22m'],
    'italic': ['\x1B[3m', '\x1B[23m'],
    'underline': ['\x1B[4m', '\x1B[24m'],
    'inverse': ['\x1B[7m', '\x1B[27m'],
    'strikethrough': ['\x1B[9m', '\x1B[29m'],
    'white': ['\x1B[37m', '\x1B[39m'],
    'grey': ['\x1B[90m', '\x1B[39m'],
    'black': ['\x1B[30m', '\x1B[39m'],
    'blue': ['\x1B[34m', '\x1B[39m'],
    'cyan': ['\x1B[36m', '\x1B[39m'],
    'green': ['\x1B[32m', '\x1B[39m'],
    'magenta': ['\x1B[35m', '\x1B[39m'],
    'red': ['\x1B[31m', '\x1B[39m'],
    'yellow': ['\x1B[33m', '\x1B[39m'],
    'whiteBG': ['\x1B[47m', '\x1B[49m'],
    'greyBG': ['\x1B[49;5;8m', '\x1B[49m'],
    'blackBG': ['\x1B[40m', '\x1B[49m'],
    'blueBG': ['\x1B[44m', '\x1B[49m'],
    'cyanBG': ['\x1B[46m', '\x1B[49m'],
    'greenBG': ['\x1B[42m', '\x1B[49m'],
    'magentaBG': ['\x1B[45m', '\x1B[49m'],
    'redBG': ['\x1B[41m', '\x1B[49m'],
    'yellowBG': ['\x1B[43m', '\x1B[49m']
}

/**
 * 不同类型的日志打印
 * @param {String} message 日志信息
 * @param {Number} type 日志类型
 */
function log(message, type = LOG_TYPE.LOG) {
    let logText = ['', 'Warning', 'Error', 'Log', 'Success']
    message = `[${logText[type]}][${message}]`;

    switch (type) {
        case LOG_TYPE.WARNING:
            console.log(styles['yellow'][0] + '%s' + styles['yellow'][1], message);
            break;
        case LOG_TYPE.ERROR:
            console.log(styles['red'][0] + '%s' + styles['red'][1], message);
            break;
        default:
            console.log(message);
    }
}

/**
 * 读取excel
 * @param {String} xlsxPath excel文件地址
 */
function loadExcel(xlsxPath, sheetName) {
    let data = xlsx.parse(xlsxPath);
    let outData = [];
    // 当前只读取第一个sheet里面的内容
    data.forEach(item => {
        if (sheetName) {
            if (item.name === sheetName) {
                outData = item.data;
                return false;
            }
            outData = [];
        } else {
            outData = item.data;
            return false;
        }
    });
    outData = outData.filter(item => item.length > 0);
    return outData;
}

/**
 * 
 * @param {Array} data 写入excel中的数据    
 * @param {String} outPath 导出的excel文件名+地址(绝对路径)
 */
function writeExcel(data, outPath, sheetName) {
    createFolder(path.dirname(outPath));
    if (data && data.length > 0 && typeof data[0] !== 'object') {
        data = data.map(item => [item]);
    }

    let buffer = xlsx.build([{
        name: sheetName || '语言包',
        data: data
    }]);

    return new Promise((resolve, reject) => {
        fs.writeFile(outPath, buffer, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function writeTextFile(filename, content) { //以文本形式写入
    createFolder(path.dirname(filename));
    fs.writeFileSync(filename, content);
}

function createFolder(folder) {
    folder = path.resolve(folder);
    var originDir = folder;
    try {
        if (fs.existsSync(folder)) return;

        while (!fs.existsSync(folder + '/..')) { //检查父目录是否存在
            folder += '/..';
        }

        while (originDir.length <= folder.length) { //如果目录循环创建完毕，则跳出循环
            fs.mkdirSync(folder, '0777');
            folder = folder.substring(0, folder.length - 3);
        }
    } catch (e) {
        console.log(e);
    }
}

/**
 * 深度合并
 * @param {Object} oldObj 被合并对象
 * @param {Object} newObj 合并对象 
 */
function deepMerge(oldObj, newObj) {
    for (let key in newObj) {
        if (newObj.hasOwnProperty(key)) {
            let oldT = oldObj[key],
                newT = newObj[key];

            if (oldT) {
                if (Object.prototype.toString.call(newT) === '[object Object]') {
                    deepMerge(oldT, newT);
                } else {
                    oldObj[key] = newT;
                }
            } else {
                oldObj[key] = newT;
            }
        }
    }
}

function mergeObject(main, other) {
    if (Object.prototype.toString.call(main) === '[object Array]') {
        return [...new Set(main.concat(other))];
    }

    for (let key in other) {
        let data = other[key];
        if (main[key] !== undefined && typeof main[key] === 'object' && typeof data === 'object') {
            main[key] = mergeObject(main[key], data);
        } else {
            main[key] = data;
        }
    }

    return main;
}
// 部分合并
function partMerge(obj, main) {
    let outData = {};
    if (getType(main) === 'Array') {
        main.map(item => {
            outData[item] = obj[item] || '';
        });
    } else {
        for (let key in main) {
            outData[key] = obj[key] || main[key];
        }
    }
    return outData;
}

/**
 * 扫描文件夹内的文件
 */
function scanFolder(folder) {
    var fileList = [],
        folderList = [],
        walk = function(folder, fileList, folderList) {
            var files = fs.readdirSync(folder);
            files.forEach(function(item) {
                var tmpPath = folder + '/' + item,
                    stats = fs.statSync(tmpPath);

                if (stats.isDirectory()) {
                    walk(tmpPath, fileList, folderList);
                    folderList.push(path.resolve(tmpPath));
                } else {
                    fileList.push(path.resolve(tmpPath));
                }
            });
        };

    walk(folder, fileList, folderList);

    return {
        files: fileList,
        folders: folderList
    };
}

function createFolder(folder, callback) {
    var originDir = folder;
    try {
        if (fs.existsSync(folder)) return;

        let list = [folder];
        folder = path.dirname(folder);
        while (!fs.existsSync(folder)) { //检查父目录是否存在
            list.push(folder);
            folder = path.dirname(folder);
        }

        while (list.length > 0) {
            fs.mkdirSync(list.pop());
        }

        if (callback) callback();
    } catch (e) {
        console.log(e);
    }
}

function copyFile(src, dist) {
    createFolder(path.dirname(dist));
    fs.createReadStream(src).pipe(fs.createWriteStream(dist));
}

/**
 * 修正路劲
 */
function correctPath(filePath) {
    filePath += '';

    if (!path.isAbsolute(filePath)) {
        filePath = path.join(process.cwd(), filePath);
        console.log(filePath);
    }

    // windows平台支持\和/，POSIX上是/
    return filePath.replace(/\\/g, '/');
}
/**
 * 移除空格
 */
function trim(text) {
    return text.replace(/(^\s+)|(\s+$)/g, '');
}

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

function string2Regexp(str) {
    if (getType(str) === 'RegExp') {
        return str;
    }

    if (/^\//.test(str)) {
        let index = str.lastIndexOf('/');
        if (index === 0) {
            return new RegExp(str);
        }

        let t = str.substring(1, index),
            k = str.substring(index + 1);
        return new RegExp(t, k);
    }

    return new RegExp(str);
}

function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj);
    }

    if (obj instanceof RegExp) {
        return new RegExp(RegExp);
    }

    let newObj = new obj.constructor();
    for (let key in obj) {
        newObj[key] = deepClone(obj[key]);
    }
    return newObj;
}

export {
    formatKey,
    decodeKey,
    deepMerge,
    loadJsonSync,
    loadFile,
    loadJson,
    loadExcel,
    scanFolder,
    createFolder,
    copyFile,
    writeTextFile,
    string2Regexp,
    writeExcel,
    correctPath,
    writeJson,
    mergeObject,
    partMerge,
    getDirname,
    LOG_TYPE,
    deepClone,
    getType,
    trim,
    log
};