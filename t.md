# 跨平台桌面程序开放 
- Visual Studio + .net + C# 开发Windows Form 程序
- [ELECTRON](https://electronjs.org/)



# 功能列表

- 提取词条
- 替换词条
- 检查翻译
- Excel to Json
- Json to Excel
- Json合并
- 原厂代码添加翻译



## 提取词条

#### html提取

通过jsdom将html代码转成DOM数，然后可以像我们在浏览器中操作dom一样对这颗树进行操作，提取词条

提取的时候对script标签和其它标签进行分开处理，script标签的逻辑走js提取的流程，其它标签继续走html提取的流程，firstchild和nextSibling进行递归，同时只处理nodeType为1和3的元素

#### JS提取

