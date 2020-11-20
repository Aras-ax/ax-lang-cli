import Extract from "./extract";
import translate from "./extractRegexp";

/**
 * 通过正则匹配对词条进行提取
 */
class ExtractOld extends Extract {
  constructor(option) {
    super(option, "regexp");
  }

  transNode(content) {
    return Promise.resolve(content);
  }

  scanNode(content) {
    return translate({
      data: this.option.transWords,
      isTranslate: this.option.isTranslate,
      isCheckTrans: this.option.isCheckTrans,
      onlyZH: this.option.onlyZH,
      CONFIG_HONG: this.option.CONFIG_HONG,
      content
    }).then((data) => {
      let content = data;
      if (this.option.isTranslate) {
        content = data.content;
        data = data.untrans;
      }

      this.addWords(data);
      return content;
    });
  }
}

export default ExtractOld;
