GTN.services.elementUpdaterFns.getCommitState = function(Positioning){
  var pf = parseFloat;
  return function(style, transform){
    var scale = transform.scale;
    if(!scale)
      scale = 1;
    scale = pf(scale);
    var pos = new Positioning()
      .setActual({
        top: pf(style.top) + transform.y,
        left: pf(style.left) + transform.x,
        width: pf(style.width),
        height: pf(style.height)
      })
      .scaleActual(scale);
    return pos;
  };
};

GTN.util.di.register("GTN.services.elementUpdaterFns.getCommitState", ["GTN.models.Positioning"], GTN.services.elementUpdaterFns.getCommitState);

