/**
*####返回顶部####
* 
***Demo**
* [gotop](../demo/gotop/gotop.html "Demo")
*
***参数**
*
*  - `scrollTop` {Number} 50  滚动条高度达到此高度时显示
*  - `hasAnimate` {Boolse} false 滚动时是否有动画
*  - `delay` {Number} 500 滚动带动画延时时间
*
***举例**
* 
*	$('#gotop').gotop();
*
* **update**
* 2013-10-15 20:32:35
*
*/

;(function($, undefined) {
	$.ui.define('gotop', {
		 options: {
			hasAnimate:false,//滚动时是否有动画
			delay:500,//滚动带动画延时时间
			scrollTop:50//滚动条高度达到此高度时显示
        },
		 /**
         * 显示
         * @method show
         */
		show:function(){
			this.el.show(); 
		},
		 /**
         * 关闭
         * @method hide
         */
		hide:function(){
			this.el.hide(); 
		},
		bind:function(){
			var self = this;
			var opts = this.options;
			var showTag = true;
			this.el.bind('click',function(){
				self.hide();
				if (opts.hasAnimate) {
					showTag = false;
					$('html,body').animate({
						scrollTop:0
					},opts.delay,null,function(){
						 showTag = true;
					});
				}else {
					$(document).scrollTop(0);
				}
			});

			$(window).scroll(function(){
				if (showTag) {		
					var scrollTop = $(document).scrollTop();
					if (scrollTop>self.options.scrollTop){
						self.show();
					}else{
						self.hide();
					}
				}
			}); 
		},
		init:function(){
			this.bind();
			this.hide();
		}
	});
})(jQuery);