//head.load({ page: '/public/apps/os/index.css' });

var page_loaded = new Event('page_loaded');

function getURLParameter(name, URI) {
	URI = URI || location.search;
	
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(URI)||[,""])[1].replace(/\+/g, '%20'))||null;
}

var os_server = null;
var update_server = function (data){
	console.log('update_server');
	os_server = data;
}

var primary_iface = null;
var update_primary_iface = function (data){
	primary_iface = data;
}

//head.load({ jsonp: "/os/api/server/?callback=update_server" });
head.load({ jsonp: "/os/api/networkInterfaces/primary?callback=update_primary_iface" });

head.ready('jsonp', function(){
	head.ready('history'
	, function() {
	 
		var OSModel = new Class({
			Implements: [Options, Events],
			
			GB: (1024 * 1024 * 1024),
			MB: (1024 * 1024 ),
			KB: 1024,
			
			options : {
				current_base: 'GB',
			},
			
			initialize: function(options){
				var self = this;
				
				self.setOptions(options);
				
				self.primary_iface = primary_iface;
				
				
				self.primary_iface_out = ko.pureComputed(function(){
					console.log(self.networkInterfaces[primary_iface]());
					return (self.networkInterfaces[primary_iface]().transmited.bytes / self[self.options.current_base]).toFixed(2);
				});
				
				self.primary_iface_in = ko.pureComputed(function(){
					return (self.networkInterfaces[primary_iface]().recived.bytes / self[self.options.current_base]).toFixed(2);
				});
				//self.info = ko.observableArray([
				//]);
			}
		});
		
		var Page = new Class({
			Implements: [Options, Events],
			
			options: {
				assets: {
					js: {
						update_server: '/os/api/server/?callback=update_server',
					},
					css: {
						'index_css': '/public/apps/os/index.css'
					}
				},
			},
			
			initialize: function(options){
				var self = this;
				
				this.setOptions(options);

					console.log('assets');
					console.log(this.options.assets.css);

				
				if(this.options.assets && this.options.assets.css){
					
					Object.each(this.options.assets.css, function(css, id){
						
						 var css = Asset.css(css, {
							 id: id,
							 onLoad: function(){self.css_loaded({id: id, css: css})},
							 //onError: function(){console.log('css error: '+ id +' : '+css)},
							 //onAbort: function(){console.log('css aborted: '+ id +' : '+css)}
						 });
					});
					
				}
				
				if(this.options.assets && this.options.assets.js){
					
					Object.each(this.options.assets.js, function(js, id){
						
						 var js = Asset.javascript(js, {
							 id: id,
							 onLoad: function(){self.js_loaded({id: id, js: js})},
						 });
					});
					
				}
			},
			css_loaded: function(data){
				console.log('css loaded');
				console.log(data);
			},
			js_loaded: function(data){
				console.log('js loaded');
				console.log(data);
			},
			navigate: function(){
			}
		});	
		
		var current_page = new Page();
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
		
		var current_uri = new URI(window.location.pathname);
		console.log(current_uri.toString());
		//self.URI = window.location.protocol+'//'+window.location.host+window.location.pathname;
		
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
					
					Object.each(res.data, function(value, key){
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
								value = (value / os_model[os_model.options.current_base]).toFixed(2);
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
								console.log(OSModel.prototype[key][primary_iface]().recived.bytes);
							}
						}
						
					});
					
					pager.navigate(URI+param);//modify browser URL to match current request
					
					window.dispatchEvent(page_loaded);
				}
			});
		};
		
		load_page(current_uri.toString(), param);
		
		window.addEventListener('page_loaded', function(event){
			console.log('page_loaded ');
			
			if(mainBodyModel.os() == null){
					
				mainBodyModel.os(os_model);
				window.removeEventListener(page_loaded, this);//run just once
				
				//var get_loadavg_interval = window.setInterval(function(){
					//get_param('loadavg', function(err, res){
							//if(err){
								//console.log('Error:', err);
								//console.log('Response:', err.data);
							//}
							//else{
								//os_model.loadavg.removeAll();
								//Array.each(res.data, function(item, index){
									//os_model.loadavg.push(item.toFixed(2));
								//});
								
							//}
					//});
				//}, 1000);
				
				//var get_freemem_interval = window.setInterval(function(){
					//get_param('freemem', function(err, res){
							//if(err){
								//console.log('Error:', err);
								//console.log('Response:', err.data);
							//}
							//else{
								//os_model.freemem((res.data / os_model[os_model.options.current_base]).toFixed(2));
							//}
					//});
				//}, 1000);
				
				//var get_loadavg_interval = window.setInterval(function(){
					//get_param('loadavg', function(err, res){
							//if(err){
								//console.log('Error:', err);
								//console.log('Response:', err.data);
							//}
							//else{
								//os_model.loadavg.removeAll();
								//Array.each(res.data, function(item, index){
									//os_model.loadavg.push(item.toFixed(2));
								//});
								
							//}
					//});
				//}, 1000);
				
				//var get_pri_iface_interval = window.setInterval(function(){
					//get_param('networkInterfaces/'+primary_iface, function(err, res){
							//if(err){
								//console.log('Error:', err);
								//console.log('Response:', err.data);
							//}
							//else{
								//os_model.networkInterfaces[primary_iface](res.data);
								////os_model.freemem((res.data / (1024 * 1024 * 1004 )).toFixed(2));
							//}
					//});
				//}, 10000);
				
				
				//window.clearInterval(load_page_interval);
				
				console.log('os binding applied');
			}
		});
		
	});
});


