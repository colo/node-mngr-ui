
function getURLParameter(name, URI) {
	URI = URI || location.search;
	
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(URI)||[,""])[1].replace(/\+/g, '%20'))||null;
}


//head.ready('jsonp', function(){
	head.ready('history'
	, function() {
	//head.js({ flot: "/public/bower/gentelella/vendors/Flot/jquery.flot.js" }, function(){
		//head.js({ flot_pie: "/public/bower/gentelella/vendors/Flot/jquery.flot.pie.js" }, function(){
		//head.js({ flot_time: "/public/bower/gentelella/vendors/Flot/jquery.flot.time.js" }, function(){
		//head.js({ flot_stack: "/public/bower/gentelella/vendors/Flot/jquery.flot.stack.js" }, function(){
		//head.js({ flot_resize: "/public/bower/gentelella/vendors/Flot/jquery.flot.resize.js" }, function(){
		//head.js({ flot_orderBars: "/public/bower/gentelella/production/js/flot/jquery.flot.orderBars.js" }, function(){
		//head.js({ flot_date: "/public/bower/gentelella/production/js/flot/date.js" }, function(){
		//head.js({ flot_spline: "/public/bower/gentelella/production/js/flot/jquery.flot.spline.js" }, function(){
		//head.js({ flot_curvedLines: "/public/bower/gentelella/production/js/flot/curvedLines.js" }, function(){
		//})})})})})})})})});
		head.js({ sprintf: '/public/bower/sprintf/dist/sprintf.min.js' });
		
		head.js({ model: "/public/apps/os/model.js" }, function(){
			var OSPage = new Class({
				Extends: Page,
				
				ON_PERIODICAL_REQUEST_TIMEOUT: 'onPeriodicalRequestTimeout',
				ON_PERIODICAL_REQUEST_FAILURE: 'onPeriodicalRequestFailure',
				
				server: null,
				timed_request: {},
				
				//plot: null,
				//plot_data: [],
				//plot_data_order: ['cpus', 'loadavg', 'freemem', 'sda_stats'],
				
				timed_request: {},
				timed_request_queue: null,
				
				periodical_functions: {},
				periodical_functions_timers : {
					'page': {},
					'model':{}
				},
				
				options: {
					assets: {
						js: [
							//{ sprintf: '/public/bower/sprintf/dist/sprintf.min.js' },
							{ gentelella_deps: [
									{ bootstrap: "/public/bower/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js" },
									{ Chart: "/public/bower/gentelella/vendors/Chart.js/dist/Chart.min.js" },
								]
							}
						],
						css: {
							'index_css': '/public/apps/os/index.css'
						},
						jsonp: {
							update_server: '/os/api/server/',
							update_primary_iface: "/os/api/networkInterfaces/primary",
						}
					},
					
					requests: {
						periodical: {
							_defaults: {
								url: '?type=status&limit=1&range[start]=%d&range[end]=%d',
								//url: '?type=status&limit=1',
								method: 'get',
								initialDelay: 5000,
								delay: 5000,
								limit: 5000,
								noCache: true
							},
							
							loadavg : {
								url: '/os/api/loadavg'
							},
							freemem: {
								url: '/os/api/freemem'
							},
							cpus: {
								url: '/os/api/cpus'
							},
							uptime: {
								url: '/os/api/uptime'
							},
							primary_iface: {
								url: function(){ return '/os/api/networkInterfaces/' +os_page.primary_iface; }.bind(this),
								onSuccess: function(doc){
									//console.log('myRequests.'+os_page.model.primary_iface());
									//console.log(doc);
									os_page.model.networkInterfaces[os_page.model.primary_iface()](doc.data[os_page.model.primary_iface()]);
								}.bind(this)
							},
							sda_stats: {
								url: function(){ 
									/** return chosen blkdev */
									return '/os/api/blockdevices/sda/stats';
								}.bind(this),
								onSuccess: function(doc){
									//console.log('myRequests.sda_stats: ');
									//console.log(doc);
									
									/**
									 * save previous stats, needed to calculate times (updated stats - prev_stats)
									 * */
									//os_page.model.blockdevices.sda._prev_stats = os_page.model.blockdevices.sda.stats();
									
									os_page.model.blockdevices.sda.stats(doc.data);
									
									//os_page._update_plot_data('sda_stats', doc.metadata.timestamp);
								}
							}
						},
						update_model: ['/os/api', '/os/api/blockdevices', '/os/api/mounts']
					},
					
					
				},
				
				initialize: function(options){
					
					root_page.addEvent('beforeHide_os', function(){
						
						this.stop_timed_requests();
						this.stop_periodical_functions();
						
					}.bind(this));
					
					root_page.addEvent('afterShow_os', function(){
						
						this.start_timed_requests();
						this.start_periodical_functions();
						
					}.bind(this));
					
					//var stop_start_periodical_requests = function(){
						////console.log('stop_start_periodical_requests');
						
						//this.stop_timed_requests();
						//this.start_timed_requests();
					//};
					
					//this.addEvent(this.ON_PERIODICAL_REQUEST_TIMEOUT, stop_start_periodical_requests.bind(this));
					//this.addEvent(this.ON_PERIODICAL_REQUEST_FAILURE, stop_start_periodical_requests.bind(this));
					
					this.addEvent(this.JSONP_LOADED+'_update_server', function(data){
						this.server = data;
						
						this._request_update_model(this.options.requests.update_model);
						
					}.bind(this));
					
					this.addEvent(this.JSONP_LOADED+'_update_primary_iface', function(data){
						
						this.primary_iface = data;
						OSModel.implement({'primary_iface': ko.observable(data)});
					});
					
					this.parent(options);
					
					
					var current_uri = new URI(window.location.pathname);
					
				},
				_request_update_model(urls){
					var self = this;
					urls = (typeOf(urls) == 'array') ? urls : [urls];
					
					var requests = {}
					
					Array.each(urls, function(url){
						var id = url.replace('/api', '');
						id = id.split('/');//split to get last portion (ex: 'os', 'blockdevices'....)
						id = id[id.length - 1]; //last part would be "/api"
						
						requests[id] = new Request.JSON({
							method: 'get',
							secure: true,
							url: this.server+url+'?type=info',
							onSuccess: function(server_data){
								
								this._apply_data_model(server_data, id);
								
							}.bind(this)
						});
						
					}.bind(this));
					
						
					var success_request = [];
					
					var myQueue = new Request.Queue({
						requests: requests,
						onSuccess: function(name, instance, data){
							
							success_request.push(name);
							/**
							 * compare the every key of "request" with "success_request", return tru when all keys (request) are found
							 * 
							 * */
							var all_success = Object.keys(requests).every(function(req){
								return (success_request.indexOf(req) >= 0) ? true : false;
							});
							
							
							if(all_success)
								self.fireEvent(self.STARTED);	
								
						},
						onEnd: function(){
							//////console.log('queue.onEnd');
						}
					});
					
					Object.each(requests, function(req){
						req.send();
					});
					//requests.jsonRequest.send();
				},
				_apply_data_model: function(server_data, id){
					
					delete server_data._id;
					delete server_data._rev;
					delete server_data.metadata;
					
					if(server_data.data)
						server_data = server_data.data;
					
					
					
					//var obj = ko.observable({});
					var obj = {};
					
					if(typeOf(server_data) == 'array'){	
						obj[id] = [];
						
						Array.each(server_data, function(value, key){
							//////console.log(this._implementable_model_object(value, key)[key]);
							obj[id].push(this._implementable_model_object(value, key)[key]);
							
							if(obj[id].length == Object.getLength(server_data)){
										
								OSModel.implement(obj);
							}
							
						}.bind(this));
						
						//////console.log(obj);
					}
					else{
						obj[id] = {};
						//if(id == 'blockdevices'){
						////console.log('server_data: ');
						////console.log(server_data);
						//}
										
						Object.each(server_data, function(value, key){
							
							if(id != 'os'){
							
								//obj[id].push(this._implementable_model_object(value, key));
								//obj[id][key] = {};
								obj[id] = Object.merge(obj[id], this._implementable_model_object(value, key));
								
								if(id == 'blockdevices'){
									//console.log('server_data: '+id+':'+key);
									//console.log(obj);
								}
								else if(id == 'mounts'){
									//console.log('server_data: '+id+':'+key);
									//console.log(obj);
								}
								//if(obj[id].length == Object.getLength(server_data)){
								if(Object.getLength(obj[id]) == Object.getLength(server_data)){
									
									OSModel.implement(obj);
								}
							}
							else{
								
								OSModel.implement(this._implementable_model_object(value, key));
							}
							
						}.bind(this));
					}
				},
				_implementable_model_object(value, key){
					var obj = {};

					if(typeof(value) == 'object'){
						
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
							
							//////console.log('_implementable_model_object: '+key);
							////////console.log(typeof(value));
							//////console.log(obj);
						}
						
						
						
					}
					else{
						var obj = {};
						obj[key] = ko.observable(value);
						//OSModel.implement(obj);
					}
					
					return obj;
				},
				
				_define_timed_requests: function(){
					var self = this;
					
					//console.log('_define_timed_requests');
					
					
					Object.each(this.options.requests.periodical, function(req, key){
						if(key.charAt(0) != '_'){
							var default_req = Object.append(
								{
									onSuccess: function(doc){
										//console.log('myRequests.'+key);
										////console.log(doc);

										self.model[key](doc.data);
										
										//self._update_plot_data(key, doc.metadata.timestamp);
									},
									onFailure: function(){
										//console.log('onFailure');
										self.fireEvent(self.ON_PERIODICAL_REQUEST_FAILURE);
									},
									onTimeout: function(){
										//console.log('onTimeout');
										self.fireEvent(self.ON_PERIODICAL_REQUEST_TIMEOUT);
									}
								},
								this.options.requests.periodical._defaults
							);
							
							default_req.url = sprintf(default_req.url, -10000, -0);
					
							//console.log('KEY '+key);
							
							if(typeOf(req.url) == 'function')
								req.url = req.url();
								
							req.url = this.server + req.url + default_req.url;
							
							//console.log(Object.merge(
								//Object.clone(default_req),
								//req
							//));
								
							this.timed_request[key] = new Request.JSON(
								Object.merge(
									Object.clone(default_req),
									req
								)
							);
						}
					}.bind(this));
					

				}.protect(),
				_define_queued_requests: function(){
					
					var requests = {};
					requests = Object.merge(requests, this.timed_request);
					
					this.timed_request_queue = new Request.Queue({
						requests: this.timed_request,
						stopOnFailure: false,
						concurrent: 10,
						onComplete: function(name, instance, text, xml){
								////////console.log('queue: ' + name + ' response: ', text, xml);
						}
					});
				}.protect(),
				start_timed_requests: function(){
					//console.log('start_timed_requests');
					
					
					
					Object.each(this.timed_request, function(req, key){
						//console.log('starting.... '+key);
						
						req.startTimer();
					});
					
					//this.timed_request_queue.resume();
				},
				stop_timed_requests: function(){
					//////console.log('stop_timed_requests');
					Object.each(this.timed_request, function(req){
						req.stopTimer();
					});
				},
				start_periodical_functions: function(){
					console.log('start_periodical_functions');
					
					Object.each(this.periodical_functions, function(data, key){
						console.log('starting.... '+key);
						
						if(!this.periodical_functions_timers['page'][key])
							this.periodical_functions_timers['page'][key] = data.fn.periodical(data.interval);
							
					}.bind(this));
					
					Object.each(this.model.periodical_functions, function(data, key){
						console.log('model starting.... '+key);
						
						if(!this.periodical_functions_timers['model'][key]){
							this.periodical_functions_timers['model'][key] = data.fn.periodical(data.interval);
							console.log('...STARTED!!!');
						}
							
					}.bind(this));
					
					
				},
				stop_periodical_functions: function(){
					console.log('stop_periodical_functions');
					
					Object.each(this.periodical_functions_timers['page'], function(timer, key){
						console.log('stoping.... '+key);
						
						clearInterval(timer);
						delete this.periodical_functions_timers['page'][key];
						
					}.bind(this));
					
					Object.each(this.periodical_functions_timers['model'], function(timer, key){
						console.log('model stoping.... '+key);
						//console.log(timer);
						
						clearInterval(timer);
						delete this.periodical_functions_timers['model'][key];
						
					}.bind(this));
					
				},
				_load_plots: function(){
					var now = new Date();
					//console.log('LOAD PLOTS')
					
					var self = this;
					////console.log(self.model);
					
					new Request.JSON({
						url: this.server+'/os/api/cpus?type=status&range[start]='+(now.getTime() - 120000) +'&range[end]='+(now.getTime()),
						method: 'get',
						//initialDelay: 1000,
						//delay: 2000,
						//limit: 10000,
						onSuccess: function(docs){
							var cpu = [];
							//console.log('myRequests.cpus: ');
							////console.log(docs);
							
							var last = {
								user: 0,
								nice: 0,
								sys: 0,
								idle: 0
							};
							/** docs come from lastes [0] to oldest [N-1] */
							for(var i = docs.length - 1; i >= 0; i--){
								var doc = docs[i];
								
								var cpu_usage = {
									user: 0,
									nice: 0,
									sys: 0,
									idle: 0
								};
								Array.each(doc.data, function(cpu){
				
									cpu_usage.user += cpu.times.user;
									cpu_usage.nice += cpu.times.nice;
									cpu_usage.sys += cpu.times.sys;
									cpu_usage.idle += cpu.times.idle;

								});
								
								var percentage = self.model.cpu_usage_percentage(last, cpu_usage);
								
								last = Object.clone(cpu_usage);
								
								////console.log(percentage);
								
								self.model._update_plot_data('cpus', percentage['usage'].toFloat(), doc.metadata.timestamp);
								
								
							}
							
						}
					}).send();
					
					new Request.JSON({
						url: this.server+'/os/api/freemem?type=status&range[start]='+(now.getTime() - 120000) +'&range[end]='+(now.getTime()),
						method: 'get',
						//initialDelay: 1000,
						//delay: 2000,
						//limit: 10000,
						onSuccess: function(docs){
							var cpu = [];
							//console.log('myRequests.freemem: ');
							////console.log(docs);
							/** docs come from lastes [0] to oldest [N-1] */
							for(var i = docs.length - 1; i >= 0; i--){
								var doc = docs[i];
								
								self.model._update_plot_data('freemem', (((self.model.totalmem() - doc.data) * 100) / self.model.totalmem()).toFixed(2), doc.metadata.timestamp);
								
							}
								
						}
							
						
					}).send();
					
					new Request.JSON({
						url: this.server+'/os/api/loadavg?type=status&range[start]='+(now.getTime() - 120000) +'&range[end]='+(now.getTime()),
						method: 'get',
						//initialDelay: 1000,
						//delay: 2000,
						//limit: 10000,
						onSuccess: function(docs){
							var cpu = [];
							//console.log('myRequests.loadavg: ');
							////console.log(docs);
							/** docs come from lastes [0] to oldest [N-1] */
							for(var i = docs.length - 1; i >= 0; i--){
								var doc = docs[i];
								////console.log(doc.data[0].toFloat())
								self.model._update_plot_data('loadavg', doc.data[0].toFloat(), doc.metadata.timestamp);
								
							}
								
						}
							
						
					}).send();
					
					new Request.JSON({
						url: this.server+'/os/api/blockdevices/sda/stats?type=status&range[start]='+(now.getTime() - 120000) +'&range[end]='+(now.getTime()),
						method: 'get',
						//initialDelay: 1000,
						//delay: 2000,
						//limit: 10000,
						onSuccess: function(docs){
							//console.log('myRequests.sda_stats: ');
							//console.log(docs);
							
							var last_time_in_queue = 0;
							
							/** docs come from lastes [0] to oldest [N-1] */
							for(var i = docs.length - 1; i >= 0; i--){
								var doc = docs[i];
								
								var time_in_queue = doc.data.time_in_queue;
								
								var percentage = self.model._blockdevice_percentage_data(last_time_in_queue, time_in_queue);
								
								last_time_in_queue = time_in_queue;
								
								////console.log(percentage);
								
								self.model._update_plot_data('sda_stats', percentage, doc.metadata.timestamp);
								
							}
								
						}
							
						
					}).send();
				},
				
				
			});	
				
			var os_page = new OSPage();
				
			os_page.addEvent(os_page.STARTED, function(){
				
				var self = this;
				
				console.log('page started');
				
				if(mainBodyModel.os() == null){
					
					if(!self.model){
						self.model = new OSModel();
						mainBodyModel.os(self.model);
					}
					else{
						self.model = mainBodyModel.os();
					}
						
					////////console.log(os_page.model['networkInterfaces']);
					
					//////console.log('os binding applied');
					
					
					
					
					
					this._define_timed_requests();
				
					this._define_queued_requests();
					
					this.start_timed_requests();
					
					
					//this._load_plots();
					
					ko.tasks.schedule(this._load_plots.bind(this));
				
					//if(Object.getLength(this.periodical_functions_timers['page']) == 0 && 
						//Object.getLength(this.periodical_functions_timers['model']) == 0){
							
					ko.tasks.schedule(this.start_periodical_functions.bind(this));
				}
				
				//this._load_charts();
				
				
				//}
				//ko.tasks.schedule(function () {
					//////console.log('my microtask');
					//this._load_plots();
					
					//this.start_periodical_functions();
				//}.bind(this));
		
				//head.ready("flot_curvedLines", function(){
					//////console.log('_load_plots');
					//this._load_plots();
				//}.bind(this));
				
				
				
				
			});	
			
		});
	});
//});


		

