
head.ready('history'
, function() {
		 
	
  mainBodyModel.dashboard = ko.observable({
	});
  
  
	ko.cleanNode(document.getElementById("main-body"));
	ko.applyBindings(mainBodyModel, document.getElementById("main-body"));
	
	console.log('dashboard binding applied');
  	
});
