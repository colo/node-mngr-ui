
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
		cpu_usage : {
			user: 0,
			nice: 0,
			sys: 0,
			idle: 0
		},
		
		options : {
			current_size_base: 'GB',
			current_time_base: 'D',
			list_partitions_types: /ext|xfs/
		},
		
		initialize: function(options){
			
			this.setOptions(options);
			
			//////console.log('this.networkInterfaces');
			//////console.log(this.primary_iface());
			
			this.header = ko.pureComputed(function(){
				return this.hostname()+' ['+this.type() +' '+this.release()+' '+this.arch()+']';
			}.bind(this));
			
			this.user_friendly_cpu = ko.pureComputed(function(){
				return this.cpus()[0].model+' @ '+this.cpus()[0].speed;
			}.bind(this));
			
			this.user_friendly_cpu_usage = ko.pureComputed(function(){
				var old_cpu_usage = this.cpu_usage;
				this.cpu_usage = {
					user: 0,
					nice: 0,
					sys: 0,
					idle: 0
				};
				
				Array.each(this.cpus(), function(cpu){
					//////console.log(cpu.times);
					
					this.cpu_usage.user += cpu.times.user;
					this.cpu_usage.nice += cpu.times.nice;
					this.cpu_usage.sys += cpu.times.sys;
					this.cpu_usage.idle += cpu.times.idle;

				}.bind(this));
				
				var new_info = {
					user: 0,
					nice: 0,
					sys: 0,
					idle: 0
				};

				new_info.user = this.cpu_usage.user - old_cpu_usage.user;
				new_info.nice = this.cpu_usage.nice - old_cpu_usage.nice;
				new_info.sys = this.cpu_usage.sys - old_cpu_usage.sys;
				new_info.idle = this.cpu_usage.idle - old_cpu_usage.idle;
				
				//console.log(new_info);
				
				var total_usage = 0;
				var total_time = 0;
				Object.each(new_info, function(value, key){
					if(key != 'idle'){
						total_usage += value;
					}
					total_time += value;
				});
				
				var percentage = {
					user: 0,
					nice: 0,
					sys: 0,
					idle: 0,
					usage: 0
				};
				
				percentage = {
					user: ((new_info.user * 100) / total_time).toFixed(2),
					nice: ((new_info.nice * 100) / total_time).toFixed(2),
					sys: ((new_info.sys * 100) / total_time).toFixed(2),
					idle: ((new_info.idle * 100) / total_time).toFixed(2),
					usage: ((total_usage * 100) / total_time).toFixed(2)
				};
				
				//var total_time = total_usage + new_info.idle;
				
				
				
				
				return percentage;
			}.bind(this));
			
			this.user_friendly_uptime = ko.pureComputed(function(){
				return (this.uptime() / this[this.options.current_time_base]).toFixed(0);
			}.bind(this));
			
			this.primary_iface_out = ko.pureComputed(function(){
				//////console.log(this.networkInterfaces[this.primary_iface()]());
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
				//////console.log('user_friendly_loadavg');
				//////console.log(this.loadavg());
				Array.each(this.loadavg(), function(item, index){
					arr[index] = item.toFixed(2);
				}.bind(this));
				
				//////console.log(arr);
				return arr;
				
			}.bind(this));
			
			this.list_blk_dev = ko.pureComputed(function(){
				var arr = [];
				
				var colors=["aero", "purple", "red", "green",  "blue"];//class="fa fa-square $color", has to match Chart order
				
				Object.each(this.blockdevices, function(dev, name){
					var info = {};
					//info.name = Object.keys(dev)[0];
					//info.size = dev[info.name].size();
					info.name = name;
					info.size = dev.size();
					
					info.partitions = [];
					//info.partitions = dev[info.name].partitions();
					var index = 0;
					Object.each(dev.partitions(), function(part, key){
						//////console.log('PART');
						//////console.log(part);
						var part_info = {};
						part_info.name = key;
						part_info.size = part.size;
						part_info.percentage = (part_info.size * 100 / info.size).toFixed(2);
						
						part_info.color = colors[index];
						
						info.partitions.push(part_info);
						index++;
					}.bind(this));
					
					arr.push(info);
					//arr.append(Object.keys(dev));
				}.bind(this));
				
				////console.log('list_blk_dev');
				////console.log(arr);
				return arr;
			}.bind(this));
			
			this.list_mounts = ko.pureComputed(function(){
				////console.log(this.mounts);
				////console.log(this.list_blk_dev());
				
				var mounts = [];
				Array.each(this.mounts, function(mount){
					if(this.options.list_partitions_types.test(mount.type())){
						var info = {};
						info.percentage = mount.percentage();
						info.point = mount.mount_point();
						info.fs = mount.fs();
						info.size = '?';
						
						////console.log(info.fs);
						
						Array.each(this.list_blk_dev(), function(dev){
							var name = Object.keys(dev)[0];
							Array.each(dev.partitions, function(part){
								////console.log('PART');
								////console.log(part);
								
								if(new RegExp(part.name).test(info.fs)){//if mount point is on listed partitions, we can get szie in bytes
									info.size = (part.size / this[this.options.current_size_base]).toFixed(0)+ "GB";
								}
								
							}.bind(this));
						}.bind(this));
						
						mounts.push(info);
					}
				}.bind(this));
				
				return mounts;
				
			}.bind(this));
		}
	});
	
	var OSPage = new Class({
		Extends: Page,
		
		server: null,
		timed_request: {},
		
		plot: null,
		plot_data: [],
		
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
			}
		},
		
		initialize: function(options){
			//root_page.addEvent('beforeHide_os', function(page){
				//////console.log('beforeHide_os');
				//throw new Error();}
			//);
		
			root_page.addEvent('beforeHide_os', this.stop_timed_requests.bind(this));
			root_page.addEvent('afterShow_os', this.start_timed_requests.bind(this));
			
			//this.addEvent(this.JS_LOADED+'_Chart', function(){
				//////console.log('this.JS_LOADED_Chart');
				
				//this._load_charts();
			//}.bind(this));
			//this.addEvent(this.JSONP_LOADED+'_update_server', function(data){
				//////console.log('this.JSONP_LOADED_update_server');
				//////console.log(data);
			//});
			
			this.addEvent(this.JSONP_LOADED+'_update_server', function(data){
				////console.log('this.JSONP_LOADED_update_server');
				////console.log(data);
				
				this.server = data;
				
				this._request_update_model(['/os/api', '/os/api/blockdevices', '/os/api/mounts']);
				
			}.bind(this));
			
			this.addEvent(this.JSONP_LOADED+'_update_primary_iface', function(data){
				////console.log('this.JSONP_LOADED');
				////console.log(data);
				
				this.primary_iface = data;
				OSModel.implement({'primary_iface': ko.observable(data)});
				//OSModel['primary_iface'](data);
			});
			
			//this.addEvent(this.JSONP_LOADED, function(data){
				//////console.log('this.JSONP_LOADED');
				//////console.log(data);
			//});
			
			//this.model = new OSModel();
			
			//if(mainBodyModel.os() == null){
				//mainBodyModel.os(this.model);
			//}
			
			this.parent(options);
			
			
			var current_uri = new URI(window.location.pathname);
			////console.log(current_uri.toString());
			//self.URI = window.location.protocol+'//'+window.location.host+window.location.pathname;
			
			
		},
		_request_update_model(urls){
			var self = this;
			urls = (typeOf(urls) == 'array') ? urls : [urls];
			
			var requests = {}
			
			Array.each(urls, function(url){
				var id = url.replace('/api', '');
				id = id.split('/');//split to get last portion (ex: 'os', 'blockdevices'....)
				id = id[id.length - 1]; //last part would be "/api"
				
				////console.log('url id:'+id);
				
				requests[id] = new Request.JSON({
					method: 'get',
					secure: true,
					url: this.server+url,
					onSuccess: function(server_data){
						////console.log('server_data');
						////console.log(server_data);
						
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
				loadavg: new Request.JSON({
					url: this.server+'/os/loadavg',
					initialDelay: 1000,
					delay: 2000,
					limit: 10000,
					onSuccess: function(loadavg){
						////console.log('myRequests.loadavg: ');
						////console.log(loadavg);
						self.model.loadavg(loadavg);
						//os_model.loadavg.removeAll();
						//Array.each(res.data, function(item, index){
							//os_model.loadavg.push(item.toFixed(2));
						//});
						
						self._update_loadavg_plot_data();
					}
				}),
				freemem: new Request.JSON({
					url: this.server+'/os/freemem',
					initialDelay: 1000,
					delay: 2000,
					limit: 10000,
					onSuccess: function(freemem){
						////console.log('myRequests.freemem: ');
						////console.log(freemem);
						self.model.freemem(freemem);
						
						self._update_usedmem_plot_data();
					}
				}),
				primary_iface: new Request.JSON({
					url: this.server+'/os/networkInterfaces/'+this.primary_iface,
					initialDelay: 1000,
					delay: 2000,
					limit: 10000,
					onSuccess: function(primary_iface){
						////console.log('myRequests.'+self.model.primary_iface());
						////console.log(primary_iface);
						self.model.networkInterfaces[self.model.primary_iface()](primary_iface);
					}
				}),
				uptime: new Request.JSON({
					url: this.server+'/os/uptime',
					initialDelay: 60000,
					delay: 120000,
					limit: 300000,
					onSuccess: function(uptime){
						////console.log('myRequests.uptime: ');
						////console.log(uptime);
						self.model.uptime(uptime);
					}
				}),
				cpus: new Request.JSON({
					url: this.server+'/os/cpus',
					initialDelay: 1000,
					delay: 2000,
					limit: 10000,
					onSuccess: function(cpus){
						//console.log('myRequests.cpus: ');
						//console.log(cpus);
						self.model.cpus(cpus);
						
						self._update_cpu_plot_data();
					}
				}),
				sda_stats: new Request.JSON({
					url: this.server+'/os/blockdevices/sda/stats',
					initialDelay: 1000,
					delay: 2000,
					limit: 10000,
					onSuccess: function(stats){
						//console.log('myRequests.cpus: ');
						//console.log(cpus);
						//self.model.cpus(cpus);
						/**
						 * save previous stats, needed to calculate times (updated stats - prev_stats)
						 * */
						self.model.blockdevices.sda._prev_stats = self.model.blockdevices.sda.stats();
						
						self.model.blockdevices.sda.stats(stats);
						//console.log(self.model.blockdevices.sda.stats());
						self._update_sda_stats_plot_data();
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
				
				cpu.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.floor((Math.random() * 10) + 1)]);
				
				load.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.random().toFixed(2)]);
				
				used_mem_percentage.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.floor((Math.random() * 50) + 1)]);
				
				sda_io_percentage.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.floor((Math.random() * 10) + 1)]);
			}
			
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
			}.periodical(1000, this);
			
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
					raw_data.shift();
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
					raw_data.shift();
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
					raw_data.shift();
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
					for(var i = (raw_data.length - 60); i < 60; i++){
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
//});


		

