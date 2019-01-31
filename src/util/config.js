/**
 * 不同消息不同的log打印
 */
const LOG_TYPE = {
    warn: 1,
    error: 2,
    log: 3
};

/**
 * 忽略文件正则
 */
const EXCLUDE_FILE = '**/{img,lang,b28,goform,cgi-bin,css}/**';
const EXCLUDE_FILE_END = '**/{img,lang,b28,goform,cgi-bin,*.css,*.scss,*.less,*.svn,*.json,*.git,*.min.js,*shiv.js,*respond.js,*shim.js}';

module.exports = {
    LOG_TYPE,
    EXCLUDE_FILE,
    EXCLUDE_FILE_END
};