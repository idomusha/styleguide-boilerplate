var debug = false;

(function($) {

  $.extend($.fn, {

    /**
     * Checking for existing attribute and/or attribute value
     *
     * @method hasAttr
     * @param {String} name (required): specify the name of the attribute to check.
     * @param {String} val (optional): specify the value of the attribute to check.
     * @return {Boolean}
     *
     * Ex:
     $('#myElement').trans(name);
     $('#myElement').trans(name,val);

     */
    hasAttr: function(name, val) {
      if (val) {
        return $(this).attr(name) === val;
      }

      return $(this).attr(name) !== undefined;
    },

    /**
     * Set the background-color OR color of the element with a percentage (positive value: lighten / negative value: darken)
     *
     * @method shadeColor
     * @param {String} property: background-color or color properties
     * @param {Float} percent: percent to shade lighter(positive number) or darker(negative number): -1.0 to 1.0
     */
    shadeColor: function(property, percent) {
      var color = rgb2hex($(this).css(property));
      var f = parseInt(color.slice(1), 16);
      var t = percent < 0 ? 0 : 255;
      var p = percent < 0 ? percent * -1 : percent;
      var R = f >> 16;
      var G = f >> 8 & 0x00FF;
      var B = f & 0x0000FF;
      color = '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
      $(this).css(property, color);
      return color;
    },

    /**
     * Set the text color (light or dark) of the element depending on the color of the background
     *
     * @method setTextColor
     * @param {Object} options
     */
    setTextColor: function(options) {
      var defaults = {

        // Default dark theme text color value
        dark: '#fdfdfd',

        // Default light theme text color value
        light: '#2f2f2f'
      };
      var settings = $.extend(defaults, options);
      if (settings.dark == undefined || !(typeof settings.dark == 'string' && settings.dark.charAt(0) == '#')) settings.dark = defaults.dark;
      if (settings.light == undefined || !(typeof settings.light == 'string' && settings.light.charAt(0) == '#')) settings.light = defaults.light;

      // converts the background color space into YIQ and compares it to the value halfway between pure black and pure white and returns light or dark text color depending if the hex value is less than half or not
      this.each(function(i, v) {
        var backgroundColor = $(this).css('background-color').charAt(0) == '#' ? $(this).css('background-color') : rgb2hex($(this).css('background-color'));
        var backgroundTheme = getContrast(backgroundColor);
        if (debug) log(backgroundColor);
        if (debug) log(backgroundTheme);
        var textColor = backgroundTheme == 'dark' ? settings.light : settings.dark;
        $(this).css('color', textColor);
      })

    }

  });

})(jQuery);

/*********************************************
 * COLOR
 *********************************************/

var hexDigits = new Array
('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');

// converts hex format to a rgb color
function rgb2hex(rgb) {
  if (rgb === 'transparent') return false;
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex2rgb(hex) {
  if (hex.lastIndexOf('#') > -1) {
    hex = hex.replace(/#/, '0x');
  }
  else {
    hex = '0x' + hex;
  }

  var r = hex >> 16;
  var g = (hex & 0x00FF00) >> 8;
  var b = hex & 0x0000FF;
  return [r, g, b];
};

function hex(x) {
  return isNaN(x) ? '00' : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

// converts the RGB color space into YIQ and returns 'light' or 'dark' depending if the hex value is less than half or not
function getContrastYIQ(hexcolor) {
  var c = hexcolor.charAt(0) == '#' ? hexcolor.substring(1) : hexcolor;
  var r = parseInt(c.substr(0, 2), 16);
  var g = parseInt(c.substr(2, 2), 16);
  var b = parseInt(c.substr(4, 2), 16);
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'dark' : 'light';
}

// takes the hex value and compares it to the value halfway between pure black and pure white and returns 'light' or 'dark' depending if the hex value is less than half or not
function getContrast50(hexcolor) {
  var c = hexcolor.charAt(0) == '#' ? hexcolor.substring(1) : hexcolor;
  return (parseInt(c, 16) > 0xffffff / 2) ? 'dark' : 'light';
}

function getContrast(hexcolor) {
  var c = hexcolor.charAt(0) == '#' ? hexcolor.substring(1) : hexcolor;
  var themeFromYIQ = getContrastYIQ(c);
  var themeFrom50 = getContrast50(c);
  return themeFromYIQ == 'light' || themeFrom50 == 'light' ? 'light' : 'dark';
}

/**
 * Return color with a percentage (positive value: lighten / negative value: darken)
 *
 * @method shadeColor
 * @param {String} color: color (hex or RGB)
 * @param {Float} percent: percent to shade lighter(positive number) or darker(negative number): -1.0 to 1.0
 */
function shadeColor(color, percent) {
  try {
    if (
      color.slice(0, 1) == '#'
      && color.length == 4
    ) {
      color = rgb2hex(color);
    }

    if (color.slice(0, 3) == 'rgb') color = rgb2hex(color);
    var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    color = '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    return color;
  }
  catch (err) {
    console.log(err);
  }
}