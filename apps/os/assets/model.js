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
	//cpu_usage : {
		//user: 0,
		//nice: 0,
		//sys: 0,
		//idle: 0
	//},
	cpu_usage: [
		{
			user: 0,
			nice: 0,
			sys: 0,
			idle: 0
		}
	],
	
	//started: 0, //timestamp updated on index.js
	
	plot: null,
	plot_data: [],
	plot_data_order: ['cpus', 'loadavg', 'freemem', 'sda_stats'],
	//plot_data_last_update: 0,
	//plot_data_update: 0,
	
	periodical_functions: {
		'plot_update':{
			'fn': null,
			'interval': 0
		},
	},
	periodical_functions_timers : {},
	
	options : {
		current_size_base: 'GB',
		current_time_base: 'D',
		list_partitions_types: /ext|xfs/,
		
		blockdevice_chart: {
			type: 'doughnut',
			tooltipFillColor: "rgba(51, 51, 51, 0.55)",
			data: {
				labels: [],
				datasets: [{
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
				}]
			},
			options: {
				legend: false,
				responsive: false
			}
		},
		timed_plot: {
			_defaults: {
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
				series: {
					lines: {
						show: true,
						fill: false
					},
					splines: {
						show: false,
						tension: 0.4,
						lineWidth: 1,
						fill: 0.4
					},
					points: {
						radius: 0,
						show: true
					},
					shadowSize: 0
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
			
			update_interval: 1000,
		}
		
	},
	
	cpu_usage_percentage: function(old_data, new_data){
		
		var new_info = {
			user: 0,
			nice: 0,
			sys: 0,
			idle: 0
		};
		
		//var last = this.cpu_usage.length -1;
		
		var user = new_data.user - old_data.user;
		var nice = new_data.nice - old_data.nice;
		var sys = new_data.sys - old_data.sys;
		var idle = new_data.idle - old_data.idle;
		
		/**
		 * may result on 0 if there are no new docs on database and the data we get if always from last doc
		 * 
		* */
		//new_info.user = (user <= 0) ? old_data.user : user;
		//new_info.nice = (nice <= 0) ? old_data.nice : nice;
		//new_info.sys =  (sys <= 0)  ? old_data.sys : sys;
		//new_info.idle = (idle <= 0) ? old_data.idle : idle;
		
		new_info.user = (user <= 0) ? 0 : user;
		new_info.nice = (nice <= 0) ? 0 : nice;
		new_info.sys =  (sys <= 0)  ? 0 : sys;
		new_info.idle = (idle <= 0) ? 0 : idle;
		
		//////console.log('new_info');
		//////console.log(new_info);
		
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
		
		if(total_time > 0){
			percentage = {
				user: ((new_info.user * 100) / total_time).toFixed(2),
				nice: ((new_info.nice * 100) / total_time).toFixed(2),
				sys: ((new_info.sys * 100) / total_time).toFixed(2),
				idle: ((new_info.idle * 100) / total_time).toFixed(2),
				usage: ((total_usage * 100) / total_time).toFixed(2)
			};
		}
		
		return percentage;
	},
	initialize: function(options){
		
		this.setOptions(options);
		
		//////////console.log('this.networkInterfaces');
		//////////console.log(this.primary_iface());
		
		this.plot_resources = ko.pureComputed(function(){
			var resources = [];
			Array.each(this.plot_data_order, function(name, index){
				var resource = {};
				resource.name = name;
				resource.rgba = this.options.timed_plot._defaults.colors[index];
				resources.push(resource);
			}.bind(this));
			return resources;
		}.bind(this));
		
		this.header = ko.pureComputed(function(){
			return this.hostname()+' ['+this.type() +' '+this.release()+' '+this.arch()+']';
		}.bind(this));
		
		this.user_friendly_cpus = ko.pureComputed(function(){
			return this.cpus()[0].model+' @ '+this.cpus()[0].speed;
		}.bind(this));
		
		this.user_friendly_cpus_usage = ko.pureComputed(function(){
			var last = this.cpu_usage.length -1;
			
			var cpu_usage = {
				user: 0,
				nice: 0,
				sys: 0,
				idle: 0
			};
			
			Array.each(this.cpus(), function(cpu){
				
				cpu_usage.user += cpu.times.user;
				cpu_usage.nice += cpu.times.nice;
				cpu_usage.sys += cpu.times.sys;
				cpu_usage.idle += cpu.times.idle;

			}.bind(this));
			
			this.cpu_usage.push(cpu_usage);
			
			var percentage = this.cpu_usage_percentage(this.cpu_usage[last], cpu_usage);
			
			
			
			return percentage;
			
		}.bind(this));
		
		this.user_friendly_uptime = ko.pureComputed(function(){
			return (this.uptime() / this[this.options.current_time_base]).toFixed(0);
		}.bind(this));
		
		this.primary_iface_out = ko.pureComputed(function(){
			//////console.log('this.networkInterfaces[this.primary_iface()]()');
			//////console.log(this.primary_iface());
			return (this.networkInterfaces[this.primary_iface()]().transmited.bytes / this[this.options.current_size_base]).toFixed(2);
		}.bind(this));
		
		this.primary_iface_in = ko.pureComputed(function(){
			return (this.networkInterfaces[this.primary_iface()]().recived.bytes / this[this.options.current_size_base]).toFixed(2);
		}.bind(this));
		
		this.user_friendly_totalmem = ko.pureComputed(function(){
			return (this.totalmem() / this[this.options.current_size_base]).toFixed(2);
		}.bind(this));
		
		this.user_friendly_freemem = ko.pureComputed(function(){
			
			/** update plot with 'used mem' */
			//this._update_plot_data('freemem', (((this.totalmem() - this.freemem()) * 100) / this.totalmem()).toFixed(2));
			
			return (this.freemem() / this[this.options.current_size_base]).toFixed(2);
		}.bind(this));
		
		this.user_friendly_loadavg = ko.pureComputed(function(){
			var arr = [];
			//////console.log('user_friendly_loadavg');
			//////console.log(this.loadavg());
			Array.each(this.loadavg(), function(item, index){
				arr[index] = item.toFixed(2);
			}.bind(this));
			
			/** update plot with 'loadavg' */
			//this._update_plot_data('loadavg', arr[0].toFloat());
			
			//////////console.log(arr);
			return arr;
			
		}.bind(this));
		
		this.list_blk_dev = ko.pureComputed(function(){
			//////console.log('list_blk_dev');
			//////console.log(this.blockdevices);
			
			var arr = [];
			
			var colors=["aero", "purple", "red", "green",  "blue"];//class="fa fa-square $color", has to match Chart order
			
			Object.each(this.blockdevices, function(dev, name){
				////console.log(dev);
				
				var info = {};
				//info.name = Object.keys(dev)[0];
				//info.size = dev[info.name].size();
				info.name = name;
				info.size = dev.size();
				
				info.partitions = [];
				//info.partitions = dev[info.name].partitions();
				var index = 0;
				Object.each(dev.partitions(), function(part, key){
					//////////console.log('PART');
					//////////console.log(part);
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
			
			////////console.log('list_blk_dev');
			////////console.log(arr);
			return arr;
		}.bind(this));
		
		this.list_mounts = ko.pureComputed(function(){
			//////console.log('this.mounts');
			//////console.log(this.mounts);
			//////console.log(this.list_blk_dev());
			
			var mounts = [];
			Array.each(this.mounts, function(mount){
				
				if(this.options.list_partitions_types.test(mount.type())){
					var info = {};
					info.percentage = mount.percentage();
					info.point = mount.mount_point();
					info.fs = mount.fs();
					info.size = '?';
					
					//////console.log(info.fs);
					
					Array.each(this.list_blk_dev(), function(dev){
						var name = Object.keys(dev)[0];
						Array.each(dev.partitions, function(part){
							////////console.log('PART');
							////////console.log(part);
							
							if(new RegExp(part.name).test(info.fs)){//if mount point is on listed partitions, we can get szie in bytes
								info.size = (part.size / this[this.options.current_size_base]).toFixed(0)+ "GB";
							}
							
						}.bind(this));
					}.bind(this));
					
					mounts.push(info);
				}
			}.bind(this));
			
			//////console.log(mounts);
			return mounts;
			
		}.bind(this));
		
		var self = this;
		ko.bindingHandlers.load_chart = {
			init: function(element, valueAccessor) {
					var name = ko.unwrap(valueAccessor()); // Get the current value of the current property we're bound to
					
					////console.log('load_chart');
					////console.log(element);
					////console.log(name);
					//$(element).toggle(value); // jQuery will hide/show the element depending on whether "value" or true or false
					
					var dev = self.blockdevices[name];
					
					////////console.log('DEVICE');
					//////console.log(name);
					//////console.log(dev.partitions());
					
					//var id = Object.keys(dev)[0];
					var size = dev.size();
					
					////////console.log("blockdevice_");
					////////console.log(dev[id].partitions());
					var blockdevice_chart = Object.clone(self.options.blockdevice_chart);
					
					blockdevice_chart.data.labels = Object.keys(dev.partitions());
					
					Object.each(dev.partitions(), function(part, key){
						
						var percentage = (part.size * 100 / size).toFixed(2);
						blockdevice_chart.data.datasets[0].data.push(percentage);
						
					})
					new Chart(element, blockdevice_chart)
					
			},
			update: function(element, valueAccessor, allBindings) {
					// Leave as before
			}
		};
		
		//head.ready("flot_curvedLines", function(){
			////////console.log('_load_plot');
			//this._load_plot();
		//}.bind(this));
		var handle = ko.tasks.schedule(function () {
				//console.log('my microtask');
				
				this._load_plot();
				
				//////console.log(ko.isObservable(this.blockdevices.sda.stats));
				
				this.user_friendly_cpus_usage.subscribe( function(value){
					////console.log('this.user_friendly_cpus_usage.subscribe');
					this._update_plot_data('cpus', value['usage'].toFloat());
				}.bind(this) );
				
				//this.freemem.subscribe(function(){
				this.user_friendly_freemem.subscribe(function(){
					//this._update_plot_data('freemem', (((this.totalmem() - value) * 100) / this.totalmem()).toFixed(2));
					this._update_plot_data('freemem', (((this.totalmem() - this.freemem()) * 100) / this.totalmem()).toFixed(2));
				}.bind(this));
				
				this.user_friendly_loadavg.subscribe(function(value){
					/** update plot with 'loadavg' */
					this._update_plot_data('loadavg', value[0].toFloat());
				}.bind(this));
			
				this.blockdevices.sda.stats.subscribe(function(oldValue) {
						//console.log('this.blockdevices().sda.stats() suscribe OLD VALUE');
						//console.log(this.blockdevices.timestamp);
						
						if(!oldValue.timestamp)
							oldValue.timestamp = this.blockdevices.timestamp;
						
						
						//var timestamp = this.blockdevices.sda._prev_stats.timestamp || 0;
						this.blockdevices.sda._prev_stats = oldValue;
						
						
						
				}.bind(this), null, "beforeChange");

				this.blockdevices.sda.stats.subscribe( function(value){
					
					////when the blkdev stats are updated for first time, we save the timestamp of the '_prev_stats', for next iteration
					//if(!this.blockdevices.sda._prev_stats){
						////console.log('saving prev timestamp');
						//this.blockdevices.sda._prev_stats = {};
						//this.blockdevices.sda._prev_stats.timestamp = Date.now();
					//}
						
					
					//console.log('this.blockdevices().sda.stats() suscribe');
					
					////milliseconds between last update and this one
					//var time_in_queue = value.time_in_queue - this.blockdevices.sda._prev_stats.time_in_queue;
					
					////////console.log('TIME IN QUEUE: '+time_in_queue);
					
					////var percentage_in_queue = [];
					//data = [];
					/**
					 * each messure spent on IO, is 100% of the disk at full IO speed (at least, available for the procs),
					 * so, as we are graphing on 1 second X, milliseconds spent on IO, would be % of that second (eg: 500ms = 50% IO)
					 * 
					 * */
					//if(time_in_queue < 1000){//should always enter this if, as we messure on 1 second updates (1000+)
						////////console.log('LESS THAN A SECOND');
						//data.push((time_in_queue * 100) / 1000);
					//}
					//else{//updates may not get as fast as 1 second, so we split the messure for as many as seconds it takes
						////////console.log('MORE THAN A SECOND');
						
						////for(var i = 1; i < (time_in_queue / 1000); i++){
							//////////console.log('----SECOND: '+i);
							
							////data.push( 100 ); //each of this seconds was at 100%
						////}
						
						//data.push(( (time_in_queue % 1000) * 100) / 1000);
					//}
					
					//var data = this._blockdevice_percentage_data(this.blockdevices.sda._prev_stats.time_in_queue, value.time_in_queue);
					var data = this._blockdevice_percentage_data(this.blockdevices.sda._prev_stats, value);
					
					this._update_plot_data('sda_stats', data, value.timestamp);
					
					//for(var i = 0; i < data.length; i++ ){
						//this._update_plot_data('sda_stats', data[i]);
					//}
					
				}.bind(this) );
				
		}.bind(this));
		
		this.periodical_functions['plot_update']['fn'] = function(){
			//console.log('update_plot');
			
			var last_minutes = Date.now().getTime() - 120000;
			var old_data = this.plot.getData();
			
			
			Array.each(old_data, function(data, index){
				
				var new_data = [];
				//raw_data = old_data[index].data;
				var raw_data = data.data;
				//////console.log('raw_data');
				//////console.log(typeOf(raw_data));
				//////console.log(raw_data);
				//////console.log(raw_data.length);
				
				//if(raw_data.length >= 60){
					//for(var i = 0; i < (raw_data.length - 60); i++){
					for(var i = 0; i < raw_data.length; i++){
						//////console.log('raw_data '+i);
						//////console.log(raw_data[i]);
						
						if(raw_data[i][0] >= last_minutes){//if timestamp >= max time window to show
							new_data.push(raw_data[i]);
						}
						//raw_data.shift();
					}
				//}
				
				this.plot_data[index] = new_data;
			}.bind(this));
			
			
			this.plot = $.plot($("#canvas_dahs"),
				//raw_data
				this.plot_data,
				this.options.timed_plot._defaults
			);
		}.bind(this);
		
		this.periodical_functions['plot_update']['interval'] = this.options.timed_plot.update_interval;
		//.periodical(this.options.timed_plot.update_interval, this);
		
	},
	//_blockdevice_percentage_data(oldValue, newValue){
		//var time_in_queue = newValue - oldValue;
					
		////////console.log('TIME IN QUEUE: '+time_in_queue);
		
		////var percentage_in_queue = [];
		//var data = [];
		///**
		 //* each messure spent on IO, is 100% of the disk at full IO speed (at least, available for the procs),
		 //* so, as we are graphing on 1 second X, milliseconds spent on IO, would be % of that second (eg: 500ms = 50% IO)
		 //* 
		 //* */
		//if(time_in_queue < 1000){//should always enter this if, as we messure on 1 second updates (1000+)
			////////console.log('LESS THAN A SECOND');
			//data.push((time_in_queue * 100) / 1000);
		//}
		//else{//updates may not get as fast as 1 second, so we split the messure for as many as seconds it takes
			////////console.log('MORE THAN A SECOND');
			
			////for(var i = 1; i < (time_in_queue / 1000); i++){
				//////////console.log('----SECOND: '+i);
				
				////data.push( 100 ); //each of this seconds was at 100%
			////}
			
			//data.push(( (time_in_queue % 1000) * 100) / 1000);
		//}
					
		//return data;
	//},
	_blockdevice_percentage_data(oldValue, newValue){
		//oldValue.timestamp = oldValue.timestamp || newValue.timestamp - 5000; //last doc.timestamp - prev.doc.timestamp (aproximate value, polling time)
		
		var time_diff = newValue.timestamp - oldValue.timestamp;
		var io_ticks = newValue.io_ticks - oldValue.io_ticks;//milliseconds, can't be greater than time_diff
		
		//console.log('io_ticks');
		//console.log(io_ticks);
		//console.log('time_diff');
		//console.log(time_diff);
		//console.log(oldValue);
		//console.log(newValue);
		
		
		var data = 0;
		
		if(io_ticks == 0 && time_diff == 0){
			data = 0;
		}
		else if(io_ticks >= time_diff){
			data = 100; //busy all the time, 100%
		}
		else{
			data = ((io_ticks * 100) / time_diff).toFloat().toFixed(2);
		}
		
		//console.log('sda_stats percentage');
		//console.log(data);
					
		return data;
	},
	_load_plot: function(){
					
		Array.each(this.plot_data_order, function(type){//add an empty array for each data type to plot
				this.plot_data.push([]);
		}.bind(this));
		
		this.plot = $.plot($("#canvas_dahs"), this.plot_data, this.options.timed_plot._defaults);
		
		
	},
	_update_plot_data: function(type, new_data, timestamp){
		//this.plot_data_last_update = this.plot_data_update;
		var now = Date.now().getTime();
		//this.plot_data_update = now;
		timestamp = timestamp || now;
		
		//////console.log('_update_plot_data: '+type);
		//if(type == 'sda_stats'){
			//////console.log('_update_plot_data timestamp: '+timestamp);
			//////console.log('_update_plot_data data: '+new_data);
		//}
		
		var index = this.plot_data_order.indexOf(type);
		
		if(index >= 0 && this.plot && this.plot.getData()){
			
			
			var old_data = this.plot.getData();
			var raw_data = [];
			
			raw_data = old_data[index].data;
			
			if(typeOf(new_data) == 'array'){
				for(var i = 0; i < new_data.length; i++ ){
					raw_data.push([timestamp, new_data[i] ]);
				}
			}
			else{
				raw_data.push([timestamp, new_data ]);
			}
			
			this.plot_data[index] = raw_data;
			
		}
	},
});

/**
 * http://www.matteoagosti.com/blog/2013/02/24/writing-javascript-modules-for-both-browser-and-node/
 * 
 * */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = OSModel;
}
else {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return OSModel;
		});
	}
	else {
		window.OSModel = OSModel;
	}
}
