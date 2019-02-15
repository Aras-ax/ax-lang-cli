const {
    log,
    loadFile,
    trim,
    writeTextFile
} = require('../util/index');
const {
    LOG_TYPE
} = require('../util/config');
const path = require('path');

/**
 * 词条提取、翻译基类
 */
class Extract {
    constructor(option) {
        this.option = Object.assign({}, {
            // 宏配置,根据宏去筛选字段是否进行提取
            CONFIG_HONG: {},
            // 只提取或者翻译中文
            onlyZH: false,
            // 翻译词条
            transWords: {},
            // 是否是翻译文件
            isTranslate: false,
            // 翻译文件时，写入的根目录
            baseWritePath: '',
            baseReadPath: '',
            // 词条提取完成后的操作
            onComplete: null
        }, option);
        this.init();
    }

    init() {
        // 记录当前的文件路径
        this.curFilePath = '';
        // 提取的词条，去除了重复项，当为翻译模式时间，只存储未被翻译的词条
        this.words = [];
        // 是否正在处理文件
        this.isWorking = false;
        // 待处理文件列表
        this.handleList = [];
        this.CONFIG_HONG = this.option.CONFIG_HONG;
    }

    handleFile(filePath) {
        log(`开始提取文件[${filePath}]`);
        this.isWorking = true;
        this.curFilePath = filePath;
        return loadFile(filePath)
            .then(data => {
                return this.transNode(data);
            })
            .then(AST => {
                return this.scanNode(AST);
            })
            .then((fileData) => {
                if (this.option.isTranslate) {
                    // 写入文件
                    log(`翻译文件[${filePath}]`);
                    writeTextFile(path.resolve(this.option.baseWritePath, path.relative(this.option.baseReadPath, this.curFilePath)), fileData);
                }
                this.complete();
                return this.startTrans();
            })
            .catch(error => {
                log(error, LOG_TYPE.error);
            });
    }

    transNode(data) {
        return Promise.resolve(data);
    }

    startTrans() {
        // 当一个文件执行完成，立即执行下一个指令
        if (this.handleList.length > 0) {
            return this.handleFile(this.handleList.shift());
        }
        return Promise.resolve('done');
    }

    addTask(filePath) {
        this.handleList.push(filePath);
    }

    addWord(word) {
        if (!this.words.includes(word)) {
            this.words.push(word);
        }
    }

    addWords(words) {
        words.forEach(word => {
            this.addWord(word);
        });
    }

    getWord(val) {
        if (val && /\S/.test(val)) {
            val = trim(val);
            let addValue = '';
            // 只提取中文
            if (this.option.onlyZH) {
                if (/[\u4e00-\u9fa5]/.test(val)) {
                    addValue = val;
                }
            } else if (/[a-z]/i.test(val) || /[\u4e00-\u9fa5]/.test(val)) {
                //中英文都提取
                addValue = val;
            } else {
                // pageRemark.push([val, page].join(spliter));
            }
            if (addValue) {
                if (this.option.isTranslate) {
                    let transVal = this.option.transWords[addValue];
                    if (transVal) {
                        return transVal;
                    }
                }
                this.addWord(addValue);
            }
        }
        return '';
    }

    complete() {
        this.isWorking = false;
        this.option.onComplete && this.option.onComplete(this.curFilePath, this.words);
        // 重置提取的词条
        this.words = [];
    }
}

module.exports = Extract;