/**
 * LRU缓存机制
 */

var listNode = function(key, val) {
    this.val = val;
    this.key = key;
    this.next = null;
    this.preview = this;
}

/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
    this.capacity = capacity;
    this.hasMap = {};
    this.head = null;
    this.last = null;
};

/** 
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function(key) {
    let node = this.hasMap[key];
    if (node) {
        this.sort(node);
    } else {
        return -1;
    }

    return node.val;
};

/** 
 * @param {number} key 
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function(key, value) {
    let { hasMap, head } = this,
    node = hasMap[key];

    if (node) {
        node.val = value;
        this.sort(node);
    } else {
        this.capacity--;
        node = new listNode(key, value);

        if (head === null) {
            this.head = node;
            this.last = node;
        } else {
            node.next = head;
            head.preview = node;
            this.head = node;

            if (this.capacity < 0) {
                delete this.hasMap[this.last.key];
                this.last = this.last.preview;
                this.last.next = null;
                this.capacity = 0;
            }
        }
        hasMap[key] = node;
    }
};

LRUCache.prototype.sort = function(node) {
    if (this.head === node) {
        return;
    }

    if (this.last === this.head) {
        return;
    }

    if (node === this.last) {
        this.last = node.preview;
        this.last.next = null;
    } else {
        node.preview.next = node.next;
        node.next.preview = node.preview;
    }
    node.next = this.head;
    node.preview = node;

    this.head.preview = node;
    this.head = node;
}
/** 
 * Your LRUCache object will be instantiated and called as such:
 * var obj = Object.create(LRUCache).createNew(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */