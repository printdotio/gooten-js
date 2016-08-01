# gooten-js

`gooten-js` is currently:

 - a fork of a subset of widget code
 - a library for the "core" gooten implementation experience
 - a library for adding a (`div` and `img` based) "print product editor" to your webpage
 - a library for generating a preview image from an editor's state
 - a library for generating a print image from an editor's state

What could it be in the future?

 - a library for generating previews directly from source images, skipping the editor step
 - a library for generating a 3d preview of an image on a product
 - a library for adding an SVG based editor to your page? (for the text benefits)
 - a "components" based approach 
 - more?

## Goals

 - Full unit test coverage -- we will write it as we go!
 - Full documentation -- we will write it as we go!
 - Have the least possible amount of references to foreign libraries (jquery/bootstrap/etc)
 - Be the least amount of UI possible. Every time we code up a UI, a client asks us to change it for them. This doesn't scale. 
 - The input to the editor should be raw template data. This locks users to our format
 - The output of the editor should be a format that can be mapped into an imgmanip string, an html5 canvas, a jpeg/png
 - The edit controls should be customizable to what the user wants

Hopefully it doesn't need to be said, but **things should be loosely coupled.**

## Roadmap

 - get a user's location
 - get products for the user location
 - get productvariants for a product in a location
 - get templates for a product
 - show a preview of an image on a product (product previews)
 - allow a user to edit (move/scale/rotate an image on a product)
 - cart functionality
  - add an item to a cart
  - remove an item from a cart
  - get the item, shipping, tax, total prices for the cart, including with coupon apply
  - get the currently applied coupons
 - get shipping prices for item[s]
 - submit an order!
 - codepens of example UIs?


### Links For Micah to Investigate

 - radial gradiant background http://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_canvas_createradialgradient

## Examples

Below are examples for each of the "core experiences."




### Setting Your Recipe Id (API Key)

**The very first step to using gooten-js is setting your recipe id**, so as to be authenticated with our servers. 

```js
// grab the config singleton from DI
// and set our recipeId
GTN.util.di.get("GTN.config").set("recipeId","f255af6f-9614-4fe2-aa8b-1b77b936d9d6");
```

After that, all requests will use the specified recipe id. 




### Getting A User's Location

Getting a user's home/ship-to country is incredibly important. The ship-to country is used for:

 - deciding which products are available for the geography
 - deciding which vendor would be the best to print for the geography
 - deciding what product and shipping prices will be

If you have a two character country code (like "US") already, then feel free to skip. 

```js
// request the API constructor from our DI container
var apiCtor = GTN.util.di.get("GTN.Api");
var api = new apiCtor();

// get the client's location
api.getUserLocation(function(err, countryCode){
  // countryCode will be a two character country code string, 
  // such as US, CA, etc.
});
```




### Getting a List of Products

Now that we have the user's country, we can call out to the API for a list of products. 

At Gooten, the term "product" has a meaning more like "product category." For instance, "Canvas Wraps" is a product that has different variants/skus underneath it, like for instance, a 10x10 black-wrapped canvas. 

The `getProducts` function can give you data to:

 - see what product categories are available in your region
 - see the starting prices of SKUs for the product
 - get marketing-worthy content and images for the product

The `getProducts` function `params` argument takes 4 values:

 - `countryCode` - required -  the 2 character country code the user is interested in shipping to
 - `currencyCode` - optional, defaults to "USD" - the currency to get prices in
 - `languageCode` - optional, defaults to "en" - the language to have product data returned in
 - `showAllProducts` - optional, defaults to `true` - whether to return all the products that are orderable in the user's region, or to only return products the user has set up in the [product settings page](https://www.gooten.com/admin#product-settings). TODO check that link

```js
// request the API constructor from our DI container
var apiCtor = GTN.util.di.get("GTN.Api");
var api = new apiCtor();

// get the available products
api.getProducts({countryCode: "US"}, function(err, result){
  // as an example,
  // loop through all the available products and write out their names
  result.Products.forEach(function(product){
    if(!product.IsComingSoon)
      console.log(product.Name);
  });
});
```

The JS above is equivalent to doing the following:

