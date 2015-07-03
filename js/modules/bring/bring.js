/**
 * @license
 *
 * Bring
 * loads data with several options (cache, callback, progress bar ...)
 * @author idomusha / https://github.com/idomusha
 *
 * Dependencies:
 *  - NProgress [OPTIONAL]
 */

(function(window, $) {
  var s;
  var Bring = {

    defaults: {

      // processing status
      ready: true,

      // debug mode
      debug: false,

      oDataCache: {}
    },

    options: {},

    settings: {},

    init: function() {
      // merge defaults and options, without modifying defaults explicitly
      this.settings = $.extend({}, this.defaults, this.options);
      s = this.settings;

      if (s.debug) console.log('##################### init()');
    },

    /**
     * AJAX request
     * generic function to load data
     *
     * @method load
     * @param {String} url (default: The current page): A string containing the URL to which the request is sent (path relative to the 'ajax/' directory ).
     * @param {String} returned (default: Intelligent Guess (xml, json, script, or html)): The type of data that you're expecting back from the server.
     * @param {Function} success: A function to be called if the request succeeds.
     * @param {Object or String} param: Data to be sent to the server. It is converted to a query string, if not already a string.
     * @param {String} request (default: 'GET'): The type of request to make ("POST" or "GET").
     * @param {Boolean} [loader=false]: Active or not the pre-request callback function beforeSend.
     * @param {Boolean} [fail=false]: Active or not the error callback function (if the request fails).
     */
    load: function(url, returned, callback, param, request, loader, fail) {
      if (s.debug) console.log('##################### load()');
      var loading;
      var failed;
      var succeed;
      loader = loader || false;
      fail = fail || false;
      request = request || 'GET';

      if ($.isFunction(callback)) {
        succeed = function(data) {
          if (s.debug) console.log('~~~~~~~~ success ~~~~~~~~');
          s.ready = true;
          $('body').removeClass('js-bring-loading');
          if (GoTo != undefined && window.location.hash.length) {
            setTimeout(function() {
              GoTo.move(window.location.hash);
            }, 1500);
          }

          try {
            NProgress.done();
          }
          catch (e) {
            //console.log(e);
          }

          s.oDataCache[url] = data;
          eval(callback(data));
        }
      }
      else {
        succeed = function(jqXHR, settings) {
          if (s.debug) console.log('~~~~~~~~ success ~~~~~~~~');
          s.ready = true;
          $('body').removeClass('js-bring-loading');
          if (GoTo != undefined && window.location.hash.length) {
            setTimeout(function() {
              GoTo.move(window.location.hash);
            }, 1500);
          }

          try {
            NProgress.done();
          }
          catch (e) {
            console.log(e);
          }
        }
      }

      if ($.isFunction(loader)) {
        loading = loader;
      }
      else {
        loading = function(jqXHR, settings) {
          if (s.debug) console.log('~~~~~~~~ beforeSend ~~~~~~~~');
          s.ready = false;
          $('body').addClass('js-bring-loading');
          try {
            NProgress.start();
          }
          catch (e) {
            console.info('Bring: NProgress is not installed.');
          }
        }
      }

      if ($.isFunction(fail)) {
        failed = fail;
        eval(fail);
      }
      else {
        failed = function(jqXHR, textStatus, errorThrown) {
          if (s.debug) console.log('~~~~~~~~ error ~~~~~~~~');
          s.ready = true;
          $('body').removeClass('js-bring-loading');
          try {
            NProgress.done();
          }
          catch (e) {
            //console.log(e);
          }
        }
      }

      // Relative URL
      /*if (!(url.match('^http'))) {
        url = settingsGlobal.pathAjax + url;
      }*/

      //console.log('url: '+url);
      //console.log('datType: '+returned);
      //console.log('success: '+callback);
      //console.log('data: '+param);
      //console.log('type: '+request);
      //console.log('beforeSend: '+loader);
      //console.log('error: '+fail);

      $.ajax({
        cache: false,
        type: request,
        url: url,
        data: param,
        dataType: returned,
        error: failed,
        beforeSend: loading,
        success: succeed
      });
    },

    destroy: function() {
      if (s.debug) console.log('##################### destroy()');
      $.removeData(Bring.get(0));
    },

    refresh: function() {
      if (s.debug) console.log('##################### refresh()');
      Bring.destroy();
      Bring.init();
    }
  }
  window.Bring = Bring;
  Bring.init();
})(window, jQuery);
