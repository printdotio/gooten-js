GTN.services.previewStrategies = function(_, util){
	return function(){

/*
		{
			// img can be a string, meaning a single image
			// or it can be an object, with subproperties
			// thumbUrl, url, printUrl
			img:{},

			// products is an array of prods to try it out on
			// null/empty means gooten selects the prods
			products:[],

			// skus is an array of skus to try it out on
			// null/empty means gooten selects the skus
			skus:[],

			// max number of previews to generate
			maxNumPreviews: -1,

			// styles
			styles:[]
		}
*/

		this.createPreviewIL = function(){

		};
	};
};

PIO.util.di.register("GTN.services.previewStrategies", ["_", "GTN.util"], PIO.services.previewStrategies);