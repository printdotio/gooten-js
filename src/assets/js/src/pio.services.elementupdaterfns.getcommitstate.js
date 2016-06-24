PIO.services.elementUpdaterFns.getCommitState = function(Positioning){
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

PIO.util.di.register("PIO.services.elementUpdaterFns.getCommitState", ["PIO.models.Positioning"], PIO.services.elementUpdaterFns.getCommitState);

