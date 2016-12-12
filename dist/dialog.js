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
   * @returns {Object}
   * @see https://github.com/the-simian/ie8-getcomputedstyle/blob/master/index.js
   * @see https://github.com/twolfson/computedStyle/blob/master/lib/computedStyle.js
   * @see http://www.zhangxinxu.com/wordpress/2012/05/getcomputedstyle-js-getpropertyvalue-currentstyle
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
   * toArray
   * @param {any} value
   * @returns {Array}
   */
  function toArray(value) {
    return value ? value.split(', ') : [];
  }

  /**
   * getEffectsInfo
   * @param {HTMLElement} element
   * @returns
   */
  function getEffectsInfo(element) {
    var styles = getComputedStyle(element);
    var transitioneDelays = toArray(styles.getPropertyValue(TRANSITION + '-delay'));
    var transitionDurations = toArray(styles.getPropertyValue(TRANSITION + '-duration'));
    var transitionTimeout = getTimeout(transitioneDelays, transitionDurations);
    var animationDelays = toArray(styles.getPropertyValue(ANIMATION + '-delay'));
    var animationDurations = toArray(styles.getPropertyValue(ANIMATION + '-duration'));
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
   * @see https://github.com/vuejs/vue/blob/dev/src/platforms/web/runtime/transition-util.js
   */
  function whenEffectsEnd(node, callback) {
    // 不支持动画
    if (!ANIMATION && !TRANSITION) {
      return callback();
    }

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

  // 公用遮罩
  var Backdrop = {
    // 遮罩分配
    alloc: [],
    // 遮罩节点
    node: $('<div tabindex="0"></div>').css({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      userSelect: 'none'
    }),
    // 锁定 tab 焦点层
    shim: $('<div tabindex="0"></div>').css({
      width: 0,
      height: 0,
      opacity: 0
    }),
    /**
     * 设置弹窗层级
     */
    zIndex: function(zIndex) {
      // 最小为 0
      zIndex = Math.max(0, --zIndex);

      // 设定 z-index
      Backdrop.node.css('z-index', zIndex);
    },
    /**
     * 依附实例
     * @param {Dialog} anchor 定位弹窗实例
     */
    attach: function(anchor) {
      var node = anchor.node;
      var className = anchor.className + '-backdrop';

      Backdrop.node
        .addClass(className)
        .insertBefore(node);

      Backdrop.shim.insertAfter(node);
    },
    /**
     * 显示遮罩
     * @param {Dialog} anchor 定位弹窗实例
     */
    show: function(anchor) {
      if (indexOf(Backdrop.alloc, anchor) === -1) {
        Backdrop.attach(anchor);
        Backdrop.alloc.push(anchor);
      }
    },

    /**
     * 隐藏遮罩
     * @param {Dialog} anchor 定位弹窗实例
     */
    hide: function(anchor) {
      Backdrop.alloc = filter(Backdrop.alloc, function(item) {
        return anchor !== item;
      });

      var length = Backdrop.alloc.length;

      if (length === 0) {
        Backdrop.node.remove();
        Backdrop.shim.remove();
      } else {
        anchor = Backdrop.alloc[length - 1];

        Backdrop.zIndex(anchor.zIndex);
        Backdrop.attach(anchor);
      }
    }
  };

  // 对齐方式拆分正则
  var ALIGNSPLIT = /\s+/;
  var __window = $(window);
  var __document = $(document);

  /**
   * Dialog
   * @constructor
   * @export
   * @see https://github.com/aui/popupjs/blob/master/src/popup.js
   */
  function Dialog() {
    var context = this;

    context.destroyed = false;
    context.node = document.createElement('div');
    context.__node = $(context.node)
      // 设置 tabindex
      .attr('tabindex', '-1')
      // 设置样式
      .css({
        display: 'none',
        position: 'absolute',
        outline: 0
      })
      // 绑定得到焦点事件
      .on('focusin', function() {
        context.focus();
      });
  }

  // 当前叠加高度
  Dialog.zIndex = 1024;
  // 顶层浮层的实例
  Dialog.active = null;
  // 遮罩元素
  Dialog.backdrop = Backdrop.node[0];

  // 锁定 tab 焦点在弹窗内
  __document.on('focusin', function(e) {
    var active = Dialog.active;

    if (active && active.modal) {
      var target = e.target;
      var node = active.node;

      if (target !== node && !node.contains(target)) {
        active.focus();
      }
    }
  });

  // 原型属性
  Dialog.prototype = {
    /**
     * 浮层 DOM 元素节点
     * @public
     * @readonly
     */
    node: null,
    /**
     * 跟随的 DOM 元素节点
     * @public
     * @readonly
     */
    anchor: null,
    /**
     * 是否开启固定定位
     * @public
     * @property
     */
    fixed: false,
    /**
     * 判断对话框是否删除
     * @public
     * @readonly
     */
    destroyed: true,
    /**
     * 判断对话框是否显示
     * @public
     * @readonly
     */
    open: false,
    /**
     * close 返回值
     * @public
     * @property
     */
    returnValue: undefined,
    /**
     * 是否自动聚焦
     * @public
     * @property
     */
    autofocus: true,
    /**
     * 对齐方式
     * @public
     * @property
     */
    align: 'bottom left',
    /**
     * 内部的 HTML 字符串
     * @public
     * @property
     */
    innerHTML: '',
    /**
     * CSS 类名
     * @public
     * @property
     */
    className: 'ui-dialog',
    /**
     * 构造函数
     * @public
     * @readonly
     */
    constructor: Dialog,
    /**
     * 显示事件，在 show()、showModal() 执行
     * @event
     * @name Popup.prototype.onshow
     */
    /**
     * 关闭前事件，在 close() 前执行
     * @event
     * @name Popup.prototype.onbeforeclose
     */
    /**
     * 关闭事件，在 close() 执行
     * @event
     * @name Popup.prototype.onclose
     */
    /**
     * 销毁前事件，在 remove() 前执行
     * @event
     * @name Popup.prototype.onbeforeremove
     */
    /**
     * 销毁事件，在 remove() 执行
     * @event
     * @name Popup.prototype.onremove
     */
    /**
     * 重置事件，在 reset() 执行
     * @event
     * @name Popup.prototype.onreset
     */
    /**
     * 焦点事件，在 foucs() 执行
     * @event
     * @name Popup.prototype.onfocus
     */
    /**
     * 失焦事件，在 blur() 执行
     * @event
     * @name Popup.prototype.onblur
     */
    /**
     * 显示浮层（私有）
     * @private
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
      context.anchor = anchor || null;
      context.__activeElement = context.__getActive();

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
        Backdrop.show(context);
        dialog.addClass(context.className + '-modal');
      }

      // 设置样式
      dialog
        .attr('role', context.modal ? 'alertdialog' : 'dialog')
        .removeClass(context.className + '-close')
        .addClass(context.className + '-show')
        .show();

      // 执行定位操作
      context.reset();

      // 触发事件
      context.__dispatchEvent('show');

      // 聚焦
      context.focus();

      return context;
    },
    /**
     * 显示浮层
     * @public
     * @param {HTMLElement}  指定位置（可选）
     */
    show: function(anchor) {
      var context = this;

      // 关闭模态
      if (context.modal) {
        var dialog = context.__node;

        // 关闭遮罩
        if (context.open) {
          Backdrop.hide(context);
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
     * @public
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
     * @public
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

      // 恢复焦点，照顾键盘操作的用户
      context.blur();

      // 动画完成之后隐藏弹窗
      whenEffectsEnd(dialog, function() {
        // 隐藏弹窗
        dialog.hide();

        // 隐藏遮罩
        if (context.modal) {
          Backdrop.hide(context);
        }

        // 切换打开状态
        context.open = false;

        // 关闭事件
        context.__dispatchEvent('close');
      });

      return context;
    },
    /**
     * 销毁浮层
     * @public
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
      context.__cleanActive();

      // 隐藏遮罩
      if (context.open && context.modal) {
        Backdrop.hide(context);
      }

      // 移除事件绑定并从 DOM 中移除节点
      context.__node
        .off('focusin')
        .remove();

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
     * @public
     */
    reset: function() {
      var context = this;

      // 销毁和未打开不做处理
      if (context.destroyed || !context.open) {
        return context;
      }

      // 对齐类名
      var align = context.__align;

      // 移除跟随定位类名
      if (align) {
        // 移除对齐类名
        context.__node.removeClass(align);

        // 清空对齐类名
        context.__align = null;
      }

      // 跟随元素
      var anchor = context.anchor;

      // 如果没有跟随居中显示
      if (anchor) {
        context.__follow(anchor);
      } else {
        context.__center();
      }

      // 触发事件
      context.__dispatchEvent('reset');

      return context;
    },
    /**
     * 重置焦点激活状态
     * @private
     */
    __cleanActive: function() {
      // 清理激活项
      if (Dialog.active === this) {
        Dialog.active = null;
      }
    },
    /**
     * 让浮层获取焦点
     * @public
     */
    focus: function() {
      var context = this;

      // 销毁，未打开和已经得到焦点不做处理
      if (context.destroyed || !context.open) {
        return context;
      }

      var node = context.node;
      var dialog = context.__node;
      var active = Dialog.active;

      if (active && active !== context) {
        active.blur(false);
      }

      // 检查焦点是否在浮层里面
      if (!node.contains(context.__getActive())) {
        var autofocus = dialog.find('[autofocus]')[0];

        if (!context.__autofocus && autofocus) {
          context.__autofocus = true;
        } else {
          autofocus = node;
        }

        // 获取焦点
        context.__focus(autofocus);
      }

      // 非激活状态才做处理
      if (active !== context) {
        var index = context.zIndex = Dialog.zIndex++;

        // 设置遮罩层级
        Backdrop.zIndex(index);
        // 设置弹窗层级
        dialog.css('zIndex', index);

        // 添加激活类名
        dialog.addClass(context.className + '-focus');
        // 触发事件
        context.__dispatchEvent('focus');

        // 保存当前激活实例
        Dialog.active = context;
      }

      return context;
    },
    /**
     * 让浮层失去焦点。将焦点退还给之前的元素，照顾视力障碍用户
     * @public
     */
    blur: function() {
      var context = this;

      // 销毁和未打开不做处理
      if (context.destroyed || !context.open) {
        return context;
      }

      var isBlur = arguments[0];
      var activeElement = context.__activeElement;

      // 清理激活项
      context.__cleanActive();

      if (isBlur !== false) {
        context.__focus(activeElement);
      }

      context.__autofocus = false;
      context.__node.removeClass(context.className + '-focus');
      context.__dispatchEvent('blur');

      return context;
    },
    /**
     * 添加事件
     * @public
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
     * @public
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
     * @private
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
     * @private
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
     * @private
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
    /**
     * 获取当前焦点的元素
     * @private
     */
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
    /**
     * 居中浮层
     * @private
     */
    __center: function() {
      var context = this;
      var dialog = context.__node;
      var fixed = context.fixed;
      var clientWidth = __window.width();
      var clientHeight = __window.height();
      var scrollLeft = fixed ? 0 : __document.scrollLeft();
      var scrollTop = fixed ? 0 : __document.scrollTop();
      var dialogWidth = dialog.outerWidth();
      var dialogHeight = dialog.outerHeight();
      var top = (clientHeight - dialogHeight) * 382 / 1000 + scrollTop; // 黄金比例
      var left = (clientWidth - dialogWidth) / 2 + scrollLeft;

      dialog.css({
        top: Math.max(parseFloat(top), scrollTop),
        left: Math.max(parseFloat(left), scrollLeft)
      });
    },
    /**
     * 跟随元素
     * @private
     * @param {HTMLElement} anchor
     */
    __follow: function(anchor) {
      var context = this;
      var dialog = context.__node;

      // 不能是根节点
      anchor = anchor.parentNode && $(anchor);

      // 定位元素不存在
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

      var dialogWidth = dialog.outerWidth();
      var dialogHeight = dialog.outerHeight();
      var anchorWidth = anchor ? anchor.outerWidth() : 0;
      var anchorHeight = anchor ? anchor.outerHeight() : 0;
      var offset = context.__offset(anchor[0]);
      var x = offset.left;
      var y = offset.top;
      var left = fixed ? x - scrollLeft : x;
      var top = fixed ? y - scrollTop : y;

      var minTop = fixed ? 0 : scrollTop;
      var minLeft = fixed ? 0 : scrollLeft;
      var maxTop = minTop + clientHeight - dialogHeight;
      var maxLeft = minLeft + clientWidth - dialogWidth;

      var css = {};
      var align = context.align.split(ALIGNSPLIT);
      var className = context.className + '-';
      var reverse = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
      var name = { top: 'top', bottom: 'top', left: 'left', right: 'left' };

      var temp = [
        {
          top: top - dialogHeight,
          bottom: top + anchorHeight,
          left: left - dialogWidth,
          right: left + anchorWidth
        },
        {
          top: top,
          bottom: top - dialogHeight + anchorHeight,
          left: left,
          right: left - dialogWidth + anchorWidth
        }
      ];

      var center = {
        top: top + anchorHeight / 2 - dialogHeight / 2,
        left: left + anchorWidth / 2 - dialogWidth / 2
      };

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

      //添加anchor的css, 为了给css使用
      className += align.join('-') + ' ' + context.className + '-follow';

      // 保存对齐类名
      context.__align = className;

      // 添加样式
      dialog.addClass(className);

      // 设置样式属性
      css[name[align[0]]] = parseFloat(temp[0][align[0]]);
      css[name[align[1]]] = parseFloat(temp[1][align[1]]);

      // 设置样式
      dialog.css(css);
    },
    /**
     * 获取元素相对于页面的位置（包括iframe内的元素）
     * 暂时不支持两层以上的 iframe 套嵌
     * @private
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

      // {Element: Ifarme}
      var frameElement = defaultView.frameElement;

      ownerDocument = $(ownerDocument);

      var scrollLeft = ownerDocument.scrollLeft();
      var scrollTop = ownerDocument.scrollTop();
      var frameOffset = $(frameElement).offset();
      var frameLeft = frameOffset.left;
      var frameTop = frameOffset.top;

      return {
        top: offset.top + frameTop - scrollTop,
        left: offset.left + frameLeft - scrollLeft
      };
    }
  };

  return Dialog;

})));
