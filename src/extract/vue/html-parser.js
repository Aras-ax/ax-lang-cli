import { parse } from "babylon";
import { makeMap, unicodeRegExp, no, chineseRE } from "./util";

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// dom标签开始位置
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// dom开始标签结束或自闭和标签结束位置，
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being pased as HTML comment when inlined in page
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

// Special Elements (can contain anything)
export const isPlainTextElement = makeMap("script,style,textarea", true);
const reCache = {};

const decodingMap = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&amp;": "&",
  "&#10;": "\n",
  "&#9;": "\t",
  "&#39;": "'"
};
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;
const bindRE = /^:|^v-bind:/;

const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
const buildRegex = (delimiters, full) => {
  // $&: 插入匹配的子串
  const open = delimiters[0].replace(regexEscapeRE, "\\$&");
  const close = delimiters[1].replace(regexEscapeRE, "\\$&");
  const reg = open + "((?:.|\\n)+?)" + close;
  return new RegExp(full ? `^${reg}$` : reg, "g");
};

const ignoreRE = [];

/**
 * 解析字符串表达式
 */
export function parseText(
  text,
  delimiters // 纯文本插入分隔符。默认为["{{", "}}"]
) {
  // 根据自定义分隔符适配匹配正则
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return;
  }
  // 文本 + 命令
  const tokens = [];
  // 指定下一次匹配的起始索引
  let lastIndex = (tagRE.lastIndex = 0);
  let match, index;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index),
        start: lastIndex,
        end: index
      });
    }
    // tag token
    const exp = match[1].trim();
    tokens.push({
      value: exp,
      directive: true,
      start: index + delimiters[0].length,
      end: index + delimiters[0].length + exp.length
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex),
      start: lastIndex,
      end: text.length
    });
  }
  return tokens;
}

/**
 * 解析{{}}指令内部的表达式
 */
function parseExp(tocken, offset = 0) {
  let ast,
    start = tocken.start + offset;

  try {
    ast = parse(tocken.value, {
      sourceType: "module",
      plugins: ["objectRestSpread"]
    });
  } catch (err) {
    return [];
  }

  ast = ast.program.body;
  let tockens = [];
  ast.forEach(item => {
    // listAst(item, tockens);
    if (typeof item === "object" && item.type === "ExpressionStatement") {
      tockens.push(...parseOperation(item.expression));
    }
  });
  return tockens;

  function parseOperation(ast) {
    let tockens = [];
    switch (ast.type) {
      case "BinaryExpression":
        while (ast.right) {
          tockens.unshift(...parseOperation(ast.right));
          ast = ast.left;
        }
        tockens.unshift(...parseOperation(ast));
        break;
      case "StringLiteral":
        tockens.push({
          start: ast.start + start,
          end: ast.end + start,
          value: ast.value
        });
        break;
      case "CallExpression":
        if (ast.callee.name === "_") {
          // _('xxx')，arguments[0]为'xxx'，所以需要把两个引号的占位符去掉
          // todo by xc start索引计算有问题，整体向前了几个值
          if (
            ast.arguments.length > 0 &&
            ast.arguments[0].type === "StringLiteral"
          ) {
            tockens.push({
              isTrans: true,
              start: ast.arguments[0].start + 1 + start,
              end: ast.arguments[0].end - 1 + start,
              value: ast.arguments[0].value
            });
          }
        } else {
          tockens.push({
            start: ast.start + start,
            end: ast.end + start,
            isArg: true
          });
        }
        break;
      case "ConditionalExpression":
        tockens.push(...parseOperation(ast.consequent));
        tockens.push(...parseOperation(ast.alternate));
        break;
      default:
        // 其它情况就需要遍历了
        // for (let key in ast) {
        //     if (typeof ast[key] === 'object') {
        //         tockens.push(...parseOperation(ast[key]));
        //     }
        // }
        tockens.push({
          start: ast.start + start,
          end: ast.end + start,
          isArg: true
        });
    }
    return tockens;
  }
}

/**
 * 解析parseExp的结果，即{{}}模板表达式内的ast，提取词条
 */
function listModuleTockens(tockens, text) {
  let outData = {
    args: [],
    text: "",
    isTrans: false,
    trans: []
  };
  for (let i = 0, l = tockens.length; i < l; i++) {
    let tocken = tockens[i];

    // 如果文本中存在翻译函数，则直接处理翻译函数，其它文本忽略
    if (tocken.isTrans) {
      outData.isTrans = true;
      outData.trans.push({
        isTrans: true,
        start: tocken.start,
        end: tocken.end,
        value: tocken.value
      });
    } else {
      if (outData.isTrans) {
        continue;
      }
      if (tocken.isArg) {
        outData.args.push(text.slice(tocken.start, tocken.end));
        outData.text += "%s";
      } else {
        outData.text += tocken.value;
      }
    }
  }
  return outData;
}

