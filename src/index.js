const handle = require('./handle');
const { COMMAD, valid, questions, baseQuestions, COMMAD_TEXT } = require('./util/config');
const { getDirname } = require('./util/index');

const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');

let cwd = process.cwd();
let configFilepath = path.join(cwd, 'b281.config.js');

//将命令和参数分离

function gerArgs() {
    let args = require('./util/getOption')(process.argv.splice(2)),
        config;

    switch (+args.type) {
        case COMMAD.GET_WORDS:
            config = {
                commandType: 0,
                onlyZH: args.zh,
                baseReadPath: args.from,
                baseOutPath: args.to,
                hongPath: args.hong
            };
            break;
        case COMMAD.TRANSLATE:
            config = {
                commandType: 1,
                baseTranslatePath: args.from,
                baseTransOutPath: args.to,
                languagePath: args.lang,
                hongPath: args.hong,
                keyName: '',
                valueName: '',
                sheetName: ''
            };
            break;
        case COMMAD.CHECK_TRANSLATE:
            config = {
                commandType: 2,
                baseCheckPath: args.from,
                langJsonPath: args.lang,
                hongPath: args.hong,
                logPath: args.to
            };
            break;
        case COMMAD.EXCEL_TO_JSON:
            config = {
                commandType: 3,
                keyName: args.key,
                valueName: args.value,
                sheetName: args.sheet,
                excelPath: args.from,
                outJsonPath: args.to
            };
            break;
        case COMMAD.JSON_TO_EXCEL:
            config = {
                commandType: 4,
                jsonPath: args.from,
                outExcelPath: args.to
            };
            break;
        case COMMAD.MERGE_JSON:
            config = {
                commandType: 5,
                mainJsonPath: args.src1,
                mergeJsonPath: args.src2,
                outMergeJsonPath: args.dest
            };
            break;
    }
    return config;
}

function main(config) {
    if (config || fs.existsSync(configFilepath)) {
        console.log('读取配置···');
        config = config || require(configFilepath);
        return correctCfg(config);
    } else {
        return getCfg();
    }
}

function getCfg() {
    let type = 0;
    return inquirer.prompt(baseQuestions)
        .then(answers => {
            type = answers.commandType;
            return inquirer.prompt(questions[type]);
        })
        .then(answers => {
            answers.commandType = type;
            fullPath(answers);
            return answers;
        });
}

/**
 * 验证和修正所有配置参数
 */
function correctCfg(cfg) {
    if (cfg.commandType === undefined || cfg.commandType === '') {
        console.error('请选择您需要使用的功能！');
        return getCfg();
    }

    console.log(`您已选择[${COMMAD_TEXT[cfg.commandType]}]功能；`);

    fullPath(cfg);

    let error = validate[cfg.commandType](cfg);

    if (error) {
        console.error('参数配置错误，请重新配置：');

        return inquirer.prompt(questions[cfg.commandType]).then(answers => {
            answers.commandType = cfg.commandType;
            fullPath(answers);
            return answers;
        });
    }

    return Promise.resolve(cfg);
}

function fullPath(cfg) {
    let fullField = ['baseReadPath', 'baseOutPath', 'baseTranslatePath', 'baseTransOutPath', 'hongPath', 'languagePath', 'baseCheckPath', 'logPath', 'langJsonPath', 'excelPath', 'outJsonPath', 'jsonPath', 'outExcelPath', 'mainJsonPath', 'mergeJsonPath', 'outMergeJsonPath'];

    // 将相对地址转为绝对地址
    fullField.forEach(field => {
        let val = cfg[field];
        if (val == '' || val === undefined) {
            return true;
        }

        if (!path.isAbsolute(val)) {
            cfg[field] = path.resolve(cwd, val);
        }
    });
}

let validate = {
    0: function(cfg) {
        if (valid.folder(cfg.baseReadPath) !== true) {
            return true;
        }

        // 为空的处理
        cfg.baseOutPath = cfg.baseOutPath || getDirname(cfg.baseReadPath);
    },
    1: function(cfg) {
        if (valid.folder(cfg.baseTranslatePath) !== true) {
            return true;
        }

        cfg.baseTransOutPath = cfg.baseTransOutPath || getDirname(cfg.baseTranslatePath);

        if (valid.specialfile(cfg.hongPath) !== true) {
            return true;
        }

        if (valid.existFile(cfg.languagePath) !== true) {
            return true;
        }

        if (path.extname(cfg.languagePath) !== '.json') {
            cfg.keyName = cfg.keyName || 'EN';
            cfg.valueName = cfg.valueName || 'CN';
        }
    },
    2: function(cfg) {
        if (valid.folder(cfg.baseCheckPath) !== true) {
            return true;
        }

        cfg.logPath = cfg.logPath || getDirname(cfg.baseCheckPath);

        if (valid.specialfile(cfg.hongPath) !== true) {
            return true;
        }

        if (valid.existFile(cfg.langJsonPath) !== true) {
            return true;
        }
    },
    3: function(cfg) {
        cfg.keyName = cfg.keyName || 'EN';
        if (valid.existFile(cfg.excelPath) !== true) {
            return true;
        }
        cfg.outJsonPath = cfg.outJsonPath || getDirname(cfg.excelPath);
    },
    4: function(cfg) {
        if (valid.existFile(cfg.jsonPath) !== true) {
            return true;
        }
        cfg.outExcelPath = cfg.outExcelPath || getDirname(cfg.jsonPath);
    },
    5: function(cfg) {
        if (valid.existFile(cfg.mainJsonPath) !== true) {
            return true;
        }
        if (valid.existFile(cfg.mergeJsonPath) !== true) {
            return true;
        }
        cfg.outMergeJsonPath = cfg.outMergeJsonPath || getDirname(cfg.mainJsonPath);
    }
}

function start(config) {
    config = config || gerArgs();

    return main(config).then(data => {
        return handle(data);
    });
}

module.exports = start;