`curl "https://api.print.io/api/v/4/source/api/products?recipeId=f255af6f-9614-4fe2-aa8b-1b77b936d9d6&countryCode=US?all=true"`

Having the response:

```js
{
  "Products": [
    {
      "Id": 154,
      "UId": "Accessory Pouches",
      "Name": "Accessory Pouches",
      "ShortDescription": "A convenient pouch to hold all of your essentials. It's the perfect bag to carry on its own or within another. ",
      "HasAvailableProductVariants": true,
      "HasProductTemplates": true,
      "IsFeatured": false,
      "IsComingSoon": false,
      "MaxZoom": 1.5,
      "RetailPrice": {
        "Price": 9.84,
        "CurrencyCode": "USD",
        "FormattedPrice": "$9.84",
        "CurrencyFormat": "${1}",
        "CurrencyDigits": 2
      },
      "Info": [
        {
          "Content": [
            "A convenient pouch to hold all of your essentials. It's the perfect bag to carry on its own or within another.  Secure zipper closure keeps make-up, jewelry and small essentials safely in place and within reach. Carry this beauty around for that extra oomph."
          ],
          [...]
```

So now we have a list of products. You want to choose products where `IsComingSoon=false`; "coming soon" products are ones that are not available. 

Now that we have a list of products that are available, we ping the API to see what SKUs underneath them are available using their `Id` values...






### Getting a List of SKUs (Product Variants) for a Product

It's easy to get a list of available SKUs for a product, after you have the a product's Id from our products endpoint (above).

##### Selection of a SKU

Different SKUs *can be* available for different regions. For instance, in US, our canvas wrap SKUs are based on inch formats, while in Europe, those SKUs are based on centimeter formats. This results in different SKUs.

The important point here is that you want to show the US SKU to someone from US, and the European SKU for the person in Europe. This is why getting the user's country is so crucial. 

The `getProductVariants` function `params` argument takes 5 values:

 - `productId` - required - the integer representing the product to get the SKUs for
 - `countryCode` - required -  the 2 character country code the user is interested in shipping to
 - `currencyCode` - optional, defaults to "USD" - the currency to get prices in
 - `languageCode` - optional, defaults to "en" - the language to have product data returned in
 - `showAllProducts` - optional, defaults to `true` - whether to return all the products that are orderable in the user's region, or to only return products the user has set up in the [product settings page](https://www.gooten.com/admin#product-settings). TODO check that link

```js
// request the API constructor from our DI container
var apiCtor = GTN.util.di.get("GTN.Api");
var api = new apiCtor();

// get the SKUs
api.getProductVariants({productId: 43, countryCode: "US"}, function(err, result){
  // as an example,
  // loop through all the skus and write out their price
  result.ProductVariants.forEach(function(variant){
    console.log(variant.Sku +" has a price of "+ variant.PriceInfo.FormattedPrice);
  });
});
```

This is equivalent to doing the following:

`curl "https://api.print.io/api/v/4/source/api/productvariants?recipeId=f255af6f-9614-4fe2-aa8b-1b77b936d9d6&countryCode=US&productId=43?all=true"`

Note we added `productId` to the request above.

This yields the response:

```
{
  "ProductVariants": [
    {
      "Options": [
        {
          "OptionId": "568b5efc04d54cfcbba692350bba6248",
          "ValueId": "723fffc93c354fcba13c0bd237083153",
          "Name": "Canvas Size",
          "Value": "5x7 inch",
          "ImageUrl": "http://app-imgs.print.io/product-canvaswraps/5x7-canvas-wrap-austen.png",
          "ImageType": "WebImg",
          "CmValue": "13x18 cm",
          "SortValue": "1"
        },
        {
          "OptionId": "53690280519549a3bc7ed05c92607f11",
          "ValueId": "4d626c16b9f8472e84503f8b83f8aec2",
          "Name": "Wrap Type",
          "Value": "Black Wrap",
          "ImageUrl": "http://app-imgs.print.io/product-canvaswraps/Blackwrap.png",
          "ImageType": "WebImg",
          "SortValue": "2"
        },
        {
          "OptionId": "6373e437e6d44405874f6c76f7d124d5",
          "ValueId": "7851884945ce440cb31112f2f982db3c",
          "Name": "Shape",
          "Value": "Rectangle",
          "ImageUrl": "http://app-imgs.print.io/product-canvaswraps/Rectangle-canvas-wrap-crop.png",
          "ImageType": "WebImg",
          "SortValue": "2"
        }
      ],
      "PriceInfo": {
        "Price": 6.74,
        "CurrencyCode": "USD",
        "FormattedPrice": "$6.74",
        "CurrencyFormat": "${1}",
        "CurrencyDigits": 2
      },
      "Sku": "CanvsWrp-BlkWrp-5x7",
      "MaxImages": 1,
      "HasTemplates": true
    }, [...]
```

