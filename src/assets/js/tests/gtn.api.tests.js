describe("GTN.Api",function(){
	var recipeId = "f255af6f-9614-4fe2-aa8b-1b77b936d9d6";

	beforeEach(function(){
		GTN.util.di.get("Gtn.config").reset();
	});
	it("can get user location",function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;
		
		GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
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

		GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
		api.getProducts({countryCode: "US"},function(error,result){
			res = result;
			err = error;
		});

		waitsFor(function(){ return res; });

		expect(err).toBeUndefined();
		expect(res.length).toEqual(2);
	});


	it("can get a list of product variants",function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;
		
		GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
		api.getProductVariants({countryCode: "US", productId: 43},function(error,result){
			res = result;
			err = error;
		});

		waitsFor(function(){ return res; });

		expect(err).toBeUndefined();
		expect(res.length).toEqual(2);
	});


	it("can get a list of templates",function(){
		var apiCtor = GTN.util.di.get("GTN.Api");
		var api = new apiCtor({});
		var res;
		var err;
		
		GTN.util.di.get("Gtn.config").set("recipeId",recipeId);
		api.getTemplates({sku: "CanvsWrp-BlkWrp-5x7"},function(error,result){
			res = result;
			err = error;
		});

		waitsFor(function(){ return res; });

		expect(err).toBeUndefined();
		expect(res.length).toEqual(2);
	});


})