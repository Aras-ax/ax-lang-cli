import path from "path";
import fs from "fs";

import { getDirname } from "./index";

const CONFIG_FILE_NAME = "b28.config.js";

const TRANS_NAME_REGEX = /^_$/;

const COMMAD = {
  /**
   * 提取词条
   */
  GET_WORDS: 0,
  /**
   * 翻译文件
   */
  TRANSLATE: 1,
  /**
   * 翻译检查
   */
  CHECK_TRANSLATE: 2,
  /**
   * Excel转JSON
   */
  EXCEL_TO_JSON: 3,
  /**
   * JSON转Excel
   */
  JSON_TO_EXCEL: 4,
  /**
   * JSON文件合并
   */
  MERGE_JSON: 5,
  /**
   * 原厂代码处理添加翻译
   */
  ORIGINAL_CODE: 6,
  /**
   * 提取词条及json文件生成一个excel表格
   */
  GET_ALLWORDS: 7,
  /**
   * 翻译文件检查
   */
  CHECK_LANGEXCEL: 8,
  /**
   * 文件转码
   */
  TRANS_ENCODE: 9
};

const COMMAD_TEXT = [
  "提取词条",
  "翻译文件",
  "翻译检查",
  "Excel转JSON",
  "JSON转Excel",
  "JSON合并",
  "添加翻译",
  "提取翻译",
  "翻译文件检查",
  "文件转码"
];

const valid = {
  // 空或者存在的地址
  specialfile(val) {
    val = val || "";
    val = val.replace(/(^\s*)|(\s*$)/g, "");
    if (val === "") {
      return true;
    }

    return valid.existFile(val);
  },
  folder(val) {
    val = val || "";
    val = val.replace(/(^\s*)|(\s*$)/g, "");
    if (val === "") {
      return "必填";
    }
    if (!path.isAbsolute(val)) {
      val = path.resolve(process.cwd(), val);
    }
    if (!fs.existsSync(val)) {
      return "请输入有效的地址";
    }
    return true;
  },
  // 存在的文件非文件夹
  existFile(val) {
    val = val || "";
    val = val.replace(/(^\s*)|(\s*$)/g, "");
    if (val === "") {
      return "必填";
    }

    if (!path.isAbsolute(val)) {
      val = path.resolve(process.cwd(), val);
    }
    if (path.extname(val) === "" || !fs.existsSync(val)) {
      return "请输入有效的文件地址";
    }
    return true;
  }
};

