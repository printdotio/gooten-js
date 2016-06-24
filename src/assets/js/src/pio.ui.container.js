PIO.ui.Container = function (ko, $,util, Positioning, Perspective, ElementUpdater) {
    var loadImage = util.loadImage;
    var Scaler = util.Scaler;
    var dutil = util.dom;
    var Mediator = util.Mediator;
    var _getRotation = dutil.getRotation;
    var _setRotation = dutil.setRotation;
    var _getElRelationship = dutil.getElRelationship;
    var _getDataVal = dutil.getDataVal;
    var _setDataVal = dutil.setDataVal;


    var _map = new function(){
        var self = this;
        var _data = {};
        var _keys = [];
        this.add = function(id,data){
            _data[id]=data;
            _keys.push(id);
        };
        this.get = function(id){
            return _data[id];
        };
        this.clean = function(){
            var newData = {};
            _keys.forEach(function(key){
                if(document.getElementById(key)){
                    newData[key] = _data[key];
                }
            });
            _data = newData;
        }
    };


    // helper funcs
    var _identity = function(v){ return v; };
    var _doCallback = function(cb){
        return function(){
            if(cb)
                cb.apply(cb,arguments);
        }
    };
    var _doCallbacks = function(cbs){
        return function(){
            if(cbs && cbs.length){
                cbs.forEach(function(fn){
                    if(fn)
                        fn();
                });
            }
        }
    };
    var _px = function (v) { return v.toString() + "px"; };
    var _pf = function (v) {
        var resultFloat = parseFloat(v);
        return isNaN(resultFloat) && !_.isEmpty(v)? v : resultFloat;
    };
    var _isArray = function (value){
        return Object.prototype.toString.call(value) === '[object Array]';
    };
    var _isUndefined = util.isUndefined;

    var _usesScaleFn = function(data){
        return (data && (data.centerFit || data.maxFit));
    };

    // get a random id (used for DOM els)
    var _randId = function () {
        var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        var uniqid = randLetter + util.uuid().replace(/\-/g,'');

        return uniqid;
    };



    //
    // a function that calls a function after a specified counter
    //
    var _getCountdownFn = function (counter, cb, args) {
        return function () {
            --counter;
            if (counter === 0) {
                if (cb) {
                    if(args && args.length){
                        return cb.apply(cb,args);
                    }
                    return cb.apply(cb,arguments);
                }
            }
        };
    };


    // events
    //
    // 1. click + dbl
    // 2. drag and drop based stuff
    //      - resize ( min / max )
    //      - move ( boundaries )
    //      - drag out
    //      - allow drag in
    //
    // events should notify interested parties


    var _preProcess = function(data, style, el, containerEl, container){
        var perspective;

        if(data.parent && data.parent.perspective) {
            perspective = data.parent.perspective;
        }

        // values that represent what we would like
        // the el to look like, sim to DOMPerceived
        var perceived = data.perceived;

        // add in ID if el needs one
        if (!data.id) {
            data.id = _randId();
        }
        el.id = data.id;

        // how to scale the sizing/positioning of the EL
        var scaleFn = _identity;
        if(data.useScale && !_usesScaleFn(data)) {
            var scaleToEl = containerEl;
            if(data.useScale!==true){
                if(data.useScale==="parent"){
                    scaleToEl = data.parent.el;
                    if(!_getDataVal(scaleToEl, "scaleDx")){
                        scaleToEl = scaleToEl.parentElement;
                    }
                } else {
                    scaleToEl = document.getElementById(data.useScale);
                }
            }
            // scaleToEl - scale via another elements scaling
            if(!scaleToEl)
                throw new Error("unable to useScale-- missing element");

            // scaleDx - scale via element data-scaleDx val
            if(!_getDataVal(scaleToEl, "scaleDx"))
                if (!scaleVal)
                    throw new Error("unable to useScale-- element missing scaleDx");

            scaleFn = new Scaler().fromDx(_getDataVal( scaleToEl, "scaleDx")).scaleToDest;
        }

        // deal with "perceiveds"
        if(perceived){
            // perceiveds are implemented via hijacking/transforming to actuals
            data.actual = data.actual || {};

            // if we want to set the parent to build
            // the perception off of
            if(perceived.perspective){
                perspective = container.getPerspective(perceived.perspective);
            }
            // the only time perspective would not be here
            // is if this is the first child of the containerEl
            if(!perspective) {
                if(!_isUndefined( perceived.rotation)) {
                    var parentRotation = _getRotation(containerEl) || 0;
                    data.actual.rotation = _pf(perceived.rotation) - _pf(parentRotation);
                }
            } else {
                if(!_isUndefined(perceived.rotation)) {
                    var parentRotation = perspective
                        .getTransformer()
                        .getChildRotation();
                    data.actual.rotation = _pf(perceived.rotation) - _pf(parentRotation);
                }
            }


        }

        // set default styling
        if (data.actual) {
            style.top = _px(scaleFn(data.actual.top || 0));
            style.left = _px(scaleFn(data.actual.left || 0));
            style.rotation = _setRotation(el, data.actual.rotation || 0);
            if (data.actual.width)
                style.width = _px(scaleFn(data.actual.width));
            if (data.actual.height)
                style.height = _px(scaleFn(data.actual.height));
        } else {
            style.top = _px(0);
            style.left = _px(0);
        }

        if(data.style) {
            for(key in data.style){
                style[key] = data.style[key];
            }
        }

        if (data.zIndex)
            style.zIndex = data.zIndex;

        // mix in element classes
        if (data.attrs) {
            if (data.attrs.contentEditable){
                _setDataVal(el, 'contenteditable', "true");

            }
            if (data.attrs.classes) {
                data.attrs.classes.forEach(function (cl) {
                    el.className == "" ? el.className = cl : el.className += " " + cl;
                });
            }

            if(data.attrs.draggable){
                el.draggable=true;
            }

            if(data.attrs.data){
                for(key in data.attrs.data){
                    _setDataVal(el, key, data.attrs.data[key]);
                }
                var pts = data.attrs.data.fontPts;
                if(pts){
                    var fpts = parseFloat(pts);

                    // http://www.imagemagick.org/Magick++/TypeMetric.html
                    // size_points = (size_pixels * 72)/resolution
                    //var px = (fpts * 300)/72;
                    //var px = fpts * 4.3;
                    var fontSize = scaleFn(fpts);
                    if (fontSize < 12) {
                        el.className += " js-min-font " + "js-min-real-font-" + fontSize;
                    }

                    style.fontSize = fontSize + "px";
                }
            }
        }

        if(data.innerHtml) {
            el.innerHTML = data.innerHtml;
        }
    };


    var ctor = function (containerEl) {
        var self = this;
        this._containerEl = containerEl;
        this._getChildEl = function (id) {
            if (id) {
                var mapped = _map.get(id);
                if(mapped && mapped.el){
                    return mapped.el;
                }
                //console.log('no map',id)
                var docd = document.getElementById(id);
                //console.log('docd',id,docd);
                return docd;
            }
            return self._containerEl.children[0];
        };

        this._getFnData = function(id){
            var d = _map.get(id);
            return {
                src:self,
                data:d,
                el:d.el,
                getDataById: function(id){
                    return _map.get(id);
                }
            };
        };

        this._postProcess = function(data, el, ctx, cb){
            var containerEl = ctx.containerEl;
            //console.log('ctx is',ctx)
            // vals for callback functionality
            var attachFn;
            var fns = data.fns;
            var toDos = [];

            // rules/constraints that outline el usage
            var rules = data.rules;

            // perspective of parent to child et reverse
            var perspective;

            if(data.parent && data.parent.perspective){
                perspective = data.parent.perspective;
            }

            // set up contraints
            if(rules && rules.mustFill) {
                _setDataVal( el, "mustFill", containerEl.id);
            }

            // fill out the data obj w/ more context/data/func
            //  and add to global map
            data.el = el;
            data.container = self;
            data.childData = [];
            data.mediator = new Mediator();
            data.getUpdater = function() {
                return new ElementUpdater(self,data,data.el)
            };
            data.getPosition = function(){
                return self.getChildPositioning(el.id);
            };

            _map.add(el.id, data);

            // attach special fns for subscribing to el events
            // this gets called last
            if(fns) {
                if(fns.onRender) {
                    toDos.push(function(){
                        fns.onRender(self._getFnData(el.id));
                    });
                }

                if(toDos.length) {
                    toDos.push(_doCallback(cb));
                    attachFn = _doCallbacks(toDos);
                }
            }
            if(!attachFn)
                attachFn = _doCallback(cb);

            // add in the "perspective"
            // ie how an element is perceived
            // with parent context

            if(perspective){
                //console.log('pre parent', perspective._getStack().length);
                // make a copy of parent's perspective
                data.perspective = perspective.clone();
                // "unshift in" this perspective
                data.perspective.unshift(self.getChildPositioning(el.id));
                //console.log('post parent', data.perspective);
            } else {
               // console.log('container is',containerEl)
                data.perspective = self.getPerspective({
                    containerEl:containerEl,
                    childEl: el,
                });
            }

            //console.log('ending')
            // spawn out children containers
            // or just callback
            if (data.children && data.children.length) {
                // make a function that can callback after all children completed
                var finalCb = _getCountdownFn(data.children.length, attachFn,[data, _map]);

                return data.children.forEach(function (ch) {
                    if(ch.div)
                        ch.div.parent = data;
                    if(ch.img)
                        ch.img.parent = data;
                    data.childData.push(ch);
                    var Container = PIO.util.di.get("PIO.ui.Container");
                    new Container(el)
                        .addChild({containerEl: el}, ch, finalCb);
                });
            } else {
                attachFn(data, _map);
            }
        };

        this.getPerspective = function(opts) {
            opts = opts || {};
            var containerEl = opts.containerEl || self._containerEl;
            var childEl = opts.childEl || self._getChildEl();
            var parent, child, positioning, perspective;

            var relationshipCheck = _getElRelationship(containerEl,childEl);
            if(!relationshipCheck || relationshipCheck !== 'aisp') {
                throw new Error('no parent/child relationship to check');
            }

            // start from the bottom, work up
            // (not a Drake reference)
            child = childEl;
            perspective = new Perspective();
            //console.log('pers con',containerEl)
            //console.log('pers child',child.parentElement)
            while(parent !== containerEl) {
                parent = child.parentElement;
                positioning = new ctor.prototype._getPositioning(_map.get(child.id).el);
                perspective.push(positioning);
                child = parent;
            }

            return perspective;
        };

        /// containerEl is DOM el
        /// child is {
        ///     img: {
        ///         url: '',
        ///         actual: { top:0, left:0, width:0, height:0, rotation:0 },
        ///         centerFit: false,
        ///         maxFit: false
        ///     },
        ///     div: {
        ///         fillSpace:false,
        ///         actual: { top:0, left:0, width:0, height:0, rotation:0 },
        ///         centerFit: false,
        ///         maxFit: false
        ///     }
        /// }
        this.addChild = function (ctx, child, finalCb) {
            var preExisting;
            var containerEl;
            var fragment;
            var cb;
            var originalParentEl;
            var originalHeight;
            var originalWidth;

            if(ctx.containerEl){
                containerEl = ctx.containerEl;
                cb = finalCb;
            } else {
                // this doesnt put back in original place
                // #ohwell
                originalWidth = ctx.clientWidth;
                originalHeight = ctx.clientHeight;
                //originalParentEl = ctx.parentNode;
                if(originalParentEl) {
                    containerEl = originalParentEl.removeChild(ctx);
                } else {
                    containerEl = ctx;
                }
                containerEl.innerHTML = "";
                if(!containerEl.clientWidth && !containerEl.style.width){
                    containerEl.style.width = _px(originalWidth);
                }
                if(!containerEl.clientHeight && !containerEl.style.height){
                    containerEl.style.height = _px(originalHeight);
                }
                ctx = {
                    containerEl: containerEl,
                };

                cb = function() {
                    //console.log("PIO.ui.container: final cb",containerEl);
                    var args = [];

                    if(originalParentEl){
                        originalParentEl.appendChild(containerEl);
                    }
                    if(finalCb){
                        for (var i = 0; i < arguments.length; i++) {
                            args.push(arguments[i]);
                        }
                        // add in the final container
                        args.push(containerEl);
                        finalCb.apply(finalCb,args);
                    }
                };
            }
            self._containerEl = containerEl;
            containerEl.style.overflow = "hidden";

            // if( (child.div && !child.div.parent)
            //     || (child.img && !child.img.parent)
            //     ){
            //     containerEl.style.position = "relative";
            // }


            // what if its chilren instead of child
            if (_isArray(child)) {
                var childrenLength = child.length;
                var childrenCallback = _getCountdownFn(childrenLength, cb);
                child.forEach(function (subChild) {
                    //console.log('adding in subchild', subChild);
                    var Container = PIO.util.di.get("PIO.ui.Container");
                    new Container().addChild(ctx, subChild, childrenCallback);
                });
                return;
            }

            // if the child is an image
            if (child.img) {
                if(child.id){
                    preExisting = document.getElementById(child.id);
                    if(preExisting){

                    }
                }
                var $container = $(containerEl);
                // show loading indicator while image loading
                var loader = $('<div class="ld-wrap ld-wrap-edit"> \
                                   <div class="ld-img" /> \
                                   <div class="ld-edit-message"> \
                                    Fetching full size images \
                                   </div> \
                                </div>');
                $container.append(loader);
                return loadImage(child.img.url, function (img) {
                    loader.remove();
                    _setDataVal(img, "owidth", img.width);
                    _setDataVal(img, "oheight", img.height);
                    _preProcess(child.img,img.style,img,containerEl,self);

                    // add the img in
                    img.style.position = "absolute";

                    // an image gets embedded before positioning
                    containerEl.appendChild(img);

                    // initial map add, gets overwritten w/ more data soon
                    _map.add(img.id,{el:img});

                    if (child.img.maxFit) {
                        self.maxFitChild(child.img.id);
                    } else if (child.img.centerFit) {
                        self.centerFitChild(child.img.id);
                    }

                    return self._postProcess(child.img,img,ctx,cb);
                });
            } else if (child.div) {
                var el = document.createElement("div");
                var style = el.style;
                var parentPositioning = self.getContainerPositioning(true);
                _preProcess(child.div,style, el,containerEl,self);

                if(_.isEmpty(style.position)) {
                    //always absolute
                    style.position = "absolute";
                }
                containerEl.appendChild(el);

                // initial map add, gets overwritten w/ more data soon
                _map.add(el.id,{el:el});

                if (child.div.fillSpace) {
                    style.top="0px";
                    style.left="0px";
                    style.height = !_isUndefined( parentPositioning.height) ? _px(parentPositioning.height) : "100%";
                    style.width = !_isUndefined( parentPositioning.width) ? _px(parentPositioning.width) : "100%";
                }  else if(child.div.maxTableCell){
                    //
                    // note
                    //
                    // this does not work at all
                    // supposed to support vertical positioning and stuff
                    // but it doesnt at all
                    // you have been warned

                    // "absolute" helps the overflow/text cutoff work
                    style.position="absolute";
                    style.display="table-cell";
                    style.top="0px";
                    style.left="0px";
                    //style.height = "100%";
                    style.width = "100%";
                    child.div.parent.el.style.display = "table";
                }  else if(child.div.centerFit){
                    self.centerFitChild(el.id);
                } else if (child.div.maxFit) {
                    self.maxFitChild(el.id);
                }

                // add in data about who this is
                return self._postProcess(child.div,el,ctx,cb);
            }
        };

        this.getContainerPositioning = function (shouldReturnObjLit) {
            return self._getPositioning(self._containerEl, shouldReturnObjLit);
        };
        this.getChildPositioning = function (id,shouldReturnObjLit) {
            return self._getPositioning(self._getChildEl(id), shouldReturnObjLit)
        };

        this.calcMaxFit = function(parentActual, childActual){
            var parentBasis = parentActual;
            var parentHeight = parentBasis.height;
            var parentWidth = parentBasis.width;

            var toWidth = 0;
            var toHeight = 0;
            var toTop = 0;
            var toLeft = 0;

            var scaler;

            var childBasis = new Positioning()
                .setActual(childActual)
                .getDOMPerceived();

            if (!(childBasis.rotation % 90)) {
                // try height first
                scaler = new Scaler(childBasis.height, parentHeight);
                toWidth = scaler.scaleToDest(childBasis.width);

                // if the width is greater than the container, we're good

                //console.log("toWidth %s toHeight %s", toWidth, toHeight);

                if (toWidth >= parentBasis.width) {
                    toHeight = scaler.scaleToDest(childBasis.height);
                    //console.log("1. toWidth %s toHeight %s", toWidth, toHeight);
                } else {
                    // if not we scale via other means
                    scaler = new Scaler(childBasis.width, parentWidth);
                    toHeight = scaler.scaleToDest(childBasis.height);
                    toWidth = scaler.scaleToDest(childBasis.width);
                    //console.log("2. toWidth %s toHeight %s", toWidth, toHeight);
                }

                // may need to negatively set left/top if over bounds
                if (toHeight > parentHeight)
                    toTop = (parentHeight - toHeight) / 2;
                if (toWidth > parentWidth)
                    toLeft = (parentWidth - toWidth) / 2;
            } else {
                throw new Error('invalid rotation');
            }

            var newPos = new Positioning()
                .setActual(childActual)
                .mutateViaDOMPerceived({
                    top: toTop,
                    left: toLeft,
                    width: toWidth,
                    height: toHeight,
                    rotation: childBasis.rotation
            });

            return {
                positioning: newPos,
                scaler: scaler
            };
        };

        this.maxFitChild = function (id) {
            var childPos = this.getChildPositioning(id);
            var parentPos = this.getContainerPositioning();
            var parentBasis = parentPos.getActual();


            var data = self.calcMaxFit(parentBasis,childPos.getActual());
            var newPos = data.positioning;
            var scaler = data.scaler;
            self._setPositioning(self._getChildEl(id), newPos, { scaleDx: scaler.serialize() });
            return newPos;
        };
        this.centerFitChild = function (id) {
            var childPos = this.getChildPositioning(id);
            var parentPos = this.getContainerPositioning();

            var childBasis = childPos.getDOMPerceived();
            //var parentBasis = parentPos.getDOMPerceived();
            var parentBasis = parentPos.getActual();

            var parentHeight = parentBasis.height;
            var parentWidth = parentBasis.width;

            var toWidth = 0;
            var toHeight = 0;
            var toTop = 0;
            var toLeft = 0;

            // try height first
            var scaler = new Scaler(childBasis.height, parentHeight);
            toWidth = scaler.scaleToDest(childBasis.width);

            // if the width is less than the container, we're good

            //console.log("toWidth %s toHeight %s", toWidth, toHeight);

            if (toWidth <= parentBasis.width) {
                toHeight = scaler.scaleToDest(childBasis.height);
                //console.log("1. toWidth %s toHeight %s", toWidth, toHeight);
            } else {
                // if not we scale via other means
                scaler = new Scaler(childBasis.width, parentWidth);
                toHeight = scaler.scaleToDest(childBasis.height);
                toWidth = scaler.scaleToDest(childBasis.width);
                //console.log("2. toWidth %s toHeight %s", toWidth, toHeight);
            }

            if (toHeight < parentHeight)
                toTop = (parentHeight - toHeight) / 2;
            if (toWidth < parentWidth)
                toLeft = (parentWidth - toWidth) / 2;

            var newPos = childPos.mutateViaDOMPerceived({
                top: toTop,
                left: toLeft,
                width: toWidth,
                height: toHeight,
                rotation:childBasis.rotation
            });
            //console.log(childPos.getActual());
            self._setPositioning(self._getChildEl(id), newPos, { scaleDx: scaler.serialize() });
            return newPos;
        };
    };



    ctor.prototype._setPositioning = function (el, positioning, data) {
        var actual = positioning.getActual();
        var style = el.style;
        style.top = _px(actual.top);
        style.left = _px(actual.left);
        style.width = _px(actual.width);
        style.height = _px(actual.height);
        _setRotation(el, actual.rotation);
        if (data) {
            for(key in data){
                _setDataVal(el, key, data[key]);
            }
        }
    };

    ctor.prototype._getPositioning = function (el,shouldReturnObjLit) {
        //console.log('getting positioning on', el);
        var style = el.style;
        var parent = el.parentElement;
        var actual = {
            top: _pf(style.top),
            left: _pf(style.left),
            width: _pf(style.width || _getDataVal(el,"owidth") || el.width || el.clientWidth),
            height: _pf(style.height || _getDataVal(el, "oheight") || el.height || el.clientHeight),
            rotation: _pf((_getRotation(el) || 0) % 360)
        };
        // if(!actual.width && style.display==="block"){
        //     //console.log('wtf width',el.style.width);
        //     actual.width = parent.style.width;
        // }
        if(style.width.indexOf("%") !== -1)
            actual.width = el.clientWidth;
        if(style.height.indexOf("%") !== -1)
            actual.height = el.clientHeight;

        var scaleDx = _getDataVal(el, "scaleDx");
        if (scaleDx) {
            actual.scaleDx = _pf(scaleDx.toString());
        }
        if (shouldReturnObjLit)
            return actual;
        var pos = new Positioning();
        pos.setActual(actual);
        return pos;
    };


    return ctor;
};

PIO.util.di.register("PIO.ui.Container", ["ko", "$",  "PIO.util", "PIO.models.Positioning",  "PIO.models.Perspective", "PIO.services.ElementUpdater"], PIO.ui.Container);
