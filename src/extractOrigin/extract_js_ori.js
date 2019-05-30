import { parse } from 'babylon';
import generate from 'babel-generator';
import Extract from './extract';
import { TRANS_NAME_REGEX } from '../util/config';
import { getType } from '../util/index';
var htmlparser = require("htmlparser2");

/**
 * JS文件解析类
 */
class ExtractJs extends Extract {
    constructor(option) {
        super(option);
        this.isAST = true;
        this.tempNodes = [];
        this.oldCode = '';
        this.newCode = '';
        this.offSet = 0;
    }

    transNode(jsDoc) {
        this.newCode = jsDoc;
        // 修正原厂代码中的语法错误项，默认语法错误项是不需要进行提取的项
        this.oldCode = jsDoc = this.correctCode(jsDoc);

        if (this.oldCode.length !== this.newCode.length) {
            return Promise.resolve(this.newCode);
        }

        return new Promise((resolve, reject) => {
            try {
                let AST = parse(jsDoc, {
                    sourceType: 'module'
                });
                resolve(AST);
            } catch (err) {
                this.isAST = false;
                let AST = jsDoc;
                // todo by xc 输出有语法错误的文件，则不对该文件进行提取
                resolve(AST);
            }
        });
    }

    // 扫描节点，提取字段
    scanNode(AST, jsDoc) {
        return new Promise((resolve, reject) => {
            let body = AST.program.body;
            body.forEach(node => {
                this.listAst(node);
            });

            // let data = this.newCode;
            // data = unescape(data.replace(/\\u/g, '%u'));
            resolve(this.newCode);
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
        switch (node.type) {
            case 'CallExpression':
                if (node.callee) {
                    let name = '';
                    if (node.callee.type === 'Identifier') {
                        name = node.callee.name;
                    } else {
                        name = this.oldCode.substring(node.callee.start, node.callee.end);
                    }
                    if (/^(alert|document\.write)$/i.test(name)) {
                        //    解析表达式的值，并且重写函数
                        if (node.arguments.length === 1) {
                            this.addCallTrans(node.arguments);
                        }
                    } else {
                        for (let key in node) {
                            this.listAst(node[key]);
                        }
                    }
                }
                break;
            case 'StringLiteral':
                this.addStringTrans(node);
                break;
        }
    }

    // 给源码中的文本添加翻译函数
    addStringTrans(node) {
        let htmlAst = htmlparser.parseDOM(node.value);
        if (htmlAst.length > 1) {
            // 解析html
            res = this.analyseHtmlNode(htmlAst, arr);
        } else {
            res = `_("${res.replace(/"/g, '\\"')}")`;
        }
        this.addTrans(res, { start: node.start, end: node.end });
    }

    // 替换源码中的文本
    addTrans(val, loc) {
        this.newCode = this.newCode.splice(loc.start + this.offSet, loc.end + this.offSet, val);
        this.offSet = val.length - (loc.end - loc.start);
    }

    // 给源码中的表达式添加翻译函数
    addCallTrans(node) {
        switch (node.type) {
            case 'BinaryExpression':
                // 遍历参数
                let res, arr = [];
                res = this.analyseBinarry(arr);
                let htmlAst = htmlparser.parseDOM(res);
                if (htmlAst.length > 1) {
                    // 解析html
                    res = this.analyseHtmlNode(htmlAst, arr);
                } else {
                    // todo by xc 添加到文件中去
                    arr = arr.length > 0 ? `, [${arr.join(',')}]` : '';
                    res = `_("${val.replace(/"/g, '\\"')}"${arr})`;
                }
                this.addTrans(res, { start: node.start, end: node.end });
                break;
            case 'StringLiteral':
                this.addStringTrans(node);
                break;
        }
    }

    analyseBinarry(node, args) {
        let res = '',
            right, left = node.left;
        if (right = node.right) {

            if (right.type === StringLiteral) {
                res = right.value + res;
            } else {
                args.unshift(this.oldCode.substring(right.start, right.end));
                res = '{%s}' + res;
            }
        }

        switch (left.type) {
            case 'BinaryExpression':
                res += this.analyseBinarry(left, args);
                break;
            case 'StringLiteral':
                res = left.value + res;
                break;
            default:
                // 默认当做参数进行处理
                args.push(this.oldCode.substring(left.start, left.end));
                res = '{%s}' + res;
                break;
        }
        return res;
    }

    // 解析html节点元素，生成对应的代码，此处解析的字符串htmlAst为将参数替换为{%s}后的ast
    analyseHtmlNode(ast, args) {
        let res = '';
        ast.forEach(item => {
            if (item.children) {
                let nodeHtml = `${item.type}`;
                for (let key in item.attribs) {
                    let attr = item.attribs.replace(/\{%\}/g, function() {
                        return `"+ ${args.shift()} +"`;
                    });

                    nodeHtml += ` ${key}="${attr}"`
                }
                if (item.type === 'input') {
                    nodeHtml += '/>';
                } else {
                    nodeHtml += '>';
                    nodeHtml += this.analyseHtmlNode(item.children, args);
                    nodeHtml += `</${item.type}>`;
                }
                res += nodeHtml;
            } else {
                res += this.analyseHtmlText(item);
            }
        });
        return res;
    }

    // 解析html文本元素，生成对应的代码
    analyseHtmlText(node, args) {
        let val = this.getWord(node.data);
        if (val) {
            let match = 0;
            val = val.replace(/\{%\}/g, function() {
                match++;
                return '%s';
            });

            if (match) {
                return `+ _("${val.replace(/"/g, '\\"')}",[${args.splice(0, match)}])`;
            } else {
                return `+ _("${val.replace(/"/g, '\\"')}")`;
            }
        } else {
            return node.data;
        }
    }

    listAst(astNode) {
        let type = getType(astNode);
        if (type === 'Object') {
            if (/^(CallExpression|StringLiteral)$/i.test(astNode.type)) {
                this.listNode(astNode);
                return;
            }
            // 对于注释的项不进行遍历
            let ignoreKeys = ['leadingComments', 'trailingComments', 'sourceElements', 'loc', 'test', 'id'];
            for (let key in astNode) {
                if (ignoreKeys.includes(key)) {
                    continue;
                }
                this.listAst(astNode[key]);
            }
        } else if (type === 'Array') {
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

    correctCode(str) {
        return str.replace(this.option.ignoreCode, function(match) {
            if (match.length >= 4) {
                return `/*${match.slice(2,-2)}*/`
            } else {
                return Math.pow(10, match.length - 1) + '';
            }
        }).replace(this.option.ignoreExp, function(match) {
            return new Array(match.length).join(' ') + 1;
        });
    }
}

String.prototype.splice = function(start, end, newStr) {
    return this.slice(0, start) + newStr + this.slice(end);
};


export default ExtractJs;