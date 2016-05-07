
head.ready('history'
, function() {
		 
	
  mainBodyModel.test = ko.observable({
	});
  
  
	ko.cleanNode(document.getElementById("main-body"));
	ko.applyBindings(mainBodyModel, document.getElementById("main-body"));
	
	console.log('test binding applied');
  	
});
