
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
				
				ON_HISTORICAL_REQUEST_TIMEOUT: 'onHistoricalRequestTimeout',
				ON_HISTORICAL_REQUEST_FAILURE: 'onHistoricalRequestFailure',
				
				server: null,
				timed_request: {},
				
				timed_request: {},
				timed_request_queue: null,
				
				historical_request: {},
				historical_request_queue: null,
				
				periodical_functions: {},
				periodical_functions_timers : {
					'page': {},
					'model':{}
				},
				
				update_model_success: [],
				
				options: {
					assets: {
						js: [
							//{ pouchdb: "/public/bower/pouchdb/dist/pouchdb.min.js"} ,
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
								initialDelay: 2000,
								delay: 2000,
								limit: 4000,
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
									console.log('myRequests.sda_stats: ');
									console.log(doc);
									
									/**
									 * save previous stats, needed to calculate times (updated stats - prev_stats)
									 * */
									//os_page.model.blockdevices.sda._prev_stats = os_page.model.blockdevices.sda.stats();
									
									doc.data.timestamp = doc.metadata.timestamp;
									
									os_page.model.blockdevices.sda.stats(doc.data);
									
									//os_page._update_plot_data('sda_stats', doc.metadata.timestamp);
								}
							}
						},
						
						historical: {
							_defaults: {
								url: '?type=status&range[start]=%d&range[end]=%d',
								method: 'get',
							},
							loadavg : {
								url: '/os/api/loadavg',
								onSuccess: function(docs){
									var cpu = [];
									console.log('historical.loadavg: ');
									////console.log(docs);
									/** docs come from lastes [0] to oldest [N-1] */
									for(var i = docs.length - 1; i >= 0; i--){
										var doc = docs[i];
										////console.log(doc.data[0].toFloat())
										os_page.model._update_plot_data('loadavg', doc.data[0].toFloat(), doc.metadata.timestamp);
										
									}
										
								}
							},
							freemem: {
								url: '/os/api/freemem',
								onSuccess: function(docs){
									var cpu = [];
									console.log('historical.freemem: ');
									////console.log(docs);
									/** docs come from lastes [0] to oldest [N-1] */
									for(var i = docs.length - 1; i >= 0; i--){
										var doc = docs[i];
										
										os_page.model._update_plot_data('freemem', (((os_page.model.totalmem() - doc.data) * 100) / os_page.model.totalmem()).toFixed(2), doc.metadata.timestamp);
										
									}
										
								}
							},
							cpus: {
								url: '/os/api/cpus',
								onSuccess: function(docs){
									var cpu = [];
									console.log('historical.cpus: ');
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
										
										var percentage = os_page.model.cpu_usage_percentage(last, cpu_usage);
										
										last = Object.clone(cpu_usage);
										
										////console.log(percentage);
										
										os_page.model._update_plot_data('cpus', percentage['usage'].toFloat(), doc.metadata.timestamp);
										
										
									}
									
								}
							},
							sda_stats: {
								url: function(){ 
									/** return chosen blkdev */
									return '/os/api/blockdevices/sda/stats';
								}.bind(this),
								onSuccess: function(docs){
									console.log('historical.sda_stats: ');
									//console.log(docs);
									
									//var io_ticks = 0;
									var last_doc = null;
									
									///** docs come from lastes [0] to oldest [N-1] */
									for(var i = docs.length - 1; i >= 0; i--){
										var doc = docs[i];
										doc.data.timestamp = docs[i].metadata.timestamp;
										
										//var io_ticks = doc.data.io_ticks;
										
										if(last_doc){
											var percentage = os_page.model._blockdevice_percentage_data(last_doc, doc.data);
											os_page.model._update_plot_data('sda_stats', percentage, doc.metadata.timestamp);
										}
										
										last_doc = doc.data;
										//last_time_in_queue = time_in_queue;
										
										////console.log(percentage);
										
										
										
									}
										
								}
								
							}
						},
						update_model: ['/os/api', '/os/api/blockdevices', '/os/api/mounts'],
						
						
					},
					
					docs:{
						buffer_size: 5,
						timer: 5, //seconds
					}
				},
				_define_historical_requests: function(){
					var now = new Date();
					
					var self = this;
					
					Object.each(this.options.requests.historical, function(req, key){
						if(key.charAt(0) != '_'){
							var default_req = Object.append(
								{
									onSuccess: function(docs){
										console.log('DEFAULT REQ onSuccess');
										console.log(docs);
										if(docs.length > 0){
											Array.each(docs, function(doc){
												delete doc._rev;
											});
											
											self.db.bulkDocs(docs)
											.catch(function (err) {
												console.log(err);
											});
											
										}
									},
									onFailure: function(){
										self.fireEvent(self.ON_HISTORICAL_REQUEST_FAILURE);
									},
									onTimeout: function(){
										self.fireEvent(self.ON_HISTORICAL_REQUEST_TIMEOUT);
									}
								},
								this.options.requests.historical._defaults
							);
							
							default_req.url = sprintf(default_req.url, (now.getTime() - 120000), now.getTime());
					
							if(typeOf(req.url) == 'function')
								req.url = req.url();
								
							req.url = this.server + req.url + default_req.url;
							
							//console.log(Object.merge(
								//Object.clone(default_req),
								//req
							//));
							
							//var onSuccess = function(docs){
								//default_req.onSuccess(docs);
								//req.onSuccess(docs);
							//};
							
							/** 'attemp' method needs [] for passing and array, or it will take 'docs' as multiple params */
							var onSuccess = function(docs){
								//default_req.onSuccess(doc);
								default_req.onSuccess.attempt([docs], this);
								if(req.onSuccess)
									req.onSuccess.attempt([docs], this);
									//req.onSuccess(doc);
							};
							
							this.historical_request[key] = new Request.JSON(
								Object.merge(
									Object.clone(default_req),
									req,
									{'onSuccess': onSuccess.bind(this)}
								)
							);
						}
					}.bind(this));
				},
				_load_plots: function(){
					Object.each(this.historical_request, function(req, key){
						req.send();
					});
				},
				initialize: function(options){
					//var self = this;
					
							
					//PouchDB.debug.enable('*');
					PouchDB.debug.disable('*');
					window.PouchDB = PouchDB;
					
					this.db = new PouchDB('dashboard');
					//window.PouchDB = this.db;
					
					
					//this.db.info().then(function (info) {
						//console.log(info);
					//})
					var self = this;
					/** check if views are in the DB */
					this.db.get('_design/info')
					.catch(function (err) {
						console.log(err);
						if (err.status == 404) {//if not found, load and insert
							
							self.addEvent(self.JS_LOADED+'_InfoView', function(){
								self.db.put(InfoView);
							});
							
							self.load_js({ InfoView : '/public/apps/os/_views/InfoView.js'});
						}
						// ignore if doc already exists
					})
					.then(function (doc) {
						
					});
					
					this.db.get('_design/status')
					.catch(function (err) {
						console.log(err);
						if (err.status == 404) {//if not found, load and insert
							
							self.addEvent(self.JS_LOADED+'_StatusView', function(){
								self.db.put(StatusView);
							});
							
							self.load_js({ StatusView : '/public/apps/os/_views/StatusView.js'});
						}
						// ignore if doc already exists
					})
					.then(function (doc) {
						//console.log(doc);
						
					});
					/** ---------------- */
					
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
						
						this._update_model(this.options.requests.update_model);
						
					}.bind(this));
					
					this.addEvent(this.JSONP_LOADED+'_update_primary_iface', function(data){
						
						this.primary_iface = data;
						OSModel.implement({'primary_iface': ko.observable(data)});
					});
					
					this.parent(options);
					
					var now = new Date().getTime();
					
					this.docs = {
						'buffer': [],
						'timer': (now + (self.options.docs.timer * 1000)),
					};
					
					var current_uri = new URI(window.location.pathname);
					
				},
				_update_model(urls){
					var self = this;
					urls = (typeOf(urls) == 'array') ? urls : [urls];
					
					var requests = {}
					
					Array.each(urls, function(url){
						var id = url.replace('/api', '');
						id = id.replace(/\//g, '.');
						
						var doc_key = id.replace('.', '');
						console.log('DOCS');
						console.log(doc_key);
						
						id = id.split('.');//split to get last portion (ex: 'os', 'blockdevices'....)
						id = id[id.length - 1];
						
						console.log('REQUESTS');
						console.log(id);
						
						requests[id] = null;//store id to use it to check wich doc/request has updated the model
						
						self.db.query('info/by_path_host', {
							descending: true,
							inclusive_end: true,
							include_docs: true,
							limit: 1,
							startkey: [ doc_key, 'localhost.colo￰' ],
							endkey: [ doc_key, 'localhost.colo' ] 
						})
						.then(function (response) {
							console.log('info/by_path_host/'+doc_key);
							console.log(response);
							
							//console.log(response.rows[0].doc);
							if(response.rows[0]){//there is a doc, update model with this data
								self._apply_data_model(response.rows[0].doc, id);
								
								self.update_model_success.push(id);
								/**
								 * compare the every key of "request" with "success_request", return true when all keys (request) are found
								 * 
								 * */
								var all_success = Object.keys(requests).every(function(req){
									return (self.update_model_success.indexOf(req) >= 0) ? true : false;
								});
								
								
								if(all_success){
									console.log('doc.ALLonSuccess');
									self.fireEvent(self.STARTED);
								}
							}
							else{
								throw new Error('no doc');
							}
							
						})
						.catch(function (err) {
							console.log('err');
							console.log(err);
							
							requests[id] = new Request.JSON({
								method: 'get',
								secure: true,
								url: self.server+url+'?type=info',
								onSuccess: function(server_data){
									console.log('onSuccess to apply');
									console.log(server_data);
									
									doc = Object.clone(server_data);
									delete doc._rev;
									
									/** insert on local db, so we can avoid this request next time */
									self.db.put(doc).catch(function (err) {
										console.log('err');
										console.log(err);
									});
									
									self._apply_data_model(server_data, id);
									
									self.update_model_success.push(id);
									/**
									 * compare the every key of "request" with "success_request", return true when all keys (request) are found
									 * 
									 * */
									var all_success = Object.keys(requests).every(function(req){
										//return (success_request.indexOf(req) >= 0) ? true : false;
										return (self.update_model_success.indexOf(req) >= 0) ? true : false;
									});
									
									
									if(all_success){
										console.log('req.ALLonSuccess');
										self.fireEvent(self.STARTED);
									}
									
								}.bind(this)
							});
							
							requests[id].send();
							
						});
						
						
						
					}.bind(this));
					
				},
				_apply_data_model: function(server_data, id){
					
					delete server_data._id;
					delete server_data._rev;
					var timestamp = server_data.metadata.timestamp;
					//delete server_data.metadata;
					
					if(server_data.data)
						server_data = server_data.data;
					
					
					
					//var obj = ko.observable({});
					var obj = {};
					
					if(typeOf(server_data) == 'array'){	
						obj[id] = [];
						
						Array.each(server_data, function(value, key){
							//////console.log(this._implementable_model_object(value, key)[key]);
							obj[id].push( Object.merge({ timestamp: timestamp}, this._implementable_model_object(value, key)[key]));
							
							if(obj[id].length == Object.getLength(server_data)){
								
								//console.log('IMPLEMENTING...');
								//console.log(obj);
								
								OSModel.implement(obj);
							}
							
						}.bind(this));

					}
					else{
						obj[id] = {};
										
						Object.each(server_data, function(value, key){
							
							if(id != 'os'){
							
								//obj[id].push(this._implementable_model_object(value, key));
								//obj[id][key] = {};
								obj[id] = Object.merge(obj[id], this._implementable_model_object(value, key));
								
								//if(obj[id].length == Object.getLength(server_data)){
								
								if(Object.getLength(obj[id]) == Object.getLength(server_data)){
									obj[id]['timestamp'] = timestamp;
									OSModel.implement(obj);
								}
								
							}
							else{
								OSModel.implement({timestamp : timestamp});
								
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

						}
						
						
						
					}
					else{
						//var obj = {};
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
										//console.log(doc);
										
										delete doc._rev;

										self.model[key](doc.data);
										
										if((self['docs']['buffer'].length < self.options.docs.buffer_size) &&
										 (self['docs']['timer'] > Date.now().getTime()))
										{
											self['docs']['buffer'].push(doc);
										}
										else{
											console.log('bulkDocs');
											console.log(self['docs']['buffer'].length);
											console.log(Date.now().getTime());
											
											self.db.bulkDocs(self['docs']['buffer'])
											.catch(function (err) {
												console.log('DB PUT ERR myRequests.'+key);
												console.log(err);
											});
											
											self['docs'] = {
												'buffer': [],
												'timer': (Date.now().getTime() + (self.options.docs.timer * 1000)),
											};
										}
										//seld.db.put(doc)
										//.catch(function(err){
											//console.log('DB PUT ERR myRequests.'+key);
											//console.log(err);
										//});
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
							
							default_req.url = sprintf(default_req.url, -10000, -1);
					
							//console.log('KEY '+key);
							
							if(typeOf(req.url) == 'function')
								req.url = req.url();
								
							req.url = this.server + req.url + default_req.url;
							
							//console.log(Object.merge(
								//Object.clone(default_req),
								//req
							//));
							var onSuccess = function(doc){
								//default_req.onSuccess(doc);
								default_req.onSuccess.attempt(doc, this);
								if(req.onSuccess)
									req.onSuccess.attempt(doc, this);
									//req.onSuccess(doc);
							};
								
							this.timed_request[key] = new Request.JSON(
								Object.merge(
									Object.clone(default_req),
									req,
									{'onSuccess': onSuccess.bind(this)}
								)
							);
						}
					}.bind(this));
					

				}.protect(),
				_define_queued_requests: function(){
					
					//var requests = {};
					//requests = Object.merge(requests, this.timed_request);
					
					this.timed_request_queue = new Request.Queue({
						requests: this.timed_request,
						stopOnFailure: false,
						//concurrent: 10,
						onComplete: function(name, instance, text, xml){
								////////console.log('queue: ' + name + ' response: ', text, xml);
						}
					});
					
					this.historical_request_queue = new Request.Queue({
						requests: this.historical_request,
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
				
				
			});	
				
			var os_page = new OSPage();
				
			os_page.addEvent(os_page.STARTED, function(){
				
				var self = this;
				
				console.log('page started');
				
				if(mainBodyModel.os() == null){
					
					if(!self.model){
						self.model = new OSModel();
						
					}
					
					mainBodyModel.os(self.model);
					
					this._define_timed_requests();
				
					this._define_historical_requests();
					
					this._define_queued_requests();
					
					//this.start_timed_requests();
					ko.tasks.schedule(this.start_timed_requests.bind(this));
					
					ko.tasks.schedule(this._load_plots.bind(this));
				
					ko.tasks.schedule(this.start_periodical_functions.bind(this));
				}
				else{
					self.model = mainBodyModel.os();
				}
				
				
			});	
			
		});
	});
//});


		

