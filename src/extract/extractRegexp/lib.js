var path = require("path");
var spliter = "\t**--**\t";

var MSG = {},
  trim = function (text) {
    return text.trim();
  },
  untranswords = [],
  pageRemark = [],
  unTransRemark = {},
  getRemark = function () {
    return pageRemark;
  },
  getUntrans = function () {
    return unique(untranswords);
  },
  setData = function (data) {
    MSG = clone(data);
  };

function unique(inputs) {
  //用哈希表去重
  var res = [];
  var json = {};
  if (!inputs) {
    return [];
  }
  for (var i = 0; i < inputs.length; i++) {
    if (!json[inputs[i]]) {
      res.push(inputs[i]);
      json[inputs[i]] = 1;
    }
  }
  return res;
}

function translate(content) {
  untranswords = [];
  return doTranslate(content);
}
//替换js文件中的翻译词条，返回翻译后的文本
function doTranslate(content) {
  //替换js中的翻译不会自动加上翻译函数，需要手动根据输出的日志文件进行添加
  // var res = content.replace(/(_\(")(.*?)(]\))|(")(.*?)([^\\]")|(_\(")(.*?)("\))/g, function(key) {
  var res = content.replace(
    /(_\(".*?[^\\]",.*?]?\)|_\('.*?[^\\]',.*?]?\)|_\(".*?[^\\]"\)|_\('.*?[^\\]'\))/g,
    function (key) {
      var quote = '"',
        singleQuote = "'";

      //解决key翻译中带有\"导致未翻译的问题
      // key = key.replace(/(\\")/g, '"');
      //解决key翻译中带有\\导致未翻译的问题
      // key = key.replace(/(\\\\)/g, "\\");
      //_("",[])  || _("",xxx)情况
      if (/(_\(")(.*?)(",)/g.test(key)) {
        //翻译中参数带翻译
        key = "_(" + doTranslate(key.slice(2, -1)) + ")";
        key = key.replace(/(")(.*?)("),/, function (keyRep) {
          keyRep = keyRep.slice(1, -2).replace(/(^\s*)|(\s*$)/g, "");

          if (MSG[keyRep]) {
            // return quote + MSG[keyRep].replace(/"/g, '\\"') + quote + ",";
            return quote + MSG[keyRep] + quote + ",";
          } else {
            untranswords.push(key);
            return quote + keyRep + quote + ",";
          }
        });

        return key;
      } else if (/(_\(')(.*?)(',)/g.test(key)) {
        //_('',xxx) || _('',[])情况
        key = "_(" + doTranslate(key.slice(2, -1)) + ")";

        key = key.replace(/(')(.*?)('),/, function (keyRep) {
          keyRep = keyRep.slice(1, -2).replace(/(^\s*)|(\s*$)/g, "");

          if (MSG[keyRep]) {
            return (
              // singleQuote + MSG[keyRep].replace(/'/g, "\\'") + singleQuote + ","
              singleQuote + MSG[keyRep] + singleQuote + ","
            );
          } else {
            untranswords.push(key);
            return singleQuote + keyRep + singleQuote + ",";
          }
        });
        return key;
      } else if (/(_\(")(.*?)("\))/g.test(key)) {
        //下划线翻译处理
        if (key !== "") {
          key = key.slice(3, -2).replace(/(^\s*)|(\s*$)/g, "");

          if (MSG[key]) {
            // return "_(" + quote + MSG[key].replace(/"/g, '\\"') + quote + ")";
            return "_(" + quote + MSG[key] + quote + ")";
          } else {
            untranswords.push(key);
            return "_(" + quote + key + quote + ")";
          }
        } else {
          return;
        }
      } else if (/(_\(')(.*?)('\))/g.test(key)) {
        //下划线翻译处理
        if (key !== "") {
          key = key.slice(3, -2).replace(/(^\s*)|(\s*$)/g, "");

          if (MSG[key]) {
            return (
              "_(" +
              singleQuote +
              // MSG[key].replace(/"/g, '\\"') +
              MSG[key] +
              singleQuote +
              ")"
            );
          } else {
            untranswords.push(key);
            return "_(" + quote + key + quote + ")";
          }
        } else {
          return;
        }
      } else {
        key = key.slice(1, -1).replace(/(^\s*)|(\s*$)/g, "");
      }

      if (/[\u4e00-\u9fa5]/.test(key) || /[a-zA-Z]/.test(key)) {
        untranswords.push(key);
      }

      // return quote + key.replace(/"/g, '\\"') + quote;
      return quote + key + quote;
    }
  );
  return res;
}

function PosToRow(str) {
  var oldpos = 0;
  var coderow = 0;
  var regExp =
    str.indexOf("\r\n") > -1
      ? new RegExp("\\r\\n", "g")
      : str.indexOf("\n") > -1
      ? new RegExp("\\n", "g")
      : new RegExp("\\r", "g");

  //console.log(regExp);
  return function (pos) {
    var pre = str.substring(oldpos, pos);
    oldpos = pos;
    var submatch = pre.match(regExp);
    coderow += submatch ? submatch.length : 0;
    return coderow + 1;
  };
}

