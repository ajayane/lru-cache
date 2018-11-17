define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NEWER = Symbol('newer');
    var OLDER = Symbol('older');
    var Entry = (function () {
        function Entry(key, value) {
            this.key = key;
            this.value = value;
            this[NEWER] = undefined;
            this[OLDER] = undefined;
        }
        return Entry;
    }());
    var Map = (function () {
        function Map() {
            this._map = {};
        }
        Map.prototype.set = function (k, v) {
            this._map[k] = v;
        };
        Map.prototype.clear = function () {
            var _this = this;
            Object.keys(this._map).forEach(function (v, i) {
                delete _this._map[v];
            });
        };
        Map.prototype.get = function (k) {
            return this._map[k];
        };
        Object.defineProperty(Map.prototype, "size", {
            get: function () {
                return Object.keys(this._map).length;
            },
            enumerable: true,
            configurable: true
        });
        Map.prototype.delete = function (k) {
            delete this._map[k];
        };
        return Map;
    }());
    var LRUMap = (function () {
        function LRUMap(limit) {
            this.size = 0;
            this.limit = limit;
            this.oldest = this.newest = undefined;
            this._keymap = new Map();
        }
        LRUMap.prototype._markEntryAsUsed = function (entry) {
            if (entry === this.newest) {
                return;
            }
            if (entry[NEWER]) {
                if (entry === this.oldest) {
                    this.oldest = entry[NEWER];
                }
                entry[NEWER][OLDER] = entry[OLDER];
            }
            if (entry[OLDER]) {
                entry[OLDER][NEWER] = entry[NEWER];
            }
            entry[NEWER] = undefined;
            entry[OLDER] = this.newest;
            if (this.newest) {
                this.newest[NEWER] = entry;
            }
            this.newest = entry;
        };
        LRUMap.prototype.get = function (key) {
            var entry = this._keymap.get(key);
            if (!entry)
                return;
            this._markEntryAsUsed(entry);
            return entry.value;
        };
        ;
        LRUMap.prototype.set = function (key, value) {
            var entry = this._keymap.get(key);
            if (entry) {
                entry.value = value;
                this._markEntryAsUsed(entry);
                return this;
            }
            this._keymap.set(key, (entry = new Entry(key, value)));
            if (this.newest) {
                this.newest[NEWER] = entry;
                entry[OLDER] = this.newest;
            }
            else {
                this.oldest = entry;
            }
            this.newest = entry;
            ++this.size;
            if (this.size > this.limit) {
                this.shift();
            }
            return this;
        };
        ;
        LRUMap.prototype.shift = function () {
            var entry = this.oldest;
            if (entry) {
                if (this.oldest[NEWER]) {
                    this.oldest = this.oldest[NEWER];
                    this.oldest[OLDER] = undefined;
                }
                else {
                    this.oldest = undefined;
                    this.newest = undefined;
                }
                entry[NEWER] = entry[OLDER] = undefined;
                this._keymap.delete(entry.key);
                --this.size;
                return [entry.key, entry.value];
            }
        };
        return LRUMap;
    }());
    exports.LRUMap = LRUMap;
});
//# sourceMappingURL=LRUCache.js.map