import jQuery from 'jquery';

/**
 * add by xc 弹出框
 * 参数解析
 * title：    string 消息框标题
 * content：  string/$对象，消息体内容(html代码或者iframe框)
 * isIframe:  bool    当content为iframe时，值必为true，默认值为false
 * -----------以下为非必填项
 *
 * skin:      皮肤样式，添加到最外层容器
 * height：   num 高度
 * width：    num 宽
 * autoClose：bool 是否自动关闭
 * timeout：  bool autoClose为true时多少秒后自动关闭
 * closeCallBack：function 关闭弹出框回调函数
 * buttons：  array [{}] 操作按钮
 * -----text：按钮文本值
 * ----theme：按钮主题
 * -autoHide: 点击按钮后是否关闭弹出窗，true为关闭，false为不关闭，默认值：true
 * -callback：点击按钮的回调，参数event会传入
 */
(function($, window, undefined){
	//参数默认值
    var _DEFAULT ={
        title:"消息提醒",
        content:"消息体",
        isIframe: false,
        height:0,
        width:0,
        buttons:[],//[{text:'确定',theme:'ok',autoHide:false,callback:function(e){}}]
        autoClose:false,
        timeout:3,
        closeCallBack:null,
        cancelCallBack:null,
        openCallBack:null
    }

    var titleHeight = 80, footerHeight = 80;

    function ModalDialog(opt){
        this.opt = $.extend({},_DEFAULT, opt);
        var html = [];
        html.push('<div class="md-modal-wrap">');
        html.push('<div class="md-modal ' + (this.opt.skin || "") + '">');
        html.push('<div class="md-content">');
        
        html.push('<div class="md-header">');
        html.push('<h3 class="md-title"></h3>');
        html.push('<button class="md-close icon-close"></button>');
        html.push('</div>');
        html.push('<div class="md-con-body"></div>');
        html.push('<div class="md-toolbar"></div>');
       
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        this.$mask = $(html.join(""));
        this.$overlay = $('<div class="md-overlay"></div>');
        this.$title = this.$mask.find(".md-title");
        this.$close = this.$mask.find('.md-close');
        this.$content = this.$mask.find(".md-con-body");
        this.$footer = this.$mask.find(".md-toolbar");
        this.namespace = "Modal_" + new Date().getTime();
        this.okCb = null;
        this.lessIE10 = is_IE(10);

        this.TIMEOUT = null;
        $("body").append(this.$overlay).append(this.$mask);
        this.calcScrollBarWidth();
        this.init();
        this.bindEvets();
    }

    ModalDialog.prototype = {
    	//初始化
        init:function(){
            this.$title.text(this.opt.title);
            var _this = this;

            this.$content.html("");
            if(this.opt.isIframe){
                this.iframeName = "Modal_Iframe";
                this.$iframe = $('<iframe src="' + this.opt.content + '" frameborder="0" class="modal-iframe" name="'+ this.iframeName +'" />');
                this.$content.css("padding-top",0).html(this.$iframe);
            }
            else{
                try{
                    $(this.opt.content).show();
                }
                catch(e){
                    console.log(e);
                }
                
                this.$content.append(this.opt.content);
            }

            this.reSize();

            this.opt.width > 0 && this.$mask.find('.md-content').css("width", this.opt.width + "px");
            this.opt.height > 0 && this.$content.css("height", this.opt.height + "px");

            this.setButtons(this.opt.buttons);
            this.show();

            //弹出框自动关闭
            if(this.opt.autoClose){
            	window.setTimeout(function(){
            			_this.hide();
            		},_this.opt.timeout*1000);
            }
        },

        calcScrollBarWidth:function(){
            var $d = $('<div style="width:100px;"></div>').appendTo("body");
            var w1 = $d[0].clientWidth;
            $d.css("overflow", "scroll");
            this.scrollW = w1 - $d[0].clientWidth;
            $d.remove();
        },

        reload:function(opt){
            this.opt = $.extend({}, this.opt, opt);
            this.init();
        },

        //获取和设置弹出框尺寸
        getSize:function(){
            this.opt.MAX_Height = (window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight) - titleHeight - 80;
            this.opt.MAX_Width = (window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || document.body.clientWidth) * 0.8;
            this.opt.buttons.length > 0 && (this.opt.MAX_Height -= footerHeight);
        },

        //设置底部操作按钮
        setButtons:function(btns){
            if(!btns || Object.prototype.toString.call(btns) != "[object Array]" || btns.length < 1) {
                this.$footer.remove();
                return;
            }
            var $footer  = this.$footer.show(),
                _this = this;
            $footer.html("");
            for(var i=0,l = btns.length;i<l;i++){
                (function(i){
                    var btn = btns[i], $btn = $('<button class="md-btn '+ btn.theme +'">'+ btn.text +'</button>');
                    if(btn.theme === "ok"){ _this.okCb = btn.callback; }

                    $btn.on("click",function(e){
                        isFunction(btn.callback) && btn.callback(e);
                        if(btn.autoHide === false){
                            return false;
                        }
                    });
                    $footer.append($btn);
                }(i));
            }
            _this.opt.buttons = btns;
        },

        //显示
        show:function(){
            var _this = this;
           
            $("body").css({
                overflow:"hidden",
                "padding-right": _this.scrollW
            });
            _this.$mask.css("overflow", "auto");

            var height = _this.$content.outerHeight();
            if(this.opt.MAX_Height > height){
                var top = ~~((this.opt.MAX_Height - height)/2);
                if(top > 80){
                    top -= 40;
                }
                _this.$mask.css("top", top);
            }
            
            _this.$mask.show();
            _this.$overlay.addClass('md-show');
            _this.$mask.addClass('md-show');

            isFunction(this.opt.openCallBack) && this.opt.openCallBack();
        },

        //隐藏
        hide:function(){
            var _this = this;
            $("body").css({
                overflow:"auto",
                "padding-right": 0
            });
            _this.$mask.css("overflow", "hidden");

            this.$overlay.removeClass('md-show');
            this.$mask.removeClass('md-show');

            isFunction(this.opt.closeCallBack) && this.opt.closeCallBack(window.frames[this.iframeName]);
        },
        
        //重置窗口大小
        reSize:function(opt){
            this.getSize();
        },

        //设置标题
        setTitle:function(text){
            if(text){
                this.$title.text(text);
                this.opt.title = text;
            }
        },

        //事件绑定
        bindEvets:function(){
            var _this = this;
            //改变浏览器窗口大小
            $(window).off('resize.'+_this.namespace).on('resize.'+_this.namespace, function(event) {
                if(_this.TIMEOUT){
                    window.clearTimeout(_this.TIMEOUT);
                    _this.TIMEOUT = null;
                }
                _this.TIMEOUT = window.setTimeout(function(){
                    _this.reSize.call(_this);
                },300);
            });

            //关闭弹出框
            _this.$close.unbind('click.' + _this.namespace).bind('click.'+_this.namespace,function(e){
                _this.hide();
                return false;
            });

            _this.$mask.find(".md-content").off("keydown").on("keydown", function (e) {
               if(e.keyCode === 13){
                   _this.okCb && _this.okCb();
               }
            });

            //底部按钮栏，防止事件冒泡
            _this.$footer.off("click." + _this.namespace).on("click." + _this.namespace, ".md-btn", function(e){
                _this.hide();
                return false;
            });

           //点击阴影部分弹出框隐藏
            _this.$mask.off("click." + _this.namespace).on("click." + _this.namespace, function(e){
                _this.opt.cancelCallBack && _this.opt.cancelCallBack();
                _this.hide();
                return false;
            });

            _this.$overlay.off("click." + _this.namespace).on("click." + _this.namespace, function(e){
                _this.hide();
                return false;
            });

            //点击弹出框内容部分，捕获事件，阻止事件冒泡
            _this.$mask.find(".md-content").off("click." + _this.namespace).on("click." + _this.namespace, function(e){
                // return false;
                $(document).click();
                e.stopPropagation();
            });
        },

        remove:function(){
            this.$mask.remove();
            this.$overlay.remove();
        }
    }

    /**
     * 是否是函数
     * @param  {[type]}  func 函数
     * @return {Boolean}      [true：是]
     */
    function isFunction(func){
        if(func && typeof func === "function"){
            return true;
        }
        return false;
    }

    //组件开放调用api
    $.fn.modalDialog = function(opt){
    	var modal = $(this).data("modalDialog");
    	if(typeof opt == 'string'){
			if( modal && modal[opt] && typeof modal[opt] === "function"){
    			modal[opt]();
    		}
    	}
    	else{
    		if(modal){
    			modal.show();
    		}else{
    			$(this).data("modalDialog",new ModalDialog(opt));
    		}
    	}

        return this;
    };

    $.modalDialog = function(opt){
        return new ModalDialog(opt);
    };

    //opt {title:"", content:"", okCallBack:function(){}//点击确定回调,closeCallBack:function(){}//关闭回调
    $.showConfirm = function(opt){
        var DEFAULT = {
            title:opt.title || _("Confirm"),
            content:opt.content || "",
            isIframe: false,
            height:0,
            width:400,
            buttons:[
                {text:_('OK'),theme:'ok', callback:opt.okCallBack},
                {text:_("Cancel"), callback:opt.cancelCallBack}
                ],
            autoClose:false,
            cancelCallBack: opt.cancelCallBack,
            closeCallBack: opt.closeCallBack
        };

        opt = $.extend({}, DEFAULT, opt);
        return new ModalDialog(opt);
    }

    //小于或等于IE*
    function is_IE(ver) {
        var b = document.createElement('b');
        b.innerHTML = '<!--[if lte IE ' + ver + ']><i></i><![endif]-->'
        return b.getElementsByTagName('i').length === 1
    }
}(jQuery, window));

