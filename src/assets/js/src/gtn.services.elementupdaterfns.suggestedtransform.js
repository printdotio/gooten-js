GTN.services.elementUpdaterFns.suggestedTransform = function (util, Positioning, getViolations) {
  var _isUndefined = util.isUndefined;
  return function (data, elPosition, parentActual, transformDx, sourceTransform) {

    var hadRotationPassed = !_isUndefined(sourceTransform.rotation);
    var hadScalePassed = !_isUndefined(sourceTransform.scale);
    var suggestedPosition;
    var violations;

    console.log("suggestedTransform: enter",
      JSON.stringify({
        //elPositionActual: elPosition.getActual(),
        elPositionDomp: elPosition.getDOMPerceived(),
        parentActual: parentActual,
        transformDx: transformDx,
        sourceTransform: sourceTransform
      }, null, null));


    if (hadRotationPassed) {
      //  mustfill only supports mod 90 degrees
      transformDx.rotation = transformDx.rotation
        - (transformDx.rotation % 90);
    }

    suggestedPosition = elPosition
      .mutateActualViaAddXY(transformDx.x,transformDx.y)
      .mutateViaActual({
        rotation: transformDx.rotation
      })
      .mutateViaScaleActual(transformDx.scale)
      .getDOMPerceived();



    //  if (violations.width || violations.height) {
    //    console.log("suggestedTransform: scalevio transform to pre",
    //      JSON.stringify(
    //    {
    //        violations: violations,
    //        elPositionActual: elPosition.getActual(),
    //        elPositionDomp: elPosition.getDOMPerceived(),
    //        parentActual: parentActual,
    //        suggestedPosition: suggestedPosition,
    //        sourceTransform: sourceTransform,
    //        transformDx: transformDx
    //      },null,2));
    //
    //    // we rotated and it doesnt maxfit now!
    //    // so we get a good maxfit val and then
    //    // scale it up
    //    var cRotated = elPosition
    //      .mutateViaActual({rotation: transformDx.rotation});
    //    var cActual = cRotated.getActual();
    //    var scaler = data.container
    //      .calcMaxFit(parentActual, cActual).scaler;
    //    console.log('suggestedTransform scaler dx',scaler.serialize());
    //    // this is sneaky --
    //    // 1. scale up the el
    //    // 2. see what the current el's pos would be like scaled
    //    // 3. proceed as though that is the new suggestion
    //    // (this can get fixed with the vios below)
    //    transformDx.scale = scaler.scaleToDest(1);
    //    var scaled = cRotated.scaleActual(transformDx.scale);
    //    suggestedPosition = new Positioning()
    //      .setActual(scaled)
    //      .getDOMPerceived();
    //
    //    violations = getViolations(parentActual, suggestedPosition);
    //    console.log("suggestedTransform: scalevio transform to post",
    //      JSON.stringify({
    //        violations: violations,
    //        elPositionActual: elPosition.getActual(),
    //        elPositionDomp: elPosition.getDOMPerceived(),
    //        parentActual: parentActual,
    //        suggestedPosition: suggestedPosition,
    //        sourceTransform: sourceTransform,
    //        transformDx: transformDx
    //      },null,2));
    //  }
    //
    //} else {
    //  // x1/y1 violation issues
    //  console.log('suggestedTransform: x1/y1 issue');
    //  var actual = elPosition.getDOMPerceived();
    //  var scale = parseFloat(transformDx.scale);
    //  var nl = scale * transformDx.x + actual.left;
    //  var nt = scale * transformDx.y + actual.top;
    //  var nw = scale * actual.width;
    //  var nh = scale * actual.height;
    //  suggestedPosition = elPosition
    //    .mutateViaDOMPerceived({
    //      left: nl,
    //      top: nt,
    //      width: nw,
    //      height: nh
    //    }).getDOMPerceived();
    //
    //
    //  violations = getViolations(parentActual, suggestedPosition);
    //}

    violations = getViolations(parentActual, suggestedPosition);

    //console.log("suggestedTransform: post rotation/scale",
    //  JSON.stringify(
    //    {
    //      violations: violations,
    //      //elPositionActual: elPosition.getActual(),
    //      elPositionDomp: elPosition.getDOMPerceived(),
    //      parentActual: parentActual,
    //      suggestedPosition: suggestedPosition,
    //      sourceTransform: sourceTransform,
    //      transformDx: transformDx
    //    }, null, 2));


    if (violations.width || violations.height) {
      // we did something and it doesnt maxfit now!
      // so we get a good maxfit val and then
      // scale it up
      var cRotated = elPosition
        .mutateViaActual({rotation: transformDx.rotation});
      var cActual = cRotated.getActual();
      var scaler = data.container
        .calcMaxFit(parentActual, cActual).scaler;
      //console.log('suggestedTransform scaler dx', scaler.serialize());
      // this is sneaky --
      // 1. scale up the el
      // 2. see what the current el's pos would be like scaled
      // 3. proceed as though that is the new suggestion
      // (this can get fixed with the vios below)
      transformDx.scale = scaler.scaleToDest(1);
      var scaled = cRotated.scaleActual(transformDx.scale);
      suggestedPosition = new Positioning()
        .setActual(scaled)
        .getDOMPerceived();

      // recompute violations
      violations = getViolations(parentActual, suggestedPosition);
    }


    if (violations.x1) {
      transformDx.x += 0 - suggestedPosition.x1;
    }
    if (violations.x2) {
        transformDx.x += parentActual.width - suggestedPosition.x2;
    }
    if (violations.y1) {
      transformDx.y += 0 - suggestedPosition.y1;
    }
    if (violations.y2) {
      transformDx.y += parentActual.height - suggestedPosition.y2;
    }

    var res = {
      transformDx: transformDx,
      violations: violations
    };
    console.log('ElementUpdater: x/y post', JSON.stringify(res, null, null));
    return res;
  };
};

GTN.util.di.register("GTN.services.elementUpdaterFns.suggestedTransform", ["GTN.util", "GTN.models.Positioning", "GTN.services.elementUpdaterFns.violationStrategy"], GTN.services.elementUpdaterFns.suggestedTransform);
