import $ from 'jquery';
import 'es5-shim';

import './common/libs/reasy-ui.js';
import './common/component/BaseComponent';
import './common/component/ModalDialog'; //formmessage组件在这个里面
import './common/css/reasy-ui.css';
import './common/css/component.scss';
import './common/css/style.css';

import modules from './common/libs/moduleSet.js'; //子模块集合

import {
	menuObj
} from './common/libs/menu.js'; //菜单对象


function MainLogic(modules, menuObj, ignoredMenu) {
	let lastPage = "wizard";

	let _mainObj = {
		modules,
		menuObj,
		ignoredMenu
	};

	this.init = function () {
		_generateMenu(_mainObj.menuObj, _mainObj.ignoredMenu);

		_initEvent();
	};

	let _initEvent = function () {
		$('#menuList').on('click', 'a', function () {
			let moduleUrl = _clickMenu.call(this);
			_loadModule(moduleUrl);
		});

		//查看帮助信息
		$('.help').on('click', function () {
			if ($(this).hasClass('help-close')) {
				$(this).removeClass('help-close').addClass('help-open');
				$('.config-box').addClass('none');
				$('.help-box').removeClass('none');
			} else {
				$(this).removeClass('help-open').addClass('help-close');
				$('.help-box').addClass('none');
				$('.config-box').removeClass('none');
			}
		});

		//登出
		$('.logout').on('click', function () {
			$.post('/logout/Auth', function () {
				window.location.href = './login.html';
			});
		});
	};

	//生成菜单
	let _generateMenu = function (menuObj, ignoredMenu) {
		let str = '',
			activeId = 'wiz-0',
			prop, len, id, url, name, menuClass, className, activeName, activeUrl;

		for (prop in menuObj) {

			len = menuObj[prop].length;
			if (len === 1) {
				menuClass = 'icon-menu-text';
			} else {
				menuClass = 'icon-menu';
			}

			str += `<li class="nav-list" id="${prop}">`; //菜单
			for (let i = 0; i < len; i++) {
				id = menuObj[prop][i]['id'];
				url = menuObj[prop][i]['url'];
				name = menuObj[prop][i]['name'];


				if (ignoredMenu[id]) { //判断是否为隐藏功能
					continue;
				}
				if (id === activeId) {
					activeUrl = url;
					activeName = name;
				}
				if (i === 0) {
					className = menuObj[prop][i]['class'];
					className = `img-icons ${className}`;

					//判断是否有子菜单
					if (len > 1) {
						str += `<a href="#" id="${id}" data-child="true" data-url="${url}" class="${className}"><div class="${menuClass}">${name}</div></a>`;
					} else {
						str += `<a href="#" id="${id}" data-child="false" data-url="${url}" class="${className}"><div class="${menuClass}">${name}</div></a>`;
					}

					str += `<ul style="display: none;" class="">`;
				} else {
					str += `<li><a href="#" id="${id}" data-url="${url}">${name}</a></li>`;
				}
			}
			str += '</ul>';
			str += '</li>';
		}
		$('#menuList').append(str);
		if (activeId) { //生成子菜单
			let activeElm = $(`#${activeId}`);

			activeElm.parent().addClass('active');
			$('.curTitle').html(activeElm.text());
			_loadModule(activeElm.data('url'));
		}
	};

	//点击菜单 TODO：可以优化
	let _clickMenu = function () {
		let url = $(this).data('url'),
			hasChild = $(this).data('child'), //true false undefined
			$parent = $(this).parent(),
			clickFlag = true;

		let speed = 350; //动效速度

		if (!clickFlag) {
			return false;
		}

		$('.active').removeClass('active');
		$('.menu-active').removeClass('menu-active');

		//重置帮助信息按钮
		$('.help-open').removeClass('help-open').addClass('help-close');

		if (hasChild) { //如果有子菜单

			if ($(this).children().eq(0).hasClass('icon-menu')) { //点击展开

				clickFlag = false;
				$parent.children().eq(0).addClass('menu-active');

				if ($('.nav-list').find('.icon-menu-open').length === 0) { //没有展开的菜单时
					$parent.find('ul').height('0');
					$parent.find('ul').show();
					clickFlag = true;

				} else {
					$('.nav-list').find('.icon-menu-open').addClass('icon-menu').removeClass('icon-menu-open');
					$('.nav-list').find('ul').animate({
						"height": 0
					}, speed, function () {
						$('.nav-list').find('ul').hide();
						$parent.find('ul').show();
						clickFlag = true;
					});
				}


				$(this).children().eq(0).attr('class', 'icon-menu-open');
				$parent.find('ul').animate({
					"height": $parent.find('ul').children().length * 30
				}, speed);

				$parent.find('ul').children().eq(0).addClass('active');

			} else if ($(this).children().eq(0).hasClass('icon-menu-open')) { //点击收起菜单
				$(this).children().eq(0).attr('class', 'icon-menu');
				$parent.children().eq(0).addClass('menu-active');

				clickFlag = false;

				$parent.find('ul').animate({
					"height": 0
				}, speed, function () {
					$parent.find('ul').hide();
					clickFlag = true;
				});
			}

			$('.curTitle').html($parent.find('ul').children().eq(0).text());

		} else if (hasChild === false) { //如果没有子菜单
			$parent.addClass('active');
			$('.nav-list').find('.icon-menu-open').addClass('icon-menu').removeClass('icon-menu-open');
			clickFlag = false;
			$('.nav-list').find('ul').animate({
				"height": 0
			}, speed, function () {
				$('.nav-list').find('ul').hide();
				clickFlag = true;
			});

			$('.curTitle').html($(this).text());
		} else { //点击某个子菜单
			$parent.addClass('active');
			$('.curTitle').html($(this).text());
		}

		return url;
	};

	//加载子模块
	let _loadModule = function (url) {
		//执行之前清除上一个页面所有定时器
		let tpTimer = _mainObj.modules[lastPage].moduleTimer;
		for (let prop in tpTimer) {
			if (tpTimer.hasOwnProperty(prop)) {
				clearTimeout(tpTimer[prop]);
			}
		}
		$('#form').load(`/pages/${url}.html`, function () {
			//执行子模块业务逻辑
			B.translatePage();
			_mainObj.modules[url].init();
			lastPage = url;
		});
	};
}

$(function () {
	let ignoredMenu = {}; //忽略的菜单，以后可以通过功能宏控制

	let hideMenu = []; //隐藏的菜单

	$.get('goform/getMainInfo', function (res) { //获取主配置信息（当前模式、当前用户类型等）
		let data = JSON.parse(res);
		window.G = data;

		if (G.workMode !== 'router' && G.workMode !== 'wisp') {
			hideMenu = ['adv-portForward', 'adv-bandwidth', 'adv-macFilter'];
		} else {
			hideMenu = [];
		}

		//根据模式隐藏菜单
		for (let i = 0; i < hideMenu.length; i++) {
			$(`#${hideMenu[i]}`).parent().remove();
		}

		let modeObj = {
			'ap': _('AP'),
			'station': _('Station'),
			'universalrepeater': _('Universal Repeater'),
			'wisp': _('WISP'),
			'repeater': _('Repeater'),
			'p2mp': _('P2MP'),
			'router': _('Router'),
			'client+ap': _('Client + AP')
		};

		$('.curMode').html(`${_('Current Mode:')}${modeObj[G.workMode]}`);

	});

	let mainLogic = new MainLogic(modules, menuObj, ignoredMenu);
	mainLogic.init();
});