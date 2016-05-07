
head.ready('history'
, function() {
 
	var TestModel = function(){
		var self = this;
		self.key = "value";
	};
	
	if(mainBodyModel.test() == null){
		
		mainBodyModel.test(new TestModel());
		
		console.log('test binding applied');
	}
});
