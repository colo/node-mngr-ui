
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
				
				options: {
					assets: {
						js: [
							{ sprintf: '/public/bower/sprintf/dist/sprintf.min.js' },
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
					//timed_plot: {
						//series: {
							//lines: {
								//show: false,
								//fill: true
							//},
							//splines: {
								//show: true,
								//tension: 0.4,
								//lineWidth: 1,
								//fill: 0.4
							//},
							//points: {
								//radius: 0,
								//show: true
							//},
							//shadowSize: 2
						//},
						//grid: {
							//verticalLines: true,
							//hoverable: true,
							//clickable: true,
							//tickColor: "#d5d5d5",
							//borderWidth: 1,
							//color: '#fff'
						//},
						//colors: ["rgba(38, 185, 154, 0.38)", "rgba(3, 88, 106, 0.38)", "rgba(215, 96, 139, 0.2)", "rgba(223, 129, 46, 0.4)"],
						//xaxis: {
							//tickColor: "rgba(51, 51, 51, 0.06)",
							//mode: "time",
							//tickSize: [1, "minute"],
							////minTickSize: [1, "second"],
							////tickLength: 10,
							//axisLabel: "Date",
							//axisLabelUseCanvas: true,
							//axisLabelFontSizePixels: 12,
							//axisLabelFontFamily: 'Verdana, Arial',
							//axisLabelPadding: 10
						//},
						//yaxis: {
							//max: 100,
							//ticks: 10,
							//tickColor: "rgba(51, 51, 51, 0.06)",
						//},
						//tooltip: false
					//},
					
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
								url: '/os/api/networkInterfaces/'+this.primary_iface,
								onSuccess: function(doc){
									console.log('myRequests.'+os_page.model.primary_iface());
									console.log(doc);
									os_page.model.networkInterfaces[os_page.model.primary_iface()](doc.data[os_page.model.primary_iface()]);
								}.bind(this)
							},
							sda_stats: {
								url: '/os/api/blockdevices/sda/stats',
								onSuccess: function(doc){
									console.log('myRequests.sda_stats: ');
									console.log(doc);
									
									/**
									 * save previous stats, needed to calculate times (updated stats - prev_stats)
									 * */
									os_page.model.blockdevices.sda._prev_stats = os_page.model.blockdevices.sda.stats();
									
									os_page.model.blockdevices.sda.stats(doc.data);
									
									//os_page._update_plot_data('sda_stats', doc.metadata.timestamp);
								}
							}
						},
						update_model: ['/os/api', '/os/api/blockdevices', '/os/api/mounts']
					},
					
					
				},
				
				initialize: function(options){
					
					root_page.addEvent('beforeHide_os', this.stop_timed_requests.bind(this));
					root_page.addEvent('afterShow_os', this.start_timed_requests.bind(this));
					
					//var stop_start_periodical_requests = function(){
						//console.log('stop_start_periodical_requests');
						
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
							////console.log('queue.onEnd');
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
							////console.log(this._implementable_model_object(value, key)[key]);
							obj[id].push(this._implementable_model_object(value, key)[key]);
							
							if(obj[id].length == Object.getLength(server_data)){
										
								OSModel.implement(obj);
							}
							
						}.bind(this));
						
						////console.log(obj);
					}
					else{
						obj[id] = {};
						//if(id == 'blockdevices'){
						//console.log('server_data: ');
						//console.log(server_data);
						//}
										
						Object.each(server_data, function(value, key){
							
							if(id != 'os'){
							
								//obj[id].push(this._implementable_model_object(value, key));
								//obj[id][key] = {};
								obj[id] = Object.merge(obj[id], this._implementable_model_object(value, key));
								
								if(id == 'blockdevices'){
									console.log('server_data: '+id+':'+key);
									console.log(obj);
								}
								else if(id == 'mounts'){
									console.log('server_data: '+id+':'+key);
									console.log(obj);
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
							
							////console.log('_implementable_model_object: '+key);
							//////console.log(typeof(value));
							////console.log(obj);
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
					
					console.log('_define_timed_requests');
					
					
					Object.each(this.options.requests.periodical, function(req, key){
						if(key.charAt(0) != '_'){
							var default_req = Object.append(
								{
									onSuccess: function(doc){
										console.log('myRequests.'+key);
										//console.log(doc);

										self.model[key](doc.data);
										
										//self._update_plot_data(key, doc.metadata.timestamp);
									},
									onFailure: function(){
										console.log('onFailure');
										self.fireEvent(self.ON_PERIODICAL_REQUEST_FAILURE);
									},
									onTimeout: function(){
										console.log('onTimeout');
										self.fireEvent(self.ON_PERIODICAL_REQUEST_TIMEOUT);
									}
								},
								this.options.requests.periodical._defaults
							);
							
							default_req.url = sprintf(default_req.url, - 10000, - 5000);
					
							console.log('KEY '+key);
							
							req.url = this.server + req.url + default_req.url;
							
							console.log(Object.merge(
								Object.clone(default_req),
								req
							));
								
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
						onComplete: function(name, instance, text, xml){
								//////console.log('queue: ' + name + ' response: ', text, xml);
						}
					});
				}.protect(),
				start_timed_requests: function(){
					console.log('start_timed_requests');
					
					
					
					Object.each(this.timed_request, function(req, key){
						console.log('starting.... '+key);
						
						req.startTimer();
					});
					
					//this.timed_request_queue.resume();
				},
				stop_timed_requests: function(){
					////console.log('stop_timed_requests');
					Object.each(this.timed_request, function(req){
						req.stopTimer();
					});
				},
				//_load_charts: function(){
					
					
					//Object.each(this.model.blockdevices, function(dev, name){
						////console.log('DEVICE');
						////console.log(name);
						////console.log(dev.partitions());
						
						////var id = Object.keys(dev)[0];
						//var size = dev.size();
						
						//////console.log("blockdevice_");
						//////console.log(dev[id].partitions());
						
						//var labels = Object.keys(dev.partitions());
						
						//var datasets = [{
							//data: [],
							//backgroundColor: [
								//"#BDC3C7",//aero
								//"#9B59B6",//purple
								//"#E74C3C",//red
								//"#26B99A",//green
								//"#3498DB"//blue
							//],
							//hoverBackgroundColor: [
								//"#CFD4D8",
								//"#B370CF",
								//"#E95E4F",
								//"#36CAAB",
								//"#49A9EA"
							//]
						//}];
						
						//Object.each(dev.partitions(), function(part, key){
							////console.log('partition: '+key);
							////console.log(part);
							
							//var percentage = (part.size * 100 / size).toFixed(2);
							//datasets[0].data.push(percentage);
							
							//////console.log(size);
						//})
						
						
						//new Chart(document.getElementById("blockdevice_"+name), {
							//type: 'doughnut',
							//tooltipFillColor: "rgba(51, 51, 51, 0.55)",
							//data: {
								//labels: labels,
								//datasets: datasets
							//},
							//options: {
								//legend: false,
								//responsive: false
							//}
						//})
					//}.bind(this));
					
					
				//},
				_load_plots: function(){
					var now = new Date();
					console.log('LOAD PLOTS')
					
					var self = this;
					//console.log(self.model);
					
					new Request.JSON({
						url: this.server+'/os/api/cpus?type=status&range[start]='+(now.getTime() - 120000) +'&range[end]='+(now.getTime()),
						method: 'get',
						//initialDelay: 1000,
						//delay: 2000,
						//limit: 10000,
						onSuccess: function(docs){
							var cpu = [];
							console.log('myRequests.cpus: ');
							//console.log(docs);
							Array.each(docs, function(doc){
								var usage = self.model.cpu_usage_percentage(doc.data)['usage'].toFloat();
								
								console.log(doc.metadata.timestamp);
								console.log(usage);
								
								//cpu.push([doc.metadata.timestamp, usage]);
								//self.model.cpu_usage_percentage(doc.data)['usage'].toFloat();
								self.model._update_plot_data('cpus', usage, doc.metadata.timestamp);
							});
							
							//self.plot_data[0] = cpu;
							//self.model.loadavg(loadavg);
							//os_model.loadavg.removeAll();
							//Array.each(res.data, function(item, index){
								//os_model.loadavg.push(item.toFixed(2));
							//});
							
							//self._update_loadavg_plot_data();
						}
					}).send();
					
					
				},
				_update_plot_data: function(type, timestamp){
					timestamp = timestamp || Date.now();
					console.log('_update_plot_data: '+type);
					console.log('_update_plot_data timestamp: '+timestamp);
					
					var index = this.plot_data_order.indexOf(type);
					
					if(index >= 0 && this.plot && this.plot.getData()){
						
						
						var data = this.plot.getData();
						var raw_data = [];
						
						raw_data = data[index].data;
						if(raw_data.length >= 60){
							for(var i = 0; i < (raw_data.length - 60); i++){
								raw_data.shift();
							}
						}
						
						data = null;
						
						switch (type){
							case 'freemem': data = (((this.model.totalmem() - this.model.freemem()) * 100) / this.model.totalmem()).toFixed(2);
								break;
							
							case 'cpus': data = this.model.user_friendly_cpus_usage()['usage'].toFloat();
								break;
								
							case 'loadavg': data = this.model.user_friendly_loadavg()[0].toFloat();
								break;
								
							case 'sda_stats': 
								//milliseconds between last update and this one
								var time_in_queue = this.model.blockdevices.sda.stats().time_in_queue - this.model.blockdevices.sda._prev_stats.time_in_queue;
								
								//console.log('TIME IN QUEUE: '+time_in_queue);
								
								//var percentage_in_queue = [];
								data = [];
								/**
								 * each messure spent on IO, is 100% of the disk at full IO speed (at least, available for the procs),
								 * so, as we are graphing on 1 second X, milliseconds spent on IO, would be % of that second (eg: 500ms = 50% IO)
								 * 
								 * */
								if(time_in_queue < 1000){//should always enter this if, as we messure on 1 second updates (1000+)
									//console.log('LESS THAN A SECOND');
									data.push((time_in_queue * 100) / 1000);
								}
								else{//updates may not get as fast as 1 second, so we split the messure for as many as seconds it takes
									//console.log('MORE THAN A SECOND');
									
									for(var i = 1; i < (time_in_queue / 1000); i++){
										//console.log('----SECOND: '+i);
										
										data.push( 100 ); //each of this seconds was at 100%
									}
									
									data.push(( (time_in_queue % 1000) * 100) / 1000);
								}
								
								break;
						}
						
						//push data
						switch (type){
							case 'sda_stats':
								for(var i = 0; i < data.length; i++ ){
									raw_data.push([timestamp, data[i] ]);
								}
								break;
								
							default: 
								raw_data.push([timestamp, data ]);
						}
						
						
						this.plot_data[index] = raw_data;
						
					}
				},
				
				
			});	
				
			var os_page = new OSPage();
				
			os_page.addEvent(os_page.STARTED, function(){
				
				var self = this;
				
				////console.log('page started');
				
				self.model = new OSModel();
				
				if(mainBodyModel.os() == null){
					
					//////console.log(os_page.model['networkInterfaces']);
					
					////console.log('os binding applied');
					
					mainBodyModel.os(self.model);
					
					
					
					this._define_timed_requests();
				
					this._define_queued_requests();
					
					this.start_timed_requests();
					
					
				}
				
				//this._load_charts();
				
				head.ready("flot_curvedLines", function(){
					//console.log('_load_plots');
					this._load_plots();
				}.bind(this));
				
				
				
				
			});	
			
		});
	});
//});


		

