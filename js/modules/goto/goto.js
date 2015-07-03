/**
 * @license
 *
 * GoTo
 * scrolls to an anchor element
 * @author idomusha / https://github.com/idomusha
 */

(function(window, $) {
  var s;
  var GoTo = {
    defaults: {

      // wrapper element (horizontal position only)
      sContainer: '#js-wrapper',

      // class for goto links (anchor in an another page)
      sLinks: '.js-goto',

      sLinkPrev: '.js-goto-prev',
      sLinkNext: '.js-goto-next',
      sFixedLinks: '.js-fixed',

      // processing status
      scrolled: false,

      // debug mode
      debug: false,

      // number of characters that contains the prefix anchors
      iAnchorPrefixCharacters: 0,

      // gap
      gap: 0,

      $scrollContainer: $(),
      $links: $(),
      sAnchor: null,
      sLastAnchor: null,
      $elements: $(),
      $clickedElement: $(),
      $anchorElement: $(),
      iCurrentScrollPosition: 0,
      iScrollSpeed: 1000,
      sDirection: 'vertical',
      bColumn: false,
      bInitial: false
    },

    options: {},

    settings: {},

    init: function() {

      // merge defaults and options, without modifying defaults explicitly
      this.settings = $.extend({}, this.defaults, this.options);
      s = this.settings;

      if (s.debug) {
        console.log('##################### init()');
      }

      s.$links = this.define(s.sLinks);
      s.$linkPrev = this.define(s.sLinkPrev);
      s.$linkNext = this.define(s.sLinkNext);
      s.$links = this.define(s.sLinks);
      s.$fixedLinks = this.define(s.sFixedLinks);
      s.$fixedLinks.addClass('invisible');
      s.$elements = s.$links.map(function() {
        var item = $($(this).attr('href'));
        if (item.length) {
          return item;
        }
      })

      if (s.sDirection == 'vertical') {
        s.$scrollContainer = $('html,body');
      }
      else if (s.sDirection == 'horizontal') {
        s.$scrollContainer = this.define(s.sContainer);
      }

      if ($('.js-last-column').length) s.bColumn = true;

      if (s.bColumn) this.width();
      this.onUIActions();
      this.onLoad();
    },

    width: function() {
      if (s.debug) {
        console.log('##################### width()');
      }

      try {
        var _el = $('.js-last-column');
        var _pos = _el.position();
        var _width = _el.width();
        var _totalWidth = _pos.left + _width;

        _el.parents('section').eq(0).css('width', _totalWidth);
      }
      catch (error) {
        if (s.debug) console.log('!!!', error);
      }
    },

    define: function(o) {
      /*if (s.debug) {
       console.log('##################### define()');
       }*/

      var $returnObject = $();

      // Undefined item
      if (typeof o === 'undefined') {
        return;
      }

      // Object item
      else if ((typeof o === 'object') && (o !== null)) {
        $returnObject = o;
      }

      // Id or class item
      else if ((typeof o === 'string') /*&& ((o.charAt(0) == '#') || (o.charAt(0) == '.'))*/) {
        $returnObject = $(o);
      }

      return $returnObject;
    },

    onUIActions: function() {
      if (s.debug) {
        console.log('##################### onUIActions()');
      }

      $(document).on('click', s.sLinks, function(event) {
        if (s.debug) console.log('>>>>>>>>>>>>>>>>>>>>>> $links: click()');
        if (s.debug) console.log(event);
        /* if( $(event.target).closest( a[data-ajax] ).length ) {
         return;
         }*/
        event.preventDefault();
        if ($(event.target).closest(s.$links).length == 0) {
          return false;
        }

        s.$clickedElement = GoTo.find(event);
        s.sAnchorLink = GoTo.get(s.$clickedElement);
        GoTo.set(s.sAnchorLink);
      });

      $(document).on('click', s.sLinkPrev, function(event) {
        if (s.debug) console.log('>>>>>>>>>>>>>>>>>>>>>> $linkPrev: click()');
        if (s.debug) console.log(event);
        event.preventDefault();
        if ($(event.target).closest(s.$linkPrev).length == 0) {
          return false;
        }

        s.$clickedElement = GoTo.find(event);
        s.sAnchorLink = GoTo.get('prev');
        GoTo.set(s.sAnchorLink);
      });

      $(document).on('click', s.sLinkNext, function(event) {
        if (s.debug) console.log('>>>>>>>>>>>>>>>>>>>>>> $linkNext: click()');
        if (s.debug) console.log(event);
        event.preventDefault();
        if ($(event.target).closest(s.$linkNext).length == 0) {
          return false;
        }

        s.$clickedElement = GoTo.find(event);
        s.sAnchorLink = GoTo.get('next');
        GoTo.set(s.sAnchorLink);
      });

      var _scrollendtimer = null;
      s.$scrollContainer.on('scroll touchmove', function(event) {
        if (s.debug) console.log('>>>>>>>>>>>>>>>>>>>>>> s.$scrollContainer: scroll()/touchmove()');
        if (_scrollendtimer !== null) {
          clearTimeout(_scrollendtimer);
        }

        _scrollendtimer = setTimeout(function() {
          // scroll end
          GoTo.onScrollEnd(event, $('#js-wrapper').scrollLeft());
          _scrollendtimer = null;
        }, 150);
      });

      $(window).on('resize', function() {
        s.iCurrentScrollPosition = GoTo.position();
        if (s.bColumn) GoTo.width();
      });
    },

    onLoad: function() {
      if (s.debug) {
        console.log('##################### onLoad()');
      }

      if (window.location.hash.length) {
        setTimeout(function() {
          window.scrollTo(0, 0);

          // force redraw to fix browers issue
          s.$scrollContainer.css({display: 'table'});
          s.$scrollContainer.get(0).offsetHeight;

          // no need to store this anywhere, the reference is enough
          s.$scrollContainer.css({display: ''});

          s.sAnchorLink = GoTo.get(window.location.hash);

          // TODO: replace setTimeout by imagesLoaded
          setTimeout(function() {
            GoTo.set(s.sAnchorLink);
          }, 150);
        }, 1);
      }

      if ($('.goto-pager').length) {
        if (s.$elements[0].parent().width() < $(window).width()) {
          $('.goto-pager').hide();
          $('.goto-pager').nextAll('.js-goto-nav').hide();
          ;
        }
      }

    },

    onScrollEnd: function(event, scrollLeft) {
      if (s.debug) {
        console.log('##################### onScrollEnd()');
      }

      s.iCurrentScrollPosition = GoTo.position();
      var _fromPosition = s.iCurrentScrollPosition + (s.sDirection == 'vertical') ? $(window).height() : $(window).width();
      var _iTargetOffset = 0;

      // Get id of current scroll item
      var _$currentElement = s.$elements.map(function() {
        if (s.sDirection == 'vertical') {
          _iTargetOffset = $(this).offset().top;
        }
        else if (s.sDirection == 'horizontal') {
          _iTargetOffset = $(this).offset().left;
        }

        if (_iTargetOffset < _fromPosition) return this;
      });

      // Get the id of the current element
      _$currentElement = _$currentElement[_$currentElement.length - 1];
      var _sElementId = _$currentElement && _$currentElement.length ? _$currentElement[0].id : '';
      var _$element = $('#' + _sElementId);
      var _iElementIndex = parseInt(_$element.index(), 10);
      var _iElements = s.$elements.length;
      var _sElementTitle = '';

      if (scrollLeft !== undefined) {
        if (scrollLeft <= $(window).width() - $(window).width() / 20) {     // 5% margin of error
          s.$fixedLinks.addClass('invisible');
        }
        else {
          s.$fixedLinks.removeClass('invisible');
        }
      }

      if (s.$elements[0] != undefined) {
        if (scrollLeft == s.$elements[0].parent().width() + parseInt(s.$elements[0].parent().css('margin-left'), 10)) {
          if (s.debug) console.log('end!');
        }
      }

      if (_$currentElement == undefined) return false;

      if (s.sLastAnchor !== _sElementId) {

        if (s.debug) console.log('sElementId', _sElementId);
        if (s.debug) console.log('iElementIndex', _iElementIndex);
        if (s.debug) console.log('iElements: ', _iElements);

        s.sLastAnchor = _sElementId;

        // Set/remove active class
        s.$links
          .removeClass('active')
          .removeAttr('style')
          .filter('[href=#' + _sElementId + ']')
          .addClass('active');

        //log(_iElements-1);
        //log(_iElementIndex);
        if (_iElementIndex == 0) {
          // scroll stop on first section
          s.$linkPrev.hide();
          _sElementTitle = _$element.next().children('.title').children('span').text();
          s.$linkNext.children('span').text(_sElementTitle);
          s.$linkNext.show(_sElementTitle);
        }
        else if (_iElementIndex == _iElements - 1) {
          // scroll stop on last section
          _sElementTitle = _$element.prev().children('.title').children('span').text();
          s.$linkPrev.children('span').text(_sElementTitle);
          s.$linkPrev.show(_sElementTitle);
          s.$linkNext.hide();
        }
        else if (_iElementIndex != -1) {
          // scroll stop on middle sections
          _sElementTitle = _$element.prev().children('.title').children('span').text();
          s.$linkPrev.children('span').text(_sElementTitle);
          s.$linkPrev.show();
          _sElementTitle = _$element.next().children('.title').children('span').text();
          s.$linkNext.children('span').text(_sElementTitle);
          s.$linkNext.show(_sElementTitle);
        }
      }
    },

    position: function() {
      if (s.debug) console.log('##################### position()');
      try {
        return s.sDirection == 'vertical' ? s.$scrollContainer.scrollTop() : s.$scrollContainer.scrollLeft();
      }
      catch (error) {
        if (s.debug) console.log('!!!', error);
      }
    },

    find: function(event) {
      if (s.debug) {
        console.log('##################### find()');
      }

      try {
        var _$clickedElement = null;
        _$clickedElement = $(event.target).closest(s.$links);
        if (s.debug) console.log(_$clickedElement);
        return _$clickedElement;
      }
      catch (error) {
        if (s.debug) console.log('!!!', error);
      }
    },

    get: function($clickedElement) {
      if (s.debug) console.log('##################### get()');

      try {
        var _$anchorElement = null;
        if ((typeof $clickedElement === 'object') && ($clickedElement !== null)) {
          if ($clickedElement.hasAttr('href')) {
            _$anchorElement = $clickedElement.attr('href') == '_initial' ? $clickedElement.attr('href') : '#' + $clickedElement.attr('href').substring(1 + s.iAnchorPrefixCharacters);
          }

          s.sAnchor = _$anchorElement;
        }
        else if (typeof $clickedElement === 'string') {
          if ($clickedElement.charAt(0) == '#' || $clickedElement.charAt(0) == '_') {
            _$anchorElement = $clickedElement;
          }
          else {
            if ($clickedElement == 'prev') {
              if ($('#' + s.sLastAnchor).prev().length) {
                _$anchorElement = '#' + $('#' + s.sLastAnchor).prev().attr('id').substring(3);
              }
            }
            else if ($clickedElement == 'next') {
              if ($('#' + s.sLastAnchor).next().length) {
                _$anchorElement = '#' + $('#' + s.sLastAnchor).next().attr('id').substring(3);
              }
            }
          }
        }

        if (s.debug) console.log('_$anchorElement', _$anchorElement);
        return _$anchorElement;

      }
      catch (error) {
        if (s.debug) console.log('!!!', error);
      }
    },

    set: function(sAnchorLink) {
      if (s.debug) {
        console.log('##################### set()');
      }

      try {
        if ($('*[id="' + sAnchorLink.substring(1) + '"]').length == 0 && sAnchorLink != '_initial') {
          if (s.debug) console.log('Anchor link doesn\'t to an existing DOM element.');
          if (s.debug) console.log('Anchor link: ' + sAnchorLink);
          return false;
        }

        // Vertical scroll to anchor or top (if has class 'top' or hash '#top'
        if (s.bInitial) {
          GoTo.move('_initial');
        }
        else {
          GoTo.move(sAnchorLink);
        }

        return false;
      }
      catch (error) {
        if (s.debug) console.log('!!!', error);
      }
    },

    move: function(sHash, fCallback, iOffset) {
      if (s.debug) console.log('##################### move(' + sHash + ', ' + fCallback + ', ' + iOffset + ')');
      var _scrollContainer = $();
      var _iTargetOffset = 0;
      var _oScrollAnimation = {};
      var _iOffset = iOffset !== undefined && typeof iOffset === 'integer' ? iOffset : 0;
      if (sHash != '_initial') {
        var _$anchor = $(sHash);

        if (s.debug) console.log('sDirection: ' + s.sDirection);
        if (s.sDirection == 'vertical') _iTargetOffset = _$anchor.offset().top;
        else if (s.sDirection == 'horizontal') _iTargetOffset = s.$scrollContainer.scrollLeft() + _$anchor.offset().left;

        if (s.debug) console.log('_scrollContainer.scrollLeft(): ', s.$scrollContainer.scrollLeft());
        if (s.debug) console.log('_$anchor: ', _$anchor);
        if (s.debug) console.log('_iTargetOffset: ' + _iTargetOffset);
      }

      if (s.sDirection == 'vertical') _oScrollAnimation = {scrollTop: _iTargetOffset - _iOffset - s.gap};
      else if (s.sDirection == 'horizontal') _oScrollAnimation = {scrollLeft: _iTargetOffset - _iOffset - s.gap};

      s.iScrollSpeed = Math.abs(s.iCurrentScrollPosition - _iTargetOffset);
      if (s.iScrollSpeed > 1000) {
        s.iScrollSpeed = 1000;
      }

      if (s.iScrollSpeed < 250) {
        s.iScrollSpeed = 250;
      }

      s.$scrollContainer.animate(_oScrollAnimation, s.iScrollSpeed, function() {
        if (!s.bScrolled) { // to correct the double callback of the GoToHash function (scroll on html AND body)
          s.bScrolled = true;
          GoTo.process();
          GoTo.onScrollEnd(undefined, _iTargetOffset - _iOffset - s.gap);
          if ($.isFunction(fCallback)) {
            GoTo.after(fCallback);
          }

          setTimeout(function() {
            s.bScrolled = false;
          }, 100);
        }
        else {
          s.bScrolled = false;
        }
      });
    },

    process: function() {
      if (s.debug) {
        console.log('##################### process()');
      }

      if (s.sAnchorLink != null) window.location.hash = s.sAnchorLink;
      s.$clickedElement = null;
      s.sAnchorLink = null;
    },

    after: function(fCallback) {
      if (s.debug) {
        console.log('##################### after()');
        fCallback();
      }

    }

  };
  window.GoTo = GoTo;
})(window, jQuery);