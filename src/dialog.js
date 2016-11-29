import $ from 'jquery';
import { Mask } from './mask';
import * as Utils from './utils';

var ALIGNSPLIT = /\s+/;
var __window = $(window);
var __document = $(document);

export default function Dialog() {
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
  /**
   * 显示浮层（私有）
   * @param {HTMLElement, Event}  指定位置（可选）
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
   * @param {HTMLElement, Event}  指定位置（可选）
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
   * @param {HTMLElement, Event}  指定位置（可选）
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
   * @param result
   */
  close: function(result) {
    var context = this;

    // 未销毁且打开状态才做操作
    if (!context.destroyed && context.open) {
      // 关闭前
      if (context.__dispatchEvent('beforeclose') !== false) {
        // 关闭
        // 设置返回值
        if (result !== undefined) {
          context.returnValue = result;
        }

        var node = context.node;
        var dialog = context.__node;
        // 隐藏操作
        var next = function() {
          dialog
            .hide()
            .removeClass(context.className + '-close');

          // 切换打开状态
          context.open = false;

          // 恢复焦点，照顾键盘操作的用户
          context.blur();
          // 关闭事件
          context.__dispatchEvent('close');
        }

        // 切换弹窗样式
        dialog
          .removeClass(context.className + '-show')
          .addClass(context.className + '-close');

        if (Utils.animation || Utils.transition) {
          var events;
          var count = 0;
          var style = Utils.getComputedStyle(node);

          // 是否有 animation 动画
          if (Utils.animation &&
            style.getPropertyValue(Utils.animation.name + '-name') !== 'none' &&
            parseFloat(style.getPropertyValue(Utils.animation.name + '-duration')) > 0) {
            count++;
            events = Utils.animation.event;
          }

          // 是否有 transition 动画
          if (Utils.transition &&
            style.getPropertyValue(Utils.transition.name + '-property') !== 'none' &&
            parseFloat(style.getPropertyValue(Utils.transition.name + '-duration')) > 0) {
            count++;
            events += (events ? ' ' : '') + Utils.transition.event;
          }

          // 有动画做事件监听
          if (count) {
            var pending = function() {
              if (!--count) {
                next();

                // 解除事件绑定
                dialog.off(events, pending);
              }
            };

            // 绑定动画结束事件
            dialog.on(events, pending);
          } else {
            next();
          }
        } else {
          next();
        }

        // 隐藏遮罩
        if (context.modal) {
          Mask.hide(context.node);
        }
      }
    }

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
    var node = context.node;
    var current = Dialog.current;
    var dialog = context.__node;
    var index = context.zIndex = Dialog.zIndex++;

    if (current && current !== this) {
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
  // 派发事件
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
    try { // try: ie8~9, iframe #26
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
   * @param    {HTMLElement, Event}  anchor
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
    Utils.forEach(align, function(value, i) {
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
