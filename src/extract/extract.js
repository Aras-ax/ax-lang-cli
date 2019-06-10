import {
    log,
    loadFile,
    trim,
    LOG_TYPE,
    copyFile,
    writeTextFile
}
from '../util/index';
let IGNORE_REGEXP = [
    /^[\s0-9]*$/,
    // 单个字母，全数字，数组+标点符号，数字/标点+字母格式不提取
    /^(([a-z0-9]+[\.,\?\\_\:\-/&\=<>\[\]\(\)\|]+)|([\.,\?\\_\:\-/&\=<>\[\]\(\)\|]+[a-z0-9]+))[a-z0-9\.,\?\\_\:\-/&\=<>\[\]\(\)\|]*$/i,
    // <% xxxx %>格式的字符串不提取
    /<%([\s\S]*)%>/i,
    /\(\[([\s\S]*)\]\)/i,
    /^(&nbsp;)+$/i,
    // 只包含html结束标签
    /^(\s*<\s*\/([a-z0-9]+)?>\s*)*$/i,
    // /^<%=((.|\n)*)%>$/i,
    // url不提取
    /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/i
];

import path from 'path';

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
            // 是否是检查翻译
            isCheckTrans: false,
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
        this.CONFIG_HONG = this.option.CONFIG_HONG || {};
    }

    handleFile(filePath) {
        log(`开始提取文件-${filePath}`);
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
                    log(`翻译文件-${filePath}`);
                    writeTextFile(path.resolve(this.option.baseWritePath, path.relative(this.option.baseReadPath, this.curFilePath)), fileData);
                }
                this.complete();
                return this.startTrans();
            })
            .catch(error => {
                this.copyFile(filePath);
                log(`文件[${filePath}]处理出错- ${error}`, LOG_TYPE.ERROR);
                return this.startTrans();
            });
    }

    copyFile(filePath) {
        //如果是翻译模式需要将未匹配的文件原样拷贝
        copyFile(filePath, path.join(this.option.baseWritePath, path.relative(this.option.baseReadPath, filePath)));
    }

    transNode(data) {
        return Promise.resolve(data);
    }

    setAttr(attr, value) {
        if (Object.prototype.toString.call(attr) === '[object Object]') {
            for (let key in attr) {
                this.setSingleAttr(key, attr[key]);
            }
        } else {
            this.setSingleAttr(attr, value);
        }
    }

    setSingleAttr(attr, value) {
        this.option[attr] = value;
        if (attr === 'CONFIG_HONG') {
            this.CONFIG_HONG = value;
        }
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

    getWord(val, isJs) {
        if (!val || /^\s*$/.test(val)) {
            return '';
        }
        if (!isJs) {
            let skip = IGNORE_REGEXP.some(item => item.test(val));
            if (skip) {
                return '';
            }
        }

        val = trim(val);
        // 移除首尾空格
        val = val.replace(/(^\s+)|(\s+$)/g, '');
        // 同时合并词条内部的多个空格等为一个空格，保留js文件中词条内的\n
        val = isJs ? val.replace(/([^\S\n]+)/g, " ") : val.replace(/(\s+)/g, " ");
        let addValue = '';
        if (/^<%=((.|\n)*)%>$/.test(val)) {
            return '';
        }

        // 只提取中文
        if (this.option.onlyZH) {
            if (/[\u4e00-\u9fa5]/.test(val)) {
                addValue = val;
            }
        } else if (/[a-z]/i.test(val) || /[\u4e00-\u9fa5]/.test(val)) {
            //中英文都提取
            addValue = val;
        }


        if (addValue) {
            if (this.option.isTranslate || this.option.isCheckTrans) {
                let transVal = this.option.transWords[addValue];
                if (transVal) {
                    return this.option.isCheckTrans ? "" : transVal;
                }
            }
            this.addWord(addValue);
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

export default Extract;