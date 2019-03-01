const esprima = require('esprima');
const escodegen = require('escodegen');

const Extract = require('./extract');
const { TRANS_NAME_REGEX } = require('../util/config');

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
                    attachComment: true,
                    // comment: true,
                    loc: true
                    // range: true,
                    // tokens: true
                });
                resolve(AST, jsDoc);
            } catch (err) {
                let AST = esprima.parseScript(jsDoc, {
                    attachComment: true,
                    // comment: true,
                    range: true,
                    // tokens: true
                });
                resolve(AST, jsDoc);
            }
        });
    }

    // 扫描节点，提取字段
    scanNode(AST, jsDoc) {
        return new Promise((resolve, reject) => {
            let body = AST.body;
            this.nearComment = '';
            body.forEach(node => {
                this.listAst(node);
            });
            // AST = escodegen.attachComments(AST, AST.comments, AST.tokens);

            let data = escodegen.generate(AST, {
                comment: true,
                format: {
                    indent: {
                        adjustMultilineComment: false
                    },
                    quotes: 'auto',
                    hexadecimal: true
                },
                sourceContent: jsDoc
            });
            data = unescape(data.replace(/\\u/g, '%u'));
            resolve(data);
        });
    }

    getValue(nodeArgs) {
        if (nodeArgs) {
            if (nodeArgs.value !== undefined) {
                return nodeArgs.value;
            }

            let value = '',
                left = nodeArgs.left;

            while (left && left.right) {
                value += left.right.value;
                left = left.left;
            }

            value = (left ? left.value : '') + value + (nodeArgs.right ? nodeArgs.right.value : '');
            return value;
        }
        return '';
    }

    listNode(node) {
        let curValue = '',
            oldVal = '';
        switch (node.type) {
            case 'CallExpression':
                if (node.callee && TRANS_NAME_REGEX.test(node.callee.name)) {
                    oldVal = this.getValue(node.arguments[0]);
                    curValue = this.getWord(oldVal, true);
                    if (curValue && node.arguments[0]['value']) {
                        node.arguments[0]['value'] = curValue;
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
            // 移除底部的注释，以免重复
            if (astNode.leadingComments && this.nearComment === astNode.leadingComments[0]) {
                astNode.leadingComments.shift();
            }

            try {
                if (astNode.trailingComments && astNode.loc.start.line === astNode.trailingComments[0].loc.start.line) {
                    astNode.trailingComments.length = 1;
                    this.nearComment = astNode.trailingComments[0];
                } else {
                    delete astNode.trailingComments;
                }
            } catch (e) {
                delete astNode.trailingComments;
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