
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
				
				server: null,
				timed_request: {},
				
				plot: null,
				plot_data: [],
				
				options: {
					assets: {
						js: [
							//{ model: '/public/apps/os/model.js' },
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
					timed_plot: {
						series: {
							lines: {
								show: false,
								fill: true
							},
							splines: {
								show: true,
								tension: 0.4,
								lineWidth: 1,
								fill: 0.4
							},
							points: {
								radius: 0,
								show: true
							},
							shadowSize: 2
						},
						grid: {
							verticalLines: true,
							hoverable: true,
							clickable: true,
							tickColor: "#d5d5d5",
							borderWidth: 1,
							color: '#fff'
						},
						colors: ["rgba(38, 185, 154, 0.38)", "rgba(3, 88, 106, 0.38)", "rgba(215, 96, 139, 0.2)", "rgba(223, 129, 46, 0.4)"],
						xaxis: {
							tickColor: "rgba(51, 51, 51, 0.06)",
							mode: "time",
							tickSize: [1, "minute"],
							//minTickSize: [1, "second"],
							//tickLength: 10,
							axisLabel: "Date",
							axisLabelUseCanvas: true,
							axisLabelFontSizePixels: 12,
							axisLabelFontFamily: 'Verdana, Arial',
							axisLabelPadding: 10
						},
						yaxis: {
							max: 100,
							ticks: 10,
							tickColor: "rgba(51, 51, 51, 0.06)",
						},
						tooltip: false
					},
					
					requests: {
						periodical: {
							method: 'get',
							initialDelay: 5000,
							delay: 5000,
							limit: 10000,
						},
						update_model: ['/os/api', '/os/api/blockdevices', '/os/api/mounts']
					}
				},
				
				initialize: function(options){
					
					root_page.addEvent('beforeHide_os', this.stop_timed_requests.bind(this));
					root_page.addEvent('afterShow_os', this.start_timed_requests.bind(this));
					
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
					this.timed_request = {
						loadavg: new Request.JSON(Object.merge(this.options.requests.periodical, {
							url: this.server+'/os/api/loadavg?type=status&limit=1&range[start]='+(Date.now() - 10000) +'&range[end]='+(Date.now() - 5000),
							onSuccess: function(loadavg){
								console.log('myRequests.loadavg: ');
								console.log(loadavg);
								self.model.loadavg(loadavg.data);
								//os_model.loadavg.removeAll();
								//Array.each(res.data, function(item, index){
									//os_model.loadavg.push(item.toFixed(2));
								//});
								
								self._update_loadavg_plot_data();
							}
						})),
						freemem: new Request.JSON(Object.merge(this.options.requests.periodical, {
							url: this.server+'/os/api/freemem?type=status&limit=1&range[start]='+(Date.now() - 10000) +'&range[end]='+(Date.now() - 5000),
							onSuccess: function(freemem){
								////console.log('myRequests.freemem: ');
								////console.log(freemem);
								self.model.freemem(freemem.data);
								
								self._update_usedmem_plot_data();
							}
						})),
						primary_iface: new Request.JSON(Object.merge(this.options.requests.periodical, {
							url: this.server+'/os/api/networkInterfaces/'+this.primary_iface+'?type=status&limit=1&range[start]='+(Date.now() - 10000) +'&range[end]='+(Date.now() - 5000),
							onSuccess: function(primary_iface){
								//console.log('myRequests.'+self.model.primary_iface());
								//console.log(primary_iface);
								self.model.networkInterfaces[self.model.primary_iface()](primary_iface.data[self.model.primary_iface()]);
							}
						})),
						uptime: new Request.JSON(Object.merge(this.options.requests.periodical, {
							url: this.server+'/os/api/uptime?type=status&limit=1&range[start]='+(Date.now() - 10000) +'&range[end]='+(Date.now() - 5000),
							initialDelay: 60000,
							delay: 110000,
							limit: 300000,
							onSuccess: function(uptime){
								////console.log('myRequests.uptime: ');
								////console.log(uptime);
								self.model.uptime(uptime.data);
							}
						})),
						cpus: new Request.JSON(Object.merge(this.options.requests.periodical, {
							url: this.server+'/os/api/cpus?type=status&limit=1&range[start]='+(Date.now() - 10000) +'&range[end]='+(Date.now() - 5000),
							onSuccess: function(cpus){
								console.log('myRequests.cpus: ');
								console.log(cpus);
								self.model.cpus(cpus.data);
								
								self._update_cpu_plot_data();
							}
						})),
						sda_stats: new Request.JSON(Object.merge(this.options.requests.periodical, {
							url: this.server+'/os/api/blockdevices/sda/stats?type=status&limit=1&range[start]='+(Date.now() - 10000) +'&range[end]='+(Date.now() - 5000),
							onSuccess: function(stats){
								//console.log('myRequests.cpus: ');
								//console.log(cpus);
								//self.model.cpus(cpus);
								/**
								 * save previous stats, needed to calculate times (updated stats - prev_stats)
								 * */
								self.model.blockdevices.sda._prev_stats = self.model.blockdevices.sda.stats();
								
								self.model.blockdevices.sda.stats(stats.data);
								//console.log(self.model.blockdevices.sda.stats());
								self._update_sda_stats_plot_data();
							}
						}))
					};

				}.protect(),
				_define_queued_requests: function(){
					
					var requests = {};
					requests = Object.merge(requests, this.timed_request);
					
					var myQueue = new Request.Queue({
						requests: this.timed_request,
						onComplete: function(name, instance, text, xml){
								//////console.log('queue: ' + name + ' response: ', text, xml);
						}
					});
				}.protect(),
				start_timed_requests: function(){
					Object.each(this.timed_request, function(req){
						req.startTimer();
					});
				},
				stop_timed_requests: function(){
					////console.log('stop_timed_requests');
					Object.each(this.timed_request, function(req){
						req.stopTimer();
					});
				},
				_load_charts: function(){
					
					
					Object.each(this.model.blockdevices, function(dev, name){
						//console.log('DEVICE');
						//console.log(name);
						//console.log(dev.partitions());
						
						//var id = Object.keys(dev)[0];
						var size = dev.size();
						
						////console.log("blockdevice_");
						////console.log(dev[id].partitions());
						
						var labels = Object.keys(dev.partitions());
						
						var datasets = [{
							data: [],
							backgroundColor: [
								"#BDC3C7",//aero
								"#9B59B6",//purple
								"#E74C3C",//red
								"#26B99A",//green
								"#3498DB"//blue
							],
							hoverBackgroundColor: [
								"#CFD4D8",
								"#B370CF",
								"#E95E4F",
								"#36CAAB",
								"#49A9EA"
							]
						}];
						
						Object.each(dev.partitions(), function(part, key){
							//console.log('partition: '+key);
							//console.log(part);
							
							var percentage = (part.size * 100 / size).toFixed(2);
							datasets[0].data.push(percentage);
							
							////console.log(size);
						})
						
						
						new Chart(document.getElementById("blockdevice_"+name), {
							type: 'doughnut',
							tooltipFillColor: "rgba(51, 51, 51, 0.55)",
							data: {
								labels: labels,
								datasets: datasets
							},
							options: {
								legend: false,
								responsive: false
							}
						})
					}.bind(this));
					
					
				},
				_load_plots: function(){
					
					/**
					 * load initial data
					 * 
					 * */
					var now = new Date();
					var cpu = [];
					var load = [];
					var used_mem_percentage = [];
					var sda_io_percentage = [];
					//for(var i = 59; i >= 0; i--){
					for(var i = 0; i <= 59; i++){
						//data.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - i).getTime(), Math.floor((Math.random() * 100) + 1)]);
						
						//cpu.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.floor((Math.random() * 10) + 1)]);
						
						load.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.random().toFixed(2)]);
						
						used_mem_percentage.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.floor((Math.random() * 50) + 1)]);
						
						sda_io_percentage.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.floor((Math.random() * 10) + 1)]);
					}
					
					var self = this;
					//console.log(self.model);
					
					//new Request.JSON({
						//url: this.server+'/os/api/cpus?type=status&range[start]='+(now.getTime() - 120000) +'&range[end]='+(now.getTime()),
						//method: 'get',
						////initialDelay: 1000,
						////delay: 2000,
						////limit: 10000,
						//onSuccess: function(docs){
							//var cpu = [];
							//console.log('myRequests.cpus: ');
							////console.log(docs);
							//Array.each(docs, function(doc){
								//var usage = self.model.cpu_usage_percentage(doc.data)['usage'].toFloat();
								
								//console.log(doc.metadata.timestamp);
								//console.log(usage);
								
								//cpu.push([doc.metadata.timestamp, usage]);
							//});
							
							//self.plot_data[0] = cpu;
							////self.model.loadavg(loadavg);
							////os_model.loadavg.removeAll();
							////Array.each(res.data, function(item, index){
								////os_model.loadavg.push(item.toFixed(2));
							////});
							
							////self._update_loadavg_plot_data();
						//}
					//}).send();
					
					////console.log(data);
					this.plot_data.push(cpu);
					this.plot_data.push(load);
					this.plot_data.push(used_mem_percentage);
					this.plot_data.push(sda_io_percentage);
					
					
					//$("#canvas_dahs").length && 
					this.plot = $.plot($("#canvas_dahs"), this.plot_data, this.options.timed_plot);

					var update_plots = function(){
						//console.log('update_plots');
						
						this.plot = $.plot($("#canvas_dahs"),
								//raw_data
								this.plot_data
						, this.options.timed_plot);
					}.periodical(5000, this);
					
				},
				_update_cpu_plot_data: function(){
					//console.log('_update_cpu_plot_data');
					////console.log(this.model.user_friendly_cpu_usage()['usage']);
					if(this.plot && this.plot.getData()){
						var now = new Date();
						
						var data = this.plot.getData();
						//var raw_data = data[0].data;
						var raw_data = [];
						
						raw_data = data[0].data;
						if(raw_data.length >= 60){
							for(var i = 0; i < (raw_data.length - 60); i++){
								raw_data.shift();
							}
						}
						
						raw_data.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).getTime(), this.model.user_friendly_cpu_usage()['usage'].toFloat() ]);
						
						this.plot_data[0] = raw_data;
						//console.log('second: '+this.plot_data[0].length);	
						////console.log(raw_data);
					}
				},
				_update_loadavg_plot_data: function(){
					//console.log('_update_loadavg_plot_data');
					//console.log(this.model.user_friendly_loadavg()[0]);
					
					if(this.plot && this.plot.getData()){
						var now = new Date();
						
						var data = this.plot.getData();
						//var raw_data = data[0].data;
						var raw_data = [];
						
						raw_data = data[1].data;//index 1 = load
						if(raw_data.length >= 60){
							for(var i = 0; i < (raw_data.length - 60); i++){
								raw_data.shift();
							}
						}
						
						raw_data.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).getTime(), this.model.user_friendly_loadavg()[0].toFloat() ]);
						
						this.plot_data[1] = raw_data;
						//console.log('second: '+this.plot_data[1].length);	
						////console.log(raw_data);
					}
				},
				_update_usedmem_plot_data: function(){
					//console.log('_update_usedmem_plot_data');
					//console.log(this.model.totalmem());
					//console.log(this.model.freemem());
					if(this.plot && this.plot.getData()){
						var used_mem_percentage = (((this.model.totalmem() - this.model.freemem()) * 100) / this.model.totalmem()).toFixed(2);
						
						var now = new Date();
						
						var data = this.plot.getData();
						//var raw_data = data[0].data;
						var raw_data = [];
						
						raw_data = data[2].data;//index 2 = used_mem
						if(raw_data.length >= 60){
							for(var i = 0; i < (raw_data.length - 60); i++){
								raw_data.shift();
							}
						}
						
						raw_data.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).getTime(), used_mem_percentage ]);
						
						this.plot_data[2] = raw_data;
						//console.log('second: '+this.plot_data[2].length);	
						////console.log(raw_data);
					}
				},
				_update_sda_stats_plot_data: function(){
					//console.log(this.model.blockdevices.sda._prev_stats.time_in_queue);
					//console.log(this.model.blockdevices.sda.stats().time_in_queue);
					
					//milliseconds between last update and this one
					var time_in_queue = this.model.blockdevices.sda.stats().time_in_queue - this.model.blockdevices.sda._prev_stats.time_in_queue;
					
					//console.log('TIME IN QUEUE: '+time_in_queue);
					
					var percentage_in_queue = [];
					/**
					 * each messure spent on IO, is 100% of the disk at full IO speed (at least, available for the procs),
					 * so, as we are graphing on 1 second X, milliseconds spent on IO, would be % of that second (eg: 500ms = 50% IO)
					 * 
					 * */
					if(time_in_queue < 1000){//should always enter this if, as we messure on 1 second updates (1000+)
						//console.log('LESS THAN A SECOND');
						percentage_in_queue.push((time_in_queue * 100) / 1000);
					}
					else{//updates may not get as fast as 1 second, so we split the messure for as many as seconds it takes
						//console.log('MORE THAN A SECOND');
						
						for(var i = 1; i < (time_in_queue / 1000); i++){
							//console.log('----SECOND: '+i);
							
							percentage_in_queue.push( 100 ); //each of this seconds was at 100%
						}
						
						percentage_in_queue.push(( (time_in_queue % 1000) * 100) / 1000);
					}
					
					if(this.plot && this.plot.getData()){
						var now = new Date();
						
						var data = this.plot.getData();
						//var raw_data = data[0].data;
						var raw_data = [];
						
						raw_data = data[3].data;//index 3 = sda_stats
						if(raw_data.length >= 60){
							for(var i = 0; i < (raw_data.length - 60); i++){
								raw_data.shift();
							}
						}
						
						for(var i = 0; i < percentage_in_queue.length; i++ ){
							raw_data.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).getTime(), percentage_in_queue[i] ]);
						}
						
						this.plot_data[3] = raw_data;
						//console.log('second: '+this.plot_data[1].length);	
						////console.log(raw_data);
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
				
				this._load_charts();
				
				head.ready("flot_curvedLines", function(){
					//console.log('_load_plots');
					this._load_plots();
				}.bind(this));
				
				
				
				
			});	
			
		});
	});
//});


		

