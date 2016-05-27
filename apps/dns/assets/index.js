//var DNSBodyModel = {};

//head.load([
	//{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
	//{ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }//no dependencies
//], function() {

function getURLParameter(name, URI) {
	URI = URI || location.search;
	
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(URI)||[,""])[1].replace(/\+/g, '%20'))||null;
}

var dns_server = null;
var update_server = function (data){
	dns_server = data;
}

head.load({ jsonp: "/dns/api/server/?callback=update_server" });

head.load({ li: "/public/bower/li/lib/index.js" });//parse Link header

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
			
			var param = '?first=10';
			
			if(getURLParameter('start') && getURLParameter('start') >= 0){
				param = '?start='+getURLParameter('start');
				
				if(getURLParameter('end') && getURLParameter('end') >= 0){
					param += '&end='+getURLParameter('end');
				}
				else{
					var end = new Number(getURLParameter('start')) + 9;
					param += '&end='+end;
				}
			}
			
			console.log('start');
			console.log(getURLParameter('start'));
			console.log('end');
			console.log(getURLParameter('end'));
			
			console.log('param');
			console.log(param);
			
			//pager.navigate('http://localhost:8080/dns/?start='+start+'&end='+end);
			//console.log('pager.Page.getFullRoute()');
			var URI = window.location.protocol+'//'+window.location.host+window.location.pathname;
			
			pager.navigate(URI+'/'+param);//change window URI
			
			client.get('/zones/'+param, function(err, res){
				if(err){
					console.log('Error:', err);
					console.log('Response:', err.data);
				}
				else{
					console.log('Ok:', res);
					console.log('Body:', res.data);
					console.log('headers');
					console.log(res.headers);
					
					self.zones(res.data);
					
					//console.log(li.parse(res.headers.Link).next);
					//console.log(getURLParameter('start', li.parse(res.headers.Link).next));
					//console.log(getURLParameter('end', li.parse(res.headers.Link).next));
					
					//change URL only...nice!!!
					/*var start = getURLParameter('start', li.parse(res.headers.Link).next);
					var end = getURLParameter('end', li.parse(res.headers.Link).next);
					pager.navigate('http://localhost:8080/dns/?start='+start+'&end='+end);*/
					
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
