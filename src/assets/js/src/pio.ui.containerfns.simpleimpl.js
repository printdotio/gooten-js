/**
 * Created by micahsmith on 5/6/16.
 */
PIO.ui.containerFns.simpleImpl = (function ($, util, Positioning) {
  var onImageContainerRender = function (divData, imgData) {
    var data = divData;
    imgData = (imgData ? imgData.data : data.data.childData.filter(function (j) {
      return j.img;
    })[0].img);
    var imgUpdater = imgData.getUpdater();

    // rotate button
    //
    //
    var currentRotation = 0;
    $('.js-rotate').click(function () {
      currentRotation += 90 % 360;
      imgUpdater.update({rotation: currentRotation});
      imgUpdater.commit();
    });

    var zoomEndTimer;
    var zoomAddend = 0;
    var onFinishedZoom = function () {
      imgUpdater.commit();
      zoomAddend = 0;
    };


    // zoom via mousewheel
    // method 1
    //
//        $(data.data.el).on('mousewheel', function (e) {
//          e.preventDefault();
//
//          zoomAddend += e.deltaY / 5;
//          var val = zoomAddend;
//          if (val === 0) {
//            val = 1;
//          }
//          if (val < 0) {
//            val = Math.abs(2 / (val));
//            if (val > 1) {
//              val = 1;
//            }
//          }
//
//          if (val === 1)
//            return;
//          console.log("zoom dy:%s zaddend:%s scaleVal:%s", e.deltaY, zoomAddend, val);
//          imgUpdater.update({scale: val}, null, false);
//
//          if (zoomEndTimer) {
//            window.clearTimeout(zoomEndTimer);
//          }
//          zoomEndTimer = setTimeout(onFinishedZoom, 300);
//        });

    // zoom via mousewheel
    // method 2
    //
    $(data.data.el).on('mousewheel', function (e) {
      e.preventDefault();

      zoomAddend += e.deltaY;

      //console.log("zoom dy:%s zaddend:%s", e.deltaY, zoomAddend);
      imgUpdater.update({scaleDxAddend: zoomAddend}, null, false);

      if (zoomEndTimer) {
        window.clearTimeout(zoomEndTimer);
      }
      zoomEndTimer = setTimeout(onFinishedZoom, 300);
    });

    // move
    //
    //
    $(data.data.el).on('mousedown touchstart', function (e) {
        e.preventDefault();
        $(imgData.el).css("cursor", "grabbing");
        var pageX;
        var pageY;
        var userAgent = window.navigator.userAgent;
        if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/android/i) || (e.pageY && e.pageX) == undefined) {
          pageX = e.originalEvent.touches[0].pageX;
          pageY = e.originalEvent.touches[0].pageY;
        } else {
          pageX = e.pageX;
          pageY = e.pageY;
        }


        $(data.data.el).on("mousemove touchmove", function (e) {
          var moveY;
          var moveX;

          if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/android/i) || (e.pageY && e.pageX) == undefined) {
            moveX = e.originalEvent.touches[0].pageY;
            moveY = e.originalEvent.touches[0].pageX;
          } else {
            moveY = e.pageY;
            moveX = e.pageX;
          }


          $(data.data.el).on("mouseup", function () {
            $(this).removeClass('draggable'); //.css('z-index', z_idx);

          });


          // do updates
          //console.log('page: %s, %s | move: %s, %s ', pageX, pageY, moveX, moveY);
          var dat = PIO.util.rotateVector(0, moveX - pageX, moveY - pageY);
          pageX = moveX;
          pageY = moveY;
          //console.log("updating ", dat);
          imgUpdater.update(dat);
        });

      })
      .on("mouseup", function () {
        $(data.data.el).off("mousemove");
        //$(imgData.el).css("cursor","grab");

        imgUpdater.commit();
      }).on("mouseout", function () {
      $(data.data.el).off("mousemove");
      //$(imgData.el).css("cursor","grab");

      imgUpdater.commit();
    });
  };


  var addImage = function (templateMapperData, containerData, accessor, imageProps, cb) {
    // get the image layer container div
    var imageLayer = templateMapperData.imageLayers[0];
    //var imgctx = accessor.get(imageLayer.div.id);
    var mainSpace = templateMapperData.spaces[0].div.el.id;

    var imgToAdd = {
      img: {
        url: imageProps.url,
        mustFill: true,
        fns: {
          onRender: function (d) {
            //console.log(d);
            var parentData = d.getDataById(d.el.parentElement.id);
            onImageContainerRender({data:parentData},d);
          }
        },
        useScale: mainSpace,
        attrs: {
          classes: ['js-image-layer-image'],
          data: {}
        }
      }
    };

    var isUndef = util.isUndefined;
    if (!(isUndef(imageProps.top) || isUndef(imageProps.left) || isUndef(imageProps.width)
      || isUndef(imageProps.height))) {
      imgToAdd.img.actual = (new Positioning()).setDOMPerceived(imageProps).getActual();
    } else {
      imgToAdd.img.maxFit = true;
    }

    return imageLayer.div.container.addChild(imageLayer.div.el, imgToAdd, cb);
  };



  return { addImage: addImage};
});


PIO.util.di.register("PIO.ui.containerFns.simpleImpl", ["$", "PIO.util", "PIO.models.Positioning"], PIO.ui.containerFns.simpleImpl);
