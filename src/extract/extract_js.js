const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require('escodegen');

const {
    log,
    loadFile,
    trim
} = require('../util/index');
const {
    LOG_TYPE
} = require('../util/config');

const Extract = require('./extract');

/**
 * JS文件解析类
 */
class ExtractJs extends Extract {
    constructor(option) {
        super(option);
    }

    transNode(jsDoc) {
        return new Promise((resolve, reject) => {
            try {
                let AST = esprima.parseModule(jsDoc, {
                    attachComment: true
                });
                resolve(AST);
            } catch (err) {
                let AST = esprima.parseScript(jsDoc, {
                    attachComment: true
                });
                resolve(AST);
            }
        });
    }

    // 扫描节点，提取字段
    scanNode(AST) {
        let body = AST.body;
        body.forEach(node => {
            this.listAst(node);
        });
        //返回数据
        return Promise.resolve(escodegen.generate(AST));
    }

    getValue(nodeArgs) {
        if (nodeArgs) {
            if (nodeArgs.value !== undefined) {
                return nodeArgs.value;
            }

            let value = '',
                left = nodeArgs.left;

            while (left.right) {
                value += left.right.value;
                left = left.left;
            }

            value = left.value + value + (nodeArgs.right ? nodeArgs.right.value : '');
            return value;
        }
        return '';
    }

    listNode(node) {
        let curValue = '',
            oldVal = '';
        switch (node.type) {
            case 'CallExpression':
                if (node.callee && node.callee.name === '_') {
                    oldVal = this.getValue(node.arguments[0]);
                    curValue = this.getWord(oldVal);
                    if (curValue && node.arguments[0]['value']) {
                        node.arguments[0]['value'] = curValue;
                        // node.arguments[0]['raw'] = node.arguments[0]['raw'].replace(oldVal, curValue);
                    }
                    return;
                }
                for (let key in node) {
                    this.listAst(node[key]);
                }
                break;
            case 'FunctionDeclaration':
                let bodyList = node.body.body;
                bodyList.forEach(item => {
                    this.listAst(item);
                });
                break;
        }
    }

    listAst(astNode) {
        let type = Object.prototype.toString.call(astNode);
        if (type === '[object Object]') {
            // 根据宏判断是否需要进行提取
            if (astNode.leadingComments && astNode.trailingComments) {
                // 代码开头注释的最后一项和代码结束的第一项注释必须一样才表明是宏控制的功能
                let startComment = astNode.leadingComments[astNode.leadingComments.length - 1]['value'],
                    endComments = astNode.trailingComments[0]['value'];
                startComment = startComment.replace(/^\s*|\s*$/g, '');
                endComments = endComments.replace(/^\s*|\s*$/g, '');
                // 若设置了宏且对应的值为false，则不进行该功能块的提取
                if (startComment === endComments && this.CONFIG_HONG[startComment] === false) {
                    return;
                }
            }
            if (astNode.type === 'CallExpression') {
                this.listNode(astNode);
                return;
            }
            // 对于注释的项不进行遍历
            let ignoreKeys = ['leadingComments', 'trailingComments'];
            for (let key in astNode) {
                if (ignoreKeys.includes(key)) {
                    continue;
                }
                this.listAst(astNode[key]);
            }
        } else if (type === '[object Array]') {
            astNode.forEach(node => {
                this.listAst(node);
            })
        }
    }
}

module.exports = ExtractJs;