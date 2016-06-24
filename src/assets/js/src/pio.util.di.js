PIO.util.Di = function (map) {
    this._map = map || {};
};

PIO.util.Di.prototype.register = function (name, depArray, fn) {
    name = name.toLowerCase();
    this._map[name] = {
        depArray: depArray || [],
        fn: fn
    };
};

PIO.util.Di.prototype.registerCtor = function (name, depArray, ctor) {
    name = name.toLowerCase();
    this._map[name] = {
        depArray: depArray || [],
        ctor: ctor
    };
};

PIO.util.Di.prototype.construct = function(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
};

PIO.util.Di.prototype.get = function (name) {
    name = name.toLowerCase();
    var self = this;
    var obj = this._map[name];

    // If no object exists with that name, throw an error.
    if (!obj) {
        throw new Error("unable to load " + name + ", it never was registered");
    }

    // If the object has been compiled before, return that.
    if (obj.compiled) {
        return obj.compiled;
    }

    var deps = obj.depArray.reduce(function (r, j) {
        var dep = self.get(j);
        if (!dep) {
            throw new Error("unable to load " + j + " while seeking to load " + name);
        }
        r.push(dep);
        return r;
    }, []);

    if (obj.fn)  {
        obj.compiled = obj.fn.apply(obj.fn, deps);
    }
    if (obj.ctor) {
        obj.compiled = self.construct(obj.ctor, deps);
    }

    return obj.compiled;
};

// sequence of register + get to process object immediately
PIO.util.Di.prototype.registerCtorInit = function(name, depArray, fn){
    this.register(name, depArray, fn);
    this.get(name);
};

/// return a new instance of PIO.util.Di without affecting the old
PIO.util.Di.prototype.clone = function () {
    var newMap = {};
    var oldMap = this._map;
    for (var k in oldMap) {
        var val = _.cloneDeep(oldMap[k]); // need to do deep clone for unit tests as only approach to replace registered items without affecting others
        // removed compiled objects
        val.compiled = false;
        newMap[k] = val;
    }
    return new PIO.util.Di(newMap);
};


