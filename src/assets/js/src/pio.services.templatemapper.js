PIO.services.templateMapper = function (util, Position) {
  var _isUndefined = util.isUndefined;
  var toContainerData = function (ctx, customBehavior) {
    var template;
    if (ctx.template) {
      template = ctx.template;
    } else {
      template = ctx;
    }

    var isOrientedTemplate = template.isOriented;
    var result = {
      fonts: [],
      imageLayers: [],
      designLayers: [],
      textLayers: []
    };
    var fontHash = {};

    var spaceIndex = 0;
    result.spaces = template.Spaces.reduce(function (sr, space) {
      var spaceDat = {};
      var spaceChildren = [];
      var spaceActual = {};
      var overlayLayers = [];
      var maxIndex = 0;
      var maxX = 0;
      var maxY = 0;

      // mark dataset values
      if (space.DefaultRotation) {
        spaceActual.rotation = space.DefaultRotation;
        spaceDat.defaultRotation = space.DefaultRotation;
      }

      if (!_isUndefined(space.FinalX1)) {
        spaceDat.finalX1 = space.FinalX1;
        spaceDat.finalX2 = space.FinalX2;
        spaceDat.finalY1 = space.FinalY1;
        spaceDat.finalY2 = space.FinalY2;
      }

      if (!_isUndefined(space.Id)) {
        spaceDat.spaceId = space.Id;
        if (_isUndefined(result.minSpaceId)
          || result.minSpaceId > space.Id) {
          result.minSpaceId = space.Id;
        }
      }

      spaceDat.spaceIndex = spaceIndex++;
      spaceDat.uid = space.Id;

      // make the layers

      var layerIndex = 0;
      space.Layers
        .sort(function (l1, l2) {
          return l2.ZIndex - l1.ZIndex;
        })
        .forEach(function (layer) {
          var ldata;
          var layerData = {};
          var layerActual = {};
          var zIndex = layer.ZIndex;
          var layerStyle = {};

          if (zIndex > maxIndex)
            maxIndex = zIndex;

          layerActual.top = layer.Y1;
          layerActual.left = layer.X1;
          layerActual.width = layer.X2 - layer.X1;
          layerActual.height = layer.Y2 - layer.Y1;


          if (layer.X2 > maxX) {
            maxX = layer.X2;
          }
          if (layer.Y2 > maxY) {
            maxY = layer.Y2;
          }

          layerData.layerIndex = layerIndex++;
          layerData.uid = layer.uid || layer.Id;
          layerData.spaceUid = space.Id;
          layerData.layerUid = layer.uid || layer.Id;
          layerData.templateX1 = layer.X1;
          layerData.templateX2 = layer.X2;
          layerData.templateY1 = layer.Y1;
          layerData.templateY2 = layer.Y2;


          layerData.spaceIndex = spaceDat.spaceIndex;
          if (layer.IncludeInPrint) {
            layerData.includeInPrint = layer.IncludeInPrint;
          }

          if (layer.Type === "Design") {

            // this is bad
            // the whole point of container.js was to get away from "math everywhere"
            // but fuck it PB needs this today, amirite?
            //
            // this should be handled in container.js
            // didnt have time to fix a bug relating to why it wasnt working
            if (isOrientedTemplate) {
              var pos = new Position({
                aw: layerActual.width,
                ah: layerActual.height,
                at: layerActual.top,
                al: layerActual.left,
                s: true
              });
              layerActual.top = pos.t;
              layerActual.left = pos.l;
              layerActual.width = pos.w;
              layerActual.height = pos.h;
              layerStyle.transform = "rotate(90deg)";
              layerStyle.webkitTransform = "rotate(90deg)";
              layerStyle.mozTransform = "rotate(90deg)";
              layerStyle.msTransform = "rotate(90deg)";
            }

            if (layer.Color) {
              layerStyle.backgroundColor = layer.Color;
            }

            var fixUrl = function (url) {
              // sometimes we need to replace location of bg images from cdn to our server on the fly
              // since IE has bad algorithm for downgrade image sizes (really bad quality in ex: calendars)
              // se we need to fix such images here before show them in IE
              if (customBehavior != null && customBehavior.ieReplaceUrl != null && window.navigator && window.navigator.userAgent && /msie|trident/igm.test(window.navigator.userAgent)) {
                var regexp = new RegExp(customBehavior.ieReplaceUrl.regexp, 'ig');
                // find and replace all mathes (so the result url can looks like new_url/old_content_here?w=100)
                // where w=100 means with eq 100px
                var urlResult = url.replace(regexp, function (matched) {
                  return customBehavior.ieReplaceUrl.strings[matched != '' ? matched : '$'];
                });
                //console.log(urlResult);
                return urlResult;
              }
              // nothing to do here
              return url;
            }

            if (layer.BackgroundImageUrl) {
              ldata = {
                img: {
                  url: fixUrl(layer.BackgroundImageUrl),
                  actual: layerActual,
                  zIndex: zIndex,
                  style: layerStyle,
                  useScale: true,
                  attrs: {
                    data: layerData,
                    classes: ['js-design-layer',
                      'ncz-background-layer',
                      'js-layer-' + layerData.uid]
                  }
                }
              };
              spaceChildren.push(ldata);
              result.designLayers.push(ldata);
            }
            if (layer.OverlayImageUrl) {
              ldata = {
                img: {
                  url: fixUrl(layer.OverlayImageUrl),
                  actual: layerActual,
                  zIndex: zIndex,
                  style: layerStyle,
                  useScale: true,
                  attrs: {
                    data: layerData,
                    classes: ['js-design-layer',
                      'ncz-overlay-layer',
                      'js-layer-' + layerData.uid]
                  }
                }
              };
              overlayLayers.push(ldata);
            }
          } else if (layer.Type === "Image") {
            ldata = {
              div: {
                actual: layerActual,
                zIndex: zIndex,
                useScale: true,
                attrs: {
                  data: layerData,
                  classes: ['js-image-layer',
                    'ncz-image-layer',
                    'js-layer-' + layerData.uid]
                }
              }
            };
            if (ctx.imageLayerFns) {
              ldata.div.fns = ctx.imageLayerFns;
            }
            if(ctx.imageLayerChildren && ctx.imageLayerChildren.length){

            }
            spaceChildren.push(ldata);
            result.imageLayers.push(ldata);
          } else if (layer.Type === "Text") {
            if (layer.FontName) {
              var font = layer.FontName;
              layerStyle.fontFamily = font;
              layerData.font = font;
              if (!fontHash.hasOwnProperty(font)) {
                result.fonts.push(font);
              }
            }
            if (layer.FontSize) {
              layerData.fontPts = layer.FontSize;
            }
            if (layer.FontHAlignment) {
              layerStyle.textAlign = layer.FontHAlignment.toLowerCase();
            }
            if (layer.FontVAlignment) {
              layerStyle.verticalAlign = layer.FontVAlignment.toLowerCase();
            }
            if (layer.Color) {
              layerStyle.color = layer.Color;
              layerData.color = layer.Color;
            }

            var child = {
              div: {
                attrs: {
                  contentEditable: true,
                  classes: ['js-text-layer-content', 'ncz-text-layer-content']
                },
                innerHtml: layer.DefaultText != null ? layer.DefaultText.replace(/\n/igm, "<br>") : layer.DefaultText
              }
            };
            if (layer.FontVAlignment) {
              child.div.style = {
                position: 'initial',
                height: 'initial',
                width: 'initial'
              };
              child = {
                div: {
                  fillSpace: true,
                  attrs: {
                    classes: ['js-text-layer-content', 'ncz-text-layer-content', 'js-text-layer-content-wrapper']
                  },
                  style: {
                    verticalAlign: layer.FontVAlignment.toLowerCase(),
                    display: 'table-cell',
                    position: 'initial'
                  },
                  children: [child]
                }
              }
            }

            ldata = {
              div: {
                actual: layerActual,
                zIndex: zIndex,
                useScale: true,
                attrs: {
                  data: layerData,
                  classes: ['js-text-layer',
                    'ncz-text-layer',
                    'js-layer-' + layerData.uid]
                },
                children: [{
                  div: {
                    useScale: "parent",
                    maxTableCell: true,
                    attrs: {
                      data: layerData,
                      classes: ['js-text-layer-text', 'ncz-text-layer-text'],
                    },
                    style: layerStyle,
                    children: [child]
                  }
                }]
              }
            };// additional children div inside text layer used to limit size of text field, since table and table-cell do not support overflow:hidden. This div has overflow:hidden and size == its parent text layer element
            spaceChildren.push(ldata);
            result.textLayers.push(ldata);
          }
        });

      // add in the overlays last
      overlayLayers
        .sort(function (l1, l2) {
          return l2.img.zIndex - l1.img.zIndex;
        })
        .forEach(function (olayer) {
          olayer.img.zIndex += maxIndex + 1;
          spaceChildren.push(olayer);
          result.designLayers.push(olayer);

        });


      // add in the space
      spaceActual.width = maxX;
      spaceActual.height = maxY;
      sr.push({
        div: {
          actual: spaceActual,
          children: spaceChildren,
          attrs: {
            data: spaceDat,
            classes: ['js-space', 'js-space-' + spaceDat.uid,
              'js-space-' + spaceDat.spaceIndex]
          },
          centerFit: true
        }
      });

      return sr;
    }, []);

    return result;
  };

  return {
    toContainerData: toContainerData
  };
};

PIO.util.di.register("PIO.services.templateMapper", ["PIO.util", "PIO.models.Position"], PIO.services.templateMapper);
