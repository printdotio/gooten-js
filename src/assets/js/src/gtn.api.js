GTN.Api = function(util, config){

	return function(){
		var self = this;

		this._urlFactory = function(endpoint, queryStringArray){
			var url = config.get("apiBaseUrl");
			url+="api/v/4/source/api/"+endpoint;
			if(queryStringArray && queryStringArray.length){
				url = url + "?" + queryStringArray.reduce(function(r,i){
					if(i && i.length && i.length === 2)
						r+= "&" + i.join("=");
					return r;
				},"").substr(1);
			}
			return url;
		};

		this.getUserLocation = function(cb){
			util.asserts.notNullOrUndefined("cb", cb);
			return util.http.get("https://printio-geo.appspot.com/ip", cb);
		};

		this.getProducts = function(params, cb){
			var countryCode = params.countryCode;
			console.log("countryCode is "+countryCode);
			util.asserts.notNullOrUndefined("countryCode", countryCode);
			util.asserts.notNullOrUndefined("cb", cb);
			var currencyCode = params.currencyCode || config.get("currencyCode");
			var languageCode = params.languageCode || config.get("languageCode");
			var showAllProducts = params.showAllProducts || config.get("showAllProducts");
			return util.http.get(self._urlFactory("products",[
				["recipeId",config.get("recipeId")],
				["countryCode", countryCode],
				["currencyCode", currencyCode],
				["languageCode", languageCode],
				["all", showAllProducts],
				]), cb);
		};


		this.getProductVariants = function(params, cb){
			var productId = params.productId;
			util.asserts.notNullOrUndefined("productId", productId);

			var countryCode = params.countryCode;
			util.asserts.notNullOrUndefined("countryCode", countryCode);
			util.asserts.notNullOrUndefined("cb", cb);

			var currencyCode = params.currencyCode || config.get("currencyCode");
			var languageCode = params.languageCode || config.get("languageCode");
			var showAllProducts = params.showAllProducts || config.get("showAllProducts");
			return util.http.get(self._urlFactory("productVariants",[
				["recipeId",config.get("recipeId")],
				["productId",productId],
				["countryCode", countryCode],
				["currencyCode", currencyCode],
				["languageCode", languageCode],
				["all", showAllProducts],
				]), cb);
		};

		this.getTemplates = function(params, cb){
			var sku = params.sku;
			util.asserts.notNullOrUndefined("sku", sku);
			
			util.asserts.notNullOrUndefined("cb", cb);

			var currencyCode = params.currencyCode || config.get("currencyCode");
			var languageCode = params.languageCode || config.get("languageCode");
			var showAllProducts = params.showAllProducts || config.get("showAllProducts");
			return util.http.get(self._urlFactory("productTemplates",[
				["recipeId",config.get("recipeId")],
				["productId",productId],
				["countryCode", countryCode],
				["currencyCode", currencyCode],
				["languageCode", languageCode],
				["all", showAllProducts],
				]), cb);
		};
	}
}
GTN.util.di.register("GTN.Api", ["GTN.util", "GTN.config"], GTN.Api)
