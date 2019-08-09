import path from 'path';
import fs from 'fs';
import ExtractHTML from './extract/extract-html';
import ExtractJS from './extract/extract-js';
import ExtractVUE from './extract/extract-vue';

import {
    scanFolder,
    createFolder,
    copyFile,
    writeExcel,
    correctPath,
    LOG_TYPE,
    log
} from './util/index';

import {
    EXCLUDE_FILE,
    EXCLUDE_FILE_END,
    EXTNAME_JS,
    EXTNAME_VUE,
    EXTNAME_HTML
} from './util/config';
const minimatch = require("minimatch");
let transFiles = [EXTNAME_JS, EXTNAME_VUE, EXTNAME_HTML];

class ExtractFile {
    constructor(option) {
        this.option = Object.assign({}, {
            baseReadPath: '',
            baseWritePath: '',
            onlyZH: false,
            isTranslate: false,
            isCheckTrans: false,
            hongPath: '',
            transWords: {}
        }, option);

        this.option.baseReadPath = correctPath(this.option.baseReadPath);
        this.option.baseWritePath = correctPath(this.option.baseWritePath);
        this.option.hongPath = correctPath(this.option.hongPath);

        console.log('hongpath', this.option.hongPath)

        this.fileList = {
            // 需要进行提取和翻译的文件
            transList: [],
            // 不需要翻译，直接进行copy的文件
            copyList: [],
            folders: []
        };
        this.outData = [];

        if (this.option.hongPath) {
            try {
                require(this.option.hongPath);
                this.CONFIG_HONG = (global.R && global.R.CONST) || {};
            } catch (e) {
                this.CONFIG_HONG = {};
                log(`宏文件解析错误，宏文件地址-${this.option.hongPath}`, LOG_TYPE.WARNING);
            }
        }


        this.init();
    }

    init() {
        this.extractHTML = new ExtractHTML({
            CONFIG_HONG: this.CONFIG_HONG,
            onlyZH: this.option.onlyZH,
            transWords: this.option.transWords,
            isTranslate: this.option.isTranslate,
            isCheckTrans: this.option.isCheckTrans,
            baseWritePath: this.option.baseWritePath,
            baseReadPath: this.option.baseReadPath,
            // 词条提取完成后的操作
            onComplete: (filePath, words) => {
                if (words.length > 0) {
                    this.outData.push(correctPath(filePath));
                    this.outData = this.outData.concat(words);
                }
            }
        });

        this.extractJS = new ExtractJS({
            CONFIG_HONG: this.CONFIG_HONG,
            onlyZH: this.option.onlyZH,
            transWords: this.option.transWords,
            isTranslate: this.option.isTranslate,
            isCheckTrans: this.option.isCheckTrans,
            baseWritePath: this.option.baseWritePath,
            baseReadPath: this.option.baseReadPath,
            // 词条提取完成后的操作
            onComplete: (filePath, words) => {
                if (words.length > 0) {
                    this.outData.push(correctPath(filePath));
                    this.outData = this.outData.concat(words);
                }
            }
        });

        this.extractVUE = new ExtractVUE({
            CONFIG_HONG: this.CONFIG_HONG,
            onlyZH: this.option.onlyZH,
            transWords: this.option.transWords,
            isTranslate: this.option.isTranslate,
            isCheckTrans: this.option.isCheckTrans,
            baseWritePath: this.option.baseWritePath,
            baseReadPath: this.option.baseReadPath,
            // 词条提取完成后的操作
            onComplete: (filePath, words) => {
                if (words.length > 0) {
                    this.outData.push(correctPath(filePath));
                    this.outData = this.outData.concat(words);
                }
            }
        });
    }

