import $ from 'jquery';
import * as Utils from './utils';

export var Mask = {
  reference: [],
  node: $('<div class="ui-dialog-mask" tableindex="0"></div>'),
  show: function(target) {
    if (Utils.indexOf(Mask.reference, target) === -1) {
      Mask.reference.push(target);
      Mask.node.insertBefore(target);
    }
  },
  hide: function(target) {
    Mask.reference = Utils.filter(Mask.reference, function(element) {
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
