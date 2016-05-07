
head.ready('history'
, function() {
	
	var DashBoardModel = function(){
		var self = this;
		self.key = "value";
	};
			 
	if(mainBodyModel.dashboard() == null){
		
		mainBodyModel.dashboard(new DashBoardModel());
		
		console.log('dashboard binding applied');
	}
	
});
