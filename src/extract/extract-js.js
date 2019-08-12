import { parse } from 'babylon';
import generate from 'babel-generator';
import Extract from './extract';
import { TRANS_NAME_REGEX } from '../util/config';
import { chineseRE } from './vue/util';
import { deepClone } from '../util/index';

const parseType = /^(CallExpression|StringLiteral)$/i;

/**
 * JS文件解析类
 */
class ExtractJs extends Extract {
    constructor(option) {
        super(option);
        this.leadingComment = '';
        this.tempNodes = [];
    }

    transNode(jsDoc) {
        return new Promise((resolve, reject) => {
            try {
                let AST = parse(jsDoc, {
                    sourceType: 'module',
                    plugins: [
                        "objectRestSpread"
                    ]
                });
                resolve(AST);
            } catch (err) {
                reject('文件转AST出错，无法转换！');
            }
        });
    }

    // 扫描节点，提取字段
    scanNode(AST, jsDoc) {
        return new Promise((resolve, reject) => {
            if (AST === 'none') {
                resolve(jsDoc);
                return;
            }
            let body = AST.program.body;
            body.forEach(node => {
                this.listAst(node);
            });

            let data = generate(AST, { /* options */ }, jsDoc).code;

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

    createFunAst(ast, word) {
        let stringAst = deepClone(ast);
        stringAst.value = word;
        ast.type = 'CallExpression';
        delete ast.value;
        delete ast.extra;
        ast.callee = {
            type: "Identifier",
            name: "_"
        };
        ast.arguments = [stringAst];
    }

    listNode(node) {
        let curValue = '',
            oldVal = '';
        switch (node.type) {
            case 'CallExpression':
                if (node.callee && TRANS_NAME_REGEX.test(node.callee.name)) {
                    // _(a ? '要翻译' : '也要翻译');
                    if (node.arguments.length > 0 && node.arguments[0].type === 'ConditionalExpression') {
                        this.listAst(node.arguments);
                    } else {
                        oldVal = this.getValue(node.arguments && node.arguments[0]);
                        curValue = this.getWord(oldVal, true);
                        if (curValue && node.arguments[0]['value']) {
                            node.arguments[0]['value'] = curValue;
                        }
                    }
                    break;
                }
                this.listAst(node.arguments);
                break;
            case 'StringLiteral':
                // 只处理中文
                oldVal = node.value;
                if (chineseRE.test(oldVal)) {
                    curValue = this.getWord(oldVal, true);
                    if (curValue) {
                        this.createFunAst(node, curValue);
                    }
                }
                break;
        }
    }

    listAst(astNode) {
        let type = Object.prototype.toString.call(astNode);
        if (type === '[object Object]') {
            // 根据宏判断是否需要进行提取
            let leadingComment = this.leadingComment;
            if (astNode.leadingComments) {
                leadingComment = astNode.leadingComments[astNode.leadingComments.length - 1]['value'].replace(/^\s*|\s*$/g, '');
                // 当且仅当宏为false时，才记录数据
                leadingComment = this.CONFIG_HONG[leadingComment] === false ? leadingComment : '';
                this.leadingComment = leadingComment;

                this.listTenpAst();
            }

            if (leadingComment) {
                // 若包含结束注释
                if (astNode.trailingComments) {
                    // 代码开头注释的最后一项和代码结束的第一项注释必须一样才表明是宏控制的功能
                    this.leadingComment = '';
                    let trailingComment = astNode.trailingComments[0]['value'].replace(/^\s*|\s*$/g, '');
                    //与开始注释一样，则表示需要过滤掉
                    if (leadingComment === trailingComment) {
                        this.tempNodes = [];
                        return;
                    } else {
                        this.listTenpAst();
                    }
                } else {
                    this.tempNodes.push(astNode);
                    return;
                }
            }

            // if (astNode.type === 'CallExpression') {
            if (parseType.test(astNode.type)) {
                this.listNode(astNode);
                return;
            }
            // ast中不需要进行遍历的属性
            let ignoreKeys = ['leadingComments', 'trailingComments', 'loc', 'key', 'Identifier', 'MemberExpression'];
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

    listTenpAst() {
        this.tempNodes.forEach(item => {
            this.listAst(item);
        });
        this.tempNodes = [];
    }
}

export default ExtractJs;