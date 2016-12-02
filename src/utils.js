var AP = Array.prototype;
var APFilter = AP.filter;
var APIndexOf = AP.indexOf;
var APForEach = AP.forEach;
var APMap = AP.map;

/**
 * filter
 * @param {Array} array
 * @param {Function} iterator
 * @param {any} context
 * @returns
 */
export var filter = APFilter ? function(array, iterator, context) {
  return APFilter.call(array, iterator, context);
} : function(array, iterator, context) {
  var val;
  var result = [];
  var len = array.length >>> 0;
  var context = arguments.length >= 3 ? arguments[2] : array;

  for (var i = 0; i < len; i++) {
    if (i in array) {
      val = array[i];

      // NOTE: Technically this should Object.defineProperty at
      //   the next index, as push can be affected by
      //   properties on Object.prototype and Array.prototype.
      //   But that method's new, and collisions should be
      //   rare, so use the more-compatible alternative.
      if (iterator.call(context, val, i, array)) {
        result.push(val);
      }
    }
  }

  return result;
};

/**
 * indexOf
 * @param {Array} array
 * @param {any} value
 * @param {Number} from
 * @returns
 */
export var indexOf = APIndexOf ? function(array, value, from) {
  return APIndexOf.call(array, value, from);
} : function(array, value, from) {
  var length = array.length >>> 0;

  from = Number(from) || 0;
  from = Math[from < 0 ? 'ceil' : 'floor'](from);

  if (from < 0) {
    from = Math.max(from + length, 0);
  }

  for (; from < length; from++) {
    if (from in array && array[from] === value) {
      return from;
    }
  }

  return -1;
};

/**
 * forEach
 * @param {Array} array
 * @param {Function} iterator
 * @param {any} context
 */
export var forEach = APForEach ? function(array, iterator, context) {
  APForEach.call(array, iterator, context);
} : function(array, iterator, context) {
  if (arguments.length < 3) {
    context = array;
  }

  for (var i = 0, length = array.length; i < length; i++) {
    iterator.call(array, array[i], i, array);
  }
};

/**
 * map
 * @param {Array} array
 * @param {Function} iterator
 * @param {any} context
 */
export var map = APMap ? function(array, iterator, context) {
  return APMap.call(array, iterator, context);
} : function(array, iterator, context) {
  var length = this.length >>> 0;
  var result = new Array(length);

  if (arguments.length < 3) {
    context = array;
  }

  for (var i = 0; i < length; i++) {
    if (i in array) {
      result[i] = fn.call(context, array[i], i, array);
    }
  }

  return result;
}

/**
 * getComputedStyle
 * @export
 * @param {HTMLElement} element
 * @param {String} property
 * @returns {Object}
 * @see https://github.com/the-simian/ie8-getcomputedstyle/blob/master/index.js
 * @see https://github.com/twolfson/computedStyle/blob/master/lib/computedStyle.js
 * @see http://www.zhangxinxu.com/wordpress/2012/05/getcomputedstyle-js-getpropertyvalue-currentstyle
 */
export function getComputedStyle(element, property) {
  var getComputedStyle = window.getComputedStyle;

  var style =
    // If we have getComputedStyle
    getComputedStyle ?
    // Query it
    // From CSS-Query notes, we might need (node, null) for FF
    getComputedStyle(element, null) :
    // Otherwise, we are in IE and use currentStyle
    element.currentStyle;

  // 返回 getPropertyValue 方法
  return {
    /**
     * getPropertyValue
     * @param {String} property
     */
    getPropertyValue: function(property) {
      if (style) {
        // Original support
        if (style.getPropertyValue) {
          return style.getPropertyValue(property);
        }

        // Switch to camelCase for CSSOM
        // DEV: Grabbed from jQuery
        // https://github.com/jquery/jquery/blob/1.9-stable/src/css.js#L191-L194
        // https://github.com/jquery/jquery/blob/1.9-stable/src/core.js#L593-L597
        property = property.replace(/-(\w)/gi, function(word, letter) {
          return letter.toUpperCase();
        });

        // Old IE
        if (style.getAttribute) {
          return style.getAttribute(property);
        }

        // Read property directly
        return style[property];
      }
    }
  };
}
