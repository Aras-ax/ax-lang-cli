const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import { log, LOG_TYPE, trim } from '../util/index';
import ExtractJS from './extract_js_ori';
import Extract from './extract';

/**
 * HTML文件解析类
 */
class ExtractHTML extends Extract {
    constructor(option) {
        super(option);

        this.extractJS = new ExtractJS({
            ignoreCode: this.option.ignoreCode,
            templateExp: this.option.templateExp
        });
        this.jsHandleList = [];
    }

    transNode(html) {
        this.oldHtml = html;
        this.scripts = [];
        this.getHeaderTag(html);
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
        // 遍历各节点
        this.listNode(document.documentElement);

        return this.nextJsTask().then(() => {
            // 通过正则替换，为了规避jsdom对html中的特殊字符串进行编码
            let outHtml = document.documentElement.innerHTML;
            let match = outHtml.match(/<script\b[^>]*>[\s\S]*?<\/script>/g);
            outHtml = this.oldHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, () => match.shift());

            return outHtml;
        });
    }

    handleJsTask(child) {
        return this.extractJS.transNode(child.nodeValue, true)
            .then(AST => {
                return this.extractJS.scanNode(AST);
            })
            .then((fileData) => {
                // 写入文件
                child.nodeValue = fileData;
                return this.nextJsTask();
            })
            .catch(() => {
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
            nodeName = element.nodeName.toLowerCase();
        //处理html节点
        // nodeType: 1-元素 2-属性 3-文本内容 8-代表注释
        if (nodeType === 1 && nodeName == 'script') {
            if (firstChild && firstChild.nodeValue && trim(firstChild.nodeValue)) {
                this.addJsTask(firstChild);
            }
        } else {
            // 处理子节点
            if (firstChild) {
                this.listNode(firstChild);
            }
        }

        // 处理兄弟节点
        if (nextSibling) {
            this.listNode(nextSibling);
        }
    }
}

export default ExtractHTML;