GTN.config = function(){
	var _config = {
		apiBaseUrl:"https://api.print.io/",
		currencyCode:"USD",
		languageCode:"en",
		showAllProducts:true
	};
	return {
		get: function(key){
			return _config[key];
		}, 
		set: function(key,val){
			_config[key] = val;
		}
	};
};

GTN.util.di.register("GTN.config", [], GTN.config);