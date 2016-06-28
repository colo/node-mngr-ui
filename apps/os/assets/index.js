//head.load({ page: '/public/apps/os/index.css' });

//var page_loaded = new Event('page_loaded');

function getURLParameter(name, URI) {
	URI = URI || location.search;
	
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(URI)||[,""])[1].replace(/\+/g, '%20'))||null;
}

//var os_server = null;
//var update_server = function (data){
	//console.log('update_server');
	////os_server = data;
	//OSPage['os_server'] = data;
//}

//var primary_iface = null;
//var update_primary_iface = function (data){
	//primary_iface = data;
//}

//head.load({ jsonp: "/os/api/server/?callback=update_server" });
//head.load({ jsonp: "/os/api/networkInterfaces/primary?callback=update_primary_iface" });

//head.ready('jsonp', function(){
	head.ready('history'
	, function() {
		
	var OSModel = new Class({
		Implements: [Options, Events],
		
		GB: (1024 * 1024 * 1024),
		MB: (1024 * 1024 ),
		KB: 1024,
		
		//primary_iface: ko.observable('lo'),
		//hostname: ko.observable(null),
		//loadavg: ko.observableArray([]),
		//freemem: ko.observable(null),
		//totalmem: ko.observable(null),
		//networkInterfaces: {},
			
		options : {
			current_base: 'GB',
		},
		
		initialize: function(options){
			
			this.setOptions(options);
			
			//console.log('this.networkInterfaces');
			//console.log(this.primary_iface());
			
			this.primary_iface_out = ko.pureComputed(function(){
				console.log(this.networkInterfaces[this.primary_iface()]());
				return (this.networkInterfaces[this.primary_iface()]().transmited.bytes / this[this.options.current_base]).toFixed(2);
			}.bind(this));
			
			this.primary_iface_in = ko.pureComputed(function(){
				return (this.networkInterfaces[this.primary_iface()]().recived.bytes / this[this.options.current_base]).toFixed(2);
			}.bind(this));
			
			this.user_friendly_totalmem = ko.pureComputed(function(){
				return (this.totalmem() / this[this.options.current_base]).toFixed(2);
			}.bind(this));
			
			this.user_friendly_freemem = ko.pureComputed(function(){
				return (this.freemem() / this[this.options.current_base]).toFixed(2);
			}.bind(this));
			
			this.user_friendly_loadavg = ko.pureComputed(function(){
				var arr = [];
				console.log('user_friendly_loadavg');
				console.log(this.loadavg());
				Array.each(this.loadavg(), function(item, index){
					arr[index] = item.toFixed(2);
				}.bind(this));
				
				//console.log(arr);
				return arr;
				
			}.bind(this));
			
		}
	});
	
	var OSPage = new Class({
		Extends: Page,
		
		options: {
			assets: {
				js: {
				},
				css: {
					'index_css': '/public/apps/os/index.css'
				},
				jsonp: {
					update_server: '/os/api/server/',
					update_primary_iface: "/os/api/networkInterfaces/primary",
				}
			},
		},
		
		initialize: function(options){
			
			//this.addEvent(this.JSONP_LOADED+'_update_server', function(data){
				//console.log('this.JSONP_LOADED_update_server');
				//console.log(data);
			//});
			
			this.addEvent(this.JSONP_LOADED+'_update_server', function(data){
				console.log('this.JSONP_LOADED_update_server');
				console.log(data);
				
				var jsonRequest = new Request.JSON({
					url: data+'/os',
					onSuccess: function(server_data){
						console.log('server_data');
						console.log(server_data);
						
						Object.each(server_data, function(value, key){
							console.log('server_data: '+key);
							console.log(typeof(value));
							
							//if(key == 'loadavg'){
								//var arr = [];
								//Object.each(value, function(item, index){
									//arr[index] = item.toFixed(2);
								//});
								
								////OSModel[key] = ko.observableArray(arr);
								//var obj = {};
								//obj[key] = ko.observableArray(arr);
								//OSModel.implement(obj);

							//}
							//else{
								//if(key.indexOf('mem') > 0){
									//value = (value / OSModel[OSModel['options']['current_base']]).toFixed(2);
								//}
								
								
								if(typeof(value) == 'object'){
									var obj = {};
									
									if(value[0]){//is array, not object
										obj[key] = ko.observableArray();
										Object.each(value, function(item, index){
											obj[key].push(item);
										});
									}
									else{
										obj[key] = {};
										Object.each(value, function(item, internal_key){
											obj[key][internal_key] = ko.observable(item);
										});
									}
									
									OSModel.implement(obj);
									
								}
								else{
									var obj = {};
									obj[key] = ko.observable(value);
									OSModel.implement(obj);
								}
								
								//if(key == 'networkInterfaces'){
									//console.log('networkInterfaces.lo.recived.bytes');
									//console.log(OSModel['networkInterfaces']);
								//}
							//}
							
						});
						
						this.fireEvent(this.STARTED);
						
					}.bind(this)
				}).send();
				
			}.bind(this));
			
			this.addEvent(this.JSONP_LOADED+'_update_primary_iface', function(data){
				console.log('this.JSONP_LOADED');
				console.log(data);
				OSModel.implement({'primary_iface': ko.observable(data)});
				//OSModel['primary_iface'](data);
			});
			
			//this.addEvent(this.JSONP_LOADED, function(data){
				//console.log('this.JSONP_LOADED');
				//console.log(data);
			//});
			
			//this.model = new OSModel();
			
			//if(mainBodyModel.os() == null){
				//mainBodyModel.os(this.model);
			//}
			
			this.parent(options);
			
			
			//var servers = [
					//os_server
			//];
			
			//var client = resilient({
				 //service: { 
					 //basePath: '/os',
					 //headers : { "Content-Type": "application/json" }
				 //}
			//});
		
			//client.setServers(servers);
			
			var current_uri = new URI(window.location.pathname);
			console.log(current_uri.toString());
			//self.URI = window.location.protocol+'//'+window.location.host+window.location.pathname;
			
			//var param = '';
			
			//var get_param = function(param, callback){
				//console.log('get_params: '+param);
				//client.get('/'+param, callback);
			//};
			
			//load_page = function(URI, param){
				////console.log('loading...');
				////console.log('URI: '+URI);
				////console.log('param: ');
				////console.log(param);
				
				//get_param(param, function(err, res){
					//if(err){
						//console.log('Error:', err);
						//console.log('Response:', err.data);
					//}
					//else{
						
						//Object.each(res.data, function(value, key){
							//console.log(typeof(value));
							//if(key == 'loadavg'){
								//var arr = [];
								//Object.each(value, function(item, index){
									//arr[index] = item.toFixed(2);
								//});
								
								//OSModel.prototype[key] = ko.observableArray(arr);

							//}
							//else{
								//if(key.indexOf('mem') > 0){
									//value = (value / os_model[os_model.options.current_base]).toFixed(2);
								//}
								
								//if(typeof(value) == 'object'){
									//OSModel.prototype[key] = {};
									//Object.each(value, function(item, internal_key){
										//OSModel.prototype[key][internal_key] = ko.observable(item);
									//});
								//}
								//else{
									//OSModel.prototype[key] = ko.observable(value);
								//}
								
								//if(key == 'networkInterfaces'){
									//console.log(OSModel.prototype[key][primary_iface]().recived.bytes);
								//}
							//}
							
						//});
						
						//pager.navigate(URI+param);//modify browser URL to match current request
						
						//window.dispatchEvent(page_loaded);
					//}
				//});
			//};
			
			//load_page(current_uri.toString(), param);
			
			//window.addEventListener('page_loaded', function(event){
				//console.log('page_loaded ');
				
				//if(mainBodyModel.os() == null){
						
					//mainBodyModel.os(os_model);
					//window.removeEventListener(page_loaded, this);//run just once
					
					////var get_loadavg_interval = window.setInterval(function(){
						////get_param('loadavg', function(err, res){
								////if(err){
									////console.log('Error:', err);
									////console.log('Response:', err.data);
								////}
								////else{
									////os_model.loadavg.removeAll();
									////Array.each(res.data, function(item, index){
										////os_model.loadavg.push(item.toFixed(2));
									////});
									
								////}
						////});
					////}, 1000);
					
					////var get_freemem_interval = window.setInterval(function(){
						////get_param('freemem', function(err, res){
								////if(err){
									////console.log('Error:', err);
									////console.log('Response:', err.data);
								////}
								////else{
									////os_model.freemem((res.data / os_model[os_model.options.current_base]).toFixed(2));
								////}
						////});
					////}, 1000);
					
					////var get_loadavg_interval = window.setInterval(function(){
						////get_param('loadavg', function(err, res){
								////if(err){
									////console.log('Error:', err);
									////console.log('Response:', err.data);
								////}
								////else{
									////os_model.loadavg.removeAll();
									////Array.each(res.data, function(item, index){
										////os_model.loadavg.push(item.toFixed(2));
									////});
									
								////}
						////});
					////}, 1000);
					
					////var get_pri_iface_interval = window.setInterval(function(){
						////get_param('networkInterfaces/'+primary_iface, function(err, res){
								////if(err){
									////console.log('Error:', err);
									////console.log('Response:', err.data);
								////}
								////else{
									////os_model.networkInterfaces[primary_iface](res.data);
									//////os_model.freemem((res.data / (1024 * 1024 * 1004 )).toFixed(2));
								////}
						////});
					////}, 10000);
					
					
					////window.clearInterval(load_page_interval);
					
					//console.log('os binding applied');
				//}
			//});
			
		},
	});	
		
	var os_page = new OSPage();
	//if(mainBodyModel.os() == null){
			
		////console.log(OSModel['hostname']());
		
		//mainBodyModel.os(new OSModel());
	//}
		
	os_page.addEvent(os_page.STARTED, function(){
		console.log('page started');
		os_page.model = new OSModel();
		
		if(mainBodyModel.os() == null){
			
			//console.log(os_page.model['networkInterfaces']);
			
			console.log('os binding applied');
			
			mainBodyModel.os(os_page.model);
			
		}
	});	
		
	});
//});


