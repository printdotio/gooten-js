describe("GTN.config",function(){
	it("can set and get",function(){
		var config = GTN.util.di.get("GTN.config");
		config.set("hi","there");
		expect(config.get("hi")).toEqual("there");
	});
});