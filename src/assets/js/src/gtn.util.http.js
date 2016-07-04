GTN.util.http = {};

GTN.util.http.get = function(url, cb){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url);	
	xhr.setRequestHeader('Content-Type', 'application/json');
	
	xhr.onerror = function(){
		console.error(xhr.responseText, arguments);
	};

	xhr.onload = function() {
	    if (xhr.status === 200) {
	        return cb(null,xhr.responseText);
	    } else {
	    	console.error(xhr.responseText);
	    	return cb(new Error(xhr.responseText));
	    }
	};
};



