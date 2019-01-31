import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <div data-key="FormPercent"></div>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($, undefined){
	$.fn.FormPercent = function(){
	    return $.renderComponent.call(this, arguments, "FormPercent");
	}

	// 构造函数
    $.components.FormPercent = function (element, options) {
        $.components.FormPercent.Base.constructor.call(this, element, options);
    };

    // 组件特有配置项
    var DEFAULT = {
        start: 0,
        end: 100,
        fixed: 2 //保留小数点后几位
    }

    $.components.FormPercent.inherit($.BaseComponent, {
    	//重写基类的render方法
    	render: function () {
            this.option = $.extend({}, DEFAULT, this.option);
            this.barWidth = 16;
            //若a > b,则start与end交互值
            var a = this.option.start, b = this.option.end;
            if(a > b){
                this.option.end = a + b - (this.option.start = b);
            }
            
            this.value = this.option.defaultValue || this.option.start;
            this.total = this.option.end - this.option.start;
            this.startMove = false;
            this.startPoint = {
                x:0, //记录按钮点击的位置
                left:0 //滑块开始时所在的位置
            };
            
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
            this.$element.addClass("form-percent");
            var htmlNode = '<div class="form-per-wrap">' + 
                                '<div class="form-per-bar">' +
                                    '<i class="bar"></i>' +
                                    '<label class="form-per-val">' + this.option.start + '</label>' +
                                '</div>' +
                                '<i class="form-per-s">' + this.option.start + '</i>' +
                                '<i class="form-per-e">' + this.option.end + '</i>' +
                            '</div>';
            this.$element.append(htmlNode);

            this.$bar = this.$element.find("div.form-per-bar");
            this.$text = this.$element.find("label.form-per-val")

            var that = this;
            
            that.totalWidth = that.$element.children(".form-per-wrap").width() - that.barWidth;
        },

        //绑定事件
        bindEvent: function () {
            if (!this.editable) {
                return;
            }
            //事件绑定
            var that = this;
            this.$bar.off("mousedown." + that.dataField ).on("mousedown." + that.dataField, ".bar", function(e){
               
                $(document).off("mousemove." + that.dataField).on("mousemove." + that.dataField, function(e){
                    e.preventDefault();
                    if(!that.startMove){
                        return;
                    }
                    var width = e.pageX - that.startPoint.x;
                    width = that.startPoint.left + width;
                    that.setValueByWidth(width);
                }); 
                
                that.startMove = true;
                that.startPoint = {
                    x: e.pageX,
                    left: parseInt(that.$bar.css("left"))
                }
                that.$text.show();
            });

            

            $(document).off("mouseup." + that.dataField).on("mouseup." + that.dataField, function(e){
                that.startMove = false;
                that.$text.hide();
                $(document).off("mousemove." + that.dataField);

            });
            //数据改变时调用基类的valChange方法执行自定义业务逻辑
        },

        setValueByWidth: function(width){
            width = width > this.totalWidth ? this.totalWidth : (width < 0 ? 0 : width);
            this.$bar.css("left", width);

            this.value = (this.option.start + (width / this.totalWidth) * this.total).toFixed(this.option.fixed);
            this.$text.text(this.value).css("margin-left", -(this.$text.width()/2));

            this.valChange();
        },

        //设置值
        setValue: function (v, confirm) {
            v = parseFloat(v);
            if(v < this.option.start){
                v = this.option.start;
            }else if(v > this.option.end){
                v = this.option.end;
            }

            this.value = v.toFixed(this.option.fixed);
            var width = (this.value - this.option.start) / this.total * this.totalWidth;
            width = width > this.totalWidth ? this.totalWidth : (width < 0 ? 0 : width);

            this.$bar.css("left", width);
            this.$text.text(this.value).css("margin-left", -(this.$text.width()/2));

            confirm && this.valChange();
        },

        getValue: function () {
            return this.value;
        },

        getText: function () {
            return this.getValue();
        }
    });
}(jQuery));