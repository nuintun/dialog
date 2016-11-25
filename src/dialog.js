import $ from 'jquery';
import { Mask } from './mask';
import { Cache } from './cache';
import * as utils from './utils';

export default function Dialog() {
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
