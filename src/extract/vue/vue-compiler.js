// 参考vue-template-compiler进行sfc文件解析
import { shouldIgnoreFirstNewline, makeMap, unicodeRegExp } from './util';
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

const ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
const qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
const startTagOpen = new RegExp(("^<" + qnameCapture));
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
const doctype = /^<!DOCTYPE [^>]+>/i;
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;
const reCache = {};

const isPlainTextElement = makeMap('script,style,textarea', true);

function parseHTML(html, options) {
    let stack = [],
        index = 0,
        last, lastTag;

    while (html) {
        last = html;
        if (!lastTag || !isPlainTextElement(lastTag)) {
            let textEnd = html.indexOf('<');
            if (textEnd === 0) {
                // 注释
                if (comment.test(html)) {
                    let commentEnd = html.indexOf('-->');

                    if (commentEnd >= 0) {
                        advance(commentEnd + 3);
                        continue;
                    }
                }
                // 条件注释
                if (conditionalComment.test(html)) {
                    let conditionalEnd = html.indexOf(']>');

                    if (conditionalEnd >= 0) {
                        advance(conditionalEnd + 2);
                        continue
                    }
                }

                // Doctype:
                let doctypeMatch = html.match(doctype);
                if (doctypeMatch) {
                    advance(doctypeMatch[0].length);
                    continue
                }

                // 结束tag
                let endTagMatch = html.match(endTag);
                if (endTagMatch) {
                    let curIndex = index;
                    advance(endTagMatch[0].length);
                    parseEndTag(endTagMatch[1], curIndex, index);
                    continue
                }

                // 开始tag
                let startTagMatch = parseStartTag();
                if (startTagMatch) {
                    handleStartTag(startTagMatch);
                    if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
                        advance(1);
                    }
                    continue
                }
            }

            let text = (void 0),
                rest = (void 0),
                next = (void 0);

            if (textEnd >= 0) {
                rest = html.slice(textEnd);
                // 提取文本中的<, 该符号不作为标签进行提取
                while (
                    !endTag.test(rest) &&
                    !startTagOpen.test(rest) &&
                    !comment.test(rest) &&
                    !conditionalComment.test(rest)
                ) {
                    // < in plain text, be forgiving and treat it as text
                    next = rest.indexOf('<', 1);
                    if (next < 0) { break }
                    textEnd += next;
                    rest = html.slice(textEnd);
                }
                text = html.substring(0, textEnd);
            } else if (textEnd < 0) {
                text = html;
            }

            if (text) {
                advance(text.length);
            }
        } else {
            let endTagLength = 0,
                stackedTag = lastTag.toLowerCase(),
                reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
            let rest$1 = html.replace(reStackedTag, function(all, text, endTag) {
                endTagLength = endTag.length;
                return ''
            });
            index += html.length - rest$1.length;
            html = rest$1;
            parseEndTag(stackedTag, index - endTagLength, index);
        }
    }

    parseEndTag();


    function advance(n) {
        index += n;
        html = html.substring(n);
    }

    function parseStartTag() {
        let start = html.match(startTagOpen);
        if (start) {
            let match = {
                tagName: start[1],
                start: index,
                attrs: []
            };
            advance(start[0].length);
            let end, attr;
            while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5] || ''
                });
            }

            if (end) {
                match.unarySlash = end[1];
                advance(end[0].length);
                match.end = index;
                return match;
            }
        }
    }

    function handleStartTag(match) {
        let tagName = match.tagName;
        let unarySlash = match.unarySlash;

        let unary = !!unarySlash;

        if (!unary) {
            stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), start: match.start, end: match.end });
            lastTag = tagName;
        }

        if (options.start) {
            options.start(tagName, match.attrs, unary, match.start, match.end);
        }
    }

    function parseEndTag(tagName, start, end) {
        let pos, lowerCasedTagName;
        if (start == null) { start = index; }
        if (end == null) { end = index; }

        // Find the closest opened tag of the same type
        if (tagName) {
            lowerCasedTagName = tagName.toLowerCase();
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                    break
                }
            }
        } else {
            // If no tag name is provided, clean shop
            pos = 0;
        }

        if (pos >= 0) {
            // Close all the open elements, up the stack
            for (let i = stack.length - 1; i >= pos; i--) {
                if (options.end) {
                    options.end(stack[i].tag, start, end);
                }
            }

            // Remove the open elements from the stack
            stack.length = pos;
            lastTag = pos && stack[pos - 1].tag;
        } else if (lowerCasedTagName === 'br') {
            if (options.start) {
                options.start(tagName, [], true, start, end);
            }
        } else if (lowerCasedTagName === 'p') {
            if (options.start) {
                options.start(tagName, [], false, start, end);
            }
            if (options.end) {
                options.end(tagName, start, end);
            }
        }
    }
}

let isSpecialTag = makeMap('script,style,template', true);

/**
 * 解析单文件组件(*.vue)输出SFC描述对象
 */
function parseComponent(
    content
) {
    // SFC描述对象
    let sfc = {
            template: null,
            script: null,
            style: [],
            customBlocks: [],
            errors: []
        },
        // 记录节点深度，深度为1的节点为template/script/style等
        depth = 0,
        currentBlock = null;

    let warn = function(msg) {
        sfc.errors.push(msg);
    };

    function start(
        tag,
        attrs,
        unary,
        start,
        end
    ) {
        if (depth === 0) {
            currentBlock = {
                type: tag,
                content: '',
                attrs: attrs,
                start: end
            };
            if (isSpecialTag(tag)) {
                if (tag !== 'style') {
                    sfc[tag] = currentBlock;
                } else {
                    sfc[tag].push(currentBlock);
                }
            } else { // custom blocks
                sfc.customBlocks.push(currentBlock);
            }
        }
        if (!unary) {
            depth++;
        }
    }

    function end(tag, start) {
        if (depth === 1 && currentBlock) {
            currentBlock.end = start;
            var text = content.slice(currentBlock.start, currentBlock.end);

            currentBlock.content = text;
            currentBlock = null;
        }
        depth--;
    }

    parseHTML(content, {
        warn: warn,
        start: start,
        end: end
    });

    return sfc;
}

export default parseComponent;