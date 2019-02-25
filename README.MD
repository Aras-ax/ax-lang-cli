# 翻译工具，Excel处理工具

该工具同时包含以下几个功能：
1. 提取代码中的中英文词条
2. 通过Excel将代码中的词条替换成目标语言的词条
3. 检查代码中词条翻译替换的正确性
4. 将Excel文件转成JSON文件
5. 将JSON文件转成Excel文件
6. 深度合并JSON文件

安装
```
npm install xxx
```

使用方式：
1. 通过WinForm界面程序直接操作
2. 通过b28.config.js进行配置
3. 直接通过命令行交互的形式

## 配置参数说明

### 公共参数
`commandType`: 操作类型，枚举值
```
1 提取词条
2 翻译文件
3 翻译检查
4 Excel转JSON
5 JSON转Excel
6 JSON合并
```

### 词条提取
``: 