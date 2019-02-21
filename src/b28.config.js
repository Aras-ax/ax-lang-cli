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
    onlyZH: false,
    /**
     * string
     * 待提取文件根目录
     */
    baseReadPath: '',
    /**
     * string
     * 提取的Excel文件输出目录
     */
    baseOutPath: '',
    /**
     * string
     * 宏文件地址
     */
    hongPath: '',
    // 翻译文件配置
    /**
     * 待翻译文件根目录
     */
    baseTranslatePath: '',
    /**
     * 翻译后文件输出根目录
     */
    baseTransOutPath: '',
    /**
     * 语言包文件地址
     */
    languagePath: '',
    /**
     * 宏文件地址
     */
    hongPath: '',
    // 翻译检查陪着
    /**
     * 待检查文件根目录
     */
    baseCheckPath: '',
    /**
     * 语言包json文件地址
     */
    langJsonPath: '',
    /**
     * 宏文件地址
     */
    hongPath: '',
    /**
     * 检查信息输出路径
     */
    logPath: '',
    // excel转json配置
    /**
     * key对应列
     */
    keyName: '',
    /**
     * value对应列
     */
    valueName: '',
    /**
     * Excel文件地址
     */
    excelPath: '',
    /**
     * 输出json文件目录
     */
    outJsonPath: '',
    // json转Excel配置
    /**
     * json文件地址
     */
    jsonPath: '',
    /**
     * 输出Excel文件目录
     */
    outExcelPath: '',
    // json合并配置
    baseJsonPath: '',
    outMergeJsonPath: ''
}