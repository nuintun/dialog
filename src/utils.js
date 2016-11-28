var AP = Array.prototype;
var APFilter = AP.filter;
var APIndexOf = AP.indexOf;
var APForEach = AP.forEach;

/**
 * apply
 * @param  {Function} fn
 * @param  {Any} context
 * @param  {Array} args
 * call is faster than apply, optimize less than 6 args
 * https://github.com/micro-js/apply
 * http://blog.csdn.net/zhengyinhui100/article/details/7837127
 */
export function apply(fn, context, args) {
  switch (args.length) {
    // faster
    case 0:
      return fn.call(context);
    case 1:
      return fn.call(context, args[0]);
    case 2:
      return fn.call(context, args[0], args[1]);
    case 3:
      return fn.call(context, args[0], args[1], args[2]);
    default:
      // slower
      return fn.apply(context, args);
  }
}

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
