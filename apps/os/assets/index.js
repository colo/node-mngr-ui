
function getURLParameter(name, URI) {
	URI = URI || location.search;
	
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(URI)||[,""])[1].replace(/\+/g, '%20'))||null;
}


//head.ready('jsonp', function(){
	head.ready('history'
	, function() {
		
	var OSModel = new Class({
		Implements: [Options, Events],
		
		GB: (1024 * 1024 * 1024),
		MB: (1024 * 1024 ),
		KB: 1024,
		
		D: (60 * 60 * 24),//day
		W: (60 * 60 * 24 * 7),//week
		
		//primary_iface: ko.observable('lo'),
		//hostname: ko.observable(null),
		//loadavg: ko.observableArray([]),
		//freemem: ko.observable(null),
		//totalmem: ko.observable(null),
		//networkInterfaces: {},
			
		options : {
			current_size_base: 'GB',
			current_time_base: 'D',
		},
		
		initialize: function(options){
			
			this.setOptions(options);
			
			//console.log('this.networkInterfaces');
			//console.log(this.primary_iface());
			
			this.header = ko.pureComputed(function(){
				return this.hostname()+' ['+this.type() +' '+this.release()+' '+this.arch()+']';
			}.bind(this));
			
			this.user_friendly_cpu = ko.pureComputed(function(){
				return this.cpus()[0].model+' @ '+this.cpus()[0].speed;
			}.bind(this));
			
			this.user_friendly_uptime = ko.pureComputed(function(){
				return (this.uptime() / this[this.options.current_time_base]).toFixed(0);
			}.bind(this));
			
			this.primary_iface_out = ko.pureComputed(function(){
				//console.log(this.networkInterfaces[this.primary_iface()]());
				return (this.networkInterfaces[this.primary_iface()]().transmited.bytes / this[this.options.current_size_base]).toFixed(2);
			}.bind(this));
			
			this.primary_iface_in = ko.pureComputed(function(){
				return (this.networkInterfaces[this.primary_iface()]().recived.bytes / this[this.options.current_size_base]).toFixed(2);
			}.bind(this));
			
			this.user_friendly_totalmem = ko.pureComputed(function(){
				return (this.totalmem() / this[this.options.current_size_base]).toFixed(2);
			}.bind(this));
			
			this.user_friendly_freemem = ko.pureComputed(function(){
				return (this.freemem() / this[this.options.current_size_base]).toFixed(2);
			}.bind(this));
			
			this.user_friendly_loadavg = ko.pureComputed(function(){
				var arr = [];
				//console.log('user_friendly_loadavg');
				//console.log(this.loadavg());
				Array.each(this.loadavg(), function(item, index){
					arr[index] = item.toFixed(2);
				}.bind(this));
				
				//console.log(arr);
				return arr;
				
			}.bind(this));
			
			this.list_blk_dev = ko.pureComputed(function(){
				var arr = [];
				Array.each(this.blockdevices, function(dev){
					arr.append(Object.keys(dev));
				});
				
				console.log('list_blk_dev');
				console.log(arr);
				return arr;
			}.bind(this));
		}
	});
	
	var OSPage = new Class({
		Extends: Page,
		
		server: null,
		timed_request: {},
		
		options: {
			assets: {
				js: [
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
		},
		
		initialize: function(options){
			//root_page.addEvent('beforeHide_os', function(page){
				//console.log('beforeHide_os');
				//throw new Error();}
			//);
		
			root_page.addEvent('beforeHide_os', this.stop_timed_requests.bind(this));
			root_page.addEvent('afterShow_os', this.start_timed_requests.bind(this));
			
			//this.addEvent(this.JS_LOADED+'_Chart', function(){
				//console.log('this.JS_LOADED_Chart');
				
				//this._load_charts();
			//}.bind(this));
			//this.addEvent(this.JSONP_LOADED+'_update_server', function(data){
				//console.log('this.JSONP_LOADED_update_server');
				//console.log(data);
			//});
			
			this.addEvent(this.JSONP_LOADED+'_update_server', function(data){
				console.log('this.JSONP_LOADED_update_server');
				console.log(data);
				
				this.server = data;
				
				this._request_update_model(['/os', '/os/blockdevices']);
				
			}.bind(this));
			
			this.addEvent(this.JSONP_LOADED+'_update_primary_iface', function(data){
				console.log('this.JSONP_LOADED');
				console.log(data);
				
				this.primary_iface = data;
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
			
			
			var current_uri = new URI(window.location.pathname);
			console.log(current_uri.toString());
			//self.URI = window.location.protocol+'//'+window.location.host+window.location.pathname;
			
			
		},
		_request_update_model(urls){
			var self = this;
			urls = (typeOf(urls) == 'array') ? urls : [urls];
			
			var requests = {}
			
			Array.each(urls, function(url){
				var id = url.split('/');//split to get last portion (ex: 'os', 'blockdevices'....)
				id = id[id.length - 1];
				
				console.log('url id:'+id);
				
				requests[id] = new Request.JSON({
					url: this.server+url,
					onSuccess: function(server_data){
						console.log('server_data');
						console.log(server_data);
						
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
					console.log('queue.onEnd');
				}
			});
			
			Object.each(requests, function(req){
				req.send();
			});
			//requests.jsonRequest.send();
		},
		_apply_data_model: function(server_data, id){
			
			//var obj = ko.observable({});
			var obj = {};
			obj[id] = [];
			
			Object.each(server_data, function(value, key){
				console.log('server_data: '+key);
				console.log(typeof(value));
					
					if(id != 'os'){
						//obj[id] = Object.merge(obj[id], this._implementable_model_object(value, key));
						obj[id].push(this._implementable_model_object(value, key));
						
						if(obj[id].length == Object.getLength(server_data)){
							
							//console.log('finish');
							//console.log(obj[id]);
							
							OSModel.implement(obj);
						}
					}
					else{
						OSModel.implement(this._implementable_model_object(value, key));
					}
				
			}.bind(this));
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
				var obj = {};
				obj[key] = ko.observable(value);
				//OSModel.implement(obj);
			}
			
			return obj;
		},
		_define_timed_requests: function(){
			var self = this;
			this.timed_request = {
				loadavg: new Request.JSON({
					url: this.server+'/os/loadavg',
					initialDelay: 1000,
					delay: 2000,
					limit: 10000,
					onSuccess: function(loadavg){
						console.log('myRequests.loadavg: ');
						console.log(loadavg);
						self.model.loadavg(loadavg);
						//os_model.loadavg.removeAll();
						//Array.each(res.data, function(item, index){
							//os_model.loadavg.push(item.toFixed(2));
						//});
					}
				}),
				freemem: new Request.JSON({
					url: this.server+'/os/freemem',
					initialDelay: 1000,
					delay: 2000,
					limit: 10000,
					onSuccess: function(freemem){
						console.log('myRequests.freemem: ');
						console.log(freemem);
						self.model.freemem(freemem);
					}
				}),
				primary_iface: new Request.JSON({
					url: this.server+'/os/networkInterfaces/'+this.primary_iface,
					initialDelay: 1000,
					delay: 2000,
					limit: 10000,
					onSuccess: function(primary_iface){
						console.log('myRequests.'+self.model.primary_iface());
						console.log(primary_iface);
						self.model.networkInterfaces[self.model.primary_iface()](primary_iface);
					}
				}),
				uptime: new Request.JSON({
					url: this.server+'/os/uptime',
					initialDelay: 60000,
					delay: 120000,
					limit: 300000,
					onSuccess: function(uptime){
						console.log('myRequests.uptime: ');
						console.log(uptime);
						self.model.uptime(uptime);
					}
				})
			};

		}.protect(),
		_define_queued_requests: function(){
			
			var requests = {};
			requests = Object.merge(requests, this.timed_request);
			
			var myQueue = new Request.Queue({
				requests: this.timed_request,
				onComplete: function(name, instance, text, xml){
						//console.log('queue: ' + name + ' response: ', text, xml);
				}
			});
		}.protect(),
		start_timed_requests: function(){
			Object.each(this.timed_request, function(req){
				req.startTimer();
			});
		},
		stop_timed_requests: function(){
			console.log('stop_timed_requests');
			Object.each(this.timed_request, function(req){
				req.stopTimer();
			});
		},
		_load_charts: function(){
			new Chart(document.getElementById("blockdevice"), {
				type: 'doughnut',
				tooltipFillColor: "rgba(51, 51, 51, 0.55)",
				data: {
					labels: [
						"Symbian",
						"Blackberry",
						"Other",
						"Android",
						"IOS"
					],
					datasets: [{
						data: [15, 20, 30, 10, 30],
						backgroundColor: [
							"#BDC3C7",
							"#9B59B6",
							"#E74C3C",
							"#26B99A",
							"#3498DB"
						],
						hoverBackgroundColor: [
							"#CFD4D8",
							"#B370CF",
							"#E95E4F",
							"#36CAAB",
							"#49A9EA"
						]
					}]
				},
				options: {
					legend: false,
					responsive: false
				}
			})
		}
	});	
		
	var os_page = new OSPage();
		
	os_page.addEvent(os_page.STARTED, function(){
		var self = this;
		
		console.log('page started');
		
		self.model = new OSModel();
		
		if(mainBodyModel.os() == null){
			
			//console.log(os_page.model['networkInterfaces']);
			
			console.log('os binding applied');
			
			mainBodyModel.os(self.model);
			
			
			
			this._define_timed_requests();
		
			this._define_queued_requests();
			
			this.start_timed_requests();
			
		}
		
		this._load_charts();
		
		
		
	});	
		
	});
//});


