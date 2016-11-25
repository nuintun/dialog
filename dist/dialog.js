(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define('dialog', ['jquery'], factory) :
  (global.Dialog = factory(global.jQuery));
}(this, (function ($) { 'use strict';

  $ = 'default' in $ ? $['default'] : $;

  var AP = Array.prototype;
  var APFilter = AP.filter;
  var APIndexOf = AP.indexOf;
  /**
   * type
   * @param {any} value
   * @returns
   */


  /**
   * typeIs
   * @param {any} value
   * @param {any} dataType
   * @returns
   */


  /**
   * apply
   * @param  {Function} fn
   * @param  {Any} context
   * @param  {Array} args
   * call is faster than apply, optimize less than 6 args
   * https://github.com/micro-js/apply
   * http://blog.csdn.net/zhengyinhui100/article/details/7837127
   */


  /**
   * filter
   * @param {any} array
   * @param {any} iterator
   * @param {any} context
   * @returns
   */
  var filter = APFilter ? function(array, iterator, context) {
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
  var indexOf = APIndexOf ? function(array, value, from) {
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

  var Mask = {
    reference: [],
    node: $('<div class="ui-dialog-mask" tableindex="0"></div>'),
    show: function(target) {
      if (indexOf(Mask.reference, target) === -1) {
        Mask.reference.push(target);
        Mask.node.insertBefore(target);
      }
    },
    hide: function(target) {
      Mask.reference = filter(Mask.reference, function(element) {
        return target !== element;
      });

      var length = Mask.reference.length;

      if (length === 0) {
        Mask.node.remove();
      } else {
        Mask.node.insertBefore(Mask.reference[length - 1]);
      }
    }
  };

  function Dialog() {
    var context = this;

    context.node = document.createElement('div');
  }

  Dialog.prototype = {
    /**
     * 初始化完毕事件，在 show()、showModal() 执行
     * @name Popup.prototype.onshow
     * @event
     *
     * 关闭事件，在 close() 执行
     * @name Popup.prototype.onclose
     * @event
     *
     * 销毁前事件，在 remove() 前执行
     * @name Popup.prototype.onbeforeremove
     * @event
     *
     * 销毁事件，在 remove() 执行
     * @name Popup.prototype.onremove
     * @event
     *
     * 重置事件，在 reset() 执行
     * @name Popup.prototype.onreset
     * @event
     *
     * 焦点事件，在 foucs() 执行
     * @name Popup.prototype.onfocus
     * @event
     *
     * 失焦事件，在 blur() 执行
     * @name Popup.prototype.onblur
     * @event
     */
    // 浮层 DOM 素节点[*]
    node: null,
    // 是否开启固定定位[*]
    fixed: false,
    // 判断对话框是否删除[*]
    destroyed: true,
    // 判断对话框是否显示
    open: false,
    // close 返回值
    returnValue: '',
    // 是否自动聚焦
    autofocus: true,
    // 对齐方式[*]
    align: 'bottom left',
    // 内部的 HTML 字符串
    innerHTML: '',
    // CSS 类名
    className: 'ui-dialog',
    /**
     * 显示浮层
     * @param {HTMLElement, Event}  指定位置（可选）
     */
    show: function(anchor) {
      var context = this;

      if (context.destroyed) {
        return context;
      }

      var node = context.node;
      var mask = Mask.mask;

      context.open = true;
      context.follow = anchor || context.follow;
      context.__activeElement = context.__getActive();

      // 初始化 show 方法
      if (!context.__ready) {
        node
          .addClass(context.className)
          .attr('role', context.modal ? 'modal-dialog' : 'dialog')
          .css('position', context.fixed ? 'fixed' : 'absolute');

        // 模态浮层的遮罩
        if (context.modal) {
          context.__ready = true;

          node.addClass(context.className + '-modal');
        }

        if (!node.html()) {
          node.html(context.innerHTML);
        }
      }

      node
        .addClass(context.className + '-show')
        .show();

      backdrop.show();
      context.reset().focus();
      context.emit('show');

      return context;
    },
  };

  return Dialog;

})));