So you receive back an array of product variants, which conttain the `Sku` field. Note that this will also include the price and options. One could pass a different currency code (like `currencyCode: "EUR"`) to have the response in that format. 









### Getting A SKU's Required Images

Without the correct sized images, an item will not be submitted to a printer. 

The `getRequiredImages` function `params` argument takes 2 values:

 - `sku` - required - the SKU you are requesting templates for
 - `template` - required - the name of template to get images sizes

Example:

```js
api.getRequiredImages(
    {
        sku: "CanvsWrp-BlkWrp-5x7"
    },
    function(error,result){
        ...
    }
);
```

This yields the response:

```js
[
  {
    width:2100,
    height:1500
  }
]
```

That sku's image should be 2100x1500. Easy!











### Getting a List of Templates For a SKU

This is a more advanced approach to the "getting a sku's required images" example above. "Templates" are data that describe how to build a UI for a SKU. For example, a template conains information such as:

 - how many images does one need to supply for a SKU?
 - what size images should one supply?
 - coordinates for where to place images
 - assets (images) to build a more realistic representation of what the final product would look like, with their coordinates


The `getTemplates` function `params` argument takes 1 value:

 - `sku` - required - the SKU you are requesting templates for

Example:

```js
// get templates for a sku
api.getTemplates({sku: "CanvsWrp-BlkWrp-5x7"}, function(err, result){
  // as an example,
  // loop through all the available templates and write out their names
  result.Options.forEach(function(template){
      console.log(template.Name);
  });
});
```




This is equivalent to doing:

`curl "https://api.print.io/api/v/4/source/api/producttemplates?recipeId=f255af6f-9614-4fe2-aa8b-1b77b936d9d6&sku=CanvsWrp-BlkWrp-5x7"`

Which would yield the response:

```
{
  "Options": [
    {
      "Spaces": [
        {
          "Id": "3FCDC",
          "Index": 1,
          "FinalX1": 450,
          "FinalX2": 2550,
          "FinalY1": 450,
          "FinalY2": 1950,
          "Layers": [
            {
              "Id": "650D9",
              "Type": "Design",
              "ZIndex": 0,
              "X1": 0,
              "X2": 3000,
              "Y1": 0,
              "Y2": 2400,
              "BackgroundImageUrl": "https://az412349.vo.msecnd.net/product-canvaswraps/CanvasWrap5x7-Black-Background.png",
              "IncludeInPrint": false
            },
            {
              "Id": "98F77",
              "Type": "Image",
              "ZIndex": 1,
              "X1": 450,
              "X2": 2550,
              "Y1": 450,
              "Y2": 1950
            },
            {
              "Id": "7AD0D",
              "Type": "Design",
              "ZIndex": 2,
              "X1": 0,
              "X2": 3000,
              "Y1": 0,
              "Y2": 2400,
              "OverlayImageUrl": "https://az412349.vo.msecnd.net/product-canvaswraps/CanvasWrap5x7-OverlayBlackv3.png",
              "IncludeInPrint": false
            }
          ]
        }
      ],
      "Name": "Single",
      "ImageUrl": "http://app-imgs.print.io/product-canvaswraps/RectangleSingleBlackA.png",
      "IsDefault": true
    },
    [...]
  ]
}
```


#### Parsing the Template Data

The response contains an array of templates.

There is a lot going on here. A few notes on what the fields of a template mean:

 - `ImageUrl` is a nice icon of the template
 - `FinalX1`, etc is the coordinates of the image that should be cropped out of the UI and submitted
 - `Layers` is an array of layers
 - `Design` layers are ones which include assets to be drawn on the UI
 - `Image` layers represent where you should allow the user to draw

So once you have a template, in order to draw the UI, one would:

 - create a canvas with a width of the largest X value in the layers, a height of the largest Y value in the layers
 - sort the layers using the `ZIndex`
 - for design layers, paint the UI
 - set up your drawing to work only within the `Image` layer coords









### Getting a Total For Items in A Cart

**TODO**

 - show example with coupon[s]


Once you have items you can get item, shipping, and tax information via one call to `getPrices`. 

The `getPrices` function `params` argument takes several values:

 - `countryCode` - required - shipping 2-letter country code
 - `SKU` - required - SKU of product
 - `ShipCarrierMethodId` - required - Id of shipping method
 - `Quantity` - required - number of items with this SKU

Its important to note that shipping prices can change based off of how much data you give us. For example, if you give us a full address that is in the US, you may get a different price than if you only passed in the `countryCode`. Thus, **where possible, pass in the entire address as often as possible**.

Example:

```js
api.getPrices(
    {
        ShipToAddress: {
            countryCode: "US",
        }
    },
    Items: [
            {SKU: "CanvsWrp-BlkWrp-18x24", ShipCarrierMethodId: 1, Quantity: 1},
            {SKU: "Framed_12x18_Black_Lustre", ShipCarrierMethodId: 1, Quantity: 1}
        ]
    }, function(error,result){
        ...
    }
);
```

This yields the response:

```js
{
  "Items": {
    "Price": 85.05,
    "CurrencyCode": "USD",
    "FormattedPrice": "$85.05",
    "CurrencyFormat": "${1}",
    "CurrencyDigits": 2
  },
  "Shipping": {
    "Price": 22.73,
    "CurrencyCode": "USD",
    "FormattedPrice": "$22.73",
    "CurrencyFormat": "${1}",
    "CurrencyDigits": 2
  },
  "HadCouponApply": false,
  "HadError": false
}
```









### Getting Shipping Options For a Cart

The `getShippingOptions` function `params` argument takes several values:

 - `ShipToPostalCode` - required - postal code
 - `ShipToCountry` - required - 2-letter country code
 - `ShipToState` - optional - state code if exists
 - `CurrencyCode` - required - currency code
 - `LanguageCode` - required - 2-letter language code
 - `SKU` - required - SKU of product
 - `Quantity` - required - number of items with this SKU

Example:

```js
api.getShippingOptions({
    ShipToPostalCode: "90210",
    ShipToCountry: "US",
    ShipToState: "CA",
    CurrencyCode: "USD",
    LanguageCode: "en",
    Items: [
        {
            SKU: "CanvsWrp-BlkWrp-18x24",
            Quantity: 1
        },
        {
            SKU: "Framed_12x18_Black_Lustre",
            Quantity: 1
        }
    ]
}, function (error, result) {
    ...
});
```

This yields the response:

```
{
  "Result": [
    {
      "SKUs": [
        "CanvsWrp-BlkWrp-18x24"
      ],
      "ShipOptions": [
        {
          "CarrierName": "Standard",
          "MethodType": "Standard",
          "Name": "Standard",
          "Price": {
            "Price": 11.98,
            "CurrencyCode": "USD",
            "FormattedPrice": "$11.98",
            "CurrencyFormat": "${1}",
            "CurrencyDigits": 2
          },
          "Id": 1,
          "EstBusinessDaysTilDelivery": 12
        },
        {
          "CarrierName": "Expedited",
          "MethodType": "Expedited",
          "Name": "Expedited",
          "Price": {
            "Price": 20.22,
            "CurrencyCode": "USD",
            "FormattedPrice": "$20.22",
            "CurrencyFormat": "${1}",
            "CurrencyDigits": 2
          },
          "Id": 2,
          "EstBusinessDaysTilDelivery": 4
        },
        {
          "CarrierName": "Overnight",
          "MethodType": "Overnight",
          "Name": "Overnight",
          "Price": {
            "Price": 32.97,
            "CurrencyCode": "USD",
            "FormattedPrice": "$32.97",
            "CurrencyFormat": "${1}",
            "CurrencyDigits": 2
          },
          "Id": 3,
          "EstBusinessDaysTilDelivery": 2
        }
      ]
    },
    {
      "SKUs": [
        "Framed_12x18_Black_Lustre"
      ],
      "ShipOptions": [
        {
          "CarrierName": "Expedited",
          "MethodType": "Expedited",
          "Name": "Expedited",
          "Price": {
            "Price": 20.57,
            "CurrencyCode": "USD",
            "FormattedPrice": "$20.57",
            "CurrencyFormat": "${1}",
            "CurrencyDigits": 2
          },
          "Id": 2,
          "EstBusinessDaysTilDelivery": 4
        },
        {
          "CarrierName": "Standard",
          "MethodType": "Standard",
          "Name": "Standard",
          "Price": {
            "Price": 10.75,
            "CurrencyCode": "USD",
            "FormattedPrice": "$10.75",
            "CurrencyFormat": "${1}",
            "CurrencyDigits": 2
          },
          "Id": 1,
          "EstBusinessDaysTilDelivery": 12
        },
        {
          "CarrierName": "Overnight",
          "MethodType": "Overnight",
          "Name": "Overnight",
          "Price": {
            "Price": 14.49,
            "CurrencyCode": "USD",
            "FormattedPrice": "$14.49",
            "CurrencyFormat": "${1}",
            "CurrencyDigits": 2
          },
          "Id": 3,
          "EstBusinessDaysTilDelivery": 2
        }
      ]
    }
  ]
}
```

**TODO**
 - explain which ID is used on order submission
 - explain grouping of items together










### Submitting an Order via Paypal

TODO









### Submitting an Order on Credit

TODO

Be sure to mention keeping PartnerPrivateBillingKey hidden.










### Submitting an Order via Braintree

**TODO**

 - do not show examples with imgmanip, show examples with image URLs

The `orderSubmit` function `params` argument takes several values:

`ShipToAddress` section:
 - `firstName` - required - first name of user
 - `lastName` - required - last name of user
 - `line1` - required - shipping address
 - `city` - required - shipping city
 - `state` - required - shipping state if exists
 - `postalCode` - required - shipping postal code
 - `countryCode` - required - shipping 2-letter country code
 - `email` - required - user's email
 - `phone` - required - users' phone

`BillingAddress` section:
 - `firstName` - required - first name of user
 - `lastName` - required - last name of user
 - `postalCode` - required - shipping postal code
 - `countryCode` - required - shipping 2-letter country code

`Items` section:
 - `SKU` - required - SKU of product
 - `ShipCarrierMethodId` - required - Id of ship carrier method
 - `Quantity` - required - number of items with this SKU
 - `Images` - required - list of images which contains `Index` of image and `ManipCommand`


`Payment` section:
 - `BraintreeEncryptedCCNumber` - required - encrypted card number
 - `BraintreeEncryptedCCExpDate` - required - encrypted valid date of card
 - `BraintreeEncryptedCCV` - required - encripted CCV number
 - `CurrencyCode` - required - currency code
 - `Total` - required - order total

Example:

