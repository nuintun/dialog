import * as Utils from './utils';

// 默认样式
var styles = document.documentElement.style;

// animationend 映射表
export var ANIMATIONEND_EVENTS = {
  animation: 'animationend',
  WebkitAnimation: 'webkitAnimationEnd',
  MozAnimation: 'mozAnimationEnd',
  OAnimation: 'oAnimationEnd',
  msAnimation: 'MSAnimationEnd',
  KhtmlAnimation: 'khtmlAnimationEnd'
};

// transition 映射表
export var TRANSITIONEND_EVENTS = {
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
export var ANIMATION = detector(ANIMATIONEND_EVENTS);

// transition
export var TRANSITION = detector(TRANSITIONEND_EVENTS);

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
  return Math.max.apply(null, Utils.map(durations, function(duration, i) {
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
  var styles = Utils.getComputedStyle(element);
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
export function whenEffectsEnd(node, callback) {
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