// html 解析
function parseHTML(html, options) {
  let index = 0;
  let last, lastTag; //记录当前解析的标签名
  while (html) {
    last = html;
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf("<");

      // 如果textEnd不为0，则从html开始位置到textEnd位置都是文本
      if (textEnd === 0) {
        // Comment: 注释节点，前进
        if (comment.test(html)) {
          const commentEnd = html.indexOf("-->");

          if (commentEnd >= 0) {
            advance(commentEnd + 3);
            continue;
          }
        }

        // 条件注释，直接跳过
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf("]>");

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue;
          }
        }

        // Doctype申明，直接跳过
        const doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue;
        }

        // End tag:
        const endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          continue;
        }

        // Start tag:
        // 解析开始标签[<xxx]到开始标签结束标记[>或/>]之间的内容，输出match
        // 例如<div id="xx" :data1="data1"> 或者<input type="text"/>
        const startTagAttrs = parseStartTag();
        if (startTagAttrs) {
          if (startTagAttrs.length > 0) {
            options.start(startTagAttrs);
          }
          continue;
        }
      }

      // 从当前位置到 textEnd 位置都是文本
      let text, rest, next;
      if (textEnd >= 0) {
        // 从textEnd开始截取，包括textEnd
        rest = html.slice(textEnd);
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // 当从<开始的位置进行匹配，匹配不到注释、开始或结束标签时，将<归为text的一部分
          next = rest.indexOf("<", 1);
          if (next < 0) break;
          textEnd += next;
          rest = html.slice(textEnd);
        }
        // 截取整个文本，可能包括不是开始或结束标签或者注释标签的<
        text = html.substring(0, textEnd);
      }

      // 不存在<，则表示为纯文本
      if (textEnd < 0) {
        text = html;
      }

      // 截断文本，递归剩余的字符串
      if (text) {
        advance(text.length);
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index);
      }
    } else {
      // 处理script、style、textarea
      const stackedTag = lastTag.toLowerCase();
      const reStackedTag =
        reCache[stackedTag] ||
        (reCache[stackedTag] = new RegExp(
          "([\\s\\S]*?)(</" + stackedTag + "[^>]*>)",
          "i"
        ));
      const rest = html.replace(reStackedTag, function() {
        return "";
      });
      index += html.length - rest.length;
      html = rest;
    }

    if (html === last) {
      options.chars && options.chars(html);
      break;
    }
  }

  /**
   * 从位置index + n处开始截断html
   */
  function advance(n) {
    index += n;
    html = html.substring(n);
  }

  /**
   * 解析开始标签[<xxx]到结束标签[>或/>]的内容，输出match
   * 只记录需要处理的attr
   */
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      // html剔除匹配的html
      advance(start[0].length);
      let attrs = [],
        end,
        attr;
      // 当前html的起始位置不是一元标签结束标签，并且有设置html属性
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(dynamicArgAttribute) || html.match(attribute))
      ) {
        let start = index;
        advance(attr[0].length);
        let end = index;

        let name = attr[1],
          value = attr[3] || attr[4] || attr[5] || "";

        if (bindRE.test(name)) {
          attrs.push({
            name,
            value,
            start: start + attr[0].match(/^\s*/).length,
            end: end,
            directive: true
          });
        } else if (["placeholder", "title", "alt"].indexOf(name) !== -1) {
          attrs.push({
            name,
            value,
            start: start + attr[0].match(/^\s*/).length,
            end: end
          });
        }
      }

      if (end) {
        advance(end[0].length);
      }
      return attrs;
    }
  }
}
/**
 * html转AST，记录词条的位置信息
 */
function parseTemplate(template, target) {
  // vue {{}}分隔符
  let delimiters = target.option.delimiters || ["{{", "}}"];
  let langs = []; // 存储词条相关内容，供翻译的时候直接添加翻译函数

  function getWord(text) {
    return target.getWord(text);
  }
  global.template = template;

  parseHTML(template, {
    start(attrs) {
      let word = "";
      attrs.forEach(attr => {
        // 指令默认已添加翻译函数，未添加翻译函数代表不提取
        if (attr.directive) {
          // value的偏移量，计算value的ast时，start index需要偏移到value的起始位置
          let offset = template.slice(attr.start, attr.end).indexOf(attr.value);
          let tockens = parseExp(attr, offset);
          let outData = listModuleTockens(tockens, attr.value);
          // 对于v-bind指令，只有当指令内容包含翻译函数时才会进行处理，其它情况不进行处理
          if (outData.isTrans) {
            outData.trans.forEach(item => {
              word = getWord(item.value);
              if (word && word !== item.value) {
                langs.push({
                  start: item.start,
                  end: item.end,
                  value: word
                  // name: attr.name
                });
              }
            });
          }
        } else {
          if (chineseRE.test(attr.value)) {
            word = getWord(attr.value);
            if (word && word !== attr.value) {
              langs.push({
                start: attr.start,
                end: attr.end,
                value: word,
                name: attr.name,
                needBind: true
              });
            }
          }
        }
      });
    },
    // 处理文本元素textnode
    chars(text, start, end) {
      if (!text.trim()) {
        return;
      }

      let tockens,
        // 文本直接添加，指令则为对象
        textArr = [];

      // 文本内容中包含指令
      if ((tockens = parseText(text, delimiters))) {
        // 解析指令表达式转成AST
        tockens.forEach(tocken => {
          if (tocken.directive) {
            // textArr.push(parseExp(tocken));
            let asts = parseExp(tocken);
            textArr.push(listModuleTockens(asts, text));
          } else {
            textArr.push(tocken.value);
          }
        });

        let word = "",
          oldWord = "",
          args = [],
          hasTrans = false;

        // 解析指令ast和字符串，输出最终的翻译表达式
        for (let i = 0, l = textArr.length; i < l; i++) {
          let tocken = textArr[i];
          if (hasTrans && (typeof tocken !== "object" || !tocken.isTrans)) {
            continue;
          }
          if (typeof tocken === "string") {
            oldWord += tocken;
          } else {
            // 如果文本中存在翻译函数，则直接处理翻译函数，其它文本忽略
            // let outData = listModuleTockens(tocken, text);
            if (tocken.isTrans) {
              hasTrans = true;
              tocken.trans.forEach(item => {
                oldWord = item.value;
                let newStart = start + item.start;
                let newEnd = newStart + item.value.length;

                word = getWord(oldWord);
                if ((word = getWord(oldWord))) {
                  if (word !== oldWord) {
                    langs.push({
                      start: newStart,
                      end: newEnd,
                      value: word
                    });
                  }
                }
              });
            } else {
              args.push(...tocken.args);
              oldWord += tocken.text;
            }
          }
        }

        if (hasTrans) {
          return;
        }

        // 非_('%s')内的%s不处理
        if (/^(%s)*$/.test(oldWord.replace(/^\s*|\s*$/g, ""))) {
          // if (!hasTrans && /^(%s)*$/.test(oldWord)) {
          return;
        }

        let textNoArgs = oldWord.replace(/%s/g, "");
        // 如果只有%s和空格符号等组成的词条，不做处理
        if (!/[a-z]/i.test(textNoArgs) && !chineseRE.test(textNoArgs)) {
          return;
        }

        if ((word = getWord(oldWord))) {
          word =
            args.length > 0
              ? `_('${word.replace(/'/, "\\'")}', [${args.join(", ")}])`
              : `_('${word.replace(/'/, "\\'")}')`;
          word = `${delimiters[0]}${word}${delimiters[1]}`;
          if (word !== text) {
            // todo by xc 考虑空格问题
            langs.push({
              start,
              end,
              value: word
            });
          }
        }
      }
      // 纯文本内容
      else if (chineseRE.test(text)) {
        let word = getWord(text);
        // word不为空则表示添加翻译
        if (word) {
          langs.push({
            start,
            end,
            value: `${delimiters[0]}_('${word.replace(/'/, "\\'")}')${
              delimiters[1]
            }`
          });
        }
      }
    }
  });

  // to do by xc 添加翻译
  let offset = 0;
  langs.forEach(item => {
    // 有name代表是属性
    if (process.env.NODE_ENV === "dev") {
      console.log(
        `[test:][${template.slice(item.start + offset, item.end + offset)}]`
      );
    }
    if (item.name && item.needBind) {
      let attrText = `:${item.name}="_('${item.value}')"`;
      replace(item.start, item.end, attrText);
    } else {
      // html节点内容文本
      replace(item.start, item.end, item.value);
    }
  });

  return template;

  function replace(start, end, value) {
    template = template.splice(start + offset, end + offset, value);
    offset += value.length - end + start;
  }
}

export default parseTemplate;