```js
api.orderSubmit({
                ShipToAddress: {
                    firstName: "Keith", 
                    lastName: "Richards", 
                    line1: "1023 N ROXBURY DR BEVERLY HILLS CA 90210", 
                    city: "BEVERLY HILLS", 
                    state: "CA", 
                    postalCode: "90210", 
                    countryCode: "US", 
                    email: "keith@rollingstones.uk", 
                    phone: "2233322233322"},
                BillingAddress: {
                    firstName: "Keith", 
                    lastName: "Richards", 
                    postalCode: "90210", 
                    countryCode: "US"},
                Items: [
                    {
                        SKU: "CanvsWrp-BlkWrp-18x24", 
                        ShipCarrierMethodId: 1, 
                        Quantity: 1, 
                        Images:[
                            {Index: 0, ManipCommand: '{"name":"canvas","commands":[{"name":"combine","args":{"map":"0=+450.00078260869566+450.00078260869566,"},"index":0},{"name":"convert","args":{"format":"jpg"},"index":999},{"name":"quality","args":{"value":100},"index":0},{"name":"resample2","args":{"dpi":300,"units":"PixelsPerInch"},"index":0},{"name":"crop","args":{"x1":450,"x2":7650,"y1":450,"y2":5850},"index":997}],"layers":[{"name":"canvas","commands":[{"name":"combine","args":{"map":"0=-626.0912608695652+0"},"index":0}],"layers":[{"name":"image","commands":[{"name":"resize","args":{"height":5400.005869565217,"width":8452.19152173913},"index":0}],"layers":[],"settings":{"uri":"https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/10981197_859464497450312_265769196419833225_n.jpg?oh=305626407b8cbf42c9da68b658e61c1d&oe=5835FF2B","printUrl":"https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/10981197_859464497450312_265769196419833225_n.jpg?oh=305626407b8cbf42c9da68b658e61c1d&oe=5835FF2B"}}],"settings":{"width":7200.00195652174,"height":5400.005869565217,"index":0,"color":"#000000"}}],"settings":{"width":8100,"height":6300,"color":"#000000"}}'}
                    ]},
                    {
                        SKU: "Framed_12x18_Black_Lustre", 
                        ShipCarrierMethodId: 1, 
                        Quantity: 1, 
                        Images:[
                            {Index: 0, ManipCommand: '{"name":"canvas","commands":[{"name":"combine","args":{"map":"0=+1050.0000000000002+1050.0000000000002,"},"index":0},{"name":"convert","args":{"format":"jpg"},"index":999},{"name":"quality","args":{"value":100},"index":0},{"name":"resample2","args":{"dpi":300,"units":"PixelsPerInch"},"index":0},{"name":"crop","args":{"x1":1050,"x2":6450,"y1":1050,"y2":4650},"index":997}],"layers":[{"name":"canvas","commands":[{"name":"combine","args":{"map":"0=-117.3913043478261+0"},"index":0}],"layers":[{"name":"image","commands":[{"name":"resize","args":{"height":3600.0000000000005,"width":5634.782608695653},"index":0}],"layers":[],"settings":{"uri":"https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/10981197_859464497450312_265769196419833225_n.jpg?oh=305626407b8cbf42c9da68b658e61c1d&oe=5835FF2B","printUrl":"https://scontent.xx.fbcdn.net/v/t1.0-9/s720x720/10981197_859464497450312_265769196419833225_n.jpg?oh=305626407b8cbf42c9da68b658e61c1d&oe=5835FF2B"}}],"settings":{"width":5400,"height":3600.0000000000005,"index":0,"color":"#000000"}}],"settings":{"width":7500,"height":5700,"color":"#000000"}}'}
                    ]}
                ],
                Payment: {
                    BraintreeEncryptedCCNumber: "$bt4|javascript_1_3_10$ ...",
                    BraintreeEncryptedCCExpDate: "$bt4|javascript_1_3_10$FMA9OkM4Z9u8bj9 ...",
                    BraintreeEncryptedCCV: "$bt4|javascript_1_3_10$UlauiA0BD42AZdw...",
                    CurrencyCode: "USD",
                    Total: "107.78"
                }
            },function(error,result){
			    ...
			});
```

This yields the response:

```
{
  "Id": "7-f0f4ffd3-2582-48c5-9d10-4c7c625e1fec"
}
```

It contains Id of submitted order.


### Getting an Order's Info

TODO (using the GET /orders API)


### Creating An Editor

First, `GTN.ui.Container` is the object/service that is the editor. We use the words "editor" and "container" interchangeably. 

The steps are:

 - get the required objects/services from DI
 - get a template from our API
 - turn (reduce) the template data into container-readable data
 - select which space from the template you want to use
 - create the editor
 - inside the callback from editor creation, or after that callback, add an image
 - celebrate life


```js
//
// get the objects we need from DI
var containerCtor = GTN.util.di.get("GTN.ui.Container");
// use the "simple" edit controls
var simpleImpl = GTN.util.di.get("GTN.ui.containerFns.simpleImpl");
var templateMapper = GTN.util.di.get("GTN.services.templateMapper");
var exportStrategies = GTN.util.di.get("GTN.ui.containerFns.exportStrategies");

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



