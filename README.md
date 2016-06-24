# gooten-js

`gooten-js` is currently:

 - a library for adding an (`div` and `img` based) "print product editor" to your webpage
 - a library for generating a preview image from an editor's state
 - a library for generating a print image from an editor's state

What could it be in the future?

 - a library for generating previews directly from source images, skipping the editor step
 - a library for generating a 3d preview of an image on a product
 - a library for adding an SVG based editor to your page? (for the text benefits)
 - more?

### Goals

 - The input to the editor should be raw template data. This locks users to our format
 - The output of the editor should be a format that can be mapped into an imgmanip string, an html5 canvas, a jpeg/png
 - The edit controls should be customizable to what the user wants

**Things should be loosely coupled.**

### API Examples

#### Creating An Editor

First, `PIO.ui.Container` is the object/service that is the editor. We use the words "editor" and "container" interchangeably. 

The steps are:

 - get the required objects/services from DI
 - get a template from our API
 - turn (reduce) the template data into container-readable data
 - select which space from the template you want to use
 - create the editor
 - celebrate life


```js
//
// get the objects we need from DI
var containerCtor = PIO.util.di.get("PIO.ui.Container");
// use the "simple" edit controls
var simpleImpl = PIO.util.di.get("PIO.ui.containerFns.simpleImpl");
var templateMapper = PIO.util.di.get("PIO.services.templateMapper");
var exportStrategies = PIO.util.di.get("PIO.ui.containerFns.exportStrategies");

// pass into the template mapper the single template data
// straight from the API
var shirtTemplate = {
      "Spaces": [
        {
          "Id": "C1B69",
          "Index": 1,
          "FinalX1": 2589,
          "FinalX2": 7089,
          "FinalY1": 1603,
          "FinalY2": 7303,
          "DefaultRotation": 0,
          "Description": "Front",
          "Layers": [
            {
              "Id": "90106",
              "Type": "Design",
              "ZIndex": 0,
              "X1": 0,
              "X2": 9340,
              "Y1": 0,
              "Y2": 11010,
              "BackgroundImageUrl": "https://az412349.vo.msecnd.net/product-tshirts/Background/Front/DT6000_Black_Background_Front.png",
              "IncludeInPrint": false
            },
            {
              "Id": "F52EB",
              "Type": "Image",
              "ZIndex": 1,
              "X1": 2589,
              "X2": 7089,
              "Y1": 1603,
              "Y2": 7303,
              "ImageFill": "CanFill",
              "IncludeInPrint": true
            },
            {
              "Id": "DD7A1",
              "Type": "Design",
              "ZIndex": 2,
              "X1": 0,
              "X2": 9340,
              "Y1": 0,
              "Y2": 11010,
              "OverlayImageUrl": "https://az412349.vo.msecnd.net/product-tshirts/Overlay/Front/DT6000_Black_Front_Overlay.png",
              "IncludeInPrint": false
            }
          ]
        }
      ]
    };

// we pass in the template
var tdata = templateMapper.toContainerData({
	template: shirtTemplate
});

// you have to select a space for the editor,
// as the editor can only work on one space at a time
// (though you can have multiple editors and therefore spaces in one place)
var mappedSingleSpace = tdata.spaces[0];

// creation of the editor
// be sure to have the CSS classes in the header of this doc that are like ncz-* !
var img = new containerCtor();
img.addChild(containerEl, mappedSingleSpace, function (finalData) {

	// add the user's image into the container
	// note that we *could* pass in previous image dimensions
	// so that the user starts where they left off
	// 
	simpleImpl.addImage(tdata, finalData, null, {url: url_live}, function () {

	});
});
```