function addInfo(str, data, pos) {
  var posToRow = PosToRow(data);
  var row = posToRow(pos);
  return [
    str,
    "  行号:" + row,
    "http://127.0.0.1:8813/execute.html?execute://" +
      path.dirname(__dirname) +
      "\\execute\\notepad2.exe /r /g " +
      row +
      " ",
    data
      .substring(data.lastIndexOf("\n", pos - 10), data.indexOf("\n", pos + 10))
      .replace(/[\n\r]/g, "   ")
  ].join(spliter);
  //增加代码摘要，+-10为缓冲范围
  //console.log(data.lastIndexOf('\n', pos - 10), data.indexOf('\n', pos + 10)
}

function filter(keys, key, index) {
  return keys.some(function (v) {
    //added by zy   考虑如下情况   import "xxx"  key.lastIndexOf(v) === index-v.length //true   所有要先判断是否为-1
    if (
      v === key ||
      (key.lastIndexOf(v) !== -1 && key.lastIndexOf(v) === index - v.length)
    )
      return true;
  });
}

//获取js资源文件内语言,对于注释的代码和宏功能为开启的代码不进行提取
function getWords(data, onlyZH) {
  pageRemark = [];
  //console.log("data=" + data + " onlyZH=" + onlyZH + " file=" + file);
  var regqutoe = new RegExp(/((["'])(?:\\.|[^\\\n])*?\2)/g); //获取""和''内的内容包括引号
  var ignoreKeyWord = [
    "import ",
    "require(",
    "$(",
    "<%",
    "getElementById(",
    "find(",
    "addClass(",
    "$.post(",
    "$.get(",
    "delegate(",
    "case ",
    "hasClass(",
    "indexOf(",
    "getElementsByTagName(",
    "getElementsByClassName(",
    "on(",
    "setTextDomain(["
  ];
  var matchKeyWord = ["_(", "showMsg(", "MSG["];
  var maxBackLen = 25; //定义最长回溯长度,一般js里的关键字长度不会超过25

  var ret = [],
    tempData = data,
    hongNames = [];

  //add by xc
  //判断宏控制的功能是否开启，若未开启则移除代码
  //宏控制的功能代码段特殊标记/*<宏名称>*/ xxxxx /*-宏名称-*/，若只有单个标记则直接忽略
  data.replace(/((\/\*<)(.*?)(>\*\/))/g, function (match) {
    let hongName = match
      .replace(/\/\*</, "")
      .replace(/>\*\//, "")
      .replace(/(^\s+)|(\s+$)/g, "");
    if (hongNames.indexOf(hongName) === -1) {
      hongNames.push(hongName);
      //若功能关闭，则移除标签段内的所有代码
      if (
        global.CONST[hongName] !== "y" &&
        typeof global.CONST[hongName] !== "undefined"
      ) {
        let reg = new RegExp(
          "(\\/\\*<( *)" +
            hongName +
            "( *)>\\*\\/)((.|\\s)*?)(\\/\\*-( *)" +
            hongName +
            "( *)-\\*\\/)",
          "g"
        );
        tempData = tempData.replace(reg, "");
      }
    }
  });

  data = tempData;

  //对于已注释的代码不进行提取操作
  //去除 /* xxx */ 或者// 注释的代码段
  data = data.replace(
    /((\/\*)((.|\s)*?)(\*\/))|((\/\/)((?:\\.|[^\\\n])*?)(\n))/g,
    ""
  );
  //end

  data.replace(regqutoe, function (matches) {
    matches = matches.slice(1, matches.length - 1);
    if (matches.trim().length > 0) {
      if (/[\u4e00-\u9fa5]/.test(matches)) {
        //是否含有中文
        if (/_\(['"].*?['"][\),]/.test(matches)) {
          //说明是在引号中间包裹的_("")
          //分为带参数，不带参数
          //双引号  单引号的四种情况
          matches = matches
            .split("_('")
            .pop()
            .split(`_("`)
            .pop()
            .split("',")[0]
            .split(`",`)[0]
            .split(`")`)[0]
            .split(`')`)[0];
        }
        ret.push(matches);
      } else if (!onlyZH) {
        if (matches.trim().length > 1 && /[a-z]/i.test(matches)) {
          var backLength =
            arguments[3] >= maxBackLen ? maxBackLen : arguments[3]; //计算回溯长度,一般js里的关键字长度不会超过25

          var backStr = data.substr(arguments[3] - backLength, backLength);
          if (
            filter(matchKeyWord, backStr, backLength) ||
            (matches.indexOf(" ") > -1 && !/^[#\.]|/.test(trim(matches)))
          ) {
            //回溯查找
            ret.push(matches);
          } else if (!filter(ignoreKeyWord, backStr, backLength)) {
            //无法确定的string添加摘要后输出
            pageRemark.push(addInfo(matches, data, arguments[3]));
          }
        }
      }
    }
  });

  return unique(ret);
}

//深度克隆对象
function clone(obj) {
  var newObj = {};

  for (var i in obj) {
    if (typeof obj[i] == "object" || typeof obj[i] == "function") {
      newObj[i] = clone(obj[i]);
    } else {
      newObj[i] = obj[i];
    }
  }

  return newObj;
}

function getUnTranslate() {
  let MSGCopy = [];
  for (var key in unTransRemark) {
    MSGCopy.push(key);
    let val = unTransRemark[key];
    for (let i = 0, l = val.length; i < l; i++) {
      MSGCopy.push(val[i]);
    }
  }
  return MSGCopy;
}

export default {
  setData,
  translate,
  getWords, //获取js等文件语言
  getUnTranslate,
  getUntrans,
  getRemark
};
