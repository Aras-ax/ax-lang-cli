const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import { log, LOG_TYPE, trim } from '../util/index';
import ExtractJS from './extract-js';
import Extract from './extract';

const HANDLE_ATTRIBUTE = ['alt', 'placeholder', 'title', 'data-title'];
const Edit_TYPE = {
    attribute: 1,
    value: 2,
    html: 3,
    nodeValue: 4,
    title: 5
};

/**
 * HTML文件解析类
 */
class ExtractHTML extends Extract {
    constructor(option) {
        super(option);

        this.extractJS = new ExtractJS({
            CONFIG_HONG: this.option.CONFIG_HONG,
            onlyZH: this.option.onlyZH,
            transWords: this.option.transWords,
            isTranslate: this.option.isTranslate
        });

        this.jsHandleList = [];
    }

    transNode(html) {
        this.getHeaderTag(html);;

        return new Promise((resolve, reject) => {
            try {
                // 将jsdom的控制台信息进行拦截，不在node的控制台进行输出
                const virtualConsole = new jsdom.VirtualConsole();
                let dom = new JSDOM(html, {
                    virtualConsole
                });
                let document = dom.window.document;
                resolve(document);
            } catch (err) {
                reject(err);
            }
        });
    }

    getHeaderTag(html) {
        this.hasHeader = !!html.match(/\<head\>/g);
        this.hasBody = !!html.match(/\<body([^>]*)\>/g);
    }

    // 扫描节点，提取字段
    scanNode(document) {
        this.listNode(document.documentElement);

        return this.nextJsTask().then(() => {
            let outHtml = document.documentElement.innerHTML;

            if (!this.hasHeader) {
                outHtml = outHtml.replace(/\<head\>[\s\S]*\<\/head\>/g, '');
            }
            if (!this.hasBody) {
                outHtml = outHtml.replace(/(\<body([^>]*)\>)|(\<\/body\>)/g, '');
            }
            outHtml = outHtml.replace(/^\s*|\s*$/g, '');
            outHtml = document.doctype ? '<!Doctype html>\t\n<html>\t\n' + outHtml + '\t\n</html>' : outHtml;

            return outHtml;
        });
    }

    listNode(element) {
        if (!element) {
            return;
        }

        let firstChild = element.firstChild,
            nextSibling = element.nextSibling,
            nodeType = element.nodeType,
            nodeName = element.nodeName.toLowerCase(),
            btnStr = "submit,reset,button",
            curValue;
        //处理html节点
        // nodeType: 1-元素 2-属性 3-文本内容 8-代表注释
        switch (nodeType) {
            case 1: // 处理html元素
                let hong = element.getAttribute("data-hong"),
                    isInputButton = (nodeName == "input" && btnStr.includes(element.getAttribute('type'))),
                    // 组件配置的dataOption属性
                    dataOption = element.getAttribute('data-options');

                // 如果属于宏控制功能，宏没开启是不会进行提取或翻译操作
                if (hong && this.CONFIG_HONG[hong] === false) {
                    if (nextSibling) {
                        this.listNode(nextSibling);
                    }
                    return;
                }

                // 标志为一个整体的html，将全部提取，不进行子元素的拆分提取操作
                if (element.getAttribute("data-nowrap") == 1) {
                    // 将换行符，多个空格合并成一个空格进行提取
                    curValue = this.getWord(element.innerHTML);
                    this.transWord(element, Edit_TYPE.html, curValue);

                    if (nextSibling) {
                        this.listNode(nextSibling);
                    }
                    return;
                }

                if (nodeName == 'script' || nodeName == 'style') {
                    if (nodeName == 'script') {
                        if (firstChild && firstChild.nodeValue && trim(firstChild.nodeValue)) {
                            this.addJsTask(firstChild);
                        }
                    }
                    nextSibling && this.listNode(nextSibling);
                    return;
                }

                // 对特殊需要翻译的属性进行处理
                HANDLE_ATTRIBUTE.forEach(attr => {
                    curValue = this.getWord(element.getAttribute(attr));
                    this.transWord(element, Edit_TYPE.attribute, curValue, attr);
                });

                if (isInputButton) {
                    curValue = this.getWord(element.value);
                    this.transWord(element, Edit_TYPE.value, curValue);
                    //data-lang属性具有较高优先级
                    if (element.getAttribute("data-lang")) {
                        curValue = this.getWord(element.getAttribute("data-lang"));
                        this.transWord(element, Edit_TYPE.attribute, curValue, 'data-lang');
                    }
                } else if (dataOption) {
                    try {
                        // todo by xc 这种规格以后应该去掉
                        curValue = JSON.parse(dataOption);
                        curValue.msg = this.getWord(curValue.msg);
                        curValue.msg && this.transWord(element, Edit_TYPE.attribute, JSON.stringify(curValue), 'data-options');
                    } catch (e) {
                        log("data-option 不是json格式数据", LOG_TYPE.WARNING);
                    }
                } else {
                    curValue = this.getWord(element.getAttribute("data-lang"));
                    this.transWord(element, Edit_TYPE.attribute, curValue, 'data-lang');
                }
                break;
            case 3: //处理文本节点
                if (/\S/.test(element.nodeValue)) {
                    curValue = this.getWord(element.nodeValue);
                    this.transWord(element, Edit_TYPE.nodeValue, curValue);
                }
                break;
        }

        //stop handle elem.child if elem has attr data-lang
        // 处理子节点
        firstChild && this.listNode(firstChild);

        // 处理兄弟节点
        nextSibling && this.listNode(nextSibling);
    }

    handleJsTask(child) {
        return this.extractJS.transNode(child.nodeValue)
            .then(AST => {
                return this.extractJS.scanNode(AST);
            })
            .then((fileData) => {
                // 写入文件
                child.nodeValue = fileData;
                return this.nextJsTask();
            })
            .catch(error => {
                console.log(error);
                log(`内联JS处理出错- ${error}`, LOG_TYPE.error);
                return this.nextJsTask();
            });
    }

    nextJsTask() {
        // 当一个文件执行完成，立即执行下一个指令
        if (this.jsHandleList.length > 0) {
            return this.handleJsTask(this.jsHandleList.shift());
        }
        // 当所有的js遍历完成后，添加抓取到的词条
        this.addWords(this.extractJS.words);
        this.extractJS.words = [];
        return Promise.resolve('done');
    }

    addJsTask(handle) {
        this.jsHandleList.push(handle);
    }

    // 翻译节点
    transWord(element, type, value, field) {
        if (value) {
            switch (type) {
                case Edit_TYPE.attribute:
                    element.setAttribute(field, value);
                    break;
                case Edit_TYPE.html:
                    element.innerHTML = value;
                    break;
                case Edit_TYPE.value:
                    element.setAttribute("value", value);
                    break;
                case Edit_TYPE.nodeValue:
                    element.nodeValue = value;
                    break;
                case Edit_TYPE.title:
                    element.title = value;
                    break;
            }
        }
    }
}

export default ExtractHTML;