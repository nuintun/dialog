import $ from 'jquery';
import * as Utils from './utils';

export var Mask = {
  alloc: [],
  node: $('<div class="ui-dialog-mask" tableindex="0"></div>'),
  /**
   * show
   * @param {any} anchor
   */
  show: function(anchor) {
    if (Utils.indexOf(Mask.alloc, anchor) === -1) {
      Mask.alloc.push(anchor);
      Mask.node.insertBefore(anchor);
    }
  },
  /**
   * hide
   * @param {any} anchor
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
