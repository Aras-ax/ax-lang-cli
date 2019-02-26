const path = require('path');
const fs = require('fs');

const { getDirname } = require('./index');

const CONFIG_FILE_NAME = 'b28.config.js';

const COMMAD = {
    /**
     * 提取词条
     */
    GET_WORDS: 0,
    /**
     * 翻译文件
     */
    TRANSLATE: 1,
    /**
     * 翻译检查
     */
    CHECK_TRANSLATE: 2,
    /**
     * Excel转JSON
     */
    EXCEL_TO_JSON: 3,
    /**
     * JSON转Excel
     */
    JSON_TO_EXCEL: 4,
    /**
     * JSON文件合并
     */
    MERGE_JSON: 5
};

const COMMAD_TEXT = ['提取词条', '翻译文件', '翻译检查', 'Excel转JSON', 'JSON转Excel', 'JSON合并'];

const valid = {
    // 空或者存在的地址
    specialfile(val) {
        val = val || '';
        val = val.replace(/(^\s*)|(\s*$)/g, '');
        if (val === '') {
            return true;
        }

        return valid.existFile(val);
    },
    folder(val) {
        val = val || '';
        val = val.replace(/(^\s*)|(\s*$)/g, '');
        if (val === '') {
            return '必填';
        }
        if (!path.isAbsolute(val)) {
            val = path.resolve(process.cwd(), val);
        }
        if (!fs.existsSync(val)) {
            return '请输入有效的地址'
        }
        return true;
    },
    // 存在的文件非文件夹
    existFile(val) {
        val = val || '';
        val = val.replace(/(^\s*)|(\s*$)/g, '');
        if (val === '') {
            return '必填';
        }

        if (!path.isAbsolute(val)) {
            val = path.resolve(process.cwd(), val);
        }
        if (path.extname(val) !== '' && !fs.existsSync(val)) {
            return '请输入有效的文件地址'
        }
        return true;
    }
}

const baseQuestions = [{
        type: "list",
        name: "commandType",
        message: "当前执行的操作是：",
        choices: COMMAD_TEXT,
        filter: function(val) {
            return COMMAD_TEXT.indexOf(val);
        }
    }],
    questions = [
        [{
            type: 'confirm',
            name: 'onlyZH',
            message: '只提取中文？'
        }, {
            type: 'input',
            name: 'baseReadPath',
            message: '待提取文件地址：',
            validate: valid.folder // 必填，可以是文件也可以是文件夹
        }, {
            type: 'input',
            name: 'baseOutPath',
            message: '提取的Excel文件输出地址：',
            default (answers) {
                return getDirname(answers.baseReadPath);
            }
        }, {
            type: 'input',
            name: 'hongPath',
            message: '宏文件地址：',
            default: '',
            validate: valid.specialfile
        }],
        [{
            type: 'input',
            name: 'baseTranslatePath',
            message: '待翻译文件根目录：',
            validate: valid.folder // 必填，可以是文件也可以是文件夹
        }, {
            type: 'input',
            name: 'baseTransOutPath',
            message: '翻译后文件输出根目录：',
            default (answers) {
                return getDirname(answers.baseTranslatePath);
            }
        }, {
            type: 'input',
            name: 'hongPath',
            message: '宏文件地址：',
            default: '',
            validate: valid.specialfile
        }, {
            type: 'input',
            name: 'languagePath',
            message: '语言包文件地址：',
            validate: valid.existFile
        }, {
            type: 'input',
            name: 'sheetName',
            message: 'Excel中对应的sheet：',
            default: '',
            when(answers) {
                return path.extname(answers.languagePath) !== '.json'
            }
        }, {
            type: 'input',
            name: 'keyName',
            message: 'key对应列：', //指代代码中的词条需要被那一列的数据替换
            default: 'EN',
            when(answers) {
                return path.extname(answers.languagePath) !== '.json'
            }
        }, {
            type: 'input',
            name: 'valueName',
            message: 'value对应列：', //指代代码中目前需要被替换的语言
            default: 'CN', // ALL代表所有
            when(answers) {
                return path.extname(answers.languagePath) !== '.json'
            }
        }],
        [{
            type: 'input',
            name: 'baseCheckPath',
            message: '待检查文件根目录：',
            validate: valid.folder
        }, {
            type: 'input',
            name: 'langJsonPath',
            message: '语言包json文件地址：',
            validate: valid.existFile
        }, {
            type: 'input',
            name: 'hongPath',
            message: '宏文件地址：',
            validate: valid.specialfile
        }, {
            type: 'input',
            name: 'logPath',
            message: '检查信息输出路径：',
            default (answers) {
                return getDirname(answers.baseCheckPath);
            }
        }],
        [{
            type: 'input',
            name: 'excelPath',
            message: 'Excel文件地址：',
            validate: valid.existFile
        }, {
            type: 'input',
            name: 'sheetName',
            message: 'Excel中对应的sheet：',
            default: ''
        }, {
            type: 'input',
            name: 'keyName',
            message: 'key对应列：',
            default: 'EN'
        }, {
            type: 'input',
            name: 'valueName',
            message: 'value对应列：',
            default: '' // ALL代表所有
        }, {
            type: 'input',
            name: 'outJsonPath',
            message: '输出json文件目录：',
            default (answers) {
                return getDirname(answers.excelPath);
            }
        }],
        [{
            type: 'input',
            name: 'jsonPath',
            message: 'json文件地址：',
            validate: valid.existFile
        }, {
            type: 'input',
            name: 'outExcelPath',
            message: '输出Excel文件目录：',
            default (answers) {
                return getDirname(answers.jsonPath);
            }
        }],
        [{
            type: 'input',
            name: 'mainJsonPath',
            message: '主json文件地址：',
            validate: valid.existFile
        }, {
            type: 'input',
            name: 'mergeJsonPath',
            message: '次json文件地址：',
            validate: valid.existFile
        }, {
            type: 'input',
            name: 'outMergeJsonPath',
            message: '合并后输出的地址：',
            default (answers) {
                return getDirname(answers.mainJsonPath);
            }
        }]
    ];

/**
 * 忽略文件正则
 */
const EXCLUDE_FILE = '**/{img,lang,b28,goform,cgi-bin,css}/**';
const EXCLUDE_FILE_END = '**/{img,lang,b28,goform,cgi-bin,*.min.js,*shiv.js,*respond.js,*shim.js}';
const EXTNAME_JS = '**/*.js';
const EXTNAME_HTML = '**/{*.aspx,*.asp,*.ejs,*.html,*.htm}';

module.exports = {
    EXCLUDE_FILE,
    EXCLUDE_FILE_END,
    CONFIG_FILE_NAME,
    COMMAD,
    COMMAD_TEXT,
    questions,
    valid,
    EXTNAME_HTML,
    EXTNAME_JS,
    baseQuestions
};