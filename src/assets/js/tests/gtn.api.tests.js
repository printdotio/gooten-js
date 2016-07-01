describe("GTN.Api",function(){
	it("can get user location",function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;
		
		api.getUserLocation(function(err,result){
			res = result;
			err = error;

		});

		waitsFor(function(){ return res; });

		expect(err).toBeUndefined();
		expect(res.length).toEqual(2);

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
		
		api.getProducts({countryCode: "US"},function(error,result){
			res = result;
			err = error;
		});

		waitsFor(function(){ return res; });

		expect(err).toBeUndefined();
		expect(res.length).toEqual(2);
	});
})