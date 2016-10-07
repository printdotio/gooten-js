# gooten-js

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
 - `showAllProducts` - optional, defaults to `true` - whether to return all the products that are orderable in the user's region, or to only return products the user has set up in the [product settings page](https://www.gooten.com/admin#/products).

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
 - `showAllProducts` - optional, defaults to `true` - whether to return all the products that are orderable in the user's region, or to only return products the user has set up in the [product settings page](https://www.gooten.com/admin#/products).

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

```json
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

```json
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

Once you have items you can get item, shipping, and tax information via one call to `getPrices`. 

The `getPrices` function `params` argument takes several values:

 - `countryCode` - required - shipping 2-letter country code
 - `SKU` - required - SKU of product
 - `ShipCarrierMethodId` - required - Id of shipping method
 - `Quantity` - required - number of items with this SKU
 - `CouponCodes` - optional - list of coupon codes

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

```json
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

The same example above with coupon code:

```js
api.getPrices(
    {
        ShipToAddress: {
            countryCode: "US",
        }
    },
    Items: [
            {SKU: "CanvsWrp-BlkWrp-18x24", ShipCarrierMethodId: 1, Quantity: 1},
        ],
    CouponCodes: ["COUPON"]
    }, function(error,result){
        ...
    }
);
```

This yields the response:

```json
{
  "Items": {
    "Price": 30.27,
    "CurrencyCode": "USD",
    "FormattedPrice": "$30.27",
    "CurrencyFormat": "${1}",
    "CurrencyDigits": 2
  },
  "Shipping": null,
  "Tax": {
    "Price": 0.0,
    "CurrencyCode": "USD",
    "FormattedPrice": "$0.00",
    "CurrencyFormat": "${1}",
    "CurrencyDigits": 2
  },
  "Coupons": [
    {
      "CouponSavings": {
        "Price": 2.0,
        "CurrencyCode": "USD",
        "FormattedPrice": "$2.00",
        "CurrencyFormat": "${1}",
        "CurrencyDigits": 2
      },
      "CouponInfo": {
        "CouponCode": "COUPON",
        "CouponType": "DollarsOff",
        "PercentOff": null,
        "DollarsOff": 2.0,
        "ConvertedDollarsOff": 2.0,
        "IsCouponSingleUse": true,
        "AppliedToSkus": [
          "CanvsWrp-BlkWrp-18x24"
        ],
        "MinOrderAmount": null,
        "ConvertedMinOrderAmount": null,
        "ShipmentMethodId": 0
      },
      "HadCouponApply": true
    }
  ],
  "HadCouponApply": true,
  "HadError": false,
  "CouponSavings": null,
  "CouponInfo": null
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

```json
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

For each SKU we provide several shipment options. Please use correspondent method `Id` from the response above as `ShipCarrierMethodId` field while submitting an order. `Overnight` option is available for US customers only.

Based on several rules like size of item and weight our API decides how items can be finally groupped. So `SKUs` field represents a list of items which can be send together in one post box. It dramatically reduce shipment costs.


### Submitting an Order via Paypal

The `postOrderPaypal` function `params` argument takes several values:

`ShipToAddress` section:
 - `firstName` - first name of user
 - `lastName` - last name of user
 - `line1` - shipping address
 - `city` - shipping city
 - `state` - shipping state if exists
 - `postalCode` - shipping postal code
 - `countryCode` - shipping 2-letter country code
 - `email` - user's email
 - `phone` - users' phone

`BillingAddress` section:
 - `firstName` - first name of user
 - `lastName` - last name of user
 - `postalCode` - shipping postal code
 - `countryCode` - shipping 2-letter country code

`Items` section:
 - `SKU` - SKU of product
 - `ShipCarrierMethodId` - Id of ship carrier method
 - `Quantity` - number of items with this SKU
 - `Images` - list of images which contains `Index` of image and `Url`


`Payment` section:
 - `BraintreeKey` - braintree key to encrypt card info
 - `BraintreeCCNumber` - valid card number
 - `BraintreeCCExpDate` - valid date of card
 - `BraintreeCCV` - CCV number
 - `CurrencyCode` - currency code
 - `Total` - order total

Example:

```js
api.postOrderPaypal({
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
                {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
        ]},
        {
            SKU: "Framed_12x18_Black_Lustre", 
            ShipCarrierMethodId: 1, 
            Quantity: 1, 
            Images:[
                {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
        ]}
    ],
    Payment: {
        CurrencyCode: "USD",
        Total: "107.78"
    }
},function(error,result){
    ...
});
```

This yields the response:

```json
{
  "Id": "7-f0f4ffd3-2582-48c5-9d10-4c7c625e1fec"
}
```

It contains Id of submitted order with special flag which indicates that order waits payment notification from PayPal.

Usually it make sense to create and submit hidden form like this:

```html
<form class="js-paypal-form" style="display:none;" action="... place PayPal/Sandbox url here ..." method="post">
    <input type="hidden" name="cmd" value="_xclick" />
    <input type="hidden" name="business" value="...email..." />
    <input type="hidden" name="item_name" value="Printed Items">
    <input type="hidden" name="cbt" value="Return to the site you came from" />
    <input type="hidden" name="rm" value="1" />
    <input type="hidden" name="image_url" value="...logo url..." />
    <input type="hidden" name="currency_code" value="...currency code..." />
    <input type="hidden" name="amount" value="...total value..." />
    <input type="hidden" name="no_shipping" value="1" />
    <input type="hidden" name="return" value="...return url..." />
    <input type="hidden" name="invoice" value="...Id of order from response - in example above: 7-f0f4ffd3-2582-48c5-9d10-4c7c625e1fec..." />
    <input type="hidden" name="notify_url" value="https://api.print.io/PayPal" />
    <input type="submit" />
