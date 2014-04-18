/**
*####tips####
* 
* tips组件,是一个用于弹出一段内容的浮层,可用于提示,消息说明等.如果tips显示超过当前视野,经配置可自动显示在视野范围内的合适位置;定位基于父级元素,配置上左,上中,上右,左上,左中,左右等12个位置.
* 
***Demo**
* [tips](../demo/tips/tips.html "Demo")
*
***参数**
*
*  - 	`autoWindow` {Boole} true 自适应窗口
*
***举例**
* 
*js部分
*
*	$('.tips').tips({
*		type:'hover',
*		hasArrow:true,
*		hasClose:true,
*		align:['top','left'],
*		autoWindow:true
*	});
* 
*html部分
*	
*<span class="tips" data-tips="this is test <a href='#'>more</a>">tips</span>
*
* **update**
* 2013-12-5 17:43:59
*
*/

;(function($, undefined) {
	$.ui.define('tips', {
		 options: {
			hasCssLink:true,
			baseVersion:'1.0.0',
			cssLinkVersion:'1.0.0',
			tipsClass:'ui-tips',
			type:'hover',//fixed || hover||click
			align:['top','left'],//位置
			autoWindow:true,//自适应窗口
			autoResize:true,//resize和scroll时,是否更新
			hasArrow:true,//是否带箭头
			hasClose:true,//是否带关闭
			zIndex:100,
			onClose:null,//关闭按钮点击时回调函数
			diff:8 //箭头高度值 //todo 多个tips的情况;点击空白处隐藏;
		},
		init:function(){
			var me = this;
			var opts = this.options;
			this.creat();
			
			if (opts.type =='fixed') {
				this.setInit(this.el);
			}
			
			if (opts.type =='hover' || opts.type =='click') {
				if (opts.type =='hover') {
					this.el.bind('mouseover',function(){
						me.setInit($(this));
					})

					this.el.bind('mouseout',function(){
						me.hide();
					})
				}

				if (opts.type =='click') {
					this.el.bind('mouseup',function(){
						me.setInit($(this));
					})
				}
			}
		},
		show:function(){
			this.tips.show();
		},
		hide:function(){
			this.tips.hide();
		},
		setInit:function(el){
			this.tips = $('#uis-tips-'+this.guid+'');
			this.tips.find('.ui-tips-main').html(el.attr('data-tips'));

			this.show();
			this.update();
			this.bind();
		},
		bind:function(){
			var me = this;
			var opts = this.options;
			this.tips.find('.ui-tips-close').bind('click',function(){
				 me.hide();
				 if(opts.onClose){opts.onClose.call(null)}
			})

			if (opts.autoResize) {
				$(window).bind('resize',function(){
					me.update();
				})

				$(window).scroll(function(){
					me.update();
				}); 
			}
		},
		creat:function(){
			var opts = this.options;
			var arrowHtml = '';
			var zIndex = opts.zIndex+this.guid;

			if (opts.hasArrow) {
				arrowHtml = '<span class="ui-tips-arrow" style="z-index:'+zIndex+'"></span>';
			}
			var closeHtml = '';
			if (this.options.hasClose) {
				closeHtml = '<span class="ui-tips-close" style="z-index:'+zIndex+'">x</span>';
			}
			var templete = [
				'<div class="'+opts.tipsClass+' ui-tips-top" style="display:none;z-index:'+zIndex+'" id="uis-tips-'+this.guid+'">',
				'	<div class="ui-tips-main">',
				'	</div>',
				arrowHtml,
				closeHtml,
				'</div>'
			].join('');
			
			if (opts.type == 'fixed') {
				$(templete).appendTo(this.el);
			}else {
				$(templete).appendTo('body');
			}
		},
		update:function(){
			var opts = this.options;
			this.align(opts.align[0],opts.align[1]);
		},
		align:function(i,j){
			var opts = this.options;
			var diff = opts.diff;
			var offset = this.el.offset();
			var elW = this.el.outerWidth();
			var elH = this.el.outerHeight();
			var top = offset.top;
			var left = offset.left;

			var tips = this.tips;
			var tipsClass='ui-tips ui-tips-top';
			var tipsW = tips.outerWidth();
			var tipsH = tips.outerHeight();

			if ($.inArray(i, ['top','bottom','left','right']) != -1) {
				tipsClass = 'ui-tips ui-tips-'+i;
			}

			if ($.inArray(j, ['top','bottom','left','right','center']) != -1) {	
				if (i == 'top' || i=='bottom') {
					
					if ((left+tipsW) > $.page.clientWidth() && opts.autoWindow) { 
						j='right';
					}

					if ( left < tipsW && opts.autoWindow) {
						j='left';
					}

					if(top-tipsH-diff <$(document).scrollTop()  && opts.autoWindow) {
						i='top';
						tipsClass = 'ui-tips ui-tips-'+i;
					}

					if (top+tipsH+elH+diff > ($(document).scrollTop() +$.page.clientHeight())  && opts.autoWindow) {
						i='bottom';
						tipsClass = 'ui-tips ui-tips-'+i;
					}

					tipsClass += ' ui-tips-x-'+j;
					
					if (i=='top') {top = top+elH+diff;}
					if (i=='bottom') {top = top-tipsH-diff;}
					
					if (j=='left') {left = left;}
					if (j=='center') {left = left-tipsW/2+elW/2;}
					if (j=='right') {left = left-tipsW+elW;}
				}
				
				if (i == 'left' || i=='right') {
					if ((left+tipsW+elW+diff) > $.page.clientWidth()  && opts.autoWindow) {
						i = 'right';
						tipsClass = 'ui-tips ui-tips-'+i;
					}

					if ( left < tipsW && opts.autoWindow) {
						i='left';
						tipsClass = 'ui-tips ui-tips-'+i;
					}

					if ( (top-tipsH+elH+diff) <$(document).scrollTop()  && opts.autoWindow) {
						j='top';
					}
					
					if (top+tipsH-diff> ($(document).scrollTop() +$.page.clientHeight())  && opts.autoWindow) {
						j='bottom';
					}
				
					tipsClass += ' ui-tips-y-'+j;
					if (i == 'left') {left = left + elW+2*diff;}
					if (i == 'right') {left = left - tipsW-diff;}
					if (j=='top') {top = top - elH+diff}
					if (j=='center') {top = top-tipsH/2+elH}
					if (j=='bottom') {top = top-tipsH+elH/2+2*diff}
				}
			}
			tips.attr('class',tipsClass);	
			tips.css({top:top,left:left});
		}
	});
})(jQuery);