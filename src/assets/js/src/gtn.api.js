GTN.Api = function(util, config) {

    return function () {
        var self = this;

        this._urlFactory = function (endpoint, queryStringArray) {
            var url = config.get("apiBaseUrl");
            url += "api/v/4/source/api/" + endpoint;
            if (queryStringArray && queryStringArray.length) {
                url = url + "?" + queryStringArray.reduce(function (r, i) {
                        if (i && i.length && i.length === 2)
                            r += "&" + i.join("=");
                        return r;
                    }, "").substr(1);
            }
            return url;
        };

        this.getUserLocation = function (cb) {
            util.asserts.notNullOrUndefined("cb", cb);
            return util.http.get({
                url: "https://printio-geo.appspot.com/ip",
                contentType: "text/plain"
            }, cb);
        };

        this.getProducts = function (params, cb) {
            var countryCode = params.countryCode;
            util.asserts.notNullOrUndefined("countryCode", countryCode);
            util.asserts.notNullOrUndefined("cb", cb);
            var currencyCode = params.currencyCode || config.get("currencyCode");
            var languageCode = params.languageCode || config.get("languageCode");
            var showAllProducts = params.showAllProducts || config.get("showAllProducts");
            return util.http.get({
                url: self._urlFactory("products", [
                    ["recipeId", config.get("recipeId")],
                    ["countryCode", countryCode],
                    ["currencyCode", currencyCode],
                    ["languageCode", languageCode],
                    ["all", showAllProducts],
                ])
            }, cb);
        };


        this.getProductVariants = function (params, cb) {
            var productId = params.productId;
            util.asserts.notNullOrUndefined("productId", productId);

            var countryCode = params.countryCode;
            util.asserts.notNullOrUndefined("countryCode", countryCode);
            util.asserts.notNullOrUndefined("cb", cb);

            var currencyCode = params.currencyCode || config.get("currencyCode");
            var languageCode = params.languageCode || config.get("languageCode");
            var showAllProducts = params.showAllProducts || config.get("showAllProducts");
            return util.http.get({
                url: self._urlFactory("productVariants", [
                    ["recipeId", config.get("recipeId")],
                    ["productId", productId],
                    ["countryCode", countryCode],
                    ["currencyCode", currencyCode],
                    ["languageCode", languageCode],
                    ["all", showAllProducts]
                ])
            }, cb);
        };

        this.getTemplates = function (params, cb) {
            var sku = params.sku;
            util.asserts.notNullOrUndefined("sku", sku);
            util.asserts.notNullOrUndefined("cb", cb);
            var showAllProducts = params.showAllProducts || config.get("showAllProducts");

            return util.http.get({
                url: self._urlFactory("productTemplates", [
                    ["sku", sku],
                    ["recipeId", config.get("recipeId")]
                ])
            }, cb);
        };

        this.getRequiredImages = function (params, cb) {
            util.asserts.notNullOrUndefined("template", params.template);
            self.getTemplates(params, function(err, templates){
                var template = _.find(templates.Options, function(template){
                    return template.Name === params.template;
                });
                var result = _.map(template.Spaces, function(space){
                    var layers = _.map(space.Layers, function(layer) {
                        if(layer.Type !== 'Image')
                            return null;
                        return {
                            X1: layer.X1,
                            Y1: layer.Y1,
                            X2: layer.X2,
                            Y2: layer.Y2
                        };
                    });
                    return _.filter(layers, function(layer){
                        return layer != null;
                    });
                });
                result = _.flatten(result);
                cb(err, result)
            })
        };

        this.getTotal = function(data, cb) {
            util.asserts.notNullOrUndefined("cb", cb);

            util.asserts.notNullOrUndefined("ShipToAddress", data.ShipToAddress);
            util.asserts.notNullOrUndefined("ShipToAddress.firstName", data.ShipToAddress.firstName);
            util.asserts.notNullOrUndefined("ShipToAddress.lastName", data.ShipToAddress.lastName);
            util.asserts.notNullOrUndefined("ShipToAddress.line1", data.ShipToAddress.line1);
            util.asserts.notNullOrUndefined("ShipToAddress.city", data.ShipToAddress.city);
            util.asserts.notNullOrUndefined("ShipToAddress.postalCode", data.ShipToAddress.postalCode);
            util.asserts.notNullOrUndefined("ShipToAddress.countryCode", data.ShipToAddress.countryCode);
            util.asserts.notNullOrUndefined("ShipToAddress.email", data.ShipToAddress.email);
            util.asserts.notNullOrUndefined("ShipToAddress.phone", data.ShipToAddress.phone);

            util.asserts.moreThan("Items.length", data.Items.length, 0);
            _.each(data.Items, function(obj){
                util.asserts.notNullOrUndefined("SKU", obj);
                util.asserts.notNullOrUndefined("ShipCarrierMethodId", obj.ShipCarrierMethodId);
                util.asserts.moreThan("Quantity", obj.Quantity, 0);
            });

            return util.http.post({
                url: self._urlFactory("priceestimate", [
                    ["recipeId", config.get("recipeId")]
                ]),
                data: data
            }, cb);
        };

        this.getShippingOptions = function(params, cb) {
            util.asserts.notNullOrUndefined("cb", cb);
            
            util.asserts.moreThan("length", params.length, 0);
            
            _.each(params, function(obj){
                util.asserts.notNullOrUndefined("SKU", obj);
                util.asserts.moreThan("Quantity", obj.Quantity, 0);
            });

            return util.http.post({
                url: self._urlFactory("shippingPrices", [
                    ["recipeId", config.get("recipeId")]
                ]),
                data: params
            }, cb);
        };

        this.orderSubmit = function(params, cb) {
            util.asserts.notNullOrUndefined("cb", cb);

            util.asserts.notNullOrUndefined("ShipToAddress", params.ShipToAddress);
            util.asserts.notNullOrUndefined("ShipToAddress.firstName", params.ShipToAddress.firstName);
            util.asserts.notNullOrUndefined("ShipToAddress.lastName", params.ShipToAddress.lastName);
            util.asserts.notNullOrUndefined("ShipToAddress.line1", params.ShipToAddress.line1);
            util.asserts.notNullOrUndefined("ShipToAddress.city", params.ShipToAddress.city);
            util.asserts.notNullOrUndefined("ShipToAddress.postalCode", params.ShipToAddress.postalCode);
            util.asserts.notNullOrUndefined("ShipToAddress.countryCode", params.ShipToAddress.countryCode);
            util.asserts.notNullOrUndefined("ShipToAddress.email", params.ShipToAddress.email);
            util.asserts.notNullOrUndefined("ShipToAddress.phone", params.ShipToAddress.phone);

            util.asserts.notNullOrUndefined("BillingAddress.firstName", params.BillingAddress.firstName);
            util.asserts.notNullOrUndefined("BillingAddress.lastName", params.BillingAddress.lastName);
            util.asserts.notNullOrUndefined("BillingAddress.postalCode", params.BillingAddress.postalCode);
            util.asserts.notNullOrUndefined("BillingAddress.countryCode", params.BillingAddress.countryCode);
            util.asserts.notNullOrUndefined("BillingAddress.email", params.BillingAddress.email);

            util.asserts.moreThan("Items.length", params.Items.length, 0);
            _.each(params.Items, function(obj){
                util.asserts.notNullOrUndefined("SKU", obj);
                util.asserts.notNullOrUndefined("ShipCarrierMethodId", obj.ShipCarrierMethodId);
                util.asserts.moreThan("Quantity", obj.Quantity, 0);
            });

            util.asserts.notNullOrUndefined("Payment.CurrencyCode", params.Payment.CurrencyCode);
            util.asserts.notNullOrUndefined("Payment.Total", params.Payment.Total);
            util.asserts.notNullOrUndefined("Payment.BraintreeEncryptedCCNumber", params.Payment.BraintreeEncryptedCCNumber);
            util.asserts.notNullOrUndefined("Payment.BraintreeEncryptedCCExpDate", params.Payment.BraintreeEncryptedCCExpDate);
            util.asserts.notNullOrUndefined("Payment.BraintreeEncryptedCCV", params.Payment.BraintreeEncryptedCCV);

            return util.http.post({
                url: self._urlFactory("orders", [
                    ["recipeId", config.get("recipeId")]
                ]),
                data: params
            }, cb);
        };
    }
};

GTN.util.di.register("GTN.Api", ["GTN.util", "GTN.config"], GTN.Api);
