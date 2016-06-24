PIO.ui.containerFns.exportStrategies = (function ($, _, util) {
  var _getArg = function (x, y) {
    if (x >= 0)
      x = "+" + x.toString();
    else
      x = x.toString();
    if (y >= 0)
      y = "+" + y.toString();
    else
      y = +y.toString();

    return x + y;
  };

  return function () {
    // the gist of this is to create an IL format
    // that can then be turned into a canvas/imgmanip
    // (separate implementation/extension from base data/container)
    this.containerToIL = function (templateSpaceData, spaceContainer) {
      var getDataFn = spaceContainer.div.container._getFnData;

      var rootPosition = spaceContainer.div.getPosition();
      var rootDomp = rootPosition.getDOMPerceived();


      var printIL = {
        top: 0,
        left: 0,
        layers: [],
        spaceId: templateSpaceData.Id
      };

      var previewIL = {
        top: 0,
        left: 0,
        layers: [],
        spaceId: templateSpaceData.Id
      };

      // sort by index for upcoming operations
      var layers = _.sortBy(templateSpaceData.Layers, "ZIndex");

      // get max width/height
      printIL.width = layers.reduce(function (r, i) {
        if (i.X2 > r)
          return i.X2;
        return r;
      }, 0);
      printIL.height = layers.reduce(function (r, i) {
        if (i.Y2 > r)
          return i.Y2;
        return r;
      }, 0);

      // also set previews
      previewIL.width = printIL.width;
      previewIL.height = printIL.height;

      var scaleDx = printIL.width / rootDomp.width;

      layers.forEach(function (layer) {
        // get the element from the webpage
        var selector = "";
        if (layer.Type === "Image") {
          selector = " > .js-image-layer-image";
        }

        var $el = $('#' + spaceContainer.div.id + ' .js-layer-' + layer.Id + selector);

        //Fix for 'Design' layers without images
        if (!$el.length) return;

        // load its container.js data
        var containerData = getDataFn($el.attr("id"));

        // get element positioning data, scaled to template/print
        var position = containerData.data.getPosition();
        var domp = position.getDOMPerceived();
        var print = position.scaleDOMPerceivedForPrint(scaleDx);

        // construct IL
        var obj = print;
        obj.layerId = layer.Id;


        if (layer.Type === "Design") {
          obj.url = layer.BackgroundImageUrl || layer.OverlayImageUrl;
          if (layer.IncludeInPrint) {
            printIL.layers.push(obj);
          }
        }


        if (layer.Type === "Image") {
          obj.url = $el[0].src;
          obj.parent = getDataFn($el.parent().attr("id"))
            .data
            .getPosition()
            .scaleDOMPerceivedForPrint(scaleDx);
          printIL.layers.push(obj);
        }

        previewIL.layers.push(obj);


        if (templateSpaceData.FinalX2) {
          printIL.finalX1 = templateSpaceData.FinalX1;
          printIL.finalX2 = templateSpaceData.FinalX2;
          printIL.finalY1 = templateSpaceData.FinalY1;
          printIL.finalY2 = templateSpaceData.FinalY2;
        }

      });

      return {
        print: printIL,
        preview: previewIL
      };
    };

    var _ilToCanvasHelper = function (opts, layers, ctx, cb) {
      var layer = layers.shift();
      if (layer) {
        layer.url = layer.url.replace("http://cdn.print.io", "https://az412349.vo.msecnd.net");
        return util.loadImage(layer.url, function (img) {
          // set timeout here is to give the browser time to
          // repaint so as to not lock the browser
          setTimeout(function () {

            if (layer.parent && !util.isUndefined(layer.parent.x1)) {
              var tempCanvas = document.createElement("canvas");
              var twidth = layer.parent.width * opts.canvasScale;
              var theight = layer.parent.height * opts.canvasScale;
              tempCanvas.width = twidth;
              tempCanvas.height = theight;

              // safari has this crazy pixel rounding bug
              // where it'll round the size of the canvas html5 element
              // and so you have to force the canvas element to be larger
              // note that this DOES NOT result in an image alteration
              // because we use the original vals (twidth, theight) when painting
              // to the final canvas
              if(tempCanvas.width < twidth){
                tempCanvas.height = Math.ceil(twidth);
              }
              if(tempCanvas.height < theight){
                tempCanvas.height = Math.ceil(theight);
              }

              var tctx = tempCanvas.getContext("2d");
              tctx.scale(opts.canvasScale,opts.canvasScale);
              //tctx.clearRect(0, 0, layer.parent.width, layer.parent.height);

              if (layer.rotation !== 0) {
                // everything about html5 canvas rotation
                // makes me want to murder someone
                // ...enjoy!
                var rotationAmount = layer.rotation * Math.PI / 180;
                tctx.translate(layer.centerX + layer.x1, layer.centerY + layer.y1);
                tctx.rotate(rotationAmount);
                if (layer.rotation % 180 === 0) {
                  tctx.drawImage(img, -layer.centerX, -layer.centerY, layer.width, layer.height);
                } else {
                  tctx.drawImage(img, -layer.centerY, -layer.centerX, layer.height, layer.width);
                }
              } else {
                tctx.drawImage(img, layer.x1, layer.y1, layer.width, layer.height);
              }

              // paint to the final canvas
              ctx.drawImage(tempCanvas, 0, 0, twidth, theight, layer.parent.x1, layer.parent.y1, layer.parent.width, layer.parent.height);

            } else {
              //ctx.translate(layer.x1,layer.y1);
              ctx.drawImage(img, layer.x1, layer.y1, layer.width, layer.height);
            }
            return _ilToCanvasHelper(opts, layers, ctx, cb);
          }, 250);

        });
      } else {
        return cb();
      }
    };

    var _getScaledSize = function (il) {

    };

    this.ILToCanvas = function (il, cb) {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      var dx = 1;

      // need to factor into scaling finalx1/x2 vals (if they exist)
      // so that the image is correct size
      var scaleToWidth = il.finalX2 ? (il.finalX2 - il.finalX1) : il.width;
      var scaleToHeight = il.finalY2 ? (il.finalY2 - il.finalY1) : il.height;

      if (il.maxWidth && scaleToWidth > il.maxWidth) {
        dx = (il.maxWidth / scaleToWidth);
        scaleToWidth *= dx;
        scaleToHeight *= dx;
      }

      if (il.maxHeight && scaleToHeight > il.maxHeight) {
        dx = (il.maxHeight / scaleToHeight);
        scaleToWidth = il.maxHeight * dx;
        scaleToHeight = il.maxWidth * dx;
      }


      canvas.height = il.height * dx;
      canvas.width = il.width * dx;


      if (il.backgroundColor) {
        ctx.fillStyle = il.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.scale(dx, dx);
      var opts = {
        canvasScale: dx,
        width: scaleToWidth,
        height: scaleToHeight,
        _canvas:canvas
      };
      return _ilToCanvasHelper(opts, util.copyArray(il.layers), ctx, function () {
        if (il.finalX2) {
          var finalCanvas = document.createElement("canvas");
          var fctx = finalCanvas.getContext("2d");
          var fwidth = (il.finalX2 - il.finalX1) * dx;
          var fheight = (il.finalY2 - il.finalY1) * dx;
          finalCanvas.width = fwidth;
          finalCanvas.height = fheight;
          fctx.drawImage(canvas, il.finalX1 * dx, il.finalY1 * dx, fwidth, fheight, 0, 0, fwidth, fheight);
          return cb(finalCanvas);
        }
        return cb(canvas);
      });
    };

    this.ILToImgManip = function (il, skipCropping) {

      var iter = 0;
      var mapArgs = [];

      var cmdObj = {
        name: "canvas",
        layers: [],
        commands: [
          {name: "resize", args: {height: il.height, width: il.width}, index: 0},
        ],
        settings: {
          width: il.width,
          height: il.height
        }
      };


      il.layers.forEach(function (layer) {
        var lobj = {
          name: "canvas",
          layers: [{
            name: "image",
            settings: {
              uri: layer.url
            },
            commands: [
              {name: "rotate", args: {degrees: layer.rotation}},
              {name: "resize", args: {height: layer.height, width: layer.width}}
            ]
          }],
          commands: [
            {name: "combine", args: {map: "0=" + _getArg(layer.left, layer.top)}}
          ],
          settings: {
            width: il.width,
            height: il.height
          }
        };

        if (layer.parent) {
          lobj.settings = {
            width: layer.parent.width,
            height: layer.parent.height
          };
          mapArgs.push((iter++) + "=" + _getArg(layer.parent.x1, layer.parent.y1));
        } else {
          mapArgs.push((iter++) + "=" + _getArg(layer.x1, layer.y1));
        }


        cmdObj.layers.push(lobj);
      });

      // add in final commands
      cmdObj.commands.push({name: "combine", args: {map: mapArgs.join(",")}, index: 1});

      if (!skipCropping && (il.finalX1 || il.finalX2)) {
        cmdObj.commands.push({
          name: "crop", args: {
            x1: il.finalX1,
            x2: il.finalX2,
            y1: il.finalY1,
            y2: il.finalY2
          }, index: 3
        });
      }

      cmdObj.commands.push({name: "resample2", args: {dpi: 300, units: "PixelsPerInch"}, index: 998});


      return cmdObj;
    };


  };

});

PIO.util.di.register("PIO.ui.containerFns.exportStrategies", ["$", "_", "PIO.util"], PIO.ui.containerFns.exportStrategies);
