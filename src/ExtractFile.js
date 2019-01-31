const path = require('path');
const fs = require('fs');
const minimatch = require("minimatch");
const {
    EXCLUDE_FILE,
    EXCLUDE_FILE_END,
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
            CONFIG_HONG: {},
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

        this.init();
    }

    init() {
        this.extractHTML = new ExtractHTML({
            CONFIG_HONG: this.option.CONFIG_HONG,
            onlyZH: this.option.onlyZH,
            transWords: this.option.transWords,
            isTranslate: this.option.isTranslate,
            baseWritePath: this.option.baseWritePath,
            baseReadPath: this.option.baseReadPath,
            // 词条提取完成后的操作
            onComplete: (filePath, words) => {
                if (words.length > 0) {
                    this.outData.push([correctPath(filePath)]);
                    this.outData = this.outData.concat(words);
                }
            }
        });

        this.extractJS = new ExtractJS({
            CONFIG_HONG: this.option.CONFIG_HONG,
            onlyZH: this.option.onlyZH,
            transWords: this.option.transWords,
            isTranslate: this.option.isTranslate,
            baseWritePath: this.option.baseWritePath,
            baseReadPath: this.option.baseReadPath,
            // 词条提取完成后的操作
            onComplete: (filePath, words) => {
                if (words.length > 0) {
                    this.outData.push([correctPath(filePath)]);
                    this.outData = this.outData.concat(words);
                }
            }
        });
    }

    scanFile() {
        if (fs.lstatSync(this.option.baseReadPath).isDirectory()) {
            this.getFileList();
        } else {
            this.fileList.transList.push(this.option.baseReadPath);
        }

        this.fileList.transList.forEach((filePath) => {
            if (path.extname(filePath) === '.js') {
                // todo by xc js文件解析
                this.extractJS.addTask(filePath);
            } else {
                // this.handleHtml(filePath);
                this.extractHTML.addTask(filePath);
            }
        });

        if (this.option.isTranslate) {
            this.copyFile();
        }

        // 将未翻译的文件以错误的形式输出
        // 将提取的词条文件，输出为excel
        Promise.all([this.handleHtml(), this.handleJs()]).then((data) => {
            let sheetName = this.option.onlyZH ? 'CN' : 'EN';
            this.outData.unshift(sheetName);
            let outPath = path.join(this.option.baseWritePath, (this.option.isTranslate ? '未匹配的词条' : '词条') + `${sheetName}.xlsx`);
            this.writeWordToExcel(outPath, sheetName);
            //重置
            this.reset();
        });
    }

    writeWordToExcel(outPath, sheetName) {
        writeExcel(this.outData, outPath, sheetName)
            .then(() => {
                log(`语言文件输出为[${outPath}]`);
            })
            .catch(error => {
                log(error.message, LOG_TYPE.error);
                let outPath = path.join(this.option.baseWritePath, (this.option.isTranslate ? '未匹配的词条' : '词条') + `${new Date().getTime()}.xlsx`);
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
            if (minimatch(val, EXCLUDE_FILE) || minimatch(val, EXCLUDE_FILE_END)) {
                if (this.option.isTranslate) {
                    this.fileList.copyList.push(val);
                }
            } else {
                this.fileList.transList.push(val);
            }
        });
    }
}

module.exports = ExtractFile;