    scanFile() {
        this.outData = [];
        if (fs.lstatSync(this.option.baseReadPath).isDirectory()) {
            this.getFileList();
        } else {
            this.addFile(this.option.baseReadPath)
        }

        this.fileList.transList.forEach((filePath) => {
            if (minimatch(filePath, EXTNAME_JS)) { // js文件
                this.extractJS.addTask(filePath);
            } else if (minimatch(filePath, EXTNAME_HTML)) { // html文件
                this.extractHTML.addTask(filePath);
            } else if (minimatch(filePath, EXTNAME_VUE)) { // vue文件
                this.extractVUE.addTask(filePath);
            } else {
                this.fileList.copyList.push(filePath);
            }
        });

        if (this.option.isTranslate) {
            this.copyFile();
        }

        // 将未翻译的文件以错误的形式输出

        // 将提取的词条文件，输出为excel
        // return Promise.all([this.handleHtml(), this.handleJs()]).then((data) => {

        return Promise.all(this.startHandle()).then((data) => {
            let sheetName = this.extractJS.option.onlyZH ? 'CN' : 'EN';

            if (this.option.isTranslate) {
                log(`翻译后的文件输出到路径-${this.option.baseWritePath}下.`, LOG_TYPE.DONE);
            } else if (!this.option.isCheckTrans) {
                this.outData.unshift(sheetName);
            }

            let outPath = path.join(this.option.baseWritePath, (this.option.isTranslate ? '未匹配的词条' : '提取词条') + `${sheetName}.xlsx`);

            if (this.outData.length > 0) {
                this.outData = [...new Set(this.outData)];
                this.writeWordToExcel(outPath, sheetName);

                if (this.option.isTranslate || this.option.isCheckTrans) {
                    log(`还有部分词条未被翻译，见输出的Excel-${outPath}`, LOG_TYPE.WARNING);
                }
            } else if (this.option.isTranslate || this.option.isCheckTrans) {
                log(`success, 未发现未翻译的词条`, LOG_TYPE.DONE);
            }
            //重置
            this.reset();
            return this.outData;
        }).catch(err => {
            log(`文件处理出错，${err}`, LOG_TYPE.ERROR);
        });
    }

    setAttr(attr, val) {
        if (typeof attr === 'object') {
            Object.assign(this.option, attr);
        } else {
            this.option[attr] = val;
        }

        this.extractHTML.setAttr(attr, val);
        this.extractJS.setAttr(attr, val);
    }

    writeWordToExcel(outPath, sheetName) {
        writeExcel(this.outData, outPath, sheetName)
            .then(() => {
                if (!this.option.isTranslate && !this.option.isCheckTrans) {
                    log(`语言文件输出为-${outPath}`, LOG_TYPE.DONE);
                }
            })
            .catch(error => {
                log(error.message, LOG_TYPE.error);
                let outPath = path.join(this.option.baseWritePath, (this.option.isTranslate ? '未匹配的词条' : '提取词条') + `${new Date().getTime()}.xlsx`);
                this.writeWordToExcel(outPath, sheetName)
            });
    }

    handleHtml(filePath) {
        return this.extractHTML.startTrans();
    }

    handleJs(filePath) {
        return this.extractJS.startTrans();
    }

    startHandle() {
        return [this.extractHTML.startTrans(), this.extractJS.startTrans(), this.extractVUE.startTrans()];
    }

    reset() {
        this.fileList = {
            transList: [],
            copyList: [],
            folders: []
        };
    }

    copyFile() {
        // 拷贝文件
        this.fileList.folders.forEach((val) => {
            createFolder(path.join(this.option.baseWritePath, path.relative(this.option.baseReadPath, val))); //创建目录
        });

        //如果是翻译模式需要将未匹配的文件原样拷贝
        this.fileList.copyList.forEach(filePath => {
            copyFile(filePath, path.join(this.option.baseWritePath, path.relative(this.option.baseReadPath, filePath)));
        });
    }

    //提取文件，并且拷贝不需要操作的文件
    getFileList() {
        var scanData = scanFolder(this.option.baseReadPath);
        this.fileList.folders = scanData.folders;

        scanData.files.forEach((val) => {
            this.addFile(val);
        });
    }

    addFile(filePath) {
        if (minimatch(filePath, EXCLUDE_FILE) || minimatch(filePath, EXCLUDE_FILE_END) || (!transFiles.some(itemRE => minimatch(filePath, itemRE)))) {
            if (this.option.isTranslate) {
                this.fileList.copyList.push(filePath);
            }
        } else {
            this.fileList.transList.push(filePath);
        }
    }
}

export default ExtractFile;