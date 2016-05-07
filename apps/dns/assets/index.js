//var DNSBodyModel = {};

//head.load([
	//{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
	//{ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }//no dependencies
//], function() {
head.ready('history'
, function() {
		 
	var DNSModel = function(){
		
		self = this;
		
		self.zones = ko.observableArray([
			{zone: "aamepsi.com.ar"},
			{zone: "academiadederecho.com.ar"}
		]);
		
		self.zones.extend({ rateLimit: 0 });
  };
  
  //DNSBodyModel = {
		//dns: new DNSModel()
  //}
  //mainBodyModel= {
		//dns: new DNSModel()
  //}
  //mainBodyModel.dns = ko.observable({
		//zones : [
			//{zone: "aamepsi.com.ar"},
			//{zone: "academiadederecho.com.ar"}
		//]
	//});
	
	//var DNSModel = {
		
		//zones: ko.observableArray([
			//{zone: "aamepsi.com.ar"},
			//{zone: "academiadederecho.com.ar"}
		//])

  //};
  
	console.log(mainBodyModel.dns());
	
	if(mainBodyModel.dns() == null){
		//mainBodyModel.dns(DNSModel);
		mainBodyModel.dns(new DNSModel());
		//console.log('body');
		//console.log(mainBodyModel);
		////ko.tasks.runEarly();
		
		//ko.cleanNode(document.getElementById("main-body"));
		//ko.applyBindings(mainBodyModel, document.getElementById("main-body"));
		console.log('DNS binding applied');
		//mainBodyModel.dns().zones([
			//{zone: "aamepsi.com.ar"},
			//{zone: "academiadederecho.com.ar"}
		//]);
		//mainBodyModel.dns().zones.push({zone: "aamepsi.com.ar"});
	}
	
	//dns = new DNSModel();
	//ko.applyBindings(); 
  
  
		//ko.applyBindings({
        //zones: [
					//{zone: "aamepsi.com.ar"},
					//{zone: "academiadederecho.com.ar"}
				//]
    //});
	//ko.applyBindings(mainBodyModel, document.getElementById("main-body"));
  
  //ko.applyBindings(DNSBodyModel, document.getElementById("DNSBodyModel"));
		
});
