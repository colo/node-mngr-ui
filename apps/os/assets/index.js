head.load({ page: '/public/apps/os/index.css' });

var page_loaded = new Event('page_loaded');

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
			
			//self.info = ko.observableArray([
			//]);
		};
	 
		var os_model = new OSModel();
		 
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
		
		var get_param = function(param, callback){
			console.log('get_params: '+param);
			client.get('/'+param, callback);
		};
		
		load_page = function(URI, param){
			//console.log('loading...');
			//console.log('URI: '+URI);
			//console.log('param: ');
			//console.log(param);
			
			get_param(param, function(err, res){
				if(err){
					console.log('Error:', err);
					console.log('Response:', err.data);
				}
				else{
					//console.log('Ok:', res);
					//console.log('Body:', res.data);
					//console.log('headers');
					//console.log(res.headers);
					
					//self.zones(res.data);
					//console.log(res.data);
					
					Object.each(res.data, function(value, key){
						//self.info.push({'key': key, 'value': value});
						//console.log(key+':'+value);
						//self[key](value);
						//if(OSModel.prototype[key]){
							//os_model[key](value);
						//}
						//else{
						console.log(typeof(value));
							if(key == 'loadavg'){
								var arr = [];
								Object.each(value, function(item, index){
									arr[index] = item.toFixed(2);
								});
								
								OSModel.prototype[key] = ko.observableArray(arr);

							}
							else{
								if(key.indexOf('mem') > 0){
									value = (value / (1024 * 1024 * 1004 )).toFixed(2);
								}
								
								if(typeof(value) == 'object'){
									OSModel.prototype[key] = {};
									Object.each(value, function(item, internal_key){
										OSModel.prototype[key][internal_key] = ko.observable(item);
									});
								}
								else{
									OSModel.prototype[key] = ko.observable(value);
								}
								
								if(key == 'networkInterfaces'){
									console.log(OSModel.prototype[key]['wlp0s19f2u5']().recived.bytes);
								}
							}
						//}
						
					});
					
					pager.navigate(URI+param);//modify browser URL to match current request
					
					window.dispatchEvent(page_loaded);
				}
			});
		};
		
		load_page(self.URI, param);
		
		window.addEventListener('page_loaded', function(event){
			console.log('page_loaded ');
			
			if(mainBodyModel.os() == null){
					
				mainBodyModel.os(os_model);
				window.removeEventListener(page_loaded, this);//run just once
				
				var get_loadavg_interval = window.setInterval(function(){
					get_param('loadavg', function(err, res){
							if(err){
								console.log('Error:', err);
								console.log('Response:', err.data);
							}
							else{
								os_model.loadavg.removeAll();
								Array.each(res.data, function(item, index){
									os_model.loadavg.push(item.toFixed(2));
								});
								
							}
					});
				}, 1000);
				
				var get_freemem_interval = window.setInterval(function(){
					get_param('freemem', function(err, res){
							if(err){
								console.log('Error:', err);
								console.log('Response:', err.data);
							}
							else{
								os_model.freemem((res.data / (1024 * 1024 * 1004 )).toFixed(2));
							}
					});
				}, 1000);
				
				var get_loadavg_interval = window.setInterval(function(){
					get_param('loadavg', function(err, res){
							if(err){
								console.log('Error:', err);
								console.log('Response:', err.data);
							}
							else{
								os_model.loadavg.removeAll();
								Array.each(res.data, function(item, index){
									os_model.loadavg.push(item.toFixed(2));
								});
								
							}
					});
				}, 1000);
				
				var get_pri_iface_interval = window.setInterval(function(){
					get_param('networkInterfaces/wlp0s19f2u5	', function(err, res){
							if(err){
								console.log('Error:', err);
								console.log('Response:', err.data);
							}
							else{
								os_model.networkInterfaces.wlp0s19f2u5(res.data);
								//os_model.freemem((res.data / (1024 * 1024 * 1004 )).toFixed(2));
							}
					});
				}, 10000);
				
				
				//window.clearInterval(load_page_interval);
				
				console.log('os binding applied');
			}
		});
		
	});
});


