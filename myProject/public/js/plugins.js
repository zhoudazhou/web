/**
 * jquery.Barrage.js v1.0.0
 * Created by 程哲林 on 2016/11/18.
 */

;(function ($) {
	'use strict';
	//requestAnimationFrame兼容性封装
	(function () {
		var lastTime = 0;
		var vendors = ['webkit', 'moz'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame =
				window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function () {
						callback(currTime + timeToCall);
					},
					timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
	}());
	
	//弹幕方法
	var Barrage = function (ele, val) {
		//弹幕盒子
		if (!ele) {
			console.error("未指定盒子！");
			return;
		}
		this.box = $(ele);
		
		//弹幕速度
		this.speed = val.speed || 1;
		//弹幕方向
		this.direction = val.direction || 'left';
		//弹幕显示多少行
		this.row = val.row || 2;
		//第一次加载多少个
		this.number = val.number || 4;
		//弹幕间距，不填默认为0，通过CSS调整
		this.margin = val.margin || 0;
		
		//是否hover暂停
		this.hoverStop = val.hoverStop || false;
		
		//数据接口
		this.dataUrl = val.dataUrl;
		//数据盒子
		this.dataBox = val.dataBox;
		//保存数据
		this.dataBase = [];
		//保存数据长度
		this.dataBaseLen = 0;
		//下一次数据起始位置
		this.dataStart = this.number;
		//数据总长度
		this.dataAllLen = 0;
		//数据总起始位置
		this.dataAllStart = 1;
		
		//首个弹幕偏移
		this.firstOffset = [];
		
		//元素偏移调校
		this.itemOffset = val.itemOffset || 0;
		
		//用于元素不同样式
		this.itemNumber = val.itemNumber || 1;
		this.itemNumPos = 1;
		
		//首个弹幕宽度
		this.firstWidth = [];
		
		//兼容性调整
		this.compatible = 'transform';
		
		//元素结构
		this.structure = val.structure;
		
		this.init();
	};
	
	Barrage.prototype = {
		init: function () {
			if (navigator.appVersion.indexOf("MSIE 9.0") > 0) {
				if (this.direction == 'left' || this.direction == "right") {
					this.compatible = 'margin-left';
				} else {
					this.compatible = 'margin-top';
				}
			}
			this.box.css("overflow", "hidden");
			this.getData(this.dataAllStart, this.rendering);
		},
		
		//获取数据
		getData: function (curr, callback) {
			var self = this;
			if (this.dataUrl) {
				$.ajax({
					url: self.dataUrl,
					type: 'get',
					dataType: 'jsonp',
					data: {
						page: curr || 1,
						page_size: this.number + 10
					},
					success: function (db) {
						var code = db.code;
						if (code == 0) {
							self.dataBase = self.dataBase.concat(db.result.list);
							self.dataSatisfy();
							
							self.dataAllLen = db.result.page_total;
							self.dataAllStart = ++curr;
							
							if (typeof callback == 'function') {
								callback(self.dataBase, self)
							}
						} else {
							console.error(code);
						}
					},
					error: function () {
						alert("网络错误，请刷新或稍后重试！")
					}
				})
			} else if (this.dataBox) {
				//添加数组
				Array.prototype.push.apply(this.dataBase, $(this.dataBox).children());
				self.dataSatisfy();
				if (typeof callback == 'function') {
					callback(self.dataBase, self);
				}
			} else {
				console.error("未找到数据源！");
				return false;
			}
		},
		
		//数据满足判断
		dataSatisfy: function () {
			var len = this.dataBase.length;
			if (len < this.number) {
				this.dataBase = this.dataBase.concat(this.dataBase);
				this.dataSatisfy();
			}
			else {
				this.dataBaseLen = len;
			}
		},
		
		
		//弹幕元素
		getItem: function (data, i) {
			var itemHtml = '',
				pos = 1;
			if(this.itemNumPos <= this.itemNumber) {
				pos = this.itemNumPos;
			}else {
				pos = 1;
			}
			
			if (this.dataUrl) {
				//console.log(data.title.replace(/<(.*)>/g, ''));
				itemHtml = this.structure(data, i, pos++);
			} else {
				itemHtml = data.outerHTML;
			}
			this.itemNumPos = pos;
			return itemHtml;
		},
		
		//渲染初始结构
		rendering: function (data, config) {
			var index = 0;
			var _html = '', item = null, i = 0, j = 0;
			if (config.direction == 'left' || config.direction == "right") {
				renHor();
			} else {
				renVer();
				config.row = 1;
			}
			
			//垂直弹幕渲染
			function renVer() {
				if (typeof config.margin == "object") {
					_html += '<ul class="barrage-row row-' + i + '"></ul>';
					config.box.html(_html);
					for (j = 0; j < config.number; j++) {
						_html = $(config.getItem(data[j], j));
						_html.css("margin-right", config.getRandom() + 'px');
						config.box.find(".barrage-row").append(_html);
					}
				} else {
					_html += '<ul class="barrage-row row-' + i + '">';
					for (j = 0; j < config.number; j++) {
						_html += config.getItem(data[j], j);
					}
					_html += '</ul>';
					config.box.html(_html);
				}
				
				var ele = config.box.children("ul");
				for (i = 0; i < config.row; i++) {
					config.firstOffset[i] = 0;
					var height = 0, item = null;
					item = ele.eq(i);
					height = item.children("li").eq(0).outerHeight()
						+ config.getMargin(item, config.direction);
					config.firstWidth[i] = height;
				}
				
				(function move() {
					config.posMove(ele, config.speed);
					requestAnimationFrame(move);
				})();
			}
			
			//水平弹幕渲染
			function renHor() {
				if (typeof config.margin == "object") {
					for (i = 0; i < config.row; i++) {
						_html += '<ul class="barrage-row row-' + i + '"></ul>';
					}
					config.box.html(_html);
					
					for (j = 0; j < config.number; j++) {
						index = j % config.row;
						_html = $(config.getItem(data[j], j));
						_html.css("margin-right", config.getRandom() + 'px');
						config.box.find(".row-" + index).append(_html);
					}
					
				} else {
					for (i = 0; i < config.row; i++) {
						_html += '<ul class="barrage-row row-' + i + '">';
						for (j = 0; j < config.number; j++) {
							item = data[j];
							index = j % config.row;
							if (i == index) {
								_html += config.getItem(item, j);
							}
						}
						_html += '</ul>';
					}
					config.box.html(_html);
				}
				
				
				var ele = config.box.children("ul");
				for (i = 0; i < config.row; i++) {
					config.firstOffset[i] = 0;
					var width = 0, item = null;
					item = ele.eq(i);
					width = item.children("li").eq(0).outerWidth()
						+ config.getMargin(item, config.direction);
					config.firstWidth[i] = width;
				}
				
				
				(function move() {
					config.posMove(ele, config.speed);
					requestAnimationFrame(move);
				})();
			}
			
			if (config.hoverStop == true) {
				config.hoverStopFn();
			}
		},
		
		//位置计算
		posMove: function (ele, speed) {
			var len = this.row,
				self = this,
				off = this.firstOffset,
				wid = this.firstWidth,
				dir = this.direction;
			
			var item = null;
			for (var i = 0; i < len; i++) {
				item = ele.eq(i);
				if (off[i] >= wid[i]) {
					item.children("li:first-child").remove();
					if (dir == 'left' || dir == 'right') {
						off[i] = off[i] - wid[i];
						wid[i] = this.getMargin(item, dir)
							+ item.children("li:first-child").outerWidth();
					} else {
						off[i] = off[i] - wid[i] - 1;
						wid[i] = this.getMargin(item, dir)
							+ item.children("li:first-child").outerHeight();
					}
					this.addData(item);
				}
				if (!item.hasClass("stop") && this.compatible == 'transform') {
					style(item, -(off[i] += speed));
				} else if (!item.hasClass("stop") && this.compatible != 'transform') {
					styleIE(item, -(off[i] += speed));
				}
			}
			
			function style(e, val) {
				if (dir == 'left' || dir == 'right') {
					val = "translateX(" + val + "px)";
				} else {
					val = "translateY(" + val + "px)";
				}
				e.css(self.compatible, val);
			}
			
			function styleIE(e, val) {
				if (dir == 'left' || dir == 'right') {
					val = val + "px";
				} else {
					val = val + "px";
				}
				e.css(self.compatible, val);
			}
		},
		
		//移动暂停
		hoverStopFn: function () {
			this.box.on("mouseover", "li", function () {
				$(this).parent().addClass("stop");
			});
			this.box.on("mouseout", "li", function () {
				$(this).parent().removeClass("stop");
			})
		},
		
		//添加数据
		addData: function (ele) {
			if (this.dataStart >= this.dataBaseLen) {
				if (this.dataAllStart <= this.dataAllLen) {
					this.getData(this.dataAllStart);
				}
				this.dataStart = 0;
			}
			ele.append(this.getItem(this.dataBase[this.dataStart], this.dataStart));
			ele.children("li:last").css("margin-right", this.getRandom() + 'px');
			this.dataStart++;
		},
		
		//获取距离随机数
		getRandom: function () {
			if (typeof this.margin == "object") {
				return Math.floor(this.margin[0]
					+ Math.random() * (this.margin[1] - this.margin[0]));
			}
		},
		
		//获取弹幕间距
		getMargin: function (ele, val) {
			var item = ele.children().eq(0), mar = null;
			if (val == 'left' || val == 'right') {
				mar = parseInt(item.css("margin-right"))
					+ parseInt(item.css("margin-left"));
			} else {
				mar = parseInt(item.css("margin-top"))
					+ parseInt(item.css("margin-bottom"));
			}
			return mar + this.itemOffset;
		}
	};
	
	//注册插件
	window.Barrage = Barrage;
	$.fn.Barrage = function (ele, val) {
		var b = new Barrage(ele, val);
	};
})(jQuery);

// @author  小飞机

// @email wyhxsg@gmial.com

// @param mainItem  正文模块的class或者id 默认为.item

// @parem sideItem  侧边栏对应块的class或者id 默认为.side-item

// @param active  侧边栏的高亮状态 默认为on

// @param offset  元素距离顶部的偏移像素 默认为0

// eg:
// 	$(window).lignt()
//  或者
// 	$(window).light({
// 		mainItem:'.side-item',
// 		sideItem:'.side-item',
// 		active:'on',
// 		offset:100
// 	});


;(function($){
	var defaults,
		_,
		methods;

	defaults = {
		mainItem : '.item',
		sideItem : '.side-item',
		active:'on',
		offset:0
	};

	_ = {
		mainItemTop:[],
	};

	methods = {};

	// 参数初始化
	methods.init = function(obj){

		obj.mainItem && (defaults.mainItem = obj.mainItem);
		obj.sideItem && (defaults.sideItem = obj.sideItem);
		obj.active && (defaults.active = obj.active);
		obj.offset && (defaults.offset = obj.offset);

		_.sideItem = defaults.sideItem;
		defaults.mainItem = $(defaults.mainItem);
		defaults.sideItem = $(defaults.sideItem);

		this.getTop();
		this.handle();
	};

	//获取所的mianItem的top值
	methods.getTop = function(){
		_.mainItemTop = [];

		for(var i=0,len = defaults.mainItem.length;i<len;++i){

			var temp = defaults.mainItem.eq(i),
				top = temp.offset().top;

			_.mainItemTop.push(top);
		}

		// 追加一个最后一个元素的高度
		var e_top = _.mainItemTop[_.mainItemTop.length-1],
			e_height = defaults.mainItem.eq(defaults.mainItem.length-1).height();

		var end = e_top + e_height;
		_.mainItemTop.push(end);

		// console.log(_.mainItemTop);

	}

	// 高亮对应侧边栏
	methods.light = function(top){

		for(var i=0,len = _.mainItemTop.length;i<len;++i){

			var e = _.mainItemTop[i];

			if(top<e){

				defaults.sideItem.removeClass(defaults.active);

				if(i != 0){

					defaults.sideItem.eq(i-1).addClass(defaults.active);
				}
				return;

			}else{
				if(i == len-1){

					defaults.sideItem.removeClass(defaults.active);
					return;
				}
			}
		};
	};

	// 事件处理
	methods.handle = function(){

		//页面滚动事件
		$(window).scroll(function(){

			this.getTop();
			var top = $(document).scrollTop();

			top += defaults.offset;

			this.light(top);

		}.bind(this));

		//左侧栏点击事件
		defaults.sideItem.click(function(){

			var index = $(this).index(_.sideItem);

			$('html,body').animate({

				scrollTop: _.mainItemTop[index] - defaults.offset

			},500);
		});
	};

	$.fn.light = function(obj){
		// 没有传传入一个正确的参数
		if(!(typeof obj == 'object' && obj instanceof Object)){

			obj = {};
		}

		methods.init(obj);
	}

})(jQuery);

;!function(){function e(e){if(!e)throw"param error:param is empty";if(!("object"==typeof e&&e instanceof Object))throw"the param must be Object"}function t(e,t,r){var a="http://hdsupport."+e+".com/api/index?aid="+t+"&cid="+r+"&s=";return{urlGet:a+"get_targets",urlPost:a+"vote",urlJoin:a+"participate",urlGetTopVoter:a+"get_top_voter",urlGetTopTarget:a+"get_top_targets",urlGetVoter:a+"get_voter",urlCheckLogin:"http://hdsupport."+e+".com/user/check_login?aid="+t,urlGetUser:"http://hdsupport."+e+".com/user/get_user?aid="+t}}function r(e,t){if(e[t])return e[t];throw"param error:"+t}function a(e,t,r,a){$.ajax({url:e,type:"get",dataType:"jsonp",data:t}).done(function(e){var t=e.code;0==t?r(e.result):(console.log(t),a.error(n(t)))}).fail(function(){throw"interface fail"})}function n(e){switch(e){case 1e5:return"非法请求";case 100001:return"活动尚未开始";case 100002:return"活动已结束";case 200100:return"没有抽奖机会";case 200101:return"用户已中奖";case 200102:return"抽奖过于频繁";case 200103:return"还未抽过奖";case 200200:return"QQ号必须填写";case 200201:return"手机号必须填写";case 200202:return"邮箱必须填写";case 200203:return"姓名必须填写";case 200204:return"地址必须填写";case 200205:return"邮编必须填写";case 200206:return"角色ID必须填写";case 200207:return"服务器必须填写";case 200208:return"必须提供联系方式";case 200300:return"验证码错误";case 200400:return"IP被禁止";case 200500:return"未获得礼包码";case 200600:return"重复参与问卷调查";case 200601:return"尚未完成问卷调查";case 200602:return"问卷调查提交不完整";case 200700:return"排行榜数据来源未设置";case 200701:return"排行榜数据为空";case 200702:return"排行榜类型错误";case 200800:return"禁止重复转发回调";case 200801:return"尚未转发微博或微信分享";case 200802:return"仅支持新浪微博、腾讯微博、微信朋友圈";case 200803:return"每天只能转发或分享一次";case 200900:return"禁止重复关注回调";case 200901:return"尚未关注微博";case 200902:return"仅支持关注新浪微博、腾讯微博";case 201e3:return"不能重复提交意见反馈";case 201001:return"尚未提交意见反馈";case 201100:return"不能重复提交祝福语";case 201101:return"快来写下你的祝福语吧";case 201102:return"您今天已经祝福太多啦，明天再来吧";case 201103:return"祝福内容不能为空哦";case 201200:return"积分不足";case 201201:return"不允许变更积分";case 201202:return"积分变更失败";case 201300:return"已经领取奖品";case 201301:return"尚未领取奖品";case 201302:return"领取奖品太过频繁";case 201303:return"领取数量达到上限";case 201304:return"奖品已经领取完";case 201305:return"不满足领取条件";case 201400:return"回调次数已达上限";case 201401:return"尚未完成回调";case 201402:return"回调来源非法";case 201403:return"每天回调次数已达上限";case 201404:return"确认回调连接失效";case 201500:return"您今天许了太多愿望啦，上帝好累哦";case 201501:return"您今天还没许愿哦，上帝好无聊啊";case 201502:return"您还没有留下您的联系方式哦";case 201503:return"您已经留过您的联系方式啦";case 201504:return"QQ号必须正确填写";case 201505:return"手机号必须正确填写";case 201506:return"地址必须正确填写";case 201507:return"角色ID必须正确填写";case 201508:return"角色名称必须正确填写";case 201509:return"角色职业必须正确填写";case 201510:return"服务器必须正确填写";case 201600:return"任务已经做完啦，别太贪心哦";case 201601:return"快来做任务啦，太懒会变胖哦";case 201700:return"您今天已经投了很多票了，歇会吧";case 201701:return"快来投上您宝贵的一票吧";case 201702:return"不要这么专一哦，换个投票对象吧";case 201703:return"手太快啦，慢点投吧";case 201704:return"联系方式不能为空";case 201705:return"支持理由不能为空";case 201801:return"快来签到吧";case 201900:return"今天已经没有投票机会啦";case 201901:return"快来投票吧";case 201902:return"不要这么专一哦，换个投票对象吧";case 201903:return"手太快啦，慢点投吧";case 201904:return"您已经没有参与上传的机会啦";case 201905:return"您还没有上传您的靓照哦";case 201906:return"请添加照片描述哦";case 201907:return"参与失败，请重试";case 201908:return"图片上传失败，限制100x100像素，5M";case 202507:return"联系方式不能为空";case 202502:return"投票机会已用完，请明天再来";case 202503:return"投票太过频繁";case 4e5:return"需要用户登录";case 5e5:return"服务器返回错误"}}function i(e,t){a(e.url.urlGet,{page:e.nowPage,page_size:e.listSize},function(r){e.totalPage=r.page_total,e.willRender();var a=e.render(r.list);$(e.container).html(a),e.didRender(),t&&t()},e)}function c(e){var t=$("#"+e.formId),r={},n=t.find("input");r.title=t.find("textarea");for(var c=0,s=n.length;c<s;++c){var u=n.eq(c).attr("name");r[u]=n.eq(c)}r.submit.click(function(t){var n={aid:e.aid,cid:e.cid,s:"participate",nick:"",contact:"",title:""};if(r.username){var i=r.username,c=$.trim(i.val()),s=i.attr("reg");if(!o(c,s))return void e.error("用户名格式错误");n.nick=c}if(r.contact){var u=r.contact,g=$.trim(u.val()),p=u.attr("reg");if(!o(g,p))return void e.error("联系方式");n.contact=g}if(r.title){var l=r.title,d=$.trim(l.val()),f=l.attr("reg");if(!o(d,f))return void e.error("祝福内容");n.title=d}if(r.add){var v=r.add,P=$.trim(v.val()),w=v.attr("reg");if(!o(P,w))return void e.error("额外参数");n.desc=[],n.desc.push(P)}e.willSubmit(n),a(e.url.urlJoin,n,function(t){t?(console.log(1),e.upLoadSuc()):e.error("上传失败")},e)});var p=$(e.container);p.on("click",e.voteBtn,function(t){var r=$(this).parents(e.voteItem).attr("tid"),n=$(this).parents(e.voteItem).find(e.voteText);e.willVote($(this)),a(e.url.urlPost,{tid:r,aid:e.aid,cid:e.cid,s:"vote"},function(t){var r=+n.text();n.text(++r),e.voted($(this))},e)}),e.pageWrap.on("click",".page-prev",function(t){1!=e.nowPage&&(--e.nowPage,e.willPageChange(e.nowPage,t.target),i(e),g(e),e.didPageChange(e.nowPage,t.target))}),e.pageWrap.on("click",".page-next",function(t){e.nowPage!=e.totalPage&&(++e.nowPage,e.willPageChange(e.nowPage,t.target),i(e),g(e),e.didPageChange(e.nowPage,t.target))}),e.pageWrap.on("click",".page-first",function(t){1!=e.nowPage&&(e.nowPage=1,e.willPageChange(e.nowPage,t.target),i(e),g(e),e.didPageChange(e.nowPage,t.target))}),e.pageWrap.on("click",".page-end",function(t){e.nowPage!=e.totalPage&&(e.nowPage=e.totalPage,e.willPageChange(e.nowPage,t.target),i(e),g(e),e.didPageChange(e.nowPage,t.target))}),e.pageWrap.on("click",".page-item",function(t){var r=$(this).text();e.nowPage!=r&&(e.nowPage=r,e.willPageChange(e.nowPage,t.target),i(e),g(e),e.didPageChange(e.nowPage,t.target))})}function o(e,t,r){if(t){var t=new RegExp(t);return t.test(e)}return!0}function s(e){e.pageWrap.html("");var t=e.totalPage>e.pageSize?e.pageSize:e.totalPage,r=[];r.push('<span class="page-first">'+e.firstText+"</span>"),r.push('<span class="page-prev">'+e.prevText+"</span>");for(var a=1;a<=t;++a)r.push('<span class="page-item">'+a+"</span>");return r.push('<span class="page-next">'+e.nextText+"</span>"),r.push('<span class="page-end">'+e.endText+"</span>"),r=r.join(""),e.pageWrap.append(r),u(e),this}function u(e){for(var t=e.pageWrap.find(".page-item"),r=t.length,a=0;a<r;++a){var n=t.eq(a),i=n.text();i==e.nowPage&&n.addClass(e.activeClass).siblings(".page-item").removeClass(e.activeClass)}}function g(e){var t=Math.ceil(e.pageSize/2),r=e.pageWrap.find(".page-item");if(e.totalPage<=e.pageSize)return void u(e);if(e.totalPage-e.nowPage<t)for(var a=e.totalPage-(e.pageSize-1),n=0;n<e.pageSize;++n)r.eq(n).text(a),++a;else if(e.nowPage<=t)for(var n=1;n<=e.pageSize;++n)r.eq(n-1).text(n);else for(var a=e.nowPage-Math.ceil(e.pageSize/2)+1,n=0;n<e.pageSize;++n)r.eq(n).html(a),++a;u(e)}var p=function(e){return new p.prototype.init(e)};p.prototype={init:function(a){var n={};return e(a),n.aid=r(a,"aid"),n.cid=r(a,"cid"),n.origin=a.origin||"ptbus",n.url=t(n.origin,n.aid,n.cid),n.container=a.container||".container",n.voteBtn=a.voteBtn||".votebtn",n.voteItem=a.voteItem||".voteitem",n.voteText=a.votetext||".votetext",n.formId=a.formId||"formid",n.pageWrap=$(a.pageWrap)||$("pagewrap"),n.listSize=+a.listSize||8,n.pageSize=+a.pageSize||5,n.prevText=a.prevText||"上一页",n.nextText=a.nextText||"下一页",n.firstText=a.firstText||"首页",n.endText=a.endText||"尾页",n.activeClass=a.activeClass||"on",n.onInit=a.onInit||function(){},n.willVote=a.willVote||function(){},n.voted=a.voted||function(){},n.willSubmit=a.willSubmit||function(){},n.upLoadSuc=a.upLoadSuc||function(){},n.willRender=a.willRender||function(){},n.didRender=a.didRender||function(){},n.error=a.error||function(e){alert(e+"格式错误")},n.willPageChange=a.willPageChange||function(){},n.didPageChange=a.didPageChange||function(){},n.render=a.render||function(e){for(var t=[],r=0,a=e.length;r<a;++r)t.push('<li tid="'+e[r].id+'" class="vote-item"><p class="username">'+e[r].nick+'</p><p class="desc">'+e[r].title+'</p><span class="votebtn"></span><span class="votetext">'+e[r].poll+"</span></li>");return t.join("")},n.nowPage=1,n.totalPage=1,i(n,function(){s(n)}),n.onInit(),c(n),this}},p.prototype.init.prototype=p.prototype,window.voteDynamic=p}(jQuery);