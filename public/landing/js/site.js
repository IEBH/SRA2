/*!
 *
 * Angle - Bootstrap Admin App
 *
 * Version: 3.2.0
 * Author: @themicon_co
 * Website: http://themicon.co
 * License: https://wrapbootstrap.com/help/licenses
 *
 */

(function ($) {
	'use strict';

	if (typeof $ === 'undefined') { throw new Error('This site\'s JavaScript requires jQuery'); }

	// cache common elements
	var $win  = $(window);
	var $doc  = $(document);
	var $body = $('body');


	// Site Preloader
	// -----------------------------------

	Loader.start();

	$('#header').waitForImages(function() {
		Loader.stop();
		$body.addClass('site-loaded');
	});

	// Show sticky topbar on scroll
	// -----------------------------------

	var stickyNavScroll;
	var stickySelector = '.navbar-sticky';

	// Setup functions based on screen
	if (matchMedia('(min-width: 992px), (max-width: 767px)').matches) {
		stickyNavScroll = function () {
			var top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
			if (top > 40) $(stickySelector).stop().animate({'top': '0'});

			else $(stickySelector).stop().animate({'top': '-80'});
		};
	}

	if (matchMedia('(min-width: 768px) and (max-width: 991px)').matches) {
		stickyNavScroll = function () {
			var top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
			if (top > 40) $(stickySelector).stop().animate({'top': '0'});

			else $(stickySelector).stop().animate({'top': '-120'});
		};
	}

	// Finally attach to events
	$doc.ready(stickyNavScroll);
	$win.scroll(stickyNavScroll);


	// Sticky Navigation
	// -----------------------------------

	$(function() {
		$('.main-navbar').onePageNav({
			scrollThreshold: 0.25,
			filter: ':not(.external)', // external links
			changeHash: true,
			scrollSpeed: 750
		});

	});


	// Smooth Scroll
	// -----------------------------------
	var scrollAnimationTime = 1200;
	var scrollAnimationFunc = 'easeInOutExpo';
	var $root               = $('html, body');

	$(function(){
		$('.scrollto').on('click.smoothscroll', function (event) {

			event.preventDefault();

			var target = this.hash;

			// console.log($(target).offset().top)

			$root.stop().animate({
					'scrollTop': $(target).offset().top
			}, scrollAnimationTime, scrollAnimationFunc, function () {
					window.location.hash = target;
			});
		});

	});

	// Self close navbar on mobile click
	// -----------------------------------
	$(function(){
		 var navMain = $("#navbar-main");
		 var navToggle = $('.navbar-toggle');

		 navMain.on('click', 'a', null, function () {
				if ( navToggle.is(':visible') )
					navMain.collapse('hide');
		 });
	 });


	// Wow Animation
	// -----------------------------------

	// setup global config
	window.wow = (
		new WOW({
			mobile: false
		})
	).init();

})(window.jQuery);
