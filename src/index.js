import handle from './handle';
import { COMMAD, valid, questions, baseQuestions, COMMAD_TEXT, CONFIG_FILE_NAME, IGNORE_REGEXP } from './util/config';
import { getDirname, LOG_TYPE, log, string2Regexp } from './util/index';

import path from 'path';
import fs from 'fs';
import inquirer from 'inquirer';
import handleRequest from './cmd';

let cwd = process.cwd();
let configFilepath = path.join(cwd, CONFIG_FILE_NAME);

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
                outMergeJsonPath: args.dest,
                action: args.action || 1
            };
            console.log(config);
            break;
        case COMMAD.ORIGINAL_CODE:
            config = {
                commandType: 6,
                baseProPath: args.from,
                baseProOutPath: args.to,
                ignoreCode: args.code,
                ignoreExp: args.exp
            };
            console.log(config);
            break;
    }
    return config;
}

function main(config) {
    if (config || fs.existsSync(configFilepath)) {
        log('读取配置···');
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
        log('请选择您需要使用的功能！', LOG_TYPE.WARNING);
        return getCfg();
    }

    log(`您已选择-${COMMAD_TEXT[cfg.commandType]}功能；`);

    fullPath(cfg);

    let error = validate[cfg.commandType](cfg);

    if (error) {
        log('参数配置错误，请重新配置！', LOG_TYPE.WARNING);

        return inquirer.prompt(questions[cfg.commandType]).then(answers => {
            answers.commandType = cfg.commandType;
            fullPath(answers);
            return answers;
        });
    }

    return Promise.resolve(cfg);
}

function fullPath(cfg) {
    let fullField = ['baseReadPath', 'baseOutPath', 'baseTranslatePath', 'baseTransOutPath', 'hongPath', 'languagePath', 'baseCheckPath', 'logPath', 'langJsonPath', 'excelPath', 'outJsonPath', 'jsonPath', 'outExcelPath', 'mainJsonPath', 'mergeJsonPath', 'outMergeJsonPath', 'baseProPath', 'baseProOutPath'];

    // 将相对地址转为绝对地址
    fullField.forEach(field => {
        let val = cfg[field] || '';
        val = val.replace(/(^\s*)|(\s*$)/g, '');
        if (val == '') {
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
    },
    6: function(cfg) {
        if (valid.folder(cfg.baseProPath) !== true) {
            return true;
        }

        // 为空的处理
        cfg.baseProOutPath = cfg.baseProOutPath || getDirname(cfg.baseProPath);
    }
}

function start(config) {
    if (process.argv.length === 3 && !(config && config.debug)) {
        handleRequest(process.argv[2]);
        return;
    }

    config = config || gerArgs();
    return main(config).then(data => {
        return handle(data);
    });
}

export default start;