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

    listAst(astNode) {
        let type = getType(astNode);
        if (type === 'Object') {
            if (/^(BinaryExpression|BinaryExpression)$/i.test(astNode.type)) {
                return;
            }

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
                            this.addCallTrans(node.arguments[0]);
                        }
                    } else {
                        // 对于字符串相关的表达式不进行提取
                        // for (let key in node) {
                        //     this.listAst(node[key]);
                        // }
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
        let res = this.getWord(node.value);
        if (!res) {
            return;
        }
        let htmlAst = htmlparser.parseDOM(res);

        if (htmlAst.length > 0) {
            if (htmlAst.length > 1 || htmlAst[0].type !== 'text') {
                // 解析html
                res = this.analyseDom(htmlAst, [], res);
            } else {
                res = `_("${res.replace(/"/g, '\\"')}")`;
            }
            this.addTrans(res, { start: node.start, end: node.end });
        }
    }

    // 替换源码中的文本
    addTrans(val, loc) {
        this.newCode = this.newCode.splice(loc.start + this.offSet, loc.end + this.offSet, val);
        this.offSet += val.length - (loc.end - loc.start);
    }

    // 给源码中的表达式添加翻译函数
    addCallTrans(node) {
        switch (node.type) {
            case 'BinaryExpression':
                // 遍历参数
                let res, arr = [],
                    args = '';
                res = this.analyseBinarry(node, arr);

                // 对于无string参与的表达式不进行翻译函数的添加
                if (!res.hasStr || !res.text) {
                    break;
                }

                res = res.text;
                let htmlAst = htmlparser.parseDOM(res);
                if (htmlAst.length > 1 || htmlAst[0].type !== 'text') {
                    // 解析html
                    res = this.analyseDom(htmlAst, arr, res);
                } else {
                    // 将标记还原
                    if (arr.length > 0) {
                        args = `, [${arr.join(',')}]`;
                        res = res.replace(/\{%s\}/g, () => '%s');
                    }
                    res = `_("${res.replace(/"/g, '\\"')}"${args})`;
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
            right,
            left = node.left,
            hasStr = false;

        if (right = node.right) {

            if (right.type === 'StringLiteral') {
                hasStr = true;
                res = right.value + res;
            } else {
                args.unshift(this.oldCode.substring(right.start, right.end));
                res = '{%s}' + res;
            }
        }

        switch (left.type) {
            case 'BinaryExpression':
                let innerRes = this.analyseBinarry(left, args);
                hasStr = hasStr || innerRes.hasStr;
                res = innerRes.text + res;
                break;
            case 'StringLiteral':
                hasStr = true;
                res = left.value + res;
                break;
            default:
                // 默认当做参数进行处理
                args.unshift(this.oldCode.substring(left.start, left.end));
                res = '{%s}' + res;
                break;
        }
        return {
            text: res,
            hasStr
        }
    }

    analyseDom(ast, args, nodeHtml) {
        let res = this.analyseHtmlNode(ast, args, nodeHtml.match(/<\/[0-9a-z]+?>/g) || []),
            text = res.text,
            isTranStart = res.isTranStart;

        if (!isTranStart) {
            text = '\'' + text;
        }

        if (res.isStrEnd) {
            text = text + '\'';
        }

        return text;
    }

    // 解析html节点元素，生成对应的代码，此处解析的字符串htmlAst为将参数替换为{%s}后的ast
    // <td><input type='text' id='vid{%s}' value='{%s}'></td>
    analyseHtmlNode(ast, args, endTags) {
        let res = '',
            isStrEnd = true;
        ast.forEach(item => {
            if (item.children) {
                let nodeHtml = `<${item.name}`;
                for (let key in item.attribs) {
                    let attr = item.attribs[key].replace(/\{%s\}/g, function() {
                        return `'+ ${args.shift()} + '`;
                    });

                    nodeHtml += ` ${key}="${attr}"`
                }
                if (item.name === 'input') {
                    nodeHtml += '/>';
                    isStrEnd = true;
                } else {
                    nodeHtml += '>';
                    let data = this.analyseHtmlNode(item.children, args, endTags);
                    let endTag = `</${item.name}>`;
                    data.isTranStart && (nodeHtml += '\' + ');
                    nodeHtml += data.text;
                    data.isStrEnd || (nodeHtml += ' + \'');
                    // nodeHtml += ;
                    if (endTags.length > 0) {
                        if (endTags[0] === endTag) {
                            endTags.shift();
                        }
                        nodeHtml += endTag;
                    }
                }
                res += nodeHtml;
                isStrEnd = true;
            } else {
                let data = this.analyseHtmlText(item, args);
                if (/^_/.test(data)) {
                    res += isStrEnd ? `' + ${data}` : ` + ${data}`;
                    isStrEnd = false;
                } else {
                    res += data;
                    isStrEnd = true;
                }
            }
        });

        return {
            isStrEnd,
            text: res,
            isTranStart: /^_/.test(res)
        };
    }

    // 解析html文本元素，生成对应的代码
    analyseHtmlText(node, args) {
        let val = this.getWord(node.data);
        if (val) {
            let match = 0;
            val = val.replace(/\{%s\}/g, function() {
                match++;
                return '%s';
            });

            if (match) {
                return `_("${val.replace(/"/g, '\\"')}", [${args.splice(0, match)}])`;
            } else {
                return `_("${val.replace(/"/g, '\\"')}")`;
            }
        } else {
            return node.data;
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