const baseQuestions = [
    {
      type: "list",
      name: "commandType",
      message: "当前执行的操作是：",
      choices: COMMAD_TEXT,
      filter: function(val) {
        return COMMAD_TEXT.indexOf(val);
      },
      pageSize: 9 //cmd命令行显示行数
    }
  ],
  questions = [
    [
      {
        type: "confirm",
        name: "onlyZH",
        message: "只提取中文？"
      },
      {
        type: "input",
        name: "baseReadPath",
        message: "待提取文件地址：",
        validate: valid.folder // 必填，可以是文件也可以是文件夹
      },
      {
        type: "input",
        name: "baseOutPath",
        message: "提取的Excel文件输出地址：",
        default(answers) {
          return getDirname(answers.baseReadPath);
        }
      },
      {
        type: "input",
        name: "hongPath",
        message: "宏文件地址：",
        default: "",
        validate: valid.specialfile
      }
    ],
    [
      {
        type: "input",
        name: "baseTranslatePath",
        message: "待翻译文件根目录：",
        validate: valid.folder // 必填，可以是文件也可以是文件夹
      },
      {
        type: "input",
        name: "baseTransOutPath",
        message: "翻译后文件输出根目录：",
        default(answers) {
          return getDirname(answers.baseTranslatePath);
        }
      },
      {
        type: "input",
        name: "hongPath",
        message: "宏文件地址：",
        default: "",
        validate: valid.specialfile
      },
      {
        type: "input",
        name: "languagePath",
        message: "语言包文件地址：",
        validate: valid.existFile
      },
      {
        type: "input",
        name: "sheetName",
        message: "Excel中对应的sheet：",
        default: "",
        when(answers) {
          return path.extname(answers.languagePath) !== ".json";
        }
      },
      {
        type: "input",
        name: "keyName",
        message: "key对应列：", //指代代码中的词条需要被那一列的数据替换
        default: "EN",
        when(answers) {
          return path.extname(answers.languagePath) !== ".json";
        }
      },
      {
        type: "input",
        name: "valueName",
        message: "value对应列：", //指代代码中目前需要被替换的语言
        default: "CN", // ALL代表所有
        when(answers) {
          return path.extname(answers.languagePath) !== ".json";
        }
      }
    ],
    [
      {
        type: "input",
        name: "baseCheckPath",
        message: "待检查文件根目录：",
        validate: valid.folder
      },
      {
        type: "input",
        name: "langJsonPath",
        message: "语言包json文件地址：",
        validate: valid.existFile
      },
      {
        type: "input",
        name: "hongPath",
        message: "宏文件地址：",
        validate: valid.specialfile
      },
      {
        type: "input",
        name: "logPath",
        message: "检查信息输出路径：",
        default(answers) {
          return getDirname(answers.baseCheckPath);
        }
      }
    ],
    [
      {
        type: "input",
        name: "excelPath",
        message: "Excel文件地址：",
        validate: valid.existFile
      },
      {
        type: "input",
        name: "sheetName",
        message: "Excel中对应的sheet：",
        default: ""
      },
      {
        type: "input",
        name: "keyName",
        message: "key对应列：",
        default: "EN"
      },
      {
        type: "input",
        name: "valueName",
        message: "value对应列：",
        default: "" // ALL代表所有
      },
      {
        type: "input",
        name: "outJsonPath",
        message: "输出json文件目录：",
        default(answers) {
          return getDirname(answers.excelPath);
        }
      }
    ],
    [
      {
        type: "input",
        name: "jsonPath",
        message: "json文件地址：",
        validate: valid.existFile
      },
      {
        type: "input",
        name: "outExcelPath",
        message: "输出Excel文件目录：",
        default(answers) {
          return getDirname(answers.jsonPath);
        }
      }
    ],
    [
      {
        type: "input",
        name: "mainJsonPath",
        message: "主json文件地址：",
        validate: valid.existFile
      },
      {
        type: "input",
        name: "mergeJsonPath",
        message: "次json文件地址：",
        validate: valid.existFile
      },
      {
        type: "input",
        name: "outMergeJsonPath",
        message: "合并后输出的地址：",
        default(answers) {
          return getDirname(answers.mainJsonPath);
        }
      }
    ],
    [
      {
        type: "input",
        name: "baseProPath",
        message: "原厂代码地址：",
        validate: valid.folder // 必填，可以是文件也可以是文件夹
      },
      {
        type: "input",
        name: "baseProOutPath",
        message: "添加翻译函数后文件输出地址：",
        default(answers) {
          return getDirname(answers.baseProPath);
        }
      },
      {
        type: "input",
        name: "ignoreCode",
        message: "需要注释的代码正则："
      },
      {
        type: "input",
        name: "templateExp",
        message: "后台插入表达式正则："
      }
    ],
    [
      {
        type: "input",
        name: "baseReadPath",
        message: "待提取文件地址：",
        validate: valid.folder // 必填，可以是文件也可以是文件夹
      },
      {
        type: "input",
        name: "languagePath",
        message: "语言包文地址（文件夹）：",
        validate: valid.folder
      },
      {
        type: "input",
        name: "baseOutPath",
        message: "提取的Excel文件输出地址：",
        default(answers) {
          return getDirname(answers.baseReadPath);
        },
        valid: valid.specialfile
      },
      {
        type: "input",
        name: "hongPath",
        message: "宏文件地址：",
        default: "",
        validate: valid.specialfile
      }
    ],
    [
      {
        type: "input",
        name: "outExcel",
        message: "输出的excel文件地址:",
        validate: valid.existFile
      },
      {
        type: "input",
        name: "sheetName1",
        message: "Excel中对应的sheet：",
        default: ""
      },
      {
        type: "input",
        name: "keyName1",
        message: "key对应列：", //指代代码中的词条需要被那一列的数据替换
        default: "EN"
      },
      {
        type: "input",
        name: "inExcel",
        message: "最终的语言包excel文件:",
        validate: valid.existFile
      },
      {
        type: "input",
        name: "sheetName2",
        message: "Excel中对应的sheet：",
        default: ""
      },
      {
        type: "input",
        name: "keyName2",
        message: "key对应列：", //指代代码中的词条需要被那一列的数据替换
        default: "EN"
      }
    ],
    [
      {
        type: "input",
        name: "transFilePath",
        message: "待转码文件地址",
        validate: valid.existFile
      },
      {
        type: "input",
        name: "transOutPath",
        message: "转码后文件输出地址",
        default: ""
      },
      {
        type: "input",
        name: "transEncode",
        message: "转码后文件的编码方式(默认UTF-8)",
        default: "utf-8"
      }
    ]
  ];

