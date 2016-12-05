import $ from 'jquery';
import * as Utils from './utils';

// 公用遮罩
export var Backdrop = {
  // 遮罩分配
  alloc: [],
  // 获取焦点回调事件
  fallback: null,
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
  locker: $('<div tabindex="0"></div>').css({
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

    // 锁定焦点
    Backdrop.fallback = function() {
      anchor.focus();
    };

    Backdrop.node
      .on('focus', Backdrop.fallback)
      .addClass(className)
      .insertBefore(node);

    Backdrop.locker
      .on('focus', Backdrop.fallback)
      .insertAfter(node);
  },
  /**
   * 显示遮罩
   * @param {Dialog} anchor 定位弹窗实例
   */
  show: function(anchor) {
    if (Utils.indexOf(Backdrop.alloc, anchor) === -1) {
      Backdrop.attach(anchor);
      Backdrop.alloc.push(anchor);
    }
  },

  /**
   * 隐藏遮罩
   * @param {Dialog} anchor 定位弹窗实例
   */
  hide: function(anchor) {
    Backdrop.alloc = Utils.filter(Backdrop.alloc, function(item) {
      return anchor !== item;
    });

    var length = Backdrop.alloc.length;

    Backdrop.node.off('focus', Backdrop.fallback);
    Backdrop.locker.off('focus', Backdrop.fallback);

    if (length === 0) {
      Backdrop.node.remove();
      Backdrop.locker.remove();

      Backdrop.fallback = null;
    } else {
      anchor = Backdrop.alloc[length - 1];

      Backdrop.zIndex(anchor.zIndex);
      Backdrop.attach(anchor);
    }
  }
};
