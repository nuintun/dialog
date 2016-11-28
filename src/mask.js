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
    width: '100%',
    height: '100%',
  }),
  /**
   * 显示遮罩
   * @param {HTMLElement} anchor 定位节点
   */
  show: function(anchor) {
    if (Utils.indexOf(Mask.alloc, anchor) === -1) {
      Mask.alloc.push(anchor);
      Mask.node.insertBefore(anchor);
    }
  },
  /**
   * 隐藏遮罩
   * @param {HTMLElement} anchor 定位节点
   */
  hide: function(anchor) {
    Mask.alloc = Utils.filter(Mask.alloc, function(element) {
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
