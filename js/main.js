(function($, window, document, undefined) {
  'use strict';

  $(function() {

    /* Set Nav state from localStorage
     ========================================================================== */
    if (localStorage && localStorage.getItem('styleguide-nav-state')) {
      var sgnav = localStorage.getItem('styleguide-nav-state');
      if (sgnav == 1) {
        $('.sg-body').addClass('nav-is-opened');
      }
    }

    /* Nav show/hide
     ========================================================================== */
    $('.sg-nav-trigger').on('click', function() {
      $('.sg-body').toggleClass('nav-is-opened');

      //set localstorage
      if ($('.sg-body').hasClass('nav-is-opened')) {
        localStorage.setItem('styleguide-nav-state', 1);
      } else {
        localStorage.setItem('styleguide-nav-state', 0);
      }
    })

    /* Nav accordion
     ========================================================================== */
    $('.sg-nav span').on('click', function() {
      $(this).toggleClass('is-opened').next().slideToggle();
    })

    /* Nav auto scrolling
     ========================================================================== */
    GoTo.options = {
      gap: $('.sg-topper').height(),
      sLinks: '.sg-nav a[href^="#"]'
    }
    GoTo.init();

    /* XrayHTML
     ========================================================================== */
    if ($('[data-xrayhtml]').length) {
      //Prism
      $('[data-xrayhtml]').find('code').addClass('language-markup');
      Prism.highlightAll();

      //Show/hide Code
      $('.xrayhtml .snippet').append('<span class="sg-toggleCode"></span>');
      $('.sg-toggleCode').on('click', function() {
        $(this).toggleClass('is-opened').parent().next().slideToggle();
      })

      //Copy/past Code
      $('.xrayhtml').each(function() {
        var code = $(this).find('code')
          .text()
          .split('\n')
          .map($.trim)
          .filter(function(line) {
            return line != '';
          })
          .join('\n');
        var copy = $('<a/>', {

          // quotes for 'class' object due to a IE issue
          'class': 'sg-copyCode',
          href: '#',
          text: 'Copy'
        })
          .attr('data-clipboard-text', code)
          .prependTo($(this).find('.source-panel'));
        var clip = new ZeroClipboard(copy, {
          moviePath: 'js/vendor/zeroclipboard/ZeroClipboard.swf'
        });
      });

    }

    /* Markdown viewer
     ========================================================================== */
    var converter = new Showdown.converter();
    var jqxhr;
    var sMdFile;
    var $mdViewer;

    $('.md-viewer').each(function() {
      $mdViewer = $(this);
      sMdFile = $mdViewer.data('file');
      jqxhr =
        $.ajax({
          async: false,

          //Make ajax requests synchronously = wait for the previous to finish
          url: sMdFile,
          data: 'text'
        })
          .done(function(data) {
            var ret = converter.makeHtml(data);
            $mdViewer.html(ret);
          })
    });

    /* Color
     ========================================================================== */
    var colorDefault = '#ffcc00';
    $('[name="color-format"]').on('change', function() {
      var $value = $('#color-value');
      if (this.value == 'hex') {
        $value.attr('placeholder', colorDefault);
        if ($value.val().slice(0, 3) == 'rgb') {
          var _hex = rgb2hex($value.val());
          $value.val(_hex);
        }
      }
      else if (this.value == 'rgb') {
        $value.attr('placeholder', hex2rgb(colorDefault));
        if ($value.val().slice(0, 1) == '#') {
          var _rgb = 'rgb(' + hex2rgb($value.val()) + ')';
          $value.val(_rgb);
        }
      }
    });

    $('#color-value').on('blur', function() {
      var $value = $(this);
      var _color = $value.val();
      if ($value.val().slice(0, 1) == '#') {
        $('[name="color-format"]').filter('[value="hex"]').prop('checked', true);
        if ($value.val().length == 4) {
          _color = '#';
          for (var i = 1; i <= 4; i++) {
            _color += $value.val().charAt(i) + $value.val().charAt(i);
          }

          $value.val(_color);
        }
      }
      else if ($value.val().slice(0, 3) == 'rgb') {
        $('[name="color-format"]').filter('[value=rgb]').prop('checked', true);
      }

      $('#color-opacity')
        .val('0')
        .trigger('change');
      if (_color == '') _color = colorDefault;
      _color = shadeColor(_color, 0);
      if (_color != undefined) {
        $('#color-result .sg-color-view').css('background-color', _color);
        $('#color-result .hex').text(_color);
        var _rgb = 'rgb(' + hex2rgb(_color) + ')';
        $('#color-result .rgb').html(_rgb);
      }
    });

    $('#color-opacity').on('change', function() {
      var _color = $('#color-value').val();
      var _opacity = Math.round(this.value / 10) / 10;
      if (_color == '') _color = colorDefault;
      _color = shadeColor(_color, _opacity);
      if (_color != undefined) {
        $('#color-result .sg-color-view').css('background-color', _color);
        $('#color-result .hex').text(_color);
        var _rgb = 'rgb(' + hex2rgb(_color) + ')';
        $('#color-result .rgb').html(_rgb);
        var _hue = ntc.name(_color)[3];
        $('#color-result .hue').html(_hue);
        var _name = ntc.name(_color)[1];
        $('#color-result .name').html(_name);
      }
    });

    $('[data-color]').each(function(i, v) {
      var _color = $(this).data('color');
      var _opacity = $(this).data('opacity') || 0;
      $(this).css('background-color', _color);
      var html = '';
      if (_opacity != undefined) {
        html = '<span class="color-opacity">';
        html += _opacity + '%';
        html += '</span>';
        _opacity = Math.round(_opacity / 10) / 10;
        _color = $(this).shadeColor('background-color', _opacity);
        html += '<span class="color-name">';
        html += ntc.name(_color)[1];
        html += '</span>';
        html += '<input type="text" class="color-hex" value="';

        //log(_color);
        //log(_opacity);
        $(this).css('background-color', _color);
      }

      html += _color;
      html += '">';
      $(this).append(html);
      $(this).children('.color-opacity').css('border-color', _color);
    });

    $('.sg-color-group li:not(.sg-color-title)').setTextColor();

    $('.sg-color .sg-color-view').on('click', function() {
      var _color = $(this).css('background-color');
      $('#color-value').val(_color);
      var _format = $('[name="color-format"]:checked').val();
      $('#color-value').trigger('blur');
      log(_format);
      if (_format == 'hex') {
        $('[name="color-format"]').filter('[value="hex"]').prop('checked', true).trigger('change');
      }
    });

    /* Icons
     ========================================================================== */
    if ($('.sg-icons-list').length) {
      if (ajaxIconsPreviewUrl != undefined) {
        var beforeLoad = function() {
          if (GoTo != undefined && window.location.hash.length) {
            setTimeout(function() {
              GoTo.move(window.location.hash);
            }, 1500);
          }
        }
        var afterLoad = function(data) {
          var data = data.replace('<body', '<body><div id="body"').replace('</body>', '</div></body>');
          data = data.replace(/<h1>[\s\S]*?<\/h1>/, '');
          var $body = $(data).filter('#body').html();
          $('.sg-icons-list').html($body);
        }

        Bring.load({
          url: ajaxIconsPreviewUrl,
          loader: beforeLoad,
          callback: afterLoad
        });
      }
    }

  });

})(jQuery, window, document);