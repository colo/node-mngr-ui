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
  mainBodyModel.dns = new DNSModel();
  //console.log('body');
  //console.log(mainBodyModel);
  ////ko.tasks.runEarly();
	
	ko.cleanNode(document.getElementById("main-body"));
	ko.applyBindings(mainBodyModel, document.getElementById("main-body"));
	
	//dns = new DNSModel();
	//ko.applyBindings(); 
  
  
		//ko.applyBindings({
        //zones: [
					//{zone: "aamepsi.com.ar"},
					//{zone: "academiadederecho.com.ar"}
				//]
    //});
	//ko.applyBindings(mainBodyModel, document.getElementById("main-body"));
  console.log('DNS binding applied');
  //ko.applyBindings(DNSBodyModel, document.getElementById("DNSBodyModel"));
		
});
