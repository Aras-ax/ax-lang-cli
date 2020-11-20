import {
  log,
  loadFile,
  trim,
  LOG_TYPE,
  copyFile,
  string2Regexp,
  writeTextFile
} from "../util/index";

import { IGNORE_REGEXP, IGNORE_FUNCTIONS } from "../util/config";
import path from "path";

/**
 * 词条提取、翻译基类
 */
class Extract {
  constructor(option) {
    this.option = Object.assign(
      {},
      {
        // 词条提取完成后的操作
        onComplete: null,
        ignoreCode: /<!--\s*hide|-->/g,
        // 将对应的词条全部修改为'/**<%%>**/window.MS'
        // templateExp: /(\=|\+|\-|\*|\/|\s|\(|\[|\{)\s*<%.*?%>/g
        templateExp: /<%([^\n]*?)%>/g,
        // 自定义不提词条规则，可以是正则也可以是function
        customRules: []
      },
      option
    );
    this.init();
  }

  init() {
    // 记录当前的文件路径
    this.curFilePath = "";
    // 提取的词条，去除了重复项，当为翻译模式时间，只存储未被翻译的词条
    this.words = [];
    // 是否正在处理文件
    this.isWorking = false;
    // 待处理文件列表
    this.handleList = [];
    this.ignoreRE = IGNORE_REGEXP.slice(0);
    this.ignoreFuns = IGNORE_FUNCTIONS.slice(0);

    let customRules = this.option.customRules;
    if (Array.isArray(customRules)) {
      customRules.forEach((item) => {
        if (typeof item === "function") {
          this.ignoreFuns.push(item);
        } else {
          this.ignoreRE.push(item);
        }
      });
    } else if (typeof customRules === "function") {
      this.ignoreFuns.push(customRules);
    } else if (customRules) {
      this.ignoreRE.push(string2Regexp(customRules));
    }
  }

  handleFile(filePath) {
    // log(`开始提取文件-${filePath}`);
    this.isWorking = true;
    this.curFilePath = filePath;
    return loadFile(filePath)
      .then((data) => {
        // 写入文件
        log(`添加翻译函数-${filePath}`);
        return this.transNode(data);
      })
      .then((AST) => {
        return this.scanNode(AST);
      })
      .then((fileData) => {
        writeTextFile(
          path.resolve(
            this.option.baseWritePath,
            path.relative(this.option.baseReadPath, this.curFilePath)
          ),
          fileData
        );
        this.complete();
        return this.startTrans();
      })
      .catch((error) => {
        this.copyFile(filePath);
        log(`文件[${filePath}]处理出错- ${error.message}`, LOG_TYPE.ERROR);
        return this.startTrans();
      });
  }

  copyFile(filePath) {
    //如果是翻译模式需要将未匹配的文件原样拷贝
    copyFile(
      filePath,
      path.join(
        this.option.baseWritePath,
        path.relative(this.option.baseReadPath, filePath)
      )
    );
  }

  transNode(data) {
    return Promise.resolve(data);
  }

  setAttr(attr, value) {
    if (Object.prototype.toString.call(attr) === "[object Object]") {
      for (let key in attr) {
        this.setSingleAttr(key, attr[key]);
      }
    } else {
      this.setSingleAttr(attr, value);
    }
  }

  setSingleAttr(attr, value) {
    this.option[attr] = value;
  }

  startTrans() {
    // 当一个文件执行完成，立即执行下一个指令
    if (this.handleList.length > 0) {
      return this.handleFile(this.handleList.shift());
    }
    return Promise.resolve("done");
  }

  addTask(filePath) {
    this.handleList.push(filePath);
  }

  addWord(word) {
    if (!this.words.includes(word)) {
      this.words.push(word);
    }
  }

  addWords(words) {
    words.forEach((word) => {
      this.addWord(word);
    });
  }

  getWord(val) {
    if (!val || /^\s*$/.test(val)) {
      return "";
    }

    // 经过处理的字符串
    if (/\{%s\}/i.test(val)) {
      return val;
    }

    let skip = this.ignoreRE.some((item) => item.test(val));
    if (skip) {
      return "";
    }

    for (let i = 0, l = this.ignoreFuns.length; i < l; i++) {
      let fun = this.ignoreFuns[i],
        str = val.replace(/(^\s+)|(\s+$)/g, "");

      if (typeof fun === "function") {
        if ((skip = fun(str))) {
          break;
        }
      }
    }
    if (skip) {
      return "";
    }

    let addValue = "";

    //中英文都提取
    if (/[a-z]/i.test(val) || /[\u4e00-\u9fa5]/.test(val)) {
      addValue = val;
    }

    return addValue;
  }

  complete() {
    this.isWorking = false;
    this.option.onComplete &&
      this.option.onComplete(this.curFilePath, this.words);
    // 重置提取的词条
    this.words = [];
  }
}

export default Extract;
