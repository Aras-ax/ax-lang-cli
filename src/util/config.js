const path = require('path');
const fs = require('fs');

const { getDirname } = require('./index');

/**
 * 不同消息不同的log打印
 */
const LOG_TYPE = {
    warn: 1,
    error: 2,
    log: 3
};

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

const validate = {
    filePath(val) {
        if (path.extname(val) === '' || validate.folder(val) !== true) {
            return '请输入有效的文件地址'
        }

        return true;
    },
    specialfile(val) {
        if (val === '' || val === undefined) {
            return true;
        }

        return validate.filePath(val);
    },
    folder(val) {
        if (!path.isAbsolute(val)) {
            val = path.join(process.cwd(), val);
        }

        if (!fs.existsSync(val)) {
            return '请输入有效的地址'
        }
        return true;
    },
    specialFolder(val) {
        if (val === '' || val === undefined) {
            return true;
        }

        return validate.folder(val);
    },
    required(val) {
        if (!!val) {
            return true;
        }
        return '必填'
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
            message: '待提取文件地址',
            validate: validate.folder
        }, {
            type: 'input',
            name: 'baseOutPath',
            message: '提取的Excel文件输出地址',
            validate: validate.specialFolder,
            default (answers) {
                return getDirname(answers.baseReadPath);
            }
        }, {
            type: 'input',
            name: 'hongPath',
            message: '宏文件地址',
            default: '',
            validate: validate.specialfile
        }],
        [{
            type: 'input',
            name: 'baseTranslatePath',
            message: '待翻译文件根目录',
            validate: validate.folder
        }, {
            type: 'input',
            name: 'baseTransOutPath',
            message: '翻译后文件输出根目录',
            validate: validate.specialFolder,
            default (answers) {
                return getDirname(answers.baseTransOutPath);
            }
        }, {
            type: 'input',
            name: 'languagePath',
            message: '语言包文件地址',
            validate: validate.filePath
        }, {
            type: 'input',
            name: 'hongPath',
            message: '宏文件地址',
            default: '',
            validate: validate.specialfile
        }, {
            type: 'input',
            name: 'keyName',
            message: 'key对应列',
            default: 'EN'
        }, {
            type: 'input',
            name: 'valueName',
            message: 'value对应列',
            default: 'ALL' // 空代表所有
        }, {
            type: 'input',
            name: 'sheetName',
            message: 'Excel中对应的sheet',
            default: ''
        }],
        [{
            type: 'input',
            name: 'baseCheckPath',
            message: '待检查文件根目录',
            validate: validate.folder
        }, {
            type: 'input',
            name: 'langJsonPath',
            message: '语言包json文件地址',
            validate: validate.filePath
        }, {
            type: 'input',
            name: 'hongPath',
            message: '宏文件地址',
            validate: validate.specialfile
        }, {
            type: 'input',
            name: 'logPath',
            message: '检查信息输出路径',
            validate: validate.specialFolder,
            default (answers) {
                return getDirname(answers.baseCheckPath);
            }
        }],
        [{
            type: 'input',
            name: 'keyName',
            message: 'key对应列',
            default: 'EN'
        }, {
            type: 'input',
            name: 'valueName',
            message: 'value对应列',
            default: 'ALL' // 空代表所有
        }, {
            type: 'input',
            name: 'sheetName',
            message: 'Excel中对应的sheet',
            default: ''
        }, {
            type: 'input',
            name: 'excelPath',
            message: 'Excel文件地址',
            validate: validate.filePath
        }, {
            type: 'input',
            name: 'outJsonPath',
            message: '输出json文件目录',
            validate: validate.specialFolder,
            default (answers) {
                return getDirname(answers.excelPath);
            }
        }],
        [{
            type: 'input',
            name: 'jsonPath',
            message: 'json文件地址',
            validate: validate.filePath
        }, {
            type: 'input',
            name: 'outExcelPath',
            message: '输出Excel文件目录',
            validate: validate.specialFolder,
            default (answers) {
                return getDirname(answers.jsonPath);
            }
        }],
        [{
            type: 'input',
            name: 'baseJsonPath',
            message: 'json文件地址',
            validate: validate.folder
        }, {
            type: 'input',
            name: 'outMergeJsonPath',
            message: '合并后输出的地址',
            validate: validate.specialFolder,
            default (answers) {
                return getDirname(answers.baseJsonPath);
            }
        }]
    ];

/**
 * 忽略文件正则
 */
const EXCLUDE_FILE = '**/{img,lang,b28,goform,cgi-bin,css}/**';
const EXCLUDE_FILE_END = '**/{img,lang,b28,goform,cgi-bin,*.css,*.scss,*.less,*.svn,*.json,*.git,*.min.js,*shiv.js,*respond.js,*shim.js}';

module.exports = {
    LOG_TYPE,
    EXCLUDE_FILE,
    EXCLUDE_FILE_END,
    COMMAD,
    COMMAD_TEXT,
    questions,
    validate,
    baseQuestions
};