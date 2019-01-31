import jQuery from 'jquery';
/**
 * 推荐如下调用形式
 * <div data-key="FormUpload"></div>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($, undefined){
	$.fn.FormUpload = function(){
	    return $.renderComponent.call(this, arguments, "FormUpload");
	}

	// 构造函数
    $.components.FormUpload = function (element, options) {
        $.components.FormUpload.Base.constructor.call(this, element, options);
    };

    // 组件特有配置项
    var DEFAULT = {
        submitUrl:"",//提交地址
        showFileText: true,//是否显示上传文件名框
        browseText: _("Browse..."),//文件浏览按钮文本
        uploadText: _("Upload"),//上传按钮文本
        beforeUpload:null,// 上传文件前的操作，格式检查之类的，通过this.value可取到上传文件的文件名,若取消上传，返回false
        success: null //上传文件返回成功的回调
    }

    $.components.FormUpload.inherit($.BaseComponent, {
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
            this.$element.addClass("form-upload");
            if(this.option.showFileText){
                this.$text = $('<input type="text" class="form-upload-text" readonly/>').appendTo(this.$element);
                this.$browse = $('<button type="boutton" class="form-upload-btn form-btn-br">' + this.option.browseText + '</button>').appendTo(this.$element);
            }
            this.ID = $.IGuid();
            this.$fileInput = $('<input  type="file" class="form-upload-file" name="'+ this.dataField +'" id="' + this.ID + '"/>').appendTo(this.$element);
            this.$btnUpload = $('<button type="boutton" class="btn-normal">' + this.option.uploadText + '</button>').appendTo(this.$element);

            if (!this.editable) {
                this.$element.children("input").attr("disabled","disabled").addClass('form-disabled');
            }
        },

        //绑定事件
        applyAjaxFileUpload: function () {
            var result = this.option.beforeUpload && this.option.beforeUpload.call(this),
                that = this;

            if(result === false){
                return;
            }
            that.option.showFileText && that.$fileInput.attr("disabled","disabled").addClass('form-disabled');
            that.$btnUpload.attr("disabled","disabled").addClass('form-disabled').text(_("Uploading..."));
            
            $.ajaxFileUpload({
                url: that.option.submitUrl,
                secureuri: false,
                fileElementId: that.ID,
                data: result,
                dataType: 'text',
                success: function (d) {
                    that.option.showFileText && that.$fileInput.removeAttr("disabled","disabled").removeClass('form-disabled');
                    that.$btnUpload.removeAttr("disabled").removeClass('form-disabled').text(that.option.uploadText);
                    that.option.success && that.option.success.call(that, d);
                    
                    //重新绑定事件
                    if(this.option.showFileText){
                        this.$fileInput.off("change").on("change", function(){
                            that.$text.val(this.value);
                            that.value = this.value;
                        });
                    }else{
                        this.$fileInput.off("change").on("change", function(){
                            that.value = this.value;
                            that.applyAjaxFileUpload();
                        });
                    }
                }
            });
        },

        bindEvent:function(){
            var that = this;
            if(this.option.showFileText){
                this.$browse.off("click").on("click", function(){
                    that.$fileInput.click();
                    return false;
                });

                this.$fileInput.off("change").on("change", function(){
                    that.$text.val(this.value);
                    that.value = this.value;
                });

                this.$btnUpload.off("click").on("click", function(){
                    if(!that.value){
                        $.formMessage(_("Please select a firmware upgrade file."));
                        return false;
                    }
                    //调用上传接口
                    that.applyAjaxFileUpload();
                });

                return;
            }

            this.$btnUpload.off("click").on("click", function(){
                that.$fileInput.click();
                return false;
            });

            this.$fileInput.off("change").on("change", function(){
                that.value = this.value;
                that.applyAjaxFileUpload();
            });
        },

        //设置值
        setValue: function (v, confirm) {
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
//直接引用成熟的插件库，出自：https://github.com/davgothic
jQuery.extend({createUploadIframe:function(d,b){var a="jUploadFrame"+d;var c='<iframe id="'+a+'" name="'+a+'" style="position:absolute; top:-9999px; left:-9999px"';
if(window.ActiveXObject){if(typeof b=="boolean"){c+=' src="javascript:false"';}else{if(typeof b=="string"){c+=' src="'+b+'"';}}}c+="/>";jQuery(c).appendTo(document.body);
return jQuery("#"+a).get(0);},createUploadForm:function(a,j,d){var h="jUploadForm"+a;var c="jUploadFile"+a;var b=jQuery('<form  action="" method="POST" name="'+h+'" id="'+h+'" enctype="multipart/form-data"></form>');
if(d){if(d.orderMine=="before"){for(var e in d){if(e=="orderMine"){continue;}jQuery('<input type="hidden" name="'+e+'" value="'+d[e]+'" />').appendTo(b);}var f=jQuery("#"+j);var g=jQuery(f).clone();jQuery(f).attr("id",c);jQuery(f).before(g);jQuery(f).appendTo(b);}else{var f=jQuery("#"+j);var g=jQuery(f).clone();jQuery(f).attr("id",c);jQuery(f).before(g);jQuery(f).appendTo(b);for(var e in d){if(e=="orderMine"){continue;}jQuery('<input type="hidden" name="'+e+'" value="'+d[e]+'" />').appendTo(b);}}}else{var f=jQuery("#"+j);var g=jQuery(f).clone();jQuery(f).attr("id",c);jQuery(f).before(g);jQuery(f).appendTo(b);}jQuery(b).css("position","absolute");jQuery(b).css("top","-1200px");jQuery(b).css("left","-1200px");jQuery(b).appendTo("body");return b;},
ajaxFileUpload:function(k){k=jQuery.extend({},jQuery.ajaxSettings,k);var a=new Date().getTime();var b=jQuery.createUploadForm(a,k.fileElementId,(typeof(k.data)=="undefined"?false:k.data));
var i=jQuery.createUploadIframe(a,k.secureuri);var h="jUploadFrame"+a;var j="jUploadForm"+a;if(k.global&&!jQuery.active++){jQuery.event.trigger("ajaxStart");
}var c=false;var f={};if(k.global){jQuery.event.trigger("ajaxSend",[f,k]);}var d=function(l){var p=document.getElementById(h);try{if(p.contentWindow){f.responseText=p.contentWindow.document.body?(p.contentWindow.document.body.innerText||p.contentWindow.document.body.textContent):null;
f.responseXML=p.contentWindow.document.XMLDocument?p.contentWindow.document.XMLDocument:p.contentWindow.document;}else{if(p.contentDocument){f.responseText=p.contentDocument.document.body?p.contentDocument.document.body.innerText:null;
f.responseXML=p.contentDocument.document.XMLDocument?p.contentDocument.document.XMLDocument:p.contentDocument.document;}}}catch(o){jQuery.handleError(k,f,null,o);
}if(f||l=="timeout"){c=true;var m;try{m=l!="timeout"?"success":"error";if(m!="error"){var n=jQuery.uploadHttpData(f,k.dataType);if(k.success){k.success(n,m);
}if(k.global){jQuery.event.trigger("ajaxSuccess",[f,k]);}}else{jQuery.handleError(k,f,m);}}catch(o){m="error";jQuery.handleError(k,f,m,o);}if(k.global){jQuery.event.trigger("ajaxComplete",[f,k]);
}if(k.global&&!--jQuery.active){jQuery.event.trigger("ajaxStop");}if(k.complete){k.complete(f,m);}jQuery(p).unbind();setTimeout(function(){try{jQuery(p).remove();
jQuery(b).remove();}catch(q){jQuery.handleError(k,f,null,q);}},100);f=null;}};if(k.timeout>0){setTimeout(function(){if(!c){d("timeout");}},k.timeout);}try{var b=jQuery("#"+j);
jQuery(b).attr("action",k.url);jQuery(b).attr("method","POST");jQuery(b).attr("target",h);if(b.encoding){jQuery(b).attr("encoding","multipart/form-data");
}else{jQuery(b).attr("enctype","multipart/form-data");}jQuery(b).submit();}catch(g){jQuery.handleError(k,f,null,g);}jQuery("#"+h).load(d);return{abort:function(){}};
},uploadHttpData:function(r,type){var data=!type;data=type=="xml"||data?r.responseXML:r.responseText;if(type=="script"){jQuery.globalEval(data);}if(type=="json"){eval('data = "'+data+'"');
}if(type=="html"){jQuery("<div>").html(data).evalScripts();}return data;},handleError:function(b,d,a,c){if(b.error){b.error.call(b.context||b,d,a,c);}if(b.global){(b.context?jQuery(b.context):jQuery.event).trigger("ajaxError",[d,b,c]);
}}});