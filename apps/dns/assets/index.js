//var DNSBodyModel = {};

//head.load([
	//{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
	//{ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }//no dependencies
//], function() {

var dns_server = null;
var update_server = function (data){
	dns_server = data;
}

head.load({ jsonp: "/dns/api/server/?callback=update_server" });

head.ready('jsonp', function(){
	head.ready('history',
	function() {
			 
		var DNSModel = function(){
			
			self = this;
			
			self.zones = ko.observableArray([
			]);
			
			console.log('dns server');
			console.log(dns_server);
			
			var servers = [
					dns_server
			];
			var client = resilient({
				 service: { 
					 basePath: '/bind',
					 headers : { "Content-Type": "application/json" }
				 }
			 });
			client.setServers(servers);
			

			client.get('/zones/', function(err, res){
				if(err){
					console.log('Error:', err);
					console.log('Response:', err.data);
				}
				else{
					console.log('Ok:', res);
					console.log('Body:', res.data);
					self.zones(res.data);
					//window.location.replace(res.headers.Link.split(';')[0].replace(/<|>/g, ''));
				}
			});
				
			//self.zones.extend({ rateLimit: 0 });
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
});