/**
 * 消息提示框，几秒钟后自动消失
 */
(function($){
    var DEFAULT = {
        message:"",
        hideTime:300, //几秒钟后自动关闭，为0则表示不关闭
        displayTime:1000,
        opacity:0.8,
        callback:function(){
            //
        }
    };

    function FormMess(opt){
        this.option = $.extend({}, DEFAULT, opt);
        this.option.displayTime = parseInt(this.option.displayTime);
        this.option.hideTime = parseInt(this.option.hideTime);
        this.cssTime = 300;
        
        if(top){
            this.$container = $(top.document.body).find("div.form-mess-con");
        }else{
            this.$container = $("div.form-mess-con");
        }

        if(this.$container.length === 0){
            if(top){
                this.$container = $('<div class="form-mess-con"></div>').appendTo(top.document.body);
            }else{
                this.$container = $('<div class="form-mess-con"></div>').appendTo('body');
            }
        }

        this.$pop = $('<div class="form-message ani-init">' + this.option.message + '</div>');

        this.show();
        this.option.callback && this.option.callback();
    }

    FormMess.prototype = {
        show:function(){
            var _this = this;
            
            this.$pop.appendTo(this.$container);
            _this.h = -this.$pop.outerHeight();
            this.$pop.css("margin-top", this.h);
            
            setTimeout(function(){
                _this.$pop.addClass('ani-final').css("margin-top", 0);
            }, 10);
            
            if(_this.option.displayTime){
                setTimeout(function(){
                    _this.hide();
                }, _this.option.displayTime + _this.cssTime); 
            }
        },

        setMess:function(mess){
            if(mess){
                this.$pop.text(mess);
            }
        },

        hide:function(){
            var _this = this;
            _this.$pop.removeClass('ani-final').css("margin-top", _this.h);
            setTimeout(function(){
                _this.$pop.remove();
                _this = null;
            }, _this.option.hideTime);
        }
    };

    $.formMessage = function(opt){
        if(typeof opt === "string"){
            opt = {message: opt};
        }
        return new FormMess(opt);
    }
}(jQuery));

