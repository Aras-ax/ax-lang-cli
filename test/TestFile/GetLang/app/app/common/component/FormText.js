import jQuery from 'jquery'
/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormText"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery 
 */
(function($, undefined){


	// 构造函数
    $.components.FormText = function (element, options) {
        $.components.FormText.Base.constructor.call(this, element, options);
    };
    $.fn.FormText = function(){
        return $.renderComponent.call(this, arguments, "FormText");
    }
    var DEFAULT = { //组件独有配置项
          
        }

    // 继承及控件实现
    $.components.FormText.inherit($.BaseComponent, {
    	//重写基类的render方法
    	render: function () {
            this.option = $.extend({}, DEFAULT, this.option);

            this.type = this.option.type;

            if(this.option.dataOptions && Object.prototype.toString.call(this.option.dataOptions) === "[object Object]"){
                this.option.dataOptions = [this.option.dataOptions];
            }

            //记录组件显示状态
            this.value = this.option.defaultValue;

            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            this.option.capTipCallback && this.addCapTip();

            this.setValue(this.value);
        },

        //渲染html内容
        htmlRender: function () {
            this.$text = $('<div class="form-text"/>');
            this.$text.insertAfter(this.$element);
            this.setValue(this.value);
        },

        //绑定事件
        bindEvent: function () {
         
        },
        //值改变，调用基类的API，实现自定义业务逻辑
        valChange: function () {
        },
        //设置值
        setValue: function (v, confirm) {
            v = v.replace(/&/g,"&amp;").replace(/ /g,"&nbsp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot");
            this.$text.html(v);
            confirm && this.valChange();
        },

        getValue: function () {
            var val = this.$text.html();
            return val;
        }
        });
    
}(jQuery));