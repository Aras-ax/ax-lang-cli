/* eslint-disable */

import jQuery from 'jquery'
/**
 * 推荐如下调用形式
 * <div data-key="FormHelpText"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery 
 */
(function ($, undefined) {


    // 构造函数
    $.components.FormHelpText = function (element, options) {
        $.components.FormHelpText.Base.constructor.call(this, element, options);
    };
    $.fn.FormHelpText = function () {
        return $.renderComponent.call(this, arguments, "FormHelpText");
    }
    var DEFAULT = { //组件独有配置项
        text: [],
        desc: [],
    }

    // 继承及控件实现
    $.components.FormHelpText.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function () {
            this.option = $.extend({}, DEFAULT, this.option);

            if (this.option.dataOptions && Object.prototype.toString.call(this.option.dataOptions) === "[object Object]") {
                this.option.dataOptions = [this.option.dataOptions];
            }

            //渲染Html页面
            this.htmlRender();
        },

        //渲染html内容
        htmlRender: function () {
            let descStr = '',
                text = '';
            if (this.option.desc.length != 0) {
                descStr = '<div class="help-desc">';
                for (let i = 0; i < this.option.desc.length; i++) {
                    descStr += ('<p>' + this.option.desc[i] + '</p>');
                }
                descStr += '</div>'
                this.$desc = $(descStr);
                this.$element.append(this.$desc);

            }

            if (this.option.text.length != 0) {
                text = '<div class="help-text-wrap">';
                for (let i = 0; i < this.option.text.length; i++) {
                    if(!this.option.text[i].text){//是标题的情况
                        text += ('<h3 class="module-title">' + this.option.text[i].title + '</h3>');
                    }else{
                    text += ('<p><span class="help-text-title">' + this.option.text[i].title + '</span>');
                    text += ('<span class="help-text-content">' + this.option.text[i].text + '</span></p>');
                    }
                }
                text += '</div>';
                text += '<div class="bottom-blank"></div>'
                this.$text = $(text);

                this.$element.append(this.$text);
            }

        },

    });

}(jQuery));