</form>
```
after payment complete PayPal will notify our API server and we remove pre-payment flag from submitted order.



### Submitting an Order on Credit


The `postOrderOnCredit` function `params` argument takes several values:

`ShipToAddress` section:
 - `firstName` - first name of user
 - `lastName` - last name of user
 - `line1` - shipping address
 - `city` - shipping city
 - `state` - shipping state if exists
 - `postalCode` - shipping postal code
 - `countryCode` - shipping 2-letter country code
 - `email` - user's email
 - `phone` - users' phone

`BillingAddress` section:
 - `firstName` - first name of user
 - `lastName` - last name of user
 - `postalCode` - shipping postal code
 - `countryCode` - shipping 2-letter country code

`Items` section:
 - `SKU` - SKU of product
 - `ShipCarrierMethodId` - Id of ship carrier method
 - `Quantity` - number of items with this SKU
 - `Images` - list of images which contains `Index` of image and `Url`


`Payment` section:
 - `PartnerBillingKey` - partner's private billing key
 - `CurrencyCode` - currency code
 - `Total` - order total

Example:

```js
api.postOrderOnCredit({
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
                {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
        ]},
        {
            SKU: "Framed_12x18_Black_Lustre", 
            ShipCarrierMethodId: 1, 
            Quantity: 1, 
            Images:[
                {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
        ]}
    ],
    Payment: {
        PartnerBillingKey: "123",
        CurrencyCode: "USD",
        Total: "107.78"
    }
},function(error,result){
    ...
});
```

This yields the response:

```json
{
  "Id": "7-f0f4ffd3-2582-48c5-9d10-4c7c625e1fec"
}
```

It contains Id of submitted order.

Please make sure that you keep your PartnerBillingKey hidden.


### Submitting an Order via Braintree


The `postOrderBraintree` function `params` argument takes several values:

`ShipToAddress` section:
 - `firstName` - first name of user
 - `lastName` - last name of user
 - `line1` - shipping address
 - `city` - shipping city
 - `state` - shipping state if exists
 - `postalCode` - shipping postal code
 - `countryCode` - shipping 2-letter country code
 - `email` - user's email
 - `phone` - users' phone

`BillingAddress` section:
 - `firstName` - first name of user
 - `lastName` - last name of user
 - `postalCode` - shipping postal code
 - `countryCode` - shipping 2-letter country code

`Items` section:
 - `SKU` - SKU of product
 - `ShipCarrierMethodId` - Id of ship carrier method
 - `Quantity` - number of items with this SKU
 - `Images` - list of images which contains `Index` of image and `Url`


`Payment` section:
 - `BraintreeKey` - braintree key to encrypt card info
 - `BraintreeCCNumber` - valid card number
 - `BraintreeCCExpDate` - valid date of card
 - `BraintreeCCV` - CCV number
 - `CurrencyCode` - currency code
 - `Total` - order total

Example:

```js
api.postOrderBraintree({
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
                {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
        ]},
        {
            SKU: "Framed_12x18_Black_Lustre", 
            ShipCarrierMethodId: 1, 
            Quantity: 1, 
            Images:[
                {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
        ]}
    ],
    Payment: {
        BraintreeKey: "MIIBCgKCAQEA7Dt2 ...",
        BraintreeCCNumber: "4111111111111111",
        BraintreeCCExpDate: "10/20",
        BraintreeCCV: "123",
        CurrencyCode: "USD",
        Total: "107.78"
    }
},function(error,result){
    ...
});
```

This yields the response:

```json
{
  "Id": "7-f0f4ffd3-2582-48c5-9d10-4c7c625e1fec"
}
```

It contains Id of submitted order.


### Getting an Order's Info

The `getOrder` function `params` argument takes only one required value - the Id of order.

Example:

```js
api.getOrder(
    {Id: "13-cdc4b014-bafc-4681-b0e0-7265d2c11aa1"},
    function(error,result){
});

```

This yields the response:

```json
{
  "Id": "13-cdc4b014-bafc-4681-b0e0-7265d2c11aa1",
  "NiceId": "Richa13-cd",
  "SourceId": "13-cdc4b014-bafc-4681-b0e0-7265d2c11aa1",
  "Items": [
    {
      "Sku": "CanvsWrp-BlkWrp-18x24",
      "ProductId": 43,
      "Product": "Canvas Wraps",
      "Quantity": 1,
      "Status": "Test",
      "Price": {
        "Price": 30.27,
        "CurrencyCode": "USD",
        "FormattedPrice": "$30.27",
        "CurrencyFormat": "${1}",
        "CurrencyDigits": 2
      },
      "DiscountAmount": {
        "Price": 0.00,
        "CurrencyCode": "USD",
        "FormattedPrice": "$0.00",
        "CurrencyFormat": "${1}",
        "CurrencyDigits": 2
      },
      "Meta": {
        
      },
      "Shipments": [
        
      ]
    },
    {
      "Sku": "Framed_12x18_Black_Lustre",
      "ProductId": 41,
      "Product": "Framed Prints",
      "Quantity": 1,
      "Status": "Test",
      "Price": {
        "Price": 54.78,
        "CurrencyCode": "USD",
        "FormattedPrice": "$54.78",
        "CurrencyFormat": "${1}",
        "CurrencyDigits": 2
      },
      "DiscountAmount": {
        "Price": 0.00,
        "CurrencyCode": "USD",
        "FormattedPrice": "$0.00",
        "CurrencyFormat": "${1}",
        "CurrencyDigits": 2
      },
      "Meta": {
        
      },
      "Shipments": [
        
      ]
    }
  ],
  "Total": {
    "Price": 107.78,
    "CurrencyCode": "USD",
    "FormattedPrice": "$107.78",
    "CurrencyFormat": "${1}",
    "CurrencyDigits": 2
  },
  "ShippingTotal": {
    "Price": 22.73,
    "CurrencyCode": "USD",
    "FormattedPrice": "$22.73",
    "CurrencyFormat": "${1}",
    "CurrencyDigits": 2
  },
  "ShippingAddress": {
    "FirstName": "Keith",
    "LastName": "Richards",
    "Line1": "1023 N ROXBURY DR BEVERLY HILLS CA 90210",
    "City": "BEVERLY HILLS",
    "State": "CA",
    "CountryCode": "US",
    "PostalCode": "90210",
    "Phone": "2233322233322",
    "Email": "keith@rollingstones.uk"
  },
  "BillingAddress": {
    "FirstName": "Keith",
    "LastName": "Richards",
    "Line1": " ",
    "City": " ",
    "State": " ",
    "CountryCode": "US",
    "PostalCode": "90210"
  }
}
```