/**
 * 忽略文件正则
 */
const EXCLUDE_FILE = "**/{img,images,lang,b28,goform,cgi-bin,css}/**";
const EXCLUDE_FILE_END =
  "**/{img,lang,b28,goform,cgi-bin,*.min.js,*shiv.js,*respond.js,*shim.js,.gitignore,.pidTmp,*.css,*.jpg,*.png,*.gif,*.bat,*.cgi}";
const EXTNAME_JS = "**/*.js";
const EXTNAME_VUE = "**/*.vue";
const EXTNAME_JSX = "**/*.jsx";
const EXTNAME_HTML = "**/{*.aspx,*.asp,*.ejs,*.html,*.htm}";
const TRANS_EXCLUDE =
  "**/{*.min.js,*shiv.js,*respond.js,*shim.js,.gitignore,.pidTmp,*.css,*.jpg,*.jpeg,*.png,*.gif,*.bat,*.cgi}";
/**
 * 不进行匹配词条的正则
 */
const IGNORE_REGEXP = [
  /^[\s0-9]*$/,
  // 单个字母
  /^[a-z]$/i,
  // <% xxxx %>格式的字符串不提取
  /<%([\s\S]*)%>/i,
  /\(\[([\s\S]*)\]\)/i,
  /^(&nbsp;)+$/i,
  /[a-z0-9]*&[a-z]*=/i,
  // 只包含html结束标签
  /^(\s*<\s*\/([a-z0-9]+)?>\s*)*$/i,
  // /^<%=((.|\n)*)%>$/i,
  // url不提取
  /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/i
];
/**
 * 不进行匹配词条的规则函数
 */
const IGNORE_WORDS = ["none", "visible", "display", "block"];
const IGNORE_FUNCTIONS = [
  // 单个单词可添加翻译函数除了全大写，none，visible等css关键词
  function word(str) {
    if (/[^a-z]/i.test(str)) {
      return false;
    }

    if (IGNORE_WORDS.includes(str)) {
      return true;
    }

    // str = str.slice(1);
    // // 除第一个字母外大小写混合
    // if (/[a-z]/.test(str) && /[A-Z]/.test(str)) {
    //     return true;
    // }

    //全大写字符串
    if (/^[A-Z]+$/.test(str)) {
      return true;
    }

    return false;
  },
  // 单个字母，全数字，数组+标点符号，数字/标点+字母格式不添加(如果不包含数字=？则还是添加)
  function specialWord(str) {
    if (
      /^(([a-z]+[0-9\.,\?\\_\:\-/&\=<>\[\]\(\)\|]+)|([0-9\.,\?\\_\:\-/&\=<>\[\]\(\)\|]+[a-z]+))[a-z0-9\.,\?\\_\:\-/&\=<>\[\]\(\)\|]*$/i.test(
        str
      )
    ) {
      if (!/[0-9\=\?]/.test(str)) {
        return false;
      }
      return true;
    }
    return false;
  }
];

const ACTION_TYPE = {
  ADDTRANS: 1, // 添加翻译函数和提取语言
  GETLANG: 2, // 提取词条，只提取有翻译函数的词条
  TRANSLATE: 3 // 翻译文件中的词条
};

export {
  EXCLUDE_FILE,
  EXCLUDE_FILE_END,
  TRANS_EXCLUDE,
  CONFIG_FILE_NAME,
  TRANS_NAME_REGEX,
  COMMAD,
  COMMAD_TEXT,
  questions,
  valid,
  EXTNAME_HTML,
  EXTNAME_JS,
  EXTNAME_VUE,
  baseQuestions,
  IGNORE_REGEXP,
  IGNORE_FUNCTIONS,
  ACTION_TYPE
};
