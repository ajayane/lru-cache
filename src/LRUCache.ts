
const NEWER = Symbol('newer');
const OLDER = Symbol('older');
class Entry {
    public key;
    public value;
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this[NEWER] = undefined;
        this[OLDER] = undefined;
    }
}
class Map {
    _map: any;
    constructor() {
        this._map = {};
    }
    set(k: any, v: any) {
        this._map[k] = v;
    }
    clear() {
        Object.keys(this._map).forEach((v, i) => {
            delete this._map[v];
        })
    }
    get(k: any) {
        return this._map[k];
    }
    get size() {
        return Object.keys(this._map).length;
    }
    delete(k: any) {
        delete this._map[k];
    }
}
export class LRUMap<K, V> {
    public size;
    public limit;
    public oldest;
    public newest;
    public _keymap;
    constructor(limit: number) {
        this.size = 0;
        this.limit = limit;
        this.oldest = this.newest = undefined;
        this._keymap = new Map();
    }
    private _markEntryAsUsed(entry: Entry) {
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
    }
    get(key) {
        var entry = this._keymap.get(key);
        if (!entry) return; 
        this._markEntryAsUsed(entry);
        return entry.value;
    };
    set(key, value) {
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
        } else {
            this.oldest = entry;
        }
        this.newest = entry;
        ++this.size;
        if (this.size > this.limit) {
            this.shift();
        }
        return this;
    };
    shift() {
        var entry = this.oldest;
        if (entry) {
            if (this.oldest[NEWER]) {
                this.oldest = this.oldest[NEWER];
                this.oldest[OLDER] = undefined;
            } else {
                this.oldest = undefined;
                this.newest = undefined;
            }
            entry[NEWER] = entry[OLDER] = undefined;
            this._keymap.delete(entry.key);
            --this.size;
            return [entry.key, entry.value];
        }
    }
}