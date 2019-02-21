/**
 * 不同消息不同的log打印
 */
const LOG_TYPE = {
    warn: 1,
    error: 2,
    log: 3
};

const COMMAD = {
    GET_WORDS: 1,
    TRANSLATE: 2,
    CHECK_TRANSLATE: 3,
    EXCEL_TO_JSON: 4,
    JSON_TO_EXCEL: 5,
    MERGE_JSON: 6
};

const questions = [{
        type: "input",
        name: "sender.email",
        message: "Sender's email address - "
    },
    {
        type: "input",
        name: "sender.name",
        message: "Sender's name - "
    },
    {
        type: "input",
        name: "subject",
        message: "Subject - "
    }
]

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
    questions
};