const path = require('path');
const fs = require('fs');
const minimatch = require("minimatch");
const {
    EXCLUDE_FILE,
    EXCLUDE_FILE_END,
    EXTNAME_JS,
    EXTNAME_HTML,
    LOG_TYPE
} = require('../src/util/config');

const ExtractHTML = require('./extract/extract_html');
const ExtractJS = require('./extract/extract_js');

const {
    scanFolder,
    createFolder,
    copyFile,
    writeExcel,
    correctPath,
    log
} = require('./util/index');

class ExtractFile {
    constructor(option) {
        this.option = Object.assign({}, {
            baseReadPath: '',
            baseWritePath: '',
            onlyZH: false,
            isTranslate: false,
            isCheckTrans: false,
            config_hong_path: '',
            transWords: {}
        }, option)
        this.option.baseReadPath = correctPath(this.option.baseReadPath);
        this.option.baseWritePath = correctPath(this.option.baseWritePath);

        this.fileList = {
            // 需要进行提取和翻译的文件
            transList: [],
            // 不需要翻译，直接进行copy的文件
            copyList: [],
            folders: []
        };
        this.outData = [];

        if (this.option.config_hong_path) {
            require(this.option.config_hong_path);
        }

        this.CONFIG_HONG = (global.R && global.R.CONST) || {};
        // global.R = null;

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
    }

    scanFile() {
        this.outData = [];
        if (fs.lstatSync(this.option.baseReadPath).isDirectory()) {
            this.getFileList();
        } else {
            this.addFile(this.option.baseReadPath)
        }

        this.fileList.transList.forEach((filePath) => {
            if (minimatch(filePath, EXTNAME_JS)) {
                this.extractJS.addTask(filePath);
            } else if (minimatch(filePath, EXTNAME_HTML)) {
                this.extractHTML.addTask(filePath);
            } else {
                this.fileList.copyList.push(filePath);
            }
        });

        if (this.option.isTranslate) {
            this.copyFile();
        }

        // 将未翻译的文件以错误的形式输出
        // 将提取的词条文件，输出为excel
        return Promise.all([this.handleHtml(), this.handleJs()]).then((data) => {
            let sheetName = this.extractJS.option.onlyZH ? 'CN' : 'EN';

            if (this.option.isTranslate) {
                console.log(`翻译后的文件输出到路径【${this.option.baseWritePath}】下.`)
            } else if (!this.option.isCheckTrans) {
                this.outData.unshift(sheetName);
            }

            let outPath = path.join(this.option.baseWritePath, (this.option.isTranslate ? '未匹配的词条' : '提取词条') + `${sheetName}.xlsx`);

            if (this.outData.length > 0) {
                this.writeWordToExcel(outPath, sheetName);

                if (this.option.isTranslate || this.option.isCheckTrans) {
                    console.error(`还有部分词条未被翻译，见输出的Excel【${outPath}】`);
                }
            }
            //重置
            this.reset();
            return this.outData;
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
                log(`语言文件输出为[${outPath}]`);
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
        if (minimatch(filePath, EXCLUDE_FILE) || minimatch(filePath, EXCLUDE_FILE_END) || (!minimatch(filePath, EXTNAME_HTML) && !minimatch(filePath, EXTNAME_JS))) {
            if (this.option.isTranslate) {
                this.fileList.copyList.push(filePath);
            }
        } else {
            this.fileList.transList.push(filePath);
        }
    }
}

module.exports = ExtractFile;