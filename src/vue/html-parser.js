const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

const isNonPhrasingTag = makeMap(
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
)

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
export function makeMap(
    str,
    expectsLowerCase
) {
    const map = Object.create(null)
    const list = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase ?
        val => map[val.toLowerCase()] :
        val => map[val]
}

/**
 * 不执行任何操作
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
export function noop(a, b, c) {}

/**
 * Always return false.
 */
export const no = (a) => false;

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// dom标签开始位置
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// dom开始标签结束或自闭和标签结束位置，
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being pased as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/

// Special Elements (can contain anything)
export const isPlainTextElement = makeMap('script,style,textarea', true)
const reCache = {}

const decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t',
    '&#39;': "'"
}
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

function decodeAttr(value, shouldDecodeNewlines) {
    const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
    return value.replace(re, match => decodingMap[match])
}

export function parseHTML(html, options) {
    // 记录html解析时的父元素层级栈 
    const stack = []
    const expectHTML = options.expectHTML
    const isUnaryTag = options.isUnaryTag || no
    const canBeLeftOpenTag = options.canBeLeftOpenTag || no
    let index = 0
    let last, lastTag //记录当前解析的标签名
    while (html) {
        last = html
        // Make sure we're not in a plaintext content element like script/style
        if (!lastTag || !isPlainTextElement(lastTag)) {
            let textEnd = html.indexOf('<')

            // 如果textEnd不为0，则从html开始位置到textEnd位置都是文本
            if (textEnd === 0) {
                // Comment: 注释节点，记录前进
                if (comment.test(html)) {
                    const commentEnd = html.indexOf('-->')

                    if (commentEnd >= 0) {
                        if (options.shouldKeepComment) {
                            // 记录注释ast
                            options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3)
                        }
                        advance(commentEnd + 3)
                        continue
                    }
                }

                // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                // 条件注释，直接跳过
                if (conditionalComment.test(html)) {
                    const conditionalEnd = html.indexOf(']>')

                    if (conditionalEnd >= 0) {
                        advance(conditionalEnd + 2)
                        continue
                    }
                }

                // Doctype申明，直接跳过
                const doctypeMatch = html.match(doctype)
                if (doctypeMatch) {
                    advance(doctypeMatch[0].length)
                    continue
                }

                // End tag:
                const endTagMatch = html.match(endTag)
                if (endTagMatch) {
                    const curIndex = index
                    advance(endTagMatch[0].length)
                    parseEndTag(endTagMatch[1], curIndex, index)
                    continue
                }

                // Start tag:
                // 解析开始标签[<xxx]到开始标签结束标记[>或/>]之间的内容，输出match
                // 例如<div id="xx" :data1="data1"> 或者<input type="text"/> 
                const startTagMatch = parseStartTag()
                if (startTagMatch) {
                    // 处理开始标签及定义的属性
                    handleStartTag(startTagMatch)
                    if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
                        advance(1)
                    }
                    continue
                }
            }

            // 从当前位置到 textEnd 位置都是文本  
            let text, rest, next
            if (textEnd >= 0) {
                // 从textEnd开始截取，包括textEnd
                rest = html.slice(textEnd)
                while (
                    !endTag.test(rest) &&
                    !startTagOpen.test(rest) &&
                    !comment.test(rest) &&
                    !conditionalComment.test(rest)
                ) {
                    // < in plain text, be forgiving and treat it as text
                    // 当从<开始的位置进行匹配，匹配不到注释、开始或结束标签时，将<归为text的一部分
                    next = rest.indexOf('<', 1)
                    if (next < 0) break
                    textEnd += next
                    rest = html.slice(textEnd)
                }
                // 截取整个文本，可能包括不是开始或结束标签或者注释标签的<
                text = html.substring(0, textEnd)
            }

            // 不存在<，则表示为纯文本
            if (textEnd < 0) {
                text = html
            }

            // 截断文本，递归剩余的字符串
            if (text) {
                advance(text.length)
            }

            if (options.chars && text) {
                options.chars(text, index - text.length, index)
            }
        } else {
            let endTagLength = 0
            const stackedTag = lastTag.toLowerCase()
            const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
            const rest = html.replace(reStackedTag, function(all, text, endTag) {
                endTagLength = endTag.length
                if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
                    text = text
                        .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
                        .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
                }
                if (shouldIgnoreFirstNewline(stackedTag, text)) {
                    text = text.slice(1)
                }
                if (options.chars) {
                    options.chars(text)
                }
                return ''
            })
            index += html.length - rest.length
            html = rest
            parseEndTag(stackedTag, index - endTagLength, index)
        }

        if (html === last) {
            options.chars && options.chars(html)
            if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
                options.warn(`Mal-formatted tag at end of template: "${html}"`, { start: index + html.length })
            }
            break
        }
    }

    // Clean up any remaining tags
    parseEndTag()

    /**
     * 从位置index + n处开始截断html
     */
    function advance(n) {
        index += n
        html = html.substring(n)
    }

    /**
     * 解析开始标签[<xxx]到结束标签[>或/>]的内容，输出match
     * {
     *  tagName: '',
     *  attrs: [],
     *  start: index,
     *  end: index,
     *  unarySlash: ''
     * }
     */
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1],
                attrs: [],
                start: index
            }
            // html剔除匹配的html
            advance(start[0].length)
            let end, attr
            // 当前html的起始位置不是一元标签结束标签，并且有设置html属性
            while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
                attr.start = index
                advance(attr[0].length)
                attr.end = index
                match.attrs.push(attr)
            }
            // end可以为 > 或者 />
            if (end) {
                // 记录一元标签，即自结束标签
                match.unarySlash = end[1]
                advance(end[0].length)
                match.end = index
                return match
            }
        }
    }

    /**
     * 处理开始标签属性等内容，记录AST
     */
    function handleStartTag(match) {
        const tagName = match.tagName
        const unarySlash = match.unarySlash

        if (expectHTML) {
            if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                parseEndTag(lastTag)
            }
            if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
                parseEndTag(tagName)
            }
        }

        // 判断开始标签是否是一元标签
        const unary = isUnaryTag(tagName) || !!unarySlash

        const l = match.attrs.length
        const attrs = new Array(l)
        for (let i = 0; i < l; i++) {
            const args = match.attrs[i]
            const value = args[3] || args[4] || args[5] || ''
            const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href' ?
                options.shouldDecodeNewlinesForHref :
                options.shouldDecodeNewlines
            attrs[i] = {
                name: args[1],
                value: decodeAttr(value, shouldDecodeNewlines) //解码标签属性值
            }

            // 记录位置信息
            if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
                attrs[i].start = args.start + args[0].match(/^\s*/).length
                attrs[i].end = args.end
            }
        }

        // 非一元标签的开始标签压入栈，用于解析结束标签时匹配正确的结束标签
        if (!unary) {
            stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end })
            lastTag = tagName
        }

        if (options.start) {
            // 生成对应的AST 
            options.start(tagName, attrs, unary, match.start, match.end)
        }
    }

    /**
     * 解析结束标签
     */
    function parseEndTag(tagName, start, end) {
        let pos, lowerCasedTagName
        if (start == null) start = index
        if (end == null) end = index

        // Find the closest opened tag of the same type
        if (tagName) {
            lowerCasedTagName = tagName.toLowerCase()
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                    break
                }
            }
        } else {
            // If no tag name is provided, clean shop
            pos = 0
        }

        if (pos >= 0) {
            // Close all the open elements, up the stack
            for (let i = stack.length - 1; i >= pos; i--) {
                if (process.env.NODE_ENV !== 'production' &&
                    (i > pos || !tagName) &&
                    options.warn
                ) {
                    options.warn(
                        `tag <${stack[i].tag}> has no matching end tag.`, { start: stack[i].start, end: stack[i].end }
                    )
                }
                if (options.end) {
                    options.end(stack[i].tag, start, end)
                }
            }

            // Remove the open elements from the stack
            stack.length = pos
            lastTag = pos && stack[pos - 1].tag
        } else if (lowerCasedTagName === 'br') {
            if (options.start) {
                options.start(tagName, [], true, start, end)
            }
        } else if (lowerCasedTagName === 'p') {
            if (options.start) {
                options.start(tagName, [], false, start, end)
            }
            if (options.end) {
                options.end(tagName, start, end)
            }
        }
    }
}