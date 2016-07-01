GTN.models.Perspective = function(util){
	var Transformer = function(fromChild, fromParent){
		var copy = function(data){
			return {
				ax:data.ax,
				ay:data.ay,
				r:data.r,
				dx:data.dx,
				dy:data.dy,
			};
		}
		// get a child point
		// from a parent's perspective
		this.getChildPoint = function(point){
			var res = copy(fromChild);

			res.ax+=point.x;
			res.ay+=point.y;
			res.dx+=point.x;
			res.dy+=point.y;
			return res;
		};

		this.getChildRotation = function(){
			return fromChild.r;
		};

	};


	var ctor = function(stack){
		var self = this;
		this.stack = stack || [];

		this._getStack = function(){
			return self.stack;
		};

		// push a positioning onto the stack
		// its assumed that only a parent positioning is added
		this.push = function(positioning) {
			self.stack.push(positioning);
		};

		this.clone = function(){
			var newStack =  self.stack.reduce(function(r,i){
				r.push(i.clone());
				return r;
			},[]);

			return new ctor(newStack);
		};

		// unshift
		// useful for when you're adding items 
		// via a top down approach
		this.unshift = function(positioning){
			self.stack.unshift(positioning);
		};


		this.getTransformer = function(fromParent){
			// actuals vs domperceiveds
			var cap, cdp, pap, pdp;
			var stack = self.stack;
			var len = stack.length;
			var child = {
				ax:0, 
				ay:0, 
				r:0, 
				dx:0, 
				dy:0
			};
			var parent = {
				ax:0, 
				ay:0, 
				r:0, 
				dx:0, 
				dy:0
			};

			var goingUp = 0;
			var goingDown = len-1;

			//dump(goingUp,len);
			for(; goingUp<len;) {
				cdp = stack[goingDown].getDOMPerceived();
				cap = stack[goingDown].getActual();
				
				pdp = stack[goingUp].getDOMPerceived();
				pap = stack[goingUp].getActual();

				// dump(cap);
				// dump(cdp);

				child.dx -= cdp.left;
				child.dy -= cdp.top;
				child.r += cdp.rotation % 360;
				child.ax -= cap.left;
				child.ay -= cap.top;

				parent.dx += pdp.left;
				parent.dy += pdp.top;
				parent.r -= pdp.rotation % 360;
				parent.ax += pap.left;
				parent.ay += pap.top;

				goingUp++;
				goingDown--;
				//dump(goingUp,len);
			}

			// dump(child);
			if(fromParent){
				return new Transformer(parent, child);
			} else {
				return new Transformer(child, parent);
			}
		};
	};

	return ctor;
}

GTN.util.di.register("GTN.models.Perspective", ["GTN.util"], GTN.models.Perspective);
