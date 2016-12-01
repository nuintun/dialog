(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define('dialog', ['jquery'], factory) :
  (global.Dialog = factory(global.jQuery));
}(this, (function ($) { 'use strict';

  $ = 'default' in $ ? $['default'] : $;

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
   * @param {Array} array
   * @param {any} value
   * @param {Number} from
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
   * @param {Array} array
   * @param {Function} iterator
   * @param {any} context
   */
  var forEach = APForEach ? function(array, iterator, context) {
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
  var map = APMap ? function(array, iterator, context) {
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
  };

  /**
   * getComputedStyle
   * @export
   * @param {HTMLElement} element
   * @param {String} property
   * @returns
   */
  function getComputedStyle(element, property) {
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

  // 公用遮罩
  var Mask = {
    // 遮罩分配
    alloc: [],
    // 遮罩节点
    node: $('<div class="ui-modal-dialog-mask" tableindex="0"></div>').css({
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    }),
    /**
     * 显示遮罩
     * @param {HTMLElement} anchor 定位节点
     */
    show: function(anchor) {
      if (indexOf(Mask.alloc, anchor) === -1) {
        Mask.alloc.push(anchor);
        Mask.node.insertBefore(anchor);
      }
    },
    /**
     * 隐藏遮罩
     * @param {HTMLElement} anchor 定位节点
     */
    hide: function(anchor) {
      Mask.alloc = filter(Mask.alloc, function(element) {
        return anchor !== element;
      });

      var length = Mask.alloc.length;

      if (length === 0) {
        Mask.node.remove();
      } else {
        Mask.node.insertBefore(Mask.alloc[length - 1]);
      }
    }
  };

  // 默认样式
  var styles = document.documentElement.style;

  // animationend 映射表
  var ANIMATIONEND_EVENTS = {
    animation: 'animationend',
    WebkitAnimation: 'webkitAnimationEnd',
    MozAnimation: 'mozAnimationEnd',
    OAnimation: 'oAnimationEnd',
    msAnimation: 'MSAnimationEnd',
    KhtmlAnimation: 'khtmlAnimationEnd'
  };

  // transition 映射表
  var TRANSITIONEND_EVENTS = {
    transition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'mozTransitionEnd',
    OTransition: 'oTransitionEnd',
    msTransition: 'MSTransitionEnd',
    KhtmlTransition: 'khtmlTransitionEnd'
  };

  /**
   * detector
   * @param {Object} maps
   * @returns
   */
  function detector(maps) {
    for (var property in maps) {
      if (maps.hasOwnProperty(property) && styles[property] !== undefined) {
        return property;
      }
    }
  }

  // animation
  var ANIMATION = detector(ANIMATIONEND_EVENTS);

  // transition
  var TRANSITION = detector(TRANSITIONEND_EVENTS);

  /**
   * toMs
   * @param {String} value
   * @returns
   */
  function toMs(value) {
    return Number(value.slice(0, -1)) * 1000;
  }

  /**
   * getTimeout
   * @param {Array} delays
   * @param {Array} durations
   * @returns
   */
  function getTimeout(delays, durations) {
    /* istanbul ignore next */
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    // 获取最大时长
    return Math.max.apply(null, map(durations, function(duration, i) {
      return toMs(duration) + toMs(delays[i]);
    }));
  }

  /**
   * getEffectsInfo
   * @param {HTMLElement} element
   * @returns
   */
  function getEffectsInfo(element) {
    var styles = getComputedStyle(element);
    var transitioneDelays = styles.getPropertyValue(TRANSITION + '-delay').split(', ');
    var transitionDurations = styles.getPropertyValue(TRANSITION + '-duration').split(', ');
    var transitionTimeout = getTimeout(transitioneDelays, transitionDurations);
    var animationDelays = styles.getPropertyValue(ANIMATION + '-delay').split(', ');
    var animationDurations = styles.getPropertyValue(ANIMATION + '-duration').split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations);

    var type;
    var count;
    var timeout;

    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? (transitionTimeout > animationTimeout ? TRANSITION : ANIMATION) : null;
    count = type ? (type === TRANSITION ? transitionDurations.length : animationDurations.length) : 0;

    return {
      type: type,
      count: count,
      timeout: timeout
    };
  }

  /**
   * whenEffectsEnd
   * @export
   * @param {jQueryElement} node
   * @param {Function} callback
   * @returns
   */
  function whenEffectsEnd(node, callback) {
    var element = node[0];
    var info = getEffectsInfo(element);
    var type = info.type;

    // 没有动画
    if (!type) {
      return callback();
    }

    var ended = 0;
    var count = info.count;
    var timeout = info.timeout;
    var event = type === TRANSITION ?
      TRANSITIONEND_EVENTS[TRANSITION] :
      ANIMATIONEND_EVENTS[ANIMATION];

    var end = function() {
      node.off(event, onEnd);
      callback();
    };

    var onEnd = function(e) {
      if (e.target === element) {
        if (++ended >= count) {
          end();
        }
      }
    };

    // 防止有些动画没有触发结束事件
    setTimeout(function() {
      if (ended < count) {
        end();
      }
    }, timeout + 1);

    // 监听动画完成事件
    node.on(event, onEnd);
  }

  var ALIGNSPLIT = /\s+/;
  var __window = $(window);
  var __document = $(document);

  /**
   * Dialog
   * @constructor
   * @export
   */
  function Dialog() {
    var context = this;

    context.destroyed = false;
    context.node = document.createElement('div');
    context.__node = $(context.node)
      .css({
        display: 'none',
        position: 'absolute',
        outline: 0
      })
      .attr('tabindex', '-1');
  }

  // 当前叠加高度
  Dialog.zIndex = 1024;
  // 顶层浮层的实例
  Dialog.current = null;
  // 遮罩
  Dialog.mask = Mask.node;

  // 原型属性
  Dialog.prototype = {
    /**
     * 显示事件，在 show()、showModal() 执行
     * @name Popup.prototype.onshow
     * @event
     *
     * 关闭前事件，在 close() 前执行
     * @name Popup.prototype.onbeforeclose
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
    // 浮层 DOM 元素节点[*]
    node: null,
    // 跟随的 DOM 元素节点[*]
    follow: null,
    // 是否开启固定定位[*]
    fixed: false,
    // 判断对话框是否删除[*]
    destroyed: true,
    // 判断对话框是否显示
    open: false,
    // close 返回值
    returnValue: undefined,
    // 是否自动聚焦
    autofocus: true,
    // 对齐方式[*]
    align: 'bottom left',
    // 内部的 HTML 字符串
    innerHTML: '',
    // CSS 类名
    className: 'ui-dialog',
    // 构造函数
    constructor: Dialog,
    /**
     * 显示浮层（私有）
     * @param {HTMLElement}  指定位置（可选）
     */
    __show: function(anchor) {
      var context = this;

      // 已销毁
      if (context.destroyed) {
        return context;
      }

      var dialog = context.__node;

      context.open = true;
      context.__activeElement = context.__getActive();
      context.follow = arguments.length ? anchor : context.follow;

      // 初始化 show 方法
      if (!context.__ready) {
        // 设置样式
        dialog
          .addClass(context.className)
          .css('position', context.fixed ? 'fixed' : 'absolute');

        // 弹窗添加到文档树
        dialog.appendTo(document.body);

        // 切换ready状态
        context.__ready = true;
      }

      // 设置内容
      if (context.__innerHTML !== context.innerHTML) {
        // 设置内容
        dialog.html(context.innerHTML);

        // 换成内容
        context.__innerHTML = context.innerHTML;
      }

      // 显示遮罩
      if (context.modal) {
        Mask.show(context.node);
        dialog.addClass(context.className + '-modal');
      }

      // 设置样式
      dialog
        .attr('role', context.modal ? 'alertdialog' : 'dialog')
        .removeClass(context.className + '-close')
        .addClass(context.className + '-show')
        .show();

      // 定位聚焦
      context
        .reset()
        .focus();

      // 触发事件
      context.__dispatchEvent('show');

      return context;
    },
    /**
     * 显示浮层
     * @param {HTMLElement}  指定位置（可选）
     */
    show: function(anchor) {
      var context = this;

      // 关闭模态
      if (context.modal) {
        var dialog = context.__node;

        // 关闭遮罩
        if (context.open) {
          Mask.hide(context.node);
        }

        // 移除类名
        dialog.removeClass(context.className + '-modal');
      }

      // 重置模态状态
      context.modal = false;

      // 显示
      return context.__show(anchor);
    },
    /**
     * 显示模态浮层。
     * @param {HTMLElement}  指定位置（可选）
     */
    showModal: function(anchor) {
      var context = this;
      var dialog = context.__node;

      // 重置模态状态
      context.modal = true;

      return context.__show(anchor);
    },
    /**
     * 关闭浮层
     * @param {any} result
     */
    close: function(result) {
      var context = this;

      // 销毁和未打开不做处理
      if (context.destroyed || !context.open) {
        return context;
      }

      // 关闭前
      if (context.__dispatchEvent('beforeclose') === false) {
        return context;
      }

      // 关闭
      // 设置返回值
      if (result !== undefined) {
        context.returnValue = result;
      }

      var node = context.node;
      var dialog = context.__node;

      // 切换弹窗样式
      dialog
        .removeClass(context.className + '-show')
        .addClass(context.className + '-close');

      // 动画完成之后隐藏弹窗
      whenEffectsEnd(dialog, function() {
        // 隐藏弹窗
        dialog.hide();

        // 隐藏遮罩
        if (context.modal) {
          Mask.hide(context.node);
        }

        // 恢复焦点，照顾键盘操作的用户
        context.blur();

        // 切换打开状态
        context.open = false;

        // 关闭事件
        context.__dispatchEvent('close');
      });

      return context;
    },
    /**
     * 销毁浮层
     */
    remove: function() {
      var context = this;

      // 已销毁
      if (context.destroyed) {
        return context;
      }

      // 移除前
      if (context.__dispatchEvent('beforeremove') === false) {
        return context;
      }

      // 清理激活项
      if (Dialog.current === context) {
        Dialog.current = null;
      }

      // 隐藏遮罩
      if (context.open && context.modal) {
        Mask.hide(context.node);
      }

      // 从 DOM 中移除节点
      context.__node.remove();

      // 切换销毁状态
      context.destroyed = true;

      // 触发销毁事件
      context.__dispatchEvent('remove');

      // 清理属性
      for (var property in context) {
        delete context[property];
      }

      return context;
    },
    /**
     * 重置位置
     */
    reset: function() {
      var context = this;

      // 销毁和未打开不做处理
      if (context.destroyed || !context.open) {
        return context;
      }

      var follow = context.follow;

      if (follow) {
        context.__follow(follow);
      } else {
        context.__center();
      }

      // 触发事件
      context.__dispatchEvent('reset');

      return context;
    },
    /**
     * 让浮层获取焦点
     */
    focus: function() {
      var context = this;

      // 销毁和未打开不做处理
      if (context.destroyed || !context.open) {
        return context;
      }

      var node = context.node;
      var current = Dialog.current;
      var dialog = context.__node;
      var index = context.zIndex = Dialog.zIndex++;

      if (current && current !== context) {
        current.blur(false);
      }

      // 检查焦点是否在浮层里面
      if (!$.contains(node, context.__getActive())) {
        var autofocus = dialog.find('[autofocus]')[0];

        if (!context._autofocus && autofocus) {
          context._autofocus = true;
        } else {
          autofocus = node;
        }

        // 获取焦点
        context.__focus(autofocus);
      }

      // 设置弹窗层级
      dialog.css('zIndex', index);
      // 设置遮罩层级
      Mask.node.css('zIndex', index);

      // 保存当前激活实例
      Dialog.current = context;

      // 添加激活类名
      dialog.addClass(context.className + '-focus');
      // 触发事件
      context.__dispatchEvent('focus');

      return context;
    },
    /**
     * 让浮层失去焦点。将焦点退还给之前的元素，照顾视力障碍用户
     */
    blur: function() {
      var context = this;

      // 销毁和未打开不做处理
      if (context.destroyed || !context.open) {
        return context;
      }

      var isBlur = arguments[0];
      var activeElement = context.__activeElement;

      if (isBlur !== false) {
        context.__focus(activeElement);
      }

      context._autofocus = false;
      context.__node.removeClass(context.className + '-focus');
      context.__dispatchEvent('blur');

      return context;
    },
    /**
     * 添加事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     */
    addEventListener: function(type, callback) {
      var context = this;

      context
        .__getEventListeners(type)
        .push(callback);

      return context;
    },
    /**
     * 删除事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     */
    removeEventListener: function(type, callback) {
      var context = this;
      var listeners = context.__getEventListeners(type);

      for (var i = 0; i < listeners.length; i++) {
        if (callback === listeners[i]) {
          listeners.splice(i--, 1);
        }
      }

      return context;
    },
    /**
     * 获取事件缓存
     * @param {String} type
     */
    __getEventListeners: function(type) {
      var context = this;
      var listeners = context.__listeners;

      if (!listeners) {
        listeners = context.__listeners = {};
      }

      if (!listeners[type]) {
        listeners[type] = [];
      }

      return listeners[type];
    },
    /**
     * 派发事件
     * @param {String} type
     */
    __dispatchEvent: function(type) {
      var returned;
      var context = this;
      var listeners = context.__getEventListeners(type);

      if (context['on' + type]) {
        returned = context['on' + type].call(context);
      }

      var result;

      // 执行事件队列
      for (var i = 0, length = listeners.length; i < length; i++) {
        result = listeners[i].call(context);

        if (returned !== false) {
          returned = result;
        }
      }

      return returned;
    },
    /**
     * 对元素安全聚焦
     * @param {HTMLElement} element
     */
    __focus: function(element) {
      // 防止 iframe 跨域无权限报错
      // 防止 IE 不可见元素报错
      try {
        // ie11 bug: iframe 页面点击会跳到顶部
        if (this.autofocus && !/^iframe$/i.test(element.nodeName)) {
          element.focus();
        }
      } catch (e) {
        // error
      }
    },
    // 获取当前焦点的元素
    __getActive: function() {
      try {
        // try: ie8~9, iframe #26
        var activeElement = document.activeElement;
        var contentDocument = activeElement.contentDocument;
        var element = contentDocument && contentDocument.activeElement || activeElement;

        return element;
      } catch (e) {
        // error
      }
    },
    // 居中浮层
    __center: function() {
      var context = this;
      var dialog = context.__node;
      var fixed = context.fixed;
      var scrollLeft = fixed ? 0 : __document.scrollLeft();
      var scrollTop = fixed ? 0 : __document.scrollTop();
      var clientWidth = __window.width();
      var clientHeight = __window.height();
      var width = dialog.width();
      var height = dialog.height();
      var left = (clientWidth - width) / 2 + scrollLeft;
      var top = (clientHeight - height) * 382 / 1000 + scrollTop; // 黄金比例
      var style = context.node.style;

      style.left = Math.max(parseInt(left), scrollLeft) + 'px';
      style.top = Math.max(parseInt(top), scrollTop) + 'px';
    },
    /**
     * 指定位置
     * @param {HTMLElement} anchor
     */
    __follow: function(anchor) {
      var context = this;
      var dialog = context.__node;

      if (context.__align) {
        dialog.removeClass(context.__align);
      }

      anchor = anchor.parentNode && $(anchor);

      if (!anchor || !anchor.length) {
        return context.__center();
      }

      // 隐藏元素不可用
      if (anchor) {
        var offset = anchor.offset();

        if (offset.left * offset.top < 0) {
          return context.__center();
        }
      }

      var fixed = context.fixed;

      var clientWidth = __window.width();
      var clientHeight = __window.height();
      var scrollLeft = __document.scrollLeft();
      var scrollTop = __document.scrollTop();

      var width = dialog.width();
      var height = dialog.height();
      var width = anchor ? anchor.outerWidth() : 0;
      var height = anchor ? anchor.outerHeight() : 0;
      var offset = context.__offset(anchor[0]);
      var x = offset.left;
      var y = offset.top;
      var left = fixed ? x - scrollLeft : x;
      var top = fixed ? y - scrollTop : y;

      var minLeft = fixed ? 0 : scrollLeft;
      var minTop = fixed ? 0 : scrollTop;
      var maxLeft = minLeft + clientWidth - width;
      var maxTop = minTop + clientHeight - height;

      var css = {};
      var align = context.align.split(ALIGNSPLIT);
      var className = context.className + '-';
      var reverse = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
      var name = { top: 'top', bottom: 'top', left: 'left', right: 'left' };

      var temp = [
        { top: top - height, bottom: top + height, left: left - width, right: left + width },
        { top: top, bottom: top - height + height, left: left, right: left - width + width }
      ];

      var center = { left: left + width / 2 - width / 2, top: top + height / 2 - height / 2 };

      var range = {
        left: [minLeft, maxLeft],
        top: [minTop, maxTop]
      };

      // 超出可视区域重新适应位置
      forEach(align, function(value, i) {
        // 超出右或下边界：使用左或者上边对齐
        if (temp[i][value] > range[name[value]][1]) {
          value = align[i] = reverse[value];
        }

        // 超出左或右边界：使用右或者下边对齐
        if (temp[i][value] < range[name[value]][0]) {
          align[i] = reverse[value];
        }
      });

      // 一个参数的情况
      if (!align[1]) {
        name[align[1]] = name[align[0]] === 'left' ? 'top' : 'left';
        temp[1][align[1]] = center[name[align[1]]];
      }

      //添加follow的css, 为了给css使用
      className += align.join('-') + ' ' + context.className + '-follow';

      // 保存对齐类名
      context.__align = className;

      // 添加样式
      dialog.addClass(className);

      // 设置样式属性
      css[name[align[0]]] = parseInt(temp[0][align[0]]);
      css[name[align[1]]] = parseInt(temp[1][align[1]]);

      // 设置样式
      dialog.css(css);
    },
    /**
     * 获取元素相对于页面的位置（包括iframe内的元素）
     * 暂时不支持两层以上的 iframe 套嵌
     * @param {HTMLElement} anchor
     */
    __offset: function(anchor) {
      var isNode = anchor.parentNode;
      var offset = isNode ? $(anchor).offset() : {
        left: anchor.pageX,
        top: anchor.pageY
      };

      anchor = isNode ? anchor : anchor.target;

      var ownerDocument = anchor.ownerDocument;
      var defaultView = ownerDocument.defaultView || ownerDocument.parentWindow;

      if (defaultView == window) {
        // IE <= 8 只能使用两个等于号
        return offset;
      }

      ownerDocument = $(ownerDocument);

      var scrollLeft = ownerDocument.scrollLeft();
      var scrollTop = ownerDocument.scrollTop();

      // {Element: Ifarme}
      var frameElement = defaultView.frameElement;
      var frameOffset = $(frameElement).offset();
      var frameLeft = frameOffset.left;
      var frameTop = frameOffset.top;

      return {
        left: offset.left + frameLeft - scrollLeft,
        top: offset.top + frameTop - scrollTop
      };
    }
  };

  return Dialog;

})));
