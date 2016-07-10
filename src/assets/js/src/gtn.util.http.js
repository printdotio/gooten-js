GTN.util.http = {};

GTN.util.http.get = function(props, cb){
	var url = props.url;
	var undef;
	var jsontype = 'application/json';
	var contentType = props.contentType || jsontype;
	var xhr = new XMLHttpRequest();
	//xhr.withCredentials = true;
	xhr.open('GET', url);	
	xhr.setRequestHeader('Content-Type', contentType);
	
	xhr.onerror = function(){
		console.error(xhr.responseText, arguments);
		return cb(new Error(xhr.responseText));
	};

	xhr.onload = function() {
	    if (xhr.status === 200) {
	    	if(contentType === jsontype)
	        	return cb(undef,JSON.parse(xhr.responseText));
	        return cb(undef,xhr.responseText);

	    } else {
	    	console.error(xhr.responseText);
	    	return cb(new Error(xhr.responseText));
	    }
	};

	xhr.send();
};

GTN.util.http.post = function(props, cb) {
    var url = props.url;
    var undef;
    var jsontype = 'application/json';
    var contentType = props.contentType || jsontype;
    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.onerror = function(){
    	console.error(xhr.responseText, arguments);
    	return cb(new Error(xhr.responseText));
    };

    xhr.onload = function() {
        if (xhr.status === 200) {
        	if(contentType === jsontype)
            	return cb(undef,JSON.parse(xhr.responseText));
            return cb(undef,xhr.responseText);

        } else {
        	console.error(xhr.responseText);
        	return cb(new Error(xhr.responseText));
        }
    };

    var data;
    if(props.data != null)
        data = JSON.stringify(props.data);
    xhr.send(data);
};

