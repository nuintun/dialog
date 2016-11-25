export var Cache = {
  items: {},
  add: function(key, value) {
    Cache.items[key] = value;
  },
  remove: function(key) {
    delete Cache.items[key];
  },
  has: function(key) {
    return Cache.items.hasOwnProperty(key);
  },
  get: function(key) {
    return Cache.items[key];
  }
};
