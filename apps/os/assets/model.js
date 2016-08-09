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
	
	plot: null,
	plot_data: [],
	plot_data_order: ['cpus', 'loadavg', 'freemem', 'sda_stats'],
	
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
			
			update_interval: 1000,
		}
		
	},
	//cpu_usage_percentage: function(cpus){
		//cpus = cpus || this.cpus();
		////console.log('user_friendly_cpus_usage');
		
		//var old_cpu_usage = this.cpu_usage;
		//this.cpu_usage = {
			//user: 0,
			//nice: 0,
			//sys: 0,
			//idle: 0
		//};
		
		//Array.each(cpus, function(cpu){
			
			//this.cpu_usage.user += cpu.times.user;
			//this.cpu_usage.nice += cpu.times.nice;
			//this.cpu_usage.sys += cpu.times.sys;
			//this.cpu_usage.idle += cpu.times.idle;

		//}.bind(this));
		
		//var new_info = {
			//user: 0,
			//nice: 0,
			//sys: 0,
			//idle: 0
		//};

		//var user = this.cpu_usage.user - old_cpu_usage.user;
		//var nice = this.cpu_usage.nice - old_cpu_usage.nice;
		//var sys = this.cpu_usage.sys - old_cpu_usage.sys;
		//var idle = this.cpu_usage.idle - old_cpu_usage.idle;
		
		///**
		 //* may result on 0 if there are no new docs on database and the data we get if always from last doc
		 //* 
		//* */
		//new_info.user = (user <= 0) ? old_cpu_usage.user : user;
		//new_info.nice = (nice <= 0) ? old_cpu_usage.nice : nice;
		//new_info.sys =  (sys <= 0)  ? old_cpu_usage.sys : sys;
		//new_info.idle = (idle <= 0) ? old_cpu_usage.idle : idle;
		
		////console.log(new_info);
		
		//var total_usage = 0;
		//var total_time = 0;
		//Object.each(new_info, function(value, key){
			//if(key != 'idle'){
				//total_usage += value;
			//}
			//total_time += value;
		//});
		
		
		//var percentage = {
			//user: 0,
			//nice: 0,
			//sys: 0,
			//idle: 0,
			//usage: 0
		//};
		
		//percentage = {
			//user: ((new_info.user * 100) / total_time).toFixed(2),
			//nice: ((new_info.nice * 100) / total_time).toFixed(2),
			//sys: ((new_info.sys * 100) / total_time).toFixed(2),
			//idle: ((new_info.idle * 100) / total_time).toFixed(2),
			//usage: ((total_usage * 100) / total_time).toFixed(2)
		//};
		
		////var total_time = total_usage + new_info.idle;
		
		
		//console.log(percentage);
		//this._update_plot_data('cpus', percentage['usage'].toFloat());
		
		//return percentage;
	//},
	cpu_usage_percentage: function(old_data, new_data){
		//cpus = cpus || this.cpus();
		//console.log('user_friendly_cpus_usage');
		
		//var old_cpu_usage = this.cpu_usage;
		//var cpu_usage = {
			//user: 0,
			//nice: 0,
			//sys: 0,
			//idle: 0
		//};
		
		//Array.each(cpus, function(cpu){
			
			//cpu_usage.user += cpu.times.user;
			//cpu_usage.nice += cpu.times.nice;
			//cpu_usage.sys += cpu.times.sys;
			//cpu_usage.idle += cpu.times.idle;

		//}.bind(this));
		
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
		new_info.user = (user <= 0) ? 0 : user;
		new_info.nice = (nice <= 0) ? 0 : nice;
		new_info.sys =  (sys <= 0)  ? 0 : sys;
		new_info.idle = (idle <= 0) ? 0 : idle;
		
		//console.log('new_info');
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
		
		if(total_time > 0){
			percentage = {
				user: ((new_info.user * 100) / total_time).toFixed(2),
				nice: ((new_info.nice * 100) / total_time).toFixed(2),
				sys: ((new_info.sys * 100) / total_time).toFixed(2),
				idle: ((new_info.idle * 100) / total_time).toFixed(2),
				usage: ((total_usage * 100) / total_time).toFixed(2)
			};
		}
		//var total_time = total_usage + new_info.idle;
		
		//this.cpu_usage.push(cpu_usage);
		
		//console.log(percentage);
		
		//this._update_plot_data('cpus', percentage['usage'].toFloat());
		
		return percentage;
	},
	initialize: function(options){
		
		this.setOptions(options);
		
		//////console.log('this.networkInterfaces');
		//////console.log(this.primary_iface());
		
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
			
			this._update_plot_data('cpus', percentage['usage'].toFloat());
			
			return percentage;
			
		}.bind(this));
		//this.user_friendly_cpus_usage = ko.pureComputed(function(){
			//cpus = this.cpus();
			////cpus = cpus || this.cpus();
			////console.log('user_friendly_cpus_usage');
			
			//var old_cpu_usage = this.cpu_usage;
			//this.cpu_usage = {
				//user: 0,
				//nice: 0,
				//sys: 0,
				//idle: 0
			//};
			
			//Array.each(cpus, function(cpu){
				
				//this.cpu_usage.user += cpu.times.user;
				//this.cpu_usage.nice += cpu.times.nice;
				//this.cpu_usage.sys += cpu.times.sys;
				//this.cpu_usage.idle += cpu.times.idle;

			//}.bind(this));
			
			//var new_info = {
				//user: 0,
				//nice: 0,
				//sys: 0,
				//idle: 0
			//};

			//var user = this.cpu_usage.user - old_cpu_usage.user;
			//var nice = this.cpu_usage.nice - old_cpu_usage.nice;
			//var sys = this.cpu_usage.sys - old_cpu_usage.sys;
			//var idle = this.cpu_usage.idle - old_cpu_usage.idle;
			
			///**
			 //* may result on 0 if there are no new docs on database and the data we get if always from last doc
			 //* 
			//* */
			//new_info.user = (user <= 0) ? old_cpu_usage.user : user;
			//new_info.nice = (nice <= 0) ? old_cpu_usage.nice : nice;
			//new_info.sys =  (sys <= 0)  ? old_cpu_usage.sys : sys;
			//new_info.idle = (idle <= 0) ? old_cpu_usage.idle : idle;
			
			////console.log(new_info);
			
			//var total_usage = 0;
			//var total_time = 0;
			//Object.each(new_info, function(value, key){
				//if(key != 'idle'){
					//total_usage += value;
				//}
				//total_time += value;
			//});
			
			
			//var percentage = {
				//user: 0,
				//nice: 0,
				//sys: 0,
				//idle: 0,
				//usage: 0
			//};
			
			//percentage = {
				//user: ((new_info.user * 100) / total_time).toFixed(2),
				//nice: ((new_info.nice * 100) / total_time).toFixed(2),
				//sys: ((new_info.sys * 100) / total_time).toFixed(2),
				//idle: ((new_info.idle * 100) / total_time).toFixed(2),
				//usage: ((total_usage * 100) / total_time).toFixed(2)
			//};
			
			////var total_time = total_usage + new_info.idle;
			
			
			//console.log(percentage);
			
			//this._update_plot_data('cpus', percentage['usage'].toFloat());
			
			//return percentage;
		//}.bind(this));
		
		this.user_friendly_uptime = ko.pureComputed(function(){
			return (this.uptime() / this[this.options.current_time_base]).toFixed(0);
		}.bind(this));
		
		this.primary_iface_out = ko.pureComputed(function(){
			//console.log('this.networkInterfaces[this.primary_iface()]()');
			//console.log(this.primary_iface());
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
			
			//////console.log(arr);
			return arr;
			
		}.bind(this));
		
		this.list_blk_dev = ko.pureComputed(function(){
			//console.log('list_blk_dev');
			//console.log(this.blockdevices);
			
			var arr = [];
			
			var colors=["aero", "purple", "red", "green",  "blue"];//class="fa fa-square $color", has to match Chart order
			
			Object.each(this.blockdevices, function(dev, name){
				console.log(dev);
				
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
			//console.log('this.mounts');
			//console.log(this.mounts);
			//console.log(this.list_blk_dev());
			
			var mounts = [];
			Array.each(this.mounts, function(mount){
				
				if(this.options.list_partitions_types.test(mount.type())){
					var info = {};
					info.percentage = mount.percentage();
					info.point = mount.mount_point();
					info.fs = mount.fs();
					info.size = '?';
					
					//console.log(info.fs);
					
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
			
			//console.log(mounts);
			return mounts;
			
		}.bind(this));
		
		var self = this;
		ko.bindingHandlers.load_chart = {
			init: function(element, valueAccessor) {
					var name = ko.unwrap(valueAccessor()); // Get the current value of the current property we're bound to
					
					console.log('load_chart');
					console.log(element);
					console.log(name);
					//$(element).toggle(value); // jQuery will hide/show the element depending on whether "value" or true or false
					
					var dev = self.blockdevices[name];
					
					////console.log('DEVICE');
					//console.log(name);
					//console.log(dev.partitions());
					
					//var id = Object.keys(dev)[0];
					var size = dev.size();
					
					////console.log("blockdevice_");
					////console.log(dev[id].partitions());
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
			////console.log('_load_plot');
			//this._load_plot();
		//}.bind(this));
		ko.tasks.schedule(function () {
				//console.log('my microtask');
				this._load_plot();
		}.bind(this));
	},
	_load_plot: function(){
					
		/**
		 * load initial data
		 * 
		 * */
		var now = new Date();
		var cpu = [];
		var load = [];
		var used_mem_percentage = [];
		var sda_io_percentage = [];
		
		//for(var i = 0; i <= 59; i++){
			////data.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - i).getTime(), Math.floor((Math.random() * 100) + 1)]);
			
			////cpu.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.floor((Math.random() * 10) + 1)]);
			
			//load.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.random().toFixed(2)]);
			
			//used_mem_percentage.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.floor((Math.random() * 50) + 1)]);
			
			//sda_io_percentage.push([new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 1, i).getTime(), Math.floor((Math.random() * 10) + 1)]);
		//}
		this.plot_data.push(cpu);
		this.plot_data.push(load);
		this.plot_data.push(used_mem_percentage);
		this.plot_data.push(sda_io_percentage);
		
		console.log(this.options.timed_plot._defaults);
		
		this.plot = $.plot($("#canvas_dahs"), this.plot_data, this.options.timed_plot._defaults);
		
		
		var update_plot = function(){
			console.log('update_plot');
			
			this.plot = $.plot($("#canvas_dahs"),
				//raw_data
				this.plot_data,
				this.options.timed_plot._defaults
			);
		}.periodical(this.options.timed_plot.update_interval, this);
		
	},
	_update_plot_data: function(type, new_data, timestamp){
		timestamp = timestamp || Date.now().getTime();
		console.log('_update_plot_data: '+type);
		console.log('_update_plot_data timestamp: '+timestamp);
		console.log('_update_plot_data data: '+new_data);
		
		var index = this.plot_data_order.indexOf(type);
		
		if(index >= 0 && this.plot && this.plot.getData()){
			
			
			var old_data = this.plot.getData();
			var raw_data = [];
			
			raw_data = old_data[index].data;
			if(raw_data.length >= 60){
				for(var i = 0; i < (raw_data.length - 60); i++){
					raw_data.shift();
				}
			}
			
			//data = null;
			
			//switch (type){
				//case 'freemem': data = (((this.model.totalmem() - this.model.freemem()) * 100) / this.model.totalmem()).toFixed(2);
					//break;
				
				//case 'cpus': data = this.model.user_friendly_cpus_usage()['usage'].toFloat();
					//break;
					
				//case 'loadavg': data = this.model.user_friendly_loadavg()[0].toFloat();
					//break;
					
				//case 'sda_stats': 
					////milliseconds between last update and this one
					//var time_in_queue = this.model.blockdevices.sda.stats().time_in_queue - this.model.blockdevices.sda._prev_stats.time_in_queue;
					
					////console.log('TIME IN QUEUE: '+time_in_queue);
					
					////var percentage_in_queue = [];
					//data = [];
					///**
					 //* each messure spent on IO, is 100% of the disk at full IO speed (at least, available for the procs),
					 //* so, as we are graphing on 1 second X, milliseconds spent on IO, would be % of that second (eg: 500ms = 50% IO)
					 //* 
					 //* */
					//if(time_in_queue < 1000){//should always enter this if, as we messure on 1 second updates (1000+)
						////console.log('LESS THAN A SECOND');
						//data.push((time_in_queue * 100) / 1000);
					//}
					//else{//updates may not get as fast as 1 second, so we split the messure for as many as seconds it takes
						////console.log('MORE THAN A SECOND');
						
						//for(var i = 1; i < (time_in_queue / 1000); i++){
							////console.log('----SECOND: '+i);
							
							//data.push( 100 ); //each of this seconds was at 100%
						//}
						
						//data.push(( (time_in_queue % 1000) * 100) / 1000);
					//}
					
					//break;
			//}
			
			//push data
			//switch (type){
				//case 'sda_stats':
					//for(var i = 0; i < new_data.length; i++ ){
						//raw_data.push([timestamp, new_data[i] ]);
					//}
					//break;
					
				//default: 
					//raw_data.push([timestamp, new_data ]);
			//}
			
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
