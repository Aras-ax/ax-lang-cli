import { log, LOG_TYPE, trim } from "../util/index";
import ExtractJS from "./extract-js";
import Extract from "./extract";
import parseComponent from "./vue/vue-compiler";
import parseHtml from "./vue/html-parser";

/**
 * 功能设定
 * 1. <template></template>中的词条支持添加翻译函数，script中的词条支持翻译函数的添加，只支持预设范围内的词条翻译函数的添加
 * 1. 只处理v-bind指令和alt，placeholder，title属性，属性内容的处理遵循下面的规则
 * 2. 如果文本段或代码段中存在_()，则只处理_()内的内容，其它内容不做处理
 * 3. 如果不存在_()，根据规则判断词条是否需要处理，进行翻译函数的添加（只对中文进行添加吧）
 * 4. 不是_('%s')内部的%s一律不作处理，解析后的%s不作处理
 */

/**
 * VUE文件解析类
 */
class ExtractVUE extends Extract {
  constructor(option) {
    super(option);

    this.extractJS = new ExtractJS({
      CONFIG_HONG: this.option.CONFIG_HONG,
      onlyZH: this.option.onlyZH,
      transWords: this.option.transWords,
      isTranslate: this.option.isTranslate
    });
  }

  transNode(content) {
    // 开始解析vue文件
    let sfc = (this.sfc = this.parseVue(content));

    return new Promise((resolve, reject) => {
      try {
        resolve(sfc);
      } catch (err) {
        reject(err);
      }
    });
  }

  parseVue(content) {
    return parseComponent(content);
  }

  // 扫描节点，提取字段
  scanNode(sfc) {
    if (sfc.template && sfc.template.content) {
      sfc.template.content = this.parseHtml(sfc.template.content);
    }
    if (sfc.script && sfc.script.content) {
      return this.handleJsTask(sfc.script.content).then(() => {
        return this.generate();
      });
    }
    return Promise.resolve(this.generate());
  }

  generate() {
    let content = "";
    if (this.option.isTranslate) {
      let sortKey = ["template", "script", "style", "customBlocks"];
      sortKey.forEach(key => {
        let item = this.sfc[key];
        if (!item) {
          return;
        }
        if (Array.isArray(item)) {
          item.forEach(style => {
            content += this.createTag(style);
          });
        } else {
          content += this.createTag(item);
        }
      });
    }
    return content;
  }

  createTag(option) {
    let content = "<";
    content += option.type;
    option.attrs.forEach(attr => {
      if (attr.value === "") {
        content += ` ${attr.name}`;
      } else {
        content += ` ${attr.name}="${attr.value}"`;
      }
    });
    content += ">";
    content += "\r\n";
    content += option.content.replace(/^\s*|\s*$/g, "");
    content += "\r\n";
    content += `</${option.type}>`;
    content += "\r\n\r\n";
    return content;
  }

  parseHtml(template) {
    if (template) {
      return parseHtml(template, this);
    }
  }

  handleJsTask(content) {
    return this.extractJS
      .transNode(content)
      .then(AST => {
        return this.extractJS.scanNode(AST);
      })
      .then(fileData => {
        // 写入解析后的内容
        this.sfc.script.content = fileData;
        // this.extractJS.complete();
        this.addWords(this.extractJS.words);
        this.extractJS.words = [];
        return "done";
      })
      .catch(error => {
        console.log(error);
        log(`vue script处理出错- ${error}`, LOG_TYPE.error);
        return "done";
      });
  }
}

export default ExtractVUE;
