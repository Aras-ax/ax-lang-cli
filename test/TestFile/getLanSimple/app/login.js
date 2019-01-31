import $ from 'jquery';
import 'es5-shim';

import './common/libs/reasy-ui.js';

import './common/component/BaseComponent';
import './common/component/FormInput';
import './common/component/FormSelect';
import './common/component/ComponentManage';
import './common/component/ModalDialog';

import './common/css/reasy-ui.css';
 import './common/css/component.scss';
import './common/css/style.css';
import './common/css/login.css';

$(function () {
	let main = new Main();
	main.gogogo();
});

let Main = function () {
	let cmp = null;
	this.gogogo = function () {
		initComponents();
		initEvent();
	};

	function initEvent() {
		$("#save").on("click", () => {
			preSubmit();
		});

		$("#username,#password,#country").on("focus",function(){
			$(this).parent().parent().parent().addClass("text-focus");
		});

		$("#username,#password,#country").on("blur",function(){
			$(this).parent().parent().parent().removeClass("text-focus");
		});

		$(document).on("keyup", function (event) {
			//解决火狐浏览器不支持event事件的问题。
			let e = event || window.event,
				charCode = e.charCode || e.keyCode;

			if (charCode == 13) { //判断是 “Enter”键
				if (e.preventDefault) { //阻止浏览器默认事件
					e.preventDefault();
				} else {
					e.returnValue = false;
				}
				preSubmit();
			}
		});
	}

	function initComponents() {
		cmp = $.componentManager({
			"container": "#cmps-wrap",
			"formCfg": {
				"username": {
					"maxLength": 64,
					"required":false,
					"autoValidate":false,
					"placeholder":_("默认用户名为admin")
				},
				"password": {
					"required":false,
					"maxLength": 64,
					"hasEyes": true,
					"autoValidate":false,
					"placeholder":_("默认密码为admin")
				},
				"country": {
					"selectArray": {//这里不需要翻译
						"cn": "简体中文",
						"en": "English"
					},
					"changeCallBack": function () {
						B.setLang(this.value);
						setTimeout(() => location.reload(), 300);
					},
					"renderedCallBack": function () {
						this.setValue(B.getLang());
					},
					"defaultValue": "cn"
				}
			}

		});
	}

	function preSubmit() {
		let subStr = "",
			username = cmp.getComponent("username").getValue(),
			password = cmp.getComponent("password").getValue(),
			timeZoneArr = { "cn": -3, "en": 0 },
			subObj = {
				"username": username,
				"password": Encode(password),
			};
			if(username == ""){
				cmp.getComponent("username").focus();
				$.formMessage(_("用户名或密码不能为空"));
				return false;
			}
			if(password == ""){
				cmp.getComponent("password").focus();
				$.formMessage(_("用户名或密码不能为空"));
				return false;
			}

		subObj.timeZone = (timeZoneArr[cmp.getComponent("country").getValue()] + 12) || 20;

		let today = new Date(),
			year, mon, day, hour, min, second;
		year = today.getFullYear().toString();
		mon = today.getMonth() + 1;
		day = today.getDate();
		hour = today.getHours();
		min = today.getMinutes();
		second = today.getSeconds();
		subObj.time = year + ";" + mon + ";" + day + ";" + hour + ";" + min + ";" + second;

		$.post("/login/Auth", subObj, (res) => {
			if (res == "0") {
				$.formMessage(_("用户名或密码错误"));
				return ;
			} else{
				window.location.href = "./index.html";
			}
		});
	}

	var Encode = function (s) {
		var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

		function utf16to8(str) {
			var out,
				i,
				len,
				c;

			out = "";
			len = str.length;
			for (i = 0; i < len; i++) {
				c = str.charCodeAt(i);
				if ((c >= 0x0001) && (c <= 0x007F)) {
					out += str.charAt(i);
				} else if (c > 0x07FF) {
					out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
					out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
					out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
				} else {
					out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
					out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
				}
			}
			return out;
		}

		function base64encode(str) {
			var out,
				i,
				len;
			var c1,
				c2,
				c3;

			len = str.length;
			i = 0;
			out = "";
			while (i < len) {
				c1 = str.charCodeAt(i++) & 0xff;
				if (i == len) {
					out += base64EncodeChars.charAt(c1 >> 2);
					out += base64EncodeChars.charAt((c1 & 0x3) << 4);
					out += "==";
					break;
				}
				c2 = str.charCodeAt(i++);
				if (i == len) {
					out += base64EncodeChars.charAt(c1 >> 2);
					out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
					out += base64EncodeChars.charAt((c2 & 0xF) << 2);
					out += '=';
					break;
				}
				c3 = str.charCodeAt(i++);
				out += base64EncodeChars.charAt(c1 >> 2);
				out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
				out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
				out += base64EncodeChars.charAt(c3 & 0x3F);
			}
			return out;
		}
		// return function (s) {
		return base64encode(utf16to8(s));
		// }
	};
};
