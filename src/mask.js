import $ from 'jquery';
import * as Utils from './utils';

// 公用遮罩
export var Mask = {
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
    zIndex: 'auto',
    overflow: 'hidden',
    userSelect: 'none'
  }),
  // 锁定 tab 焦点层
  backdrop: $('<div tableindex="0"></div>').css({
    position: 'fixed',
    top: -1,
    left: -1,
    width: 0,
    height: 0,
    opacity: 0
  }),
  /**
   * 显示遮罩
   * @param {Dialog} anchor 定位弹窗实例
   */
  show: function(anchor) {
    if (Utils.indexOf(Mask.alloc, anchor) === -1) {
      Mask.alloc.push(anchor);

      anchor = anchor.node;

      Mask.node.css('z-index', 'auto').insertBefore(anchor);
      Mask.backdrop.insertAfter(anchor);
    }
  },
  /**
   * 隐藏遮罩
   * @param {Dialog} anchor 定位弹窗实例
   */
  hide: function(anchor) {
    Mask.alloc = Utils.filter(Mask.alloc, function(item) {
      return anchor !== item;
    });

    var length = Mask.alloc.length;

    if (length === 0) {
      Mask.node.remove();
      Mask.backdrop.remove();
    } else {
      anchor = Mask.alloc[length - 1].node;

      Mask.node.insertBefore(anchor);
      Mask.backdrop.insertAfter(anchor);
    }
  }
};
