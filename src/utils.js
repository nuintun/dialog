var AP = Array.prototype;
var APFilter = AP.filter;
var APIndexOf = AP.indexOf;
var APForEach = AP.forEach;

/**
 * filter
 * @param {any} array
 * @param {any} iterator
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
 * @param {any} array
 * @param {any} value
 * @param {any} from
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
 * @param {any} array
 * @param {any} iterator
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
}

// 默认样式
var style = document.documentElement.style;
// 浏览器前缀
var prefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'];

/**
 * modernizr
 * @param {any} name
 * @returns
 */
function modernizr(name) {
  if (style[name] !== undefined) {
    return {
      name: name,
      event: name + 'end'
    }
  }

  var pfx;

  name = name.replace(/(\w)/, function(word, letter) {
    return letter.toUpperCase();
  });

  for (var i = 0, length = prefixes.length; i < length; i++) {
    if (style[prefixes[i] + name] !== undefined) {
      pfx = prefixes[i];

      return {
        property: pfx + name,
        event: pfx + name + 'End'
      };
    }
  }

  return false;
}

// animation
export var animation = modernizr('animation');
// transition
export var transition = modernizr('transition');

/**
 * getComputedStyle
 * @export
 * @param {any} element
 * @param {any} property
 * @returns
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

  return {
    /**
     * getPropertyValue
     * @param property
     */
    getPropertyValue: function(property) {
      if (style) {
        // Original support
        if (style.getPropertyValue) {
          return style.getPropertyValue(property);
        }

        // Fixed IE float
        if (prop === 'float') {
          prop = 'styleFloat';
        } else {
          // Switch to camelCase for CSSOM
          // DEV: Grabbed from jQuery
          // https://github.com/jquery/jquery/blob/1.9-stable/src/css.js#L191-L194
          // https://github.com/jquery/jquery/blob/1.9-stable/src/core.js#L593-L597
          property = property.replace(/-(\w)/gi, function(word, letter) {
            return letter.toUpperCase();
          });
        }

        return style[property];
      }
    }
  };
}

/**
 * hasDuration
 * @export
 * @param {any} duration
 */
export function hasDuration(duration) {
  duration = duration.split(/\s*,\s*/);

  for (var i = 0, length = duration.length; i < length; i++) {
    if (parseFloat(duration[i]) > 0) {
      return true;
    }
  }

  return false;
}
