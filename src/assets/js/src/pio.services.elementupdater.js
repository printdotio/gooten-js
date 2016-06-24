// an object to aide in CSS3/hardware accelerated transforms that are TRANSACTIONAL
// oh shit oh shit oh shit
//
PIO.services.ElementUpdater = function (util, Positioning, getViolations, getSuggestedTransform, getCommitState, undef) {
  var domUtil = util.dom;
  var _isUndefined = util.isUndefined;
  var raf;
  if (window.IS_KARMA) {
    raf = function (cb) {
      _.delay(cb, 1);
    } // workaround for jenkins
  } else {
    raf = requestAnimationFrame;
  }
  var pf = parseFloat;
  var _or = util.or;
  var px = function (v) {
    return v + "px";
  };

  var ctor = function (container, data, el) {
    var self = this;

    var _id = util.uuid();
    // an "empty" transform
    var transform = {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
    };

    var beginningTransform = {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1
    };

    var elPosition;
    var parentPosition;
    var parentActual;

    var inModification = false;
    var inCommit = false;
    var style = el.style;


    // get initial transform positionsssss
    var _setBeginningVals = function () {
      elPosition = undef;
      parentPosition = undef;
      parentActual = undef;

      var parsedBeginning = domUtil.getTransforms(el);
      if (parsedBeginning) {
        if (parsedBeginning.scale) {
          var scaleVals = parsedBeginning.scale.split(',');
          if (scaleVals) {
            beginningTransform.scale = pf(scaleVals[0]);
            transform.scale = pf(scaleVals[0]);
          }
        }
        if (!_isUndefined(parsedBeginning.rotate)) {
          beginningTransform.rotation = pf(parsedBeginning.rotate);
          transform.rotation = pf(parsedBeginning.rotate);
        }
        if (parsedBeginning.translate) {
          var translateVals = parsedBeginning.translate.split(',');
          if (translateVals && translateVals.length) {
            beginningTransform.x = pf(translateVals[0]);
            transform.x = pf(translateVals[0]);

            beginningTransform.y = pf(translateVals[1]);
            transform.y = pf(translateVals[1]);
          }

        }
      }
    };

    // set css transform vals
    var _setElementValues = function (x, y, scale, rotation) {
      var value = [
        'translate(' + x + 'px,' + y + 'px)',
        'scale(' + scale + ',' + scale + ')',
        'rotate(' + rotation + 'deg)',
      ];

      value = value.join(" ");
      //console.log('%s update to %s',el.id, value);
      style.webkitTransform = value;
      style.mozTransform = value;
      style.transform = value;
      style.msTransform = value;
      style.OTransform = value;
    };


    // kick off init
    _setBeginningVals();


    this._getViolations = getViolations;

    // take the transform that is wanted
    // then play it out to see if it would lead to a violation
    // if it would lead to a violation
    // 		fix it, then return a "better transform"
    // else
    //		return original ok transform
    this._getSuggestedTransform = getSuggestedTransform;

    // update accepts
    //	a transformDx representing dx of current event/change
    //	[optional] a function to handle the EL value as it is persistent
    //
    // why this function is kinda shitty--
    // 1. transDx x and y values have the state tracked internally
    //    and for those values further transDX x and y values get "added on"
    //    -- so state is tracked by this obj for those values
    //    HOWEVER, for transDx.scale and rotation, the opposite happens--
    //    what is passed is applied directly
    //    == would be nice to have consistency with this
    // -- micah 2016-02-14
    this.update = function (transDx, fn, breakOnViolations) {
      if (inModification)
        return;
      if (inCommit)
        return;
      inModification = true;

      console.log('ElementUpdater: update', transDx);
      var requestedModification;



      var transformDx = {
        x: _or(transDx.x, 0) + _or(transform.x,0),
        y: _or(transDx.y, 0) + _or(transform.y,0),
        rotation: _or(transDx.rotation, transform.rotation),
        scale: _or(transDx.scale, transform.scale)
      };

      // what would you like to have happen?
      if (fn) {
        // this is not used anywhere that i know of right now
        // -- micah, 2016-02-07
        requestedModification = fn(beginningTransform);
      } else {

        // do the mustFill computation work herrrrrre
        if (data.mustFill) {
          if (!elPosition) {
            elPosition = container.getChildPositioning(el.id).clone();
            parentPosition = container.getContainerPositioning();
            parentActual = parentPosition.getActual();
          }

          // transDxAdditive is an additive means of scaling
          // via increasing the width of the image via the passed amount
          if(!transDx.scale && transDx.scaleDxAddend){
            var actualWidth = elPosition.scaleDOMPerceivedForPrint().width;
            var currentWidth = elPosition.getDOMPerceived().width;
            var scaleDx = (currentWidth + transDx.scaleDxAddend) / actualWidth;
            console.log('doing additive, actual:%s | current:%s | scaleDx:%s ',actualWidth,currentWidth,scaleDx);
            transformDx.scale = scaleDx;
          }

          var trans = self._getSuggestedTransform(
            data,
            elPosition,
            parentActual,
            transformDx,
            transDx
          );

          if (breakOnViolations && trans.violations.hadViolation) {
            inModification = false;
            return;
          }

          transformDx = trans.transformDx;
        }
      }

      // perform the actual update
      raf(function () {
        // add in the dx
        transform.x = transformDx.x;
        transform.y = transformDx.y;

        transform.rotation = _or(transformDx.rotation, transform.rotation);
        transform.scale = transformDx.scale;

        _setElementValues(transform.x,
          transform.y,
          transform.scale,
          transform.rotation);
        //console.log("update %s",el.id);
        inModification = false;
      });
    };

    this.reset = function () {
      inModification = true;
      raf(function () {
        //console.log("in reset %s",el.id);
        _setElementValues(beginningTransform.x,
          beginningTransform.y,
          beginningTransform.scale,
          beginningTransform.rotation);
        transform.x = beginningTransform.x;
        transform.y = beginningTransform.y;
        transform.rotation = beginningTransform.rotation;
        transform.scale = beginningTransform.scale;
        inModification = false;
      });
    };

    this.invalidate = function () {
      inModification = true;
      raf(function () {
        //console.log("in reset %s",el.id);
        _setBeginningVals();
        inModification = false;
      });

    };

    this.commit = function (cb) {
      if (inCommit)
        return;
      inCommit = true;
      inModification = true;
      console.log('ElementUpdater: commit pre:raf', transform);

      raf(function () {
        console.log('ElementUpdater: commit inraf', transform);
        var pos = getCommitState(style, transform);

        style.top = px(pos.top);
        style.left = px(pos.left);
        style.width = px(pos.width);
        style.height = px(pos.height);

        _setElementValues(0,
          0,
          1,
          transform.rotation);

        _setBeginningVals();
        inCommit = false;
        inModification = false;
        data.mediator.pub('change');
        if (cb) {
          cb(pos);
        }
        //self.reset();
      });
    };
  };

  return ctor;

};

PIO.util.di.register("PIO.services.ElementUpdater", ["PIO.util", "PIO.models.Positioning", "PIO.services.elementUpdaterFns.violationStrategy", "PIO.services.elementUpdaterFns.suggestedTransform", "PIO.services.elementUpdaterFns.getCommitState"], PIO.services.ElementUpdater);
