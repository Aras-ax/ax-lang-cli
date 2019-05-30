const {
    JSDOM
} = require("jsdom");
import {
    log,
    LOG_TYPE,
    trim
}
from '../util/index';
import { ACTION_TYPE } from '../util/config';

import ExtractJS from './extract_js_ori';
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

        this.extractJS = new ExtractJS({});
        this.jsHandleList = [];
    }

    transNode(html) {
        this.getHeaderTag(html);;

        return new Promise((resolve, reject) => {
            try {
                let dom = new JSDOM(html);
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
        this.footerTag = '\t\n<\html>';
    }

    // 扫描节点，提取字段
    scanNode(document) {
        // 遍历各节点
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
            outHtml = document.doctype ? '<!doctype html>\t\n<html>\t\n' + outHtml + '\t\n</html>' : outHtml;

            return outHtml;
        });
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
                log(`内联JS处理出错- ${error}`, LOG_TYPE.error);
                return this.nextJsTask();
            });
    }

    nextJsTask() {
        // 当一个文件执行完成，立即执行下一个指令
        if (this.jsHandleList.length > 0) {
            return this.handleJsTask(this.jsHandleList.shift());
        }
        return Promise.resolve('done');
    }

    addJsTask(handle) {
        this.jsHandleList.push(handle);
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
                let isInputButton = (nodeName == "input" && btnStr.includes(element.getAttribute('type')));
                // 组件配置的dataOption属性
                // dataOption = element.getAttribute('data-options');

                if (nodeName == 'script' || nodeName == 'style') {
                    if (nodeName == 'script') {
                        if (firstChild && firstChild.nodeValue && trim(firstChild.nodeValue)) {
                            // todo by xc 添加对内嵌JS代码的处理
                            // return this.extractJS.transNode(firstChild.nodeValue)
                            //     .then(AST => {
                            //         return this.extractJS.scanNode(AST);
                            //     })
                            //     .then((fileData) => {
                            //         // 写入文件
                            //         firstChild.nodeValue = fileData;
                            //         return nextSibling && this.listNode(nextSibling);
                            //     })
                            //     .catch(error => {
                            //         log(`内联JS处理出错- ${error}`, LOG_TYPE.error);
                            //         return nextSibling && this.listNode(nextSibling);
                            //     });
                            this.addJsTask(firstChild);
                        }
                        // return Promise.resolve(nextSibling && this.listNode(nextSibling));
                    }
                    // return Promise.resolve(nextSibling && this.listNode(nextSibling));
                }

                // 对特殊需要翻译的属性进行处理
                HANDLE_ATTRIBUTE.forEach(attr => {
                    let attrVal = element.getAttribute(attr);
                    if (attrVal) {
                        curValue = this.getWord(attrVal);
                        this.transWord(element, Edit_TYPE.attribute, curValue, attr);
                    }
                });

                if (isInputButton) {
                    curValue = this.getWord(element.value);
                    this.transWord(element, Edit_TYPE.value, curValue);
                    //data-lang属性具有较高优先级
                    if (element.getAttribute("data-lang")) {
                        curValue = this.getWord(element.getAttribute("data-lang"));
                        this.transWord(element, Edit_TYPE.attribute, curValue, 'data-lang');
                    }
                    // } else if (dataOption) {
                    //     try {
                    //         // todo by xc 这种规格以后应该去掉
                    //         curValue = JSON.parse(dataOption);
                    //         curValue.msg = this.getWord(curValue.msg);
                    //         curValue.msg && this.transWord(element, Edit_TYPE.attribute, JSON.stringify(curValue), 'data-options');
                    //     } catch (e) {
                    //         log("data-option 不是json格式数据", LOG_TYPE.WARNING);
                    //     }
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
        if (firstChild) {
            this.listNode(firstChild);
        }

        // 处理兄弟节点
        if (nextSibling) {
            this.listNode(nextSibling);
        }
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