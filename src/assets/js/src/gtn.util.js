// need to know if this is IE9 for a few items
GTN.env = {};
GTN.env.isIE9 = window.navigator.userAgent.toUpperCase().indexOf("MSIE 9") !== -1;
GTN.env.isIE10 = !GTN.env.isIE9 && window.navigator.userAgent.toUpperCase().indexOf("MSIE 10") !== -1;

// begin the actual util
String.prototype.format = function() {
    var result = this;
    for (var ix = 0; ix < arguments.length; ix++) {
        result = result.replace("{" + (ix + 1) + "}", arguments[ix].toString());
    };
    return result;
};

GTN.util.isUndefined = function(v) {
    return typeof v === "undefined";
};

GTN.util.or = function(v1, v2, v3) {
    var _isUndefined = GTN.util.isUndefined;
    if (!_isUndefined(v1))
        return v1;
    if (!_isUndefined(v2))
        return v2;
    if (!_isUndefined(v3))
        return v3;
}
GTN.util.uuid = (function() {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    return function(len, radix) {
        var chars = CHARS,
            uuid = [];
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (var i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    };
})();


/**
 *   A mediator for events in the widget
 *
 *   This will take the place of ko.init
 *   and will pass recipe/state data to any interested parties
 *   on app.init
 *
 *   http://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/
 **/

GTN.util.Mediator = function() {};


GTN.util.asPubSub = function() {
    var self = this;
    this._a = {};
    this._all = [];
    this.subAll = function(fn) {
        self._all.push(fn);
    };
    this.sub = function(key, fn, once) {
        var g = [],
            a = self._a,
            fou = false;
        if (a.hasOwnProperty(key)) {
            g = a[key];
            fou = true;
        }
        if (!fou)
            a[key] = g;
        // fn = function
        // o = should i only run once?
        // r = have i been run before?
        g.push({
            fn: fn,
            o: once,
            r: 0
        });
    };
    this.pub = function(key, val) {
        if (self._all == null) {
            console.log('[error] access to disposed pubsub object do not allowed');
            return; // do not allow for disposed events
        }
        var a = self._a,
            all = self._all,
            allLen = self._all.length,
            t = {};
        if (a.hasOwnProperty(key)) {
            for (var s = 0; s < a[key].length; s += 1) {
                // if its not a "run only once function"
                // or it is a "run only once function" and its never been ran yet
                // then run this shhhhhhhh
                if (!t.o || (t.o && !t.r)) {
                    t = a[key][s];
                    t.fn.call(t.fn, val);
                    t.r = true;
                }
            }
        }
        //
        // call funcs in the _all array
        for (var ai = 0; ai < allLen; ai += 1) {
            t = all[ai];
            t.call(t, key, val);
        }

    };

    this.unsub = function(key, fn){
        var subArray = self._a[key];
        var index = _.findIndex(subArray, function(item){
            return item.fn == fn;
        });
        if(index >= 0)
            subArray.splice(index, 1);
    };

    this.subExists = function(key){
        return self._a.hasOwnProperty(key)
            || self._all.hasOwnProperty(key);
    };

    this.dispose = function() {
        self._a = null;
        self._all = null;
    };
};


//attache the pubsub to the mediator
GTN.util.Mediator = GTN.util.asPubSub;

GTN.util.randomizeArray = function(srcArray, outputLength) {
    var getRandomIndexes = function(len) {
            var res = [],
                source = [];

            //generate a set of indexes, complete (enumerator.range style)
            for (var i = 0; i < len; i++)
                source.push(i);

            //randomize the set
            while (source.length > 0) {
                //get random number within indexes
                var randIndex = Math.floor(Math.random() * source.length);
                //add item to random indexes
                res.push(source[randIndex]);
                //remove item from source
                source.splice(randIndex, 1);
            }

            return res;
        },
        res = [],
        rands = [];

    while (res.length < outputLength) {
        //get some random indexes if we dont have any
        if (rands.length === 0)
            rands = getRandomIndexes(srcArray.length);

        //get a random index
        //this also removes an item from rands
        var randIndex = rands.pop();
        res.push(srcArray[randIndex]);
    }
    return res;
};

GTN.util.loadImage = function(url, cb) {

    var i = new Image();
    i.setAttribute('crossOrigin', 'anonymous');

    i.onload = function() {
        if (cb) cb(i);
    };

    if (url && url.indexOf("https://az412349.vo.msecnd.net") > -1) {
        url = url.split('?')[0]+'?a=42'
    }
    i.src = url;

};

GTN.util.urlFix = function(url) {
    if (!url) return url;
    url = url.replace("http://imgsrv.print.io/images", "https://az412349.vo.msecnd.net");
    url = url.replace("http://app-imgs.print.io", "https://az412349.vo.msecnd.net");
    url = url.replace("http://cdn.print.io", "https://az412349.vo.msecnd.net");
    return url;
};

GTN.util.getImgSrvUrl = function(url) {
    if (!url) return url;
    url = url.replace("http://imgsrv.print.io/images", "http://app-imgs.print.io");
    url = url.replace("http://cdn.print.io", "http://app-imgs.print.io");
    url = url.replace("https://az412349.vo.msecnd.net", "http://app-imgs.print.io");
    return url;
};

GTN.util.once = function(fn) {
    var i = 0;
    return function() {
        if (i === 0) fn.apply(fn, arguments);
        i++;
    }
};

function ni(data, prop, offset) {
    var value = parseInt(data[prop](), 10);
    if (value + offset >= 0) {
        data[prop](value + offset);
    }
}

GTN.util.numericInputLess = function(data, prop) {
    return function() {
        ni(data, prop, -1);
    };
};

GTN.util.numericInputMore = function(data, prop) {
    return function() {
        ni(data, prop, 1);
    };
};

GTN.util.multiplyMatrices = function(m1, m2) {
    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
};

// rotates a vector clockwise
GTN.util.rotateVector = function(rotation, x, y) {
    var rot = rotation * -1;
    var multiply = GTN.util.multiplyMatrices;
    if (rot === 0)
        return {
            x: x,
            y: y
        };
    var radconst = Math.PI / 180;
    var angle = radconst * rot;
    // MATH
    var matrix = multiply(

        [
            [Math.cos(angle), -1 * Math.sin(angle)],
            [Math.sin(angle), Math.cos(angle)]
        ], [
            [x],
            [y]
        ]
    );
    return {
        x: matrix[0][0],
        y: matrix[1][0]
    };
};


// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


GTN.util.Scaler = function(sourceValue, destinationValue) {
    var dx = 1;
    if (sourceValue && destinationValue)
        dx = sourceValue / destinationValue;
    this.scaleToDest = function(v) {
        return v / dx;
    };
    this.scaleToSource = function(v) {
        return v * dx;
    };
    this.serialize = function() {
        return dx;
    }
    this.fromDx = function(v) {
        dx = parseFloat(v);
        return this;
    }
};


/*
 *   GTN.util.dom
 *
 *   DOM methods
 */
GTN.util.dom = {};
// checks the relationship of two DOM nodes
//
// 'bisp' means "B is parent of A"
// 'aisp' means "A is parent of B"
// undefined for others
GTN.util.dom.getElRelationship = function(elA, elB) {
    var res = elA.compareDocumentPosition(elB);
    if (res >= 8 && res < 16) {
        return 'bisp;'
    } else if (res >= 16 && res < 32) {
        return 'aisp'
    }
};
GTN.util.dom.getRotationFromMatrix = function(matrix) {
    var values = matrix.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    return angle;
};
GTN.util.dom.getRotationAttrs = function() {
    return ["transform",
        "-webkit-transform",
        "-moz-transform",
        "-ms-transform",
        "msTransform",
        "-o-transform"
    ];
};
GTN.util.dom.getRotation = function(el) {
    var d = GTN.util.dom;
    var a = d.getRotationAttrs();
    var _getRotationFromMatrix = d.getRotationFromMatrix;
    var res = 0;
    var transforms = d.getTransforms(el);
    if (!transforms)
        return 0;
    var s = transforms.rotate;
    if (!s)
        return 0;
    if (s.indexOf("matrix") == -1) {
        res = parseFloat(s.replace(/[^0-9\-]/g, ''));
    } else {
        res = _getRotationFromMatrix(s);
    }
    return res;
};
GTN.util.dom.setRotation = function(el, val) {
    var a = GTN.util.dom.getRotationAttrs();
    a.forEach(function(i) {
        try {
            el.style[i] = "rotate(" + val.toString() + "deg)";
        } catch (err) {

        }
    });
};
GTN.util.dom._parseTransform = function(str) {
    var b = '(';
    var start = str.indexOf(b);
    var end = str.indexOf(')');
    if (start !== -1) {
        if (end === -1)
            end = str.length;
        return [str.substring(0, start),
            str.substring(start + 1, end)
        ];
    }
};
GTN.util.dom.getTransforms = function(el) {
    var d = GTN.util.dom;
    var a = d.getRotationAttrs();
    var parser = d._parseTransform;
    var res;
    a.some(function(i) {
        try {
            var val = el.style[i];
            //console.log(i,val)
            if (val && val !== " ") {
                var parts = val.split(') ');
                var temp;
                res = {};
                if (parts && parts.length) {
                    parts.forEach(function(p) {
                        var parsed = parser(p);
                        if (parsed && parsed.length)
                            res[parsed[0]] = parsed[1];
                    });
                    return true;
                } else {
                    temp = parser(val);
                    if (temp && temp.length) {
                        res[temp[0]] = temp[1];
                        return true;
                    }
                }
            }
        } catch (err) {

        }
        return false;
    });
    return res;
};

// need a fn for getting an element dataset
// b/c IE 9 + 10
//
// thanks Photobucket
GTN.util.dom.getDataVal = function(el, propName) {
    if (el.dataset) {
        return el.dataset[propName];
    } else {
        return el.getAttribute("data-" + propName);
    }

}
GTN.util.dom.setDataVal = function(el, propName, value) {
    if (el.dataset) {
        return el.dataset[propName] = value;
    } else {
        return el.setAttribute("data-" + propName, value);
    }
}

GTN.util.injectCss = function(url) {
    var d = document;
    var link = d.createElement("link");
    link.href = url;
    link.type = "text/css";
    link.rel = "stylesheet";
    d.getElementsByTagName("head")[0].appendChild(link);
};


// polyfill to get dataset vals to work
// in IE10 and below it doesnt play nice with dash names
if (window.jQuery) {
    window.jQuery.fn.data2 = function(name) {
        var $t = $(this);
        var test1 = $t.data(name);
        if (test1) {
            return test1;
        }
        // here is the IE specific part
        return $t.attr("data-" + jQuery.camelCase(name));
    };
}

// handle the sending of HTML5 postMessage
GTN.util.postMessage = function(data, origin) {
    var w = window;
    data = "~pio~" + JSON.stringify(data);

    // do native html5 postMessage
    (w.parent || w.opener || w.top).postMessage(data, origin);
};

GTN.util.getCdnUploadUrl = function(bucket, filename, maxWidth, maxHeight) {
    return "https://az795974.vo.msecnd.net/cdn/" + bucket + "/" + filename + "?mode=max&w=" + maxWidth + "&h=" + maxHeight;
};

GTN.util.copyArray = function(a){
  var f = [];
  a.forEach(function(i){f.push(i);});
  return a;
};

GTN.util.asserts = {};
GTN.util.asserts.notNullOrUndefined = function(objName, obj){
    var test = obj !== null && !GTN.util.isUndefined(obj);
    console.assert(test, objName + " must not be null or undefined");
    return !test;
};

GTN.util.asserts.equals = function(objName, obj, expected) {
  var test = obj === expected;
  console.assert(test, objName + " must be equal to " + expected);
  return !test;
};

GTN.util.asserts.moreThan = function(objName, obj, expected) {
  var test = obj !== null && obj > expected;
  console.assert(test, objName + " must be more than " + expected);
  return !test;
};



//// handle the receiving of HTML5 postMessage
//GTN.util._postMessageHandlers = [];

//// function a parent can call to pub in data
//GTN.util._cm = function (data) {

//    // its in a setTimeout so that it mirrors
//    // the async of native html5 postMessage
//    setTimeout(function () {
//        GTN.util._postMessageHandlers.forEach(function (fn) {
//            try {
//                // dont let one failed pub kill them all
//                fn(data);
//            } catch (e) {

//            }
//        });
//    }, 0);
//}
//GTN.util.addPostMessageHandler = function (fn) {
//    var w = window;
//    if (GTN.env.isIE9) {

//        // if we're IE9, then call the function directly
//        // its in a setTimeout so that it mirrors
//        // the async of native html5 postMessage
//        setTimeout(function () {
//            w.opener.GTN._cm(data);
//        }, 0);
//    } else {

//        // do native html5 postMessage
//        w.addEventListener("message", fn);
//    }
//};
