import { parse } from "babylon";
import generate from "babel-generator";
import Extract from "./extract";
import { TRANS_NAME_REGEX } from "../util/config";
import { log, LOG_TYPE } from "../util/index";
import { getType } from "../util/index";
var htmlparser = require("htmlparser2");
const HANDLE_ATTRIBUTE = ["alt", "placeholder", "title"];

/**
 * JS文件解析类
 */
class ExtractJs extends Extract {
  constructor(option) {
    super(option);
    this.isAST = true;
    this.tempNodes = [];
    this.oldCode = "";
    this.newCode = "";
    this.offSet = 0;
  }

  transNode(jsDoc, fromHtml) {
    this.fromHtml = !!fromHtml;
    this.newCode = jsDoc;
    // 修正原厂代码中的语法错误项，默认语法错误项是不需要进行提取的项
    this.oldCode = jsDoc = this.correctCode(jsDoc);

    if (this.oldCode.length !== this.newCode.length) {
      return Promise.resolve(this.newCode);
    }

    return new Promise((resolve, reject) => {
      try {
        let AST = parse(jsDoc, {
          sourceType: "script"
        });
        resolve(AST);
      } catch (err) {
        let AST = parse(jsDoc, {
          sourceType: "module"
        });

        resolve(AST);
      }
    }).catch((err) => {
      this.fromHtml
        ? log(`内联JS处理出错- ${err}`, LOG_TYPE.ERROR)
        : log(
            "js代码包含语法错误，故无法添加翻译函数！" + err.message,
            LOG_TYPE.ERROR
          );
    });
  }

  // 扫描节点，提取字段
  scanNode(AST) {
    this.offSet = 0;
    return new Promise((resolve, reject) => {
      let body = AST.program.body;
      body.forEach((node) => {
        this.listAst(node);
      });

      if (this.fromHtml) {
        this.newCode = this.newCode.replace(/\(\[([^\n]*?)\]\)/g, function (
          match,
          val
        ) {
          return `<%${val}%>`;
        });
      }
      resolve(this.newCode);
    });
  }

  getValue(nodeArgs) {
    if (nodeArgs) {
      if (nodeArgs.value !== undefined) {
        return nodeArgs.value;
      }

      let value = "",
        left = nodeArgs.left;

      while (left && left.right) {
        value += left.right.value;
        left = left.left;
      }

      value =
        (left ? left.value : "") +
        value +
        (nodeArgs.right ? nodeArgs.right.value : "");
      return value;
    }
    return "";
  }

  listAst(astNode) {
    let type = getType(astNode);
    if (type === "Object") {
      if (/^(BinaryExpression|BinaryExpression)$/i.test(astNode.type)) {
        return;
      }

      if (/^(CallExpression|StringLiteral)$/i.test(astNode.type)) {
        this.listNode(astNode);
        return;
      }
      // 对于注释的项不进行遍历
      let ignoreKeys = [
        "leadingComments",
        "trailingComments",
        "sourceElements",
        "loc",
        "id"
      ];
      for (let key in astNode) {
        if (ignoreKeys.includes(key)) {
          continue;
        }
        this.listAst(astNode[key]);
      }
    } else if (type === "Array") {
      astNode.forEach((node) => {
        this.listAst(node);
      });
    }
  }

  listNode(node) {
    switch (node.type) {
      case "CallExpression":
        if (node.callee) {
          let name = "";
          if (node.callee.type === "Identifier") {
            name = node.callee.name;
          } else {
            name = this.oldCode.substring(node.callee.start, node.callee.end);
          }
          if (/^(confirm|alert|document\.write(ln)?)$/i.test(name)) {
            //    解析表达式的值，并且重写函数
            if (node.arguments.length === 1) {
              this.addCallTrans(node.arguments[0]);
            }
          } else {
            // 对于字符串相关的表达式不进行提取
          }
        }
        break;
      case "StringLiteral":
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
      if (htmlAst.length > 1 || htmlAst[0].type !== "text") {
        // 解析html
        res = this.analyseDom(htmlAst, [], res);
      } else {
        res = `_('${res.replace(/'/g, "\\")}')`;
      }
      this.addTrans(res, { start: node.start, end: node.end });
    }
  }

  // 替换源码中的文本
  addTrans(val, loc) {
    //去除无效的表达式
    val = val
      .replace(/'[\s]*' \+ /g, "")
      .replace(/\+ '[\s]*'/g, "")
      .replace(/^\s+|\s+$/g, "");

    this.newCode = this.newCode.splice(
      loc.start + this.offSet,
      loc.end + this.offSet,
      val
    );
    this.offSet += val.length - (loc.end - loc.start);
  }

  // 给源码中的表达式添加翻译函数
  addCallTrans(node) {
    switch (node.type) {
      case "BinaryExpression":
        // 遍历参数
        let res,
          arr = [],
          args = "";
        res = this.analyseBinarry(node, arr);

        // 对于无string参与的表达式不进行翻译函数的添加
        if (!res.hasStr || !res.text) {
          break;
        }

        res = res.text;
        let htmlAst = htmlparser.parseDOM(res);
        if (htmlAst.length > 1 || htmlAst[0].type !== "text") {
          // 解析html
          res = this.analyseDom(htmlAst, arr, res);
        } else {
          // 将标记还原
          if (arr.length > 0) {
            args = `, [${arr.join(", ")}]`;
            res = res.replace(/\{%s\}/g, () => "%s");
          }
          res = `_('${res.replace(/'/g, "\\")}'${args})`;
        }
        this.addTrans(res, { start: node.start, end: node.end });
        break;
      case "StringLiteral":
        this.addStringTrans(node);
        break;
    }
  }

  analyseBinarry(node, args) {
    let res = "",
      right,
      left = node.left,
      hasStr = false;

    if ((right = node.right)) {
      if (right.type === "StringLiteral") {
        hasStr = true;
        res = right.value.replace(/\n/, "\\n") + res;
      } else {
        args.unshift(this.oldCode.substring(right.start, right.end));
        res = "{%s}" + res;
      }
    }

    switch (left.type) {
      case "BinaryExpression":
        let innerRes = this.analyseBinarry(left, args);
        hasStr = hasStr || innerRes.hasStr;
        res = innerRes.text + res;
        break;
      case "StringLiteral":
        hasStr = true;
        res = left.value.replace(/\n/, "\\n") + res;
        break;
      default:
        // 默认当做参数进行处理
        args.unshift(this.oldCode.substring(left.start, left.end));
        res = "{%s}" + res;
        break;
    }
    return {
      text: res,
      hasStr
    };
  }

  analyseDom(ast, args, nodeHtml) {
    let res = this.analyseHtmlNode(
        ast,
        args,
        nodeHtml.toLowerCase().match(/<\/[a-z0-9]+?>/gi) || []
      ),
      text = res.text,
      isTranStart = res.isTranStart;

    if (!isTranStart) {
      text = "'" + text;
    }

    if (res.isStrEnd) {
      text = text + "'";
    }

    return text;
  }

  // 解析html节点元素，生成对应的代码，此处解析的字符串htmlAst为将参数替换为{%s}后的ast
  // <td><input type='text' id='vid{%s}' value='{%s}'></td>
  analyseHtmlNode(ast, args, endTags) {
    let res = "",
      isStrEnd = true;
    ast.forEach((item) => {
      if (item.children) {
        let nodeHtml = (isStrEnd ? "" : "+ '") + `<${item.name}`;
        for (let key in item.attribs) {
          let attr = item.attribs[key];
          if (/\{%s\}/g.test(attr)) {
            attr = attr.replace(/\{%s\}/g, function () {
              return `'+ ${args.shift()} + '`;
            });
          } else if (HANDLE_ATTRIBUTE.includes(key)) {
            // 处理input的value等属性
            attr = `'+ _('${attr.replace(/'/g, "'")}') + '`;
          } else if (
            key === "value" &&
            item.name === "input" &&
            /button|submit|reset/gi.test(item.attribs["type"])
          ) {
            attr = `'+ _('${attr.replace(/'/g, "'")}') + '`;
          }

          nodeHtml += attr ? ` ${key}="${attr}"` : ` ${key}`;
        }
        if (/^(input|br)$/i.test(item.name)) {
          nodeHtml += "/>";
          isStrEnd = true;
        } else {
          nodeHtml += ">";
          let data = this.analyseHtmlNode(item.children, args, endTags);
          let endTag = `</${item.name}>`;
          data.isTranStart && (nodeHtml += "' + ");
          nodeHtml += data.text;
          data.isStrEnd || (nodeHtml += " + '");
          // nodeHtml += ;
          if (endTags.length > 0) {
            if (endTags[0] === endTag) {
              endTags.shift();
            }
            nodeHtml += endTag;
          }
        }
        // 对于还有结余的标签全部补上
        while (endTags.length > 0) {
          nodeHtml += `${endTags.shift()}`;
        }
        res += nodeHtml;
        isStrEnd = true;
      } else {
        // 用于类似_(member[1])的词条不添加翻译
        if (/^\s*\{%s\}\s*$/.test(item.data)) {
          res += `'+ _(${args.shift()})`;
          isStrEnd = false;
        } else {
          let data = this.analyseHtmlText(item, args);
          if (data) {
            if (/^_/.test(data)) {
              res += isStrEnd ? `' + ${data}` : ` + ${data}`;
              isStrEnd = false;
            } else {
              res += data;
              isStrEnd = true;
            }
          }
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
    let val = this.getWord(node.data).replace(/^\s+|\s+$/g, "");
    if (val) {
      let match = 0;
      val = val.replace(/\{%s\}/gi, function () {
        match++;
        return "%s";
      });

      if (match) {
        return `_('${val.replace(/'/g, "\\")}', [${args.splice(0, match)}])`;
      } else {
        return `_('${val.replace(/'/g, "\\")}')`;
      }
    } else {
      // html中ignore文本同样需要翻译
      val = node.data.replace(/^\s+|\s+$/g, "");
      if (val && !/^(&nbsp;)+$/gi.test(val)) {
        return `_('${val.replace(/'/g, "\\")}')`;
      }
    }
    return node.data.replace(/^\s+|\s+$/g, "");
  }

  listTenpAst() {
    this.tempNodes.forEach((item) => {
      this.listAst(item);
    });
    this.tempNodes = [];
  }

  correctCode(str) {
    return str
      .replace(this.option.ignoreCode, function (match) {
        if (match.length >= 4) {
          return `/*${match.slice(2, -2)}*/`;
        } else {
          return Math.pow(10, match.length - 1) + "";
        }
      })
      .replace(this.option.templateExp, function (match, val) {
        return `([${val.replace(/;$/, " ")}])`;
      });
  }
}

export default ExtractJs;
