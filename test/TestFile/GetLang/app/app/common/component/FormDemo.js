import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormDemo"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($, undefined){
	$.fn.FormDemo = function(){
	    return $.renderComponent.call(this, arguments, "FormDemo");
	}

	// 构造函数
    $.components.FormDemo = function (element, options) {
        $.components.FormDemo.Base.constructor.call(this, element, options);
    };

    // 组件特有配置项
    var DEFAULT = {
        //配置项
    }

    $.components.FormDemo.inherit($.BaseComponent, {
    	//重写基类的render方法
    	render: function () {
            this.option = $.extend({}, DEFAULT, this.option);
            
            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            if (this.value) {
                this.setValue(this.value);
            }
        },

        //渲染html内容
        htmlRender: function () {
            if (!this.editable) {
                this.$element.attr("disabled","disabled").addClass('form-disabled');
            }
            else {
                //组件渲染
            }
        },

        //绑定事件
        bindEvent: function () {
            //事件绑定
            //数据改变时调用基类的valChange方法执行自定义业务逻辑
        },

        //数据验证
        validate: function () {
            //自身业务逻辑
            //..........................
            //
            //...自定义业务逻辑写在这...
            //
            //..........................
            //自身业务逻辑-end 
            return true;
        },

        //设置值
        setValue: function (v, confirm) {
            if (v == null) return;
            if (!this.editable) {
                this.value = (v + "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                // this.$element.text(this.value);
            }
            else {
                // this.$element.val(v);
            }
            confirm && this.valChange();
        },

        getValue: function () {
            if (!this.editable) {
                var v = this.value;
                return v==null?"":v;
            }
            else {
                // return this.$element.val().trim();
            }
        },

        getText: function () {
            return this.getValue();
        }
    });
}(jQuery))