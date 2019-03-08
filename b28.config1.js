module.exports = {
    /**
     * 当前执行的操作类型
     * 1 提取词条
     * 2 翻译文件
     * 3 翻译检查
     * 4 Excel转JSON
     * 5 JSON转Excel
     * 6 JSON合并
     */
    commandType: 1,

    // 提取此条相关配置
    /**
     * bool 
     * 只提取中文词条
     */
    onlyZH: true,
    /**
     * string
     * 待提取文件根目录
     */
    baseReadPath: 'D:/Git/translate/test/TestFile/test/allTest',
    /**
     * string
     * 提取的Excel文件输出目录
     */
    baseOutPath: './test/TestFile/output/allTest',
    /**
     * string
     * 宏文件地址
     */
    hongPath: './test/TestFile/config/index.js',

    // 翻译文件配置
    /**
     * 待翻译文件根目录
     */
    baseTranslatePath: 'D:/Git/translate/test/TestFile/test/allTest',
    /**
     * 翻译后文件输出根目录
     */
    baseTransOutPath: './test/TestFile/output/allTest',
    /**
     * 语言包文件地址
     */
    languagePath: 'D:/Git/translate/test/TestFile/testData/allTest/translate.xlsx',
    /**
     * 宏文件地址
     */
    hongPath: './test/TestFile/config/index.js',
    /**
     * key对应列
     */
    keyName: 'EN',
    /**
     * value对应列
     */
    valueName: 'CN',
    /**
     * Excel对应的sheet名称
     */
    sheetName: '',

    // 翻译检查陪着
    /**
     * 待检查文件根目录
     */
    baseCheckPath: './test/TestFile/testData/allTest/translate',
    /**
     * 语言包json文件地址
     */
    langJsonPath: './test/TestFile/testData/allTest/translate/lang.json',
    /**
     * 宏文件地址
     */
    hongPath: './test/TestFile/config/index.js',
    /**
     * 检查信息输出路径
     */
    logPath: 'D:/Git/translate/test/TestFile/output/allTest/test',

    // excel转json配置
    /**
     * key对应列
     */
    keyName: 'EN',
    /**
     * value对应列
     */
    valueName: '',
    /**
     * Excel对应的sheet名称
     */
    sheetName: '',
    /**
     * Excel文件地址
     */
    excelPath: 'D:/Git/translate/test/TestFile/testData/excel2json.xlsx',
    /**
     * 输出json文件目录
     */
    outJsonPath: './test/TestFile/output',

    // json转Excel配置
    /**
     * json文件地址
     */
    jsonPath: 'D:/Git/translate/test/TestFile/testData/onlyZH.json',
    /**
     * 输出Excel文件目录
     */
    outExcelPath: './test/TestFile/output/test1.xlsx',

    // json合并配置
    /**
     * 主json文件
     */
    mainJsonPath: './test/TestFile/testData/onlyZH.json',
    /**
     * 次json文件
     */
    mergeJsonPath: './test/TestFile/testData/en.json',
    /**
     * 合并后输出的文件地址
     */
    outMergeJsonPath: './test/TestFile/testData/hebin.json'
}