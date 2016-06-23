GTN.config = function(){
	var _getDefaults = function(){
		return {
		apiBaseUrl:"https://api.print.io/",
		currencyCode:"USD",
		languageCode:"en",
		showAllProducts:true
		}
	};

	var _config = _getDefaults();
	return {
		get: function(key){
			return _config[key];
		}, 
		set: function(key,val){
			_config[key] = val;
		},
		reset: function(){
			_config = _getDefaults();
		}
	};
};

GTN.util.di.register("GTN.config", [], GTN.config);