head.load({ page: '/public/apps/os/index.css' });

function getURLParameter(name, URI) {
	URI = URI || location.search;
	
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(URI)||[,""])[1].replace(/\+/g, '%20'))||null;
}

var os_server = null;
var update_server = function (data){
	os_server = data;
}

head.load({ jsonp: "/os/api/server/?callback=update_server" });

head.ready('jsonp', function(){
	head.ready('history'
	, function() {
	 
		var OSModel = function(){
			var self = this;
			
			self.info = ko.observableArray([
			]);
		
		
			var servers = [
					os_server
			];
			
			var client = resilient({
				 service: { 
					 basePath: '/os',
					 headers : { "Content-Type": "application/json" }
				 }
			});
		
			client.setServers(servers);
			
			self.URI = window.location.protocol+'//'+window.location.host+window.location.pathname;
			
			var param = '';
			
			load_page = function(URI, param){
				//console.log('loading...');
				//console.log('URI: '+URI);
				//console.log('param: ');
				//console.log(param);
				
				
				client.get('/'+param, function(err, res){
					if(err){
						console.log('Error:', err);
						console.log('Response:', err.data);
					}
					else{
						console.log('Ok:', res);
						console.log('Body:', res.data);
						console.log('headers');
						console.log(res.headers);
						
						//self.zones(res.data);
						console.log(res.data);
						
						Object.each(res.data, function(value, key){
							self.info.push({'key': key, 'value': value});
						});
						
						pager.navigate(URI+param);//modify browser URL to match current request 
					}
				});
			};
		
			load_page(self.URI, param);	
		
		};	
		
		if(mainBodyModel.os() == null){
			
			mainBodyModel.os(new OSModel());
			
			console.log('os binding applied');
			componentHandler.upgradeDom();
		}
	});
});
