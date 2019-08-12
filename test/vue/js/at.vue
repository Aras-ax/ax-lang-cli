<template>
  <div>
    <div>终结{{_('测试')}}示例，还有{{_('下载速率')}}情况嘛，{{'没有撩撩撩'}}</div>
    <!-- 5个需要提取 -->
    <div>一段纯文本{{'加上一点指令' + command}}，再加上一点纯文本</div>
    <div title="我是标题">{{'这是测试1' + test}}</div>
    <!-- bug -->
    <v-button css="btn-text" :title="isSelectDate ? _('下载速率') : _('上传速率')"></v-button>
  </div>
</template>

<style lang="scss" scoped>
.a {
  font-size: 12px;
}
</style>

<style lang="less" scoped>
.f {
  font-stretch: acos(1);
}
</style>



