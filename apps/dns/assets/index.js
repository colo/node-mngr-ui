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
			

			client.get('/zones/?start=0&end=9', function(err, res){
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
				

		};
		
		
		console.log(mainBodyModel.dns());
		
		if(mainBodyModel.dns() == null){

			mainBodyModel.dns(new DNSModel());

			console.log('DNS binding applied');

		}
			
	});
});
