import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormCheckbox"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($, undefined){
	$.fn.FormCheckbox = function(){
	    return $.renderComponent.call(this, arguments, "FormCheckbox");
	}

	// 构造函数
    $.components.FormCheckbox = function (element, options) {
        $.components.FormCheckbox.Base.constructor.call(this, element, options);
    };

    // 组件特有配置项
    var DEFAULT = {
        text:"",
        defaultValue: "0"
    }

    $.components.FormCheckbox.inherit($.BaseComponent, {
    	//重写基类的render方法
    	render: function () {
            //是否可见
            if (!this.visible) { 
                
                this.$wrap.hide(); 
                return; 
            }

            this.option = $.extend({}, DEFAULT, this.option);
            this.value = this.option.defaultValue;
            
            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            this.setValue(this.value);
        },

        //渲染html内容
        htmlRender: function () {
            if (!this.editable) {
                this.$element.attr("disabled","disabled").addClass('form-disabled');
            }
            else {
                var css = this.option.defaultValue ? "active" : "";
                this.$checklabel = $('<label class="check-label '+ css +'"></label>');
                // this.$element.addClass('check-label').addClass(css);
                this.$element.addClass("form-container").append(this.$checklabel);

                this.option.text && this.$element.append('<label class="form-label" for="' + this.dataField + '">'+ this.option.text +'</label>');
            }
        },

        //绑定事件
        bindEvent: function () {
            var _this = this;
            //事件绑定
            this.$element.off("click.FormCheckbox").on("click.FormCheckbox", function(){
                _this.$checklabel.toggleClass('active');

                _this.valChange.call(_this);
            });
        },

        // //数据验证
        // validate: function () {
        // },

        //设置值
        setValue: function (v, confirm) {
            this.value = +v;
            if (!this.editable) {
                this.$element.text(this.value);
            }
            else {
                this.value ? this.$checklabel.addClass('active'):this.$checklabel.removeClass('active');
            }
            confirm && this.valChange();
        },

        getValue: function () {
            if (this.editable) {
                this.value = this.$checklabel.hasClass('active');
            }
            return this.value ? '1' : '0';
        }
    });
}(jQuery));