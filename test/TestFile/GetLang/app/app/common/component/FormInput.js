import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormInput"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($, undefined){
	$.fn.FormInput = function(){
	    return $.renderComponent.call(this, arguments, "FormInput");
	}

	// 构造函数
    $.components.FormInput = function (element, options) {
        $.components.FormInput.Base.constructor.call(this, element, options);
    };

    var displayMode = {
            edit:'edit',
            read:'readonly',
            readEdit:'readEdit'
        },
        DEFAULT = { //组件独有配置项
            placeholder: '',
            displayMode: displayMode.edit,
            removeSpace:false,//移除首尾空格
            hasEyes:false,// 是否有眼睛图标显示，只有在type为password的情况下才有效
            dataOptions:[],//[{type:"",args:[]}]
            defaultText:"", // 值为空时显示的默认文本
            defaultTextClass:"gray",
            switchCallBack:null,//切换模式回调函数
            focusCallBack:null,//文本框获取焦点回调
            maxLength:""
        }

    // 继承及控件实现
    $.components.FormInput.inherit($.BaseComponent, {
    	//重写基类的render方法
    	render: function () {
            this.option = $.extend({}, DEFAULT, this.option);

            this.supportPlaceHolder = 'placeholder' in document.createElement('input');
            this.supportChangeType = supportChangeType();
            this.type = this.option.type;

            if(this.option.dataOptions && Object.prototype.toString.call(this.option.dataOptions) === "[object Object]"){
                this.option.dataOptions = [this.option.dataOptions];
            }

            //记录组件显示状态
            //edit（编辑），read（只读）,readEdit（编辑只读状态互转）
            this.displayMode = this.option.displayMode;
            this.editable = this.displayMode == displayMode.read ? false : this.editable;
            this.value = this.option.defaultValue;

            this.$holderplace = null;

            //渲染Html页面
            this.htmlRender();
            //设置placeholder
            this.setPlaceHolder(this.option.placeholder);
            //绑定事件
            this.bindEvent();

            this.option.capTipCallback && this.addCapTip();

            this.setValue(this.value);
        },

        //渲染html内容
        htmlRender: function () {
            if (!this.editable) {
                this.$element.attr("disabled","disabled").addClass('form-disabled');
            }

            if(this.type === "password"){
                if(this.$element.attr("type") !== "password"){
                    if(this.supportChangeType){
                        this.$element.prop("type", "password");
                    }else{
                        var $copyNode = $('<input type="password"/>');
                        var tarElem = this.$element[0],
                            attrs = tarElem.attributes;

                        for(var i=0, l = attrs.length; i<l; i++){
                            var attr = attrs[i];
                            if(attr.nodeName !="type"){
                                $copyNode.attr(attr.nodeName, attr.nodeValue);
                            }
                        }
                        this.$element.replaceWith($copyNode);
                        this.$element = $copyNode;
                    }
                }
            }

            this.$element.addClass("form-input").attr("name",this.dataField).attr("placeholder", this.option.placeholder).attr("maxlength",this.option.maxLength);
            //type为password时，输入框获取焦点则显示输入的文本信息
            if(!this.supportChangeType && this.type === "password"){
                this.$textElem = $('<input type="text" class="form-input" style="display:none;"/>');
                var tarElem = this.$element[0],
                    attrs = tarElem.attributes;

                for(var i=0, l = attrs.length; i<l; i++){
                    var attr = attrs[i];
                    if(attr.nodeName !="type"){
                        this.$textElem.attr(attr.nodeName, attr.nodeValue);
                    }
                }

                this.$textElem.insertAfter(this.$element);
            }

            var left = this.$element.outerWidth();
            if(this.option.hasEyes && this.type === "password"){
                this.$eyes = $('<i class="icon-eyes-close form-input-eyes" style="left: ' + (left + this.$element.position().left - 30) + 'px"></i>');
                this.$eyes.insertAfter(this.$element);
            }

            if(this.displayMode === displayMode.readEdit){
                this.$readELement = $('<label class="form-inputmess ellipsis"></label>');
                // this.$readEditBth = $('<i class="edit-icon icon-edit" style="left: ' + left + 'px"></i>');
                this.$readEditBth = $('<i class="edit-icon icon-edit"></i>');
                this.$readWrap = $("<div class='form-inputread'></div>").append(this.$readELement).append(this.$readEditBth);
                this.$element.before(this.$readWrap).hide();
            }
        },

        //绑定事件
        bindEvent: function () {
            var _this = this;

            //获取焦点时，进行错误提示信息等移除
            this.$element.unbind("focus.FormInput").bind("focus.FormInput", this, function (e) {
                var _this = e.data;
                _this.option.focusCallBack && _this.option.focusCallBack.call(_this);
                _this.removeValidateText();
            });

            //值类型为整数或者小数时，进行输入限制
            if(this.option.dataValueType === "num"){
                this.$element.unbind("keydown.FormInput").bind("keydown.FormInput", this, function (e) {
                    var code = e.keyCode, ignoreCode = [8, 9, 37, 39, 46];// backspace键，tab键，左键，右键，delete键
                    
                    if(!((code >= 48 && code <= 57) || (code >=96 && code <= 105) || ignoreCode.indexOf(code) > -1)){
                        // e.preventDefault();
                        return false;
                    }
                });

                this.$element.unbind("keyup.FormInput").bind("keyup.FormInput", this, function (e) {
                    var v;
                    if(this.value == "0"){
                        v = 0;
                    }else{
                        v = this.value.replace(/[^\d]+/g,"");
                    }

                    v !== "" && (v = Number(v));
                    if(this.value !== v){
                        this.value = v;
                    }
                });
            }else if(this.option.dataValueType === "float"){
                this.$element.unbind("keydown.FormInput").bind("keydown.FormInput", this, function (e) {
                    var code = e.keyCode, ignoreCode = [8, 9, 37, 39, 46, 110, 190];// backspace键，tab键，左键，右键，delete键，小键盘.键，.键
                    if(!((code >= 48 && code <= 57) || (code >=96 && code <= 105) || ignoreCode.indexOf(code) > -1)){
                        return false;
                    }

                    if(this.value === "" && (code === 190 || code === 110)){
                        return false;
                    }

                    //.键
                    if(code === 190 || code === 110){
                        if(this.value.indexOf(".") > -1){
                            return false;
                        }
                    }
                });

                this.$element.unbind("keyup.FormInput").bind("keyup.FormInput", this, function (e) {
                    var curVal = this.value;
                    if(curVal === ""){
                        return;
                    }
                    curVal = curVal.replace(/([^\d\.]|\s)/g, "");
                    if (/\./.test(curVal)) {
                        // var split = curVal.split(".");
                        // curVal = ~~(split[0]) + ".";
                        // split.shift();
                        // curVal += split.join("");
                        curVal = curVal.replace(/[^\d\.]+/g,"");
                    }else if(curVal !== ""){
                        // curVal = curVal == "0" ? curVal : curVal.replace(/^0+/g,"");
                        curVal = Number(curVal);
                    }
                    if(this.value !== curVal){
                        this.value = curVal;
                    }
                });
            }

            //当前的输入框为密码时
            if(this.type === "password"){
                //兼容IE,若可以更改type属性则直接进行type属性的修改
                if(this.supportChangeType){
                    //有眼睛按钮的情况下通过点击眼睛来切换明文密文
                    if(this.option.hasEyes){
                        this.$eyes.off("click.FormInputeyes").on("click.FormInputeyes", function(){
                            if($(this).hasClass('active')){
                                _this.$element.attr("type", "password");
                            }else{
                                _this.$element.attr("type", "text");
                            }
                            $(this).toggleClass('active');
                            return false;
                        });
                    }else{
                    //无眼睛的情况下通过文本框获取和失去焦点来切换明文米密文
                        this.$element.off("focus.FormInputpass").on("focus.FormInputpass", function(){
                            this.type = "text";
                        });

                        this.$element.off("blur.FormInputpass").on("blur.FormInputpass", function(){
                            this.type = "password";
                        });
                    }
                }else{
                    //绑定事件，控制两个输入框的显示隐藏，数据同步
                    if(this.option.hasEyes){
                        this.$eyes.off("click.FormInputeyes").on("click.FormInputeyes", function(){
                            if($(this).hasClass('active')){
                                _this.setValue(_this.$textElem.val());
                                _this.$textElem.hide();
                                _this.$element.show();
                            }else{
                                _this.setValue(_this.$element.val());
                                _this.$textElem.show();
                                _this.$element.hide();
                            }
                            $(this).toggleClass('active');
                            return false;
                        });
                        
                        _this.$textElem.on('keyup.FormInputpass', function () {
                            var $this = $(this);
                            _this.setValue($this.val());
                        });

                        // this.$textElem.on('blur.FormInput.pass', function () {
                        //     var $this = $(this);

                        //     _this.setValue($this.val());
                        //     _this.$element.blur();
                        // });
                    }else{
                        _this.$element.off("focus.FormInputpass").on('focus.FormInputpass', function () {
                            var val = this.value, pos = $(this).position();
                            // $(this).addClass('hide');
                            _this.$textElem.css({position:"absolute", top:pos.top, left:pos.left}).show();
                            if(val === ""){
                                this.value = " ";
                            }
                            setTimeout(function() {
                                // _this.$textElem.focus();
                                _this.focus(_this.$textElem[0]);
                                _this.removeValidateText();
                                $.setCursorPos(_this.$textElem[0], val.length);
                            }, 0);
                        });
                        
                        _this.$textElem.on('keyup.FormInputpass', function () {
                            var $this = $(this);
                            _this.setValue($this.val());
                        });

                        _this.$textElem.on('blur.FormInputpass', function () {
                            var $this = $(this);

                            _this.setValue($this.val());
                            $this.hide();
                            // _this.$element.removeClass('hide');
                            _this.$element.blur();
                        });
                    }
                }
            }

            //切换显示风格
            if(this.displayMode === displayMode.readEdit){
                this.$readEditBth.off("click.formInput").on("click.formInput", function(){
                    _this.lastValue = _this.getValue();
                    _this.changeDisplayMode("show");
                    _this.option.switchCallBack && _this.option.switchCallBack.call(_this);
                });

                // this.$element.unbind("blur.FormInput").bind("blur.FormInput", this, function (e) {
                //     var _this = e.data;
                //     _this.valChange();
                // });
            }

            //G0项目需要数据实时校验
            /*this.$element.off("keyup.FormValidate").on("keyup.FormValidate", this, function (e) {
                _this.format();
                _this.onValidate()
            });*/

            //失去焦点，进行数据校验
            this.$element.unbind("blur.FormInput").bind("blur.FormInput", this, function (e) {
                var _this = e.data;
                if(_this.option.dataValueType === "float"){
                    if(this.value && this.value.indexOf(".") === this.value.length -1){
                        var v = Number(this.value) + "";
                        this.value = v;
                    }
                }
                
                _this.valChange();
            });

            //对于自定义placeholder情况的实现
            if(_this.$holderplace){
                //如果是密码输入框
                if(this.$textElem){
                    _this.$textElem.keyup(function(e) { 
                        if(this.value){
                            _this.$holderplace.hide();
                        }else{
                            _this.$holderplace.show();
                        }
                    });
                }

                _this.$element.keyup(function(e) { 
                    if(this.value){
                        _this.$holderplace.hide();
                    }else{
                        _this.$holderplace.show();
                    }
                });
                
                _this.$holderplace.click(function(e) {
                    // _this.$element.focus();
                    _this.focus();
                });
            }
        },

        //文本框获取焦点后，将光标移动到文本框的末尾
        focus:function(dom, start, end){
            var dom = dom || this.$element[0], l = dom.value.length;
            start = start || l;
            end = end || l;

            if (dom.setSelectionRange) {  
                dom.focus();  
                dom.setSelectionRange(start, end);  
            }  
            else if (dom.createTextRange) {  
                var range = dom.createTextRange();  
                range.collapse(true);  
                range.moveEnd('character', end);  
                range.moveStart('character', start);  
                range.select();  
            }  
        },

        changePlaceholder:function(placeholder){
            this.setPlaceHolder(placeholder);
        },

        changeDisplayMode: function(mode){
            if(mode === "show"){
                this.$readWrap.hide();
                this.$element.show();
                // this.$element.show().focus();
                this.focus();
            }else{
                this.$readWrap.show();
                this.$element.hide();
            }
        },

        //值改变，调用基类的API，实现自定义业务逻辑
        valChange: function () {
            this.getValue();
            if(this.option.autoValidate){
                var v = this.onValidate();
                if(v){
                    this.handleChangeEvents();
                }
                if(!!v && this.displayMode === displayMode.readEdit){
                    // 改变值
                    var text = this.getValue();
                    if(text == "" && this.option.defaultText){
                        text = this.option.defaultText;
                        this.$readELement.addClass(this.option.defaultTextClass);
                    }else{
                        this.$readELement.removeClass(this.option.defaultTextClass);
                    }
                    this.$readELement.text(text).attr("title", text);
                    this.changeDisplayMode("hide");
                }
            }
			this.option.afterChangeCallBack && this.option.afterChangeCallBack.call(this);
        },

        //数据验证
        validate: function () {
            //格式验证
            var val = this.value;
            if (val !== "" && val !== undefined && this.option.dataOptions && this.option.dataOptions.length > 0) {
                var err = '', isValid = true, opt;
                
                for(var i = 0, l = this.option.dataOptions.length; i<l; i++){
                    opt = this.option.dataOptions[i];
                    var types = opt.type.split("."), 
                        fn = $.valid, 
                        obj = {},
                        args = [val].concat(opt.args);

                    for(var j = 0, k = types.length; j < k; j++){
                        j === k - 1 && (obj = fn);
                        if(fn) fn = fn[types[j]];
                    } 

                    if(fn){
                        err = fn.apply(obj, args);
                        if(err) break;
                    }
                }
                
                err && (isValid = false);
                
                if (!isValid) {
                    this.addValidateText(err);
                    return false;
                }
            }
            return true;
        },

        //设置placeholder 
        setPlaceHolder: function (ph) {
            if (this.editable && !!ph) {
                this.option.placeholder = ph.toString();

                //兼容IE9及以下
                if(this.supportPlaceHolder){
                    this.$element.attr("placeholder", this.option.placeholder);
                }else{
                    if(this.$holderplace){
                        this.$holderplace.text(this.option.placeholder);
                    }else{
                        var self = this.$element, 
                            _this = this;
                        var pos = self.position(), 
                            h = self.outerHeight(true), 
                            paddingleft = self.css('padding-left'),
                            fontsize = self.css("font-size");
                        this.$holderplace = $('<span class="forn-input-pholder"></span>').text(ph)
                                                       .css({
                                                        left:pos.left || (_this.option.hasTitle ? 15 : 0), 
                                                        top:pos.top, 
                                                        height:h, 
                                                        lineHeight:parseInt(h)+"px", 
                                                        paddingLeft:paddingleft, 
                                                        position:'absolute', 
                                                        color:'#aaa',
                                                        "max-width":"100%",
                                                        whiteSpace:"nowrap",
                                                        "z-index":10,
                                                        overflow:"hidden",
                                                        "font-size":fontsize
                                                       }).appendTo(self.parent());
                        
                    }
                }
            }
        },

        removePlaceholder:function(){
            if(this.supportPlaceHolder){
                this.$element.attr("placeholder", "");
            }else{
                this.$holderplace && this.$holderplace.text("");
            }
        },

        //设置值
        setValue: function (v, confirm) {
            // if (v == null) return;
            if (!this.editable) {
                this.value = (v + "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                this.$element.val(this.value);
            }
            else {
                this.$element.val(v);
                this.$textElem && this.$textElem.val(v);
                
                if(this.$readELement){
                    if(v === "" && this.option.defaultText){
                        v = this.option.defaultText;
                        this.$readELement.addClass(this.option.defaultTextClass);
                    }else{
                        this.$readELement.removeClass(this.option.defaultTextClass);
                    }
    
                    this.$readELement.text(v).attr("title", v);
                }
                if(v && this.$holderplace){
                    this.$holderplace.hide();
                }
            }
            confirm && this.valChange();
        },

        getValue: function () {
            if (!this.editable) {
                var v = this.value;
                this.value = v==null?"":v;
            }
            else {
                this.value = this.$element.val();
                this.option.removeSpace && (this.value = this.value.trim());
            }
            
            this.format();
            return this.value;
        },

        addCapTip: function() {
            var _this = this;

            function hasCapital(value, pos) {
                var pattern = /[A-Z]/g;
                pos = pos || value.length;

                return pattern.test(value.charAt(pos - 1));
            }

            var $capTipElem = this.$element;
            if (this.$textElem && this.$textElem.length == 1) {
                $capTipElem = this.$textElem;
            }

            //add capital tip
            $capTipElem.on('keyup', function (e) {
                var myKeyCode  =  e.keyCode || e.which,
                    pos;

                // HANDLE: Not input letter
                if (myKeyCode < 65 || myKeyCode > 90) {
                    return true;
                }

                pos = $.getCursorPos(this);

                if (hasCapital(this.value, pos)) {
                    _this.option.capTipCallback(true);//输入的是大写字母
                } else {
                    _this.option.capTipCallback(false);//输入的是小写字母
                }
            });
        }
    }); 
   
    //是否支持修改input元素的type属性
    function supportChangeType(){
        try{
            var $elem =  $('<input type="text" style="display:none;"/>').appendTo("body");
            $elem.attr("type", "password");
            var s = $elem[0].type === "password";
            $elem.remove();
            return s;
        }
        catch(e){
            return false;
        }
    }
}(jQuery));