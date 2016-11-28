import $ from 'jquery';
import { Mask } from './mask';
import * as Utils from './utils';

var __window = $(window);
var __document = $(document);

export default function Dialog() {
  var context = this;

  context.destroyed = false;
  context.node = document.createElement('div');
  context.__dialog = $(context.node)
    .css({
      display: 'none',
      position: 'absolute',
      outline: 0
    })
    .attr('tabindex', '-1')
    .html(context.innerHTML)
    .appendTo(document.body);
}

// 当前叠加高度
Dialog.zIndex = 1024;
// 顶层浮层的实例
Dialog.current = null;

// 原型属性
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

    var dialog = context.__dialog;

    context.open = true;
    context.follow = anchor || context.follow;
    context.__activeElement = context.__getActive();

    // 初始化 show 方法
    if (!context.__ready) {
      dialog
        .addClass(context.className)
        .attr('role', context.modal ? 'modal-dialog' : 'dialog')
        .css('position', context.fixed ? 'fixed' : 'absolute');

      // 模态浮层的遮罩
      if (context.modal) {
        context.__ready = true;

        Mask.node.addClass(context.className + '-mask');
        dialog.addClass(context.className + '-modal');
        Mask.show(context.node);
      }

      if (dialog.html() !== context.innerHTML) {
        dialog.html(context.innerHTML);
      }
    }

    dialog
      .addClass(context.className + '-show')
      .show();

    context.reset().focus();
    context.__dispatchEvent('show');

    return context;
  },
  /**
   * 显示模态浮层。
   * 参数参见 show()
   */
  showModal: function() {
    var context = this;

    context.modal = true;

    return Utils.apply(context.show, context, arguments);
  },
  /**
   * 关闭浮层
   * @param result
   */
  close: function(result) {
    var context = this;

    if (!context.destroyed && context.open) {
      if (arguments.length >= 1) {
        context.returnValue = result;
      }

      context.__dialog
        .hide()
        .removeClass(this.className + '-show');

      Mask.hide(context.node);
      Mask.node.removeClass(context.className + '-mask');

      context.open = false;
      context.modal = false;

      // 恢复焦点，照顾键盘操作的用户
      context.blur();
      context.__dispatchEvent('close');
    }

    return context;
  },
  /**
   * 销毁浮层
   */
  remove: function() {
    var context = this;

    if (context.destroyed) {
      return context;
    }

    context.__dispatchEvent('beforeremove');

    if (Dialog.current === context) {
      Dialog.current = null;
    }

    if (context.modal && context.open) {
      Mask.hide(context.node);
      Mask.node.removeClass(context.className + '-mask');
    }

    // 从 DOM 中移除节点
    context.__dialog.remove();
    context.__dispatchEvent('remove');

    for (var i in context) {
      delete context[i];
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
    var dialog = context.__dialog;
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

    // 设置叠加高度
    dialog.css('zIndex', index);

    Dialog.current = context;

    dialog.addClass(context.className + '-focus');

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
    context.__dialog.removeClass(context.className + '-focus');
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
      .__getEventListener(type)
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
    var listeners = context.__getEventListener(type);

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
  __getEventListener: function(type) {
    var context = this;
    var listener = context.__listener;

    if (!listener) {
      listener = context.__listener = {};
    }

    if (!listener[type]) {
      listener[type] = [];
    }

    return listener[type];
  },
  // 派发事件
  __dispatchEvent: function(type) {
    var context = this;
    var listeners = context.__getEventListener(type);

    if (context['on' + type]) {
      context['on' + type].call(context);
    }

    for (var i = 0; i < listeners.length; i++) {
      listeners[i].call(context);
    }
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
    var dialog = context.__dialog;
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
    var dialog = this.__dialog;

    if (context.__followSkin) {
      dialog.removeClass(context.__followSkin);
    }

    anchor = anchor.parentNode && $(anchor);

    // 隐藏元素不可用
    if (anchor) {
      var o = anchor.offset();

      if (o.left * o.top < 0) {
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
    var offset = this.__offset(anchor[0]);
    var x = offset.left;
    var y = offset.top;
    var left = fixed ? x - scrollLeft : x;
    var top = fixed ? y - scrollTop : y;

    var minLeft = fixed ? 0 : scrollLeft;
    var minTop = fixed ? 0 : scrollTop;
    var maxLeft = minLeft + clientWidth - width;
    var maxTop = minTop + clientHeight - height;

    var css = {};
    var align = this.align.split(' ');
    var className = this.className + '-';
    var reverse = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    var name = { top: 'top', bottom: 'top', left: 'left', right: 'left' };

    var temp = [
      {
        top: top - height,
        bottom: top + height,
        left: left - width,
        right: left + width
      },
      {
        top: top,
        bottom: top - height + height,
        left: left,
        right: left - width + width
      }
    ];

    var center = {
      left: left + width / 2 - width / 2,
      top: top + height / 2 - height / 2
    };

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
    className += align.join('-') + ' ' + this.className + '-follow';

    context.__followSkin = className;

    if (anchor.length) {
      dialog.addClass(className);
    }

    css[name[align[0]]] = parseInt(temp[0][align[0]]);
    css[name[align[1]]] = parseInt(temp[1][align[1]]);

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
