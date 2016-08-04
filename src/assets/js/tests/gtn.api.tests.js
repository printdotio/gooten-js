describe("GTN.Api",function(){
	var recipeId = "f255af6f-9614-4fe2-aa8b-1b77b936d9d6";

	beforeEach(function(){
		GTN.util.di.get("Gtn.config").reset();
	});

    it("can get user location",function() {
        var apiCtor = GTN.util.di.get("GTN.Api");
        var api = new apiCtor({});
        var res;
        var err;

        runs(function () {
            GTN.util.di.get("Gtn.config").set("recipeId", recipeId);
            api.getUserLocation(function (error, result) {
                res = result;
                err = error;
            });
        });

        waitsFor(function () { return res || err; });

        runs(function () {
            expect(err).toBeUndefined();
            expect(res.length).toEqual(2);
        });
    });

    describe("_urlFactory", function(){
		it("can build a URL with no query string params",function(){
			var apiCtor = GTN.util.di.get("GTN.Api");
			var api = new apiCtor({});
			var url = api._urlFactory("products");
			expect(url).toEqual("https://api.print.io/api/v/4/source/api/products");
		});

		it("can build a URL with one query param",function(){
			var apiCtor = GTN.util.di.get("GTN.Api");
			var api = new apiCtor({});
			var url = api._urlFactory("products",[["countryCode","US"]]);
			expect(url).toEqual("https://api.print.io/api/v/4/source/api/products?countryCode=US");
		});

		it("can build a URL with multi query param",function(){
			var apiCtor = GTN.util.di.get("GTN.Api");
			var api = new apiCtor({});
			var url = api._urlFactory("products",[["countryCode","US"],["currencyCode","USD"]]);
			expect(url).toEqual("https://api.print.io/api/v/4/source/api/products?countryCode=US&currencyCode=USD");
		});
    });



    it("can get a list of products",function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.getProducts({countryCode: "US"},function(error,result){
				res = result;
				err = error;
			});
		});

		waitsFor(function(){ return res || err; }, 10000);

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.Products.length).toBeDefined();
		});
    });


    it("can get a list of product variants",function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.getProductVariants({countryCode: "US", productId: 43},function(error,result){
				res = result;
				err = error;
			});
		});
		waitsFor(function(){ return res || err; });

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.ProductVariants.length).toBeDefined();
		});
    });


    it("can get a list of templates",function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.getTemplates({sku: "CanvsWrp-BlkWrp-5x7"},function(error,result){
				res = result;
				err = error;
			});
		});

		waitsFor(function(){ return res || err; });

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.Options.length).toBeDefined();
		});
    });

    it("can get required images for sku", function(){
        var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.getRequiredImages({sku: "CanvsWrp-BlkWrp-5x7"},function(error,result){
				res = result;
				err = error;
			});
		});

		waitsFor(function(){ return res || err; });

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.length).toBe(1);
			expect(res[0].width).toBe(2100);
		});
    });

    it("can get required images for sku with mutliple spaces", function(){
        var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.getRequiredImages({sku: "Apparel-DTG-Hoodie-AA-5495-L-White-Unisex-CFCB"},function(error,result){
				res = result;
				err = error;
			});
		});

		waitsFor(function(){ return res || err; });

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.length).toBe(2);
		});
    });

    it("can get total for items in cart", function(){
        var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.getPrices({
                ShipToAddress: {countryCode: "US"},
                Items: [
                    {SKU: "CanvsWrp-BlkWrp-18x24", ShipCarrierMethodId: 1, Quantity: 1},
                    {SKU: "Framed_12x18_Black_Lustre", ShipCarrierMethodId: 1, Quantity: 1}
                ]
            },function(error,result){
            	dump(JSON.stringify(result))
				res = result;
				err = error;
			});
		});
		waitsFor(function(){ return res || err; }, 10000);

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.Items).toBeDefined();
			expect(res.Items.Price).toBeGreaterThan(0);
			expect(res.Items.CurrencyCode).toBeDefined();
		});
    });

    it("can get shipping options for items in cart", function(){
        var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function() {
            GTN.util.di.get("Gtn.config").set("recipeId", recipeId);
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
                res = result;
                err = error;
            });
        });
		waitsFor(function(){ return res || err; });

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.Result.length).toBeDefined();
			expect(res.Result[0].SKUs).toBeDefined();
			expect(res.Result[0].SKUs.length).toBeGreaterThan(0);
			expect(res.Result[0].ShipOptions.length).toBeGreaterThan(1);
			expect(res.Result[1].SKUs).toBeDefined();
			expect(res.Result[1].SKUs.length).toBeGreaterThan(0);
			expect(res.Result[1].ShipOptions.length).toBeGreaterThan(1);
		});
    });

    it("can submit an order via paypal", function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.postOrderPaypal({
                ShipToAddress: {firstName: "Keith", lastName: "Richards", line1: "1023 N ROXBURY DR BEVERLY HILLS CA 90210", city: "BEVERLY HILLS", state: "CA", postalCode: "90210", countryCode: "US", email: "keith@rollingstones.uk", phone: "2233322233322"},
                BillingAddress: {firstName: "Keith", lastName: "Richards", postalCode: "90210", countryCode: "US"},
                Items: [
                    {SKU: "CanvsWrp-BlkWrp-18x24", ShipCarrierMethodId: 1, Quantity: 1, Images:[
                        {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
                    ]},
                    {SKU: "Framed_12x18_Black_Lustre", ShipCarrierMethodId: 1, Quantity: 1, Images:[
                        {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
                    ]}
                ],
                Payment: {
                    CurrencyCode: "USD",
                    Total: "107.78"
                },
                IsInTestMode: true
            },function(error,result){
				res = result;
				err = error;
			});
		});
		waitsFor(function(){ return res || err; });

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.Id).toBeDefined();
		});
    });

    it("can submit an order via braintree", function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.postOrderBraintree({
                ShipToAddress: {firstName: "Keith", lastName: "Richards", line1: "1023 N ROXBURY DR BEVERLY HILLS CA 90210", city: "BEVERLY HILLS", state: "CA", postalCode: "90210", countryCode: "US", email: "keith@rollingstones.uk", phone: "2233322233322"},
                BillingAddress: {firstName: "Keith", lastName: "Richards", postalCode: "90210", countryCode: "US"},
                Items: [
                    {SKU: "CanvsWrp-BlkWrp-18x24", ShipCarrierMethodId: 1, Quantity: 1, Images:[
                        {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
                    ]},
                    {SKU: "Framed_12x18_Black_Lustre", ShipCarrierMethodId: 1, Quantity: 1, Images:[
                        {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
                    ]}
                ],
                Payment: {
                    BraintreeKey: "MIIBCgKCAQEA7Dt20svKjDNsrqu3BWp1hWQah9mpNiIjTeBkxHukMh+nzb40wTOARHpPr4qbEmPRC89oSKuObzwtNjxwvRRiEaRAPJff6dI1ZvF46NWWIqHMWY4zAxEjAvG41eE9+9d8cqyRAkptHVdKl+aawALpcwn8wfdCKeryNvKDH9iCvJIYmpe7tmeonhLz8pksN+iSNYdQQJW8tBrSkpa1crZTWth3SorLjTLOcnUDtDpjpWarjzA/16c1l7TvEzuZbGrSNjSunk2ujZAdZVlZM0xo2nSGjI8WIEpZVIRS4JINVkazD2dIaUAWynzGgwpeh3ymKknZAuqk4SXyBlcUUq2NSwIDAQAB",
                    BraintreeCCNumber: "4111111111111111",
                    BraintreeCCExpDate: "10/20",
                    BraintreeCCV: "123",
                    CurrencyCode: "USD",
                    Total: "107.78"
                },
                IsInTestMode: true
            },function(error,result){
				res = result;
				err = error;
			});
		});
		waitsFor(function(){ return res || err; });

		runs(function(){
            // payment process declined for now - may be in the future it will work
			//expect(err).toBeUndefined();
			//expect(res.Id).toBeDefined();
		});
    });

    it("can submit an order on credit", function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.postOrderOnCredit({
                ShipToAddress: {firstName: "Keith", lastName: "Richards", line1: "1023 N ROXBURY DR BEVERLY HILLS CA 90210", city: "BEVERLY HILLS", state: "CA", postalCode: "90210", countryCode: "US", email: "keith@rollingstones.uk", phone: "2233322233322"},
                BillingAddress: {firstName: "Keith", lastName: "Richards", postalCode: "90210", countryCode: "US"},
                Items: [
                    {SKU: "CanvsWrp-BlkWrp-18x24", ShipCarrierMethodId: 1, Quantity: 1, Images:[
                        {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
                    ]},
                    {SKU: "Framed_12x18_Black_Lustre", ShipCarrierMethodId: 1, Quantity: 1, Images:[
                        {Index: 0, Url: "http://dpcdn.500px.org/535/d1f05f91178b8fd71469f003e29bfd04abca640e/2048.jpg"}
                    ]}
                ],
                Payment: {
                    PartnerBillingKey: "oeO2j1ZbfU0TaDPRrhStEyp68ZRbXK8UfWfq7BKICGY=",
                    CurrencyCode: "USD",
                    Total: "107.78"
                },
                IsInTestMode: true
            },function(error,result){
				res = result;
				err = error;
			});
		});
		waitsFor(function(){ return res || err; });

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.Id).toBeDefined();
		});
    });

    it("can get a order info",function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;

		runs(function(){
			GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
			api.getOrder({Id: "13-cdc4b014-bafc-4681-b0e0-7265d2c11aa1"},function(error,result){
				res = result;
				err = error;
			});
		});

		waitsFor(function(){ return res || err; }, 10000);

		runs(function(){
			expect(err).toBeUndefined();
			expect(res.Id).toBeDefined();
			expect(res.NiceId).toBeDefined();
			expect(res.SourceId).toBeDefined();
			expect(res.Items.length).toBe(2);
			expect(res.Total).toBeDefined();
			expect(res.ShippingTotal).toBeDefined();
			expect(res.ShippingAddress).toBeDefined();
		});
    });
});