/*
 * 进度条
*/
(function($, undefined){
    var _DEFAULT = {
        msg: '',    //进度条提示语
        cgi: '',    //通知后台重启的接口，为空则不发请求
        duration: 60,   //进度条行走时间，单位s
        jumpTo: '', //进度条走完之后跳转路径，不填则默认刷新
        callback: '' //进度条走完之后执行的回调，优先级高于jumpTo
    }

    function ProgressBar(opt) {
        this.options = $.extend({}, _DEFAULT, opt);

        this.criticalVal = 0; //进度临界值
        this.criticalSpeed = 0; //临界速度：get到数据后，定时器将以该速度5s内走完
        this.requestTimer = null;   //请求定时器
        this.rebootTimer = null;    //重启定时器
        this.flag = true;
        this.ps = 0;    //进度标志

        this.options.duration = +this.options.duration > 60 ? +this.options.duration : 60;  //重启时间至少60秒
        this.speed = this.options.duration / 100 * 1000 ;//计算出定时器时间
        this.delay = this.options.duration / 2 * 1000; //延迟发请求时间

        this.criticalVal = (1 - 5 / (100 * (this.speed / 1000))) * 100;//大于这个进度，进度条会在5秒之内走完，不需要加速
        this.requestUrl = this.options.jumpTo ? 'http://' + this.options.jumpTo : './index.html';

        var html = [];
        html.push('<div class="md-modal-wrap">');
        html.push('<div class="md-modal">');
        html.push('<div class="md-content">');

        html.push('<div class="md-con-body">');
        html.push('<div class="progress-box"><div class="progress-bar"></div></div>');
        html.push('<p><span class="progress-tip"></span><span class="percent">0%</span></p>');
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');

        this.$container = $(html.join(''));
        this.$overlay = $('<div class="md-overlay"></div>');
        this.$tips = this.$container.find('.progress-tip');
        this.$bar = this.$container.find('.progress-bar');
        this.$percent = this.$container.find('.percent');

        this.init();    
    }


    ProgressBar.prototype = {
        init: function() {
            //插入到html中
            this.$tips.text(this.options.msg);
            this.$container.find('.md-content').css("width", "600");
            $("body").append(this.$overlay).append(this.$container);

            this.options.cgi && $.post(this.options.cgi);//通知后台重启

            var pageHeight = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight;
            var contentHeight = this.$container.outerHeight();

            var top = ~~(pageHeight / 2 - contentHeight);

            this.$container.css('top', top);

            this.show();
        },
        show: function() {
            //显示
            this.$overlay.addClass('md-show');
            this.$container.addClass('md-show');

            this.reboot();
        },
        reboot: function() {
            var that = this;

            this.rebootTimer = setTimeout(function() {
                that.reboot();
                that.ps++;

                if(that.ps > 100) {
                    clearTimeout(that.rebootTimer);
                    clearTimeout(that.requestTimer);
                    if(typeof that.options.callback === 'function') {
                       that.options.callback.call(that);
                    }else {
                       that.options.jumpTo === '' ? window.location.reload(true) : window.location.href = 'http://' + that.options.jumpTo;
                    } 
                }
     
            }, this.speed);

            this.requestTimer = setTimeout(function() {
                if(that.flag) {
                    $.get(that.requestUrl, function(res) {
                        if(that.ps < that.criticalVal && typeof res === 'string' && res.indexOf('<!DOCTYPE html>') > -1 ) {
                            that.flag = false;

                            that.criticalSpeed = (5 / (100 - that.ps + 1)) * 1000;
                            that.speed = that.criticalSpeed;
                            clearTimeout(that.requestTimer);
                        }
                    });
                }
               
            }, that.delay);

            this.$bar.css('width', this.ps + '%');
            this.$percent.html(this.ps + '%')
        }
    }



    $.progress = function(opt) {
        if(typeof opt === 'string') {
            opt = {msg: opt};
        }
        return new ProgressBar(opt);
    }

}(jQuery));