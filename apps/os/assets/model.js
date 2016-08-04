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
	cpu_usage_percentage: function(cpus){
		cpus = cpus || this.cpus();
		//console.log('user_friendly_cpu_usage');
		
		var old_cpu_usage = this.cpu_usage;
		this.cpu_usage = {
			user: 0,
			nice: 0,
			sys: 0,
			idle: 0
		};
		
		Array.each(cpus, function(cpu){
			
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

		var user = this.cpu_usage.user - old_cpu_usage.user;
		var nice = this.cpu_usage.nice - old_cpu_usage.nice;
		var sys = this.cpu_usage.sys - old_cpu_usage.sys;
		var idle = this.cpu_usage.idle - old_cpu_usage.idle;
		
		/**
		 * may result on 0 if there are no new docs on database and the data we get if always from last doc
		 * 
		* */
		new_info.user = (user <= 0) ? old_cpu_usage.user : user;
		new_info.nice = (nice <= 0) ? old_cpu_usage.nice : nice;
		new_info.sys =  (sys <= 0)  ? old_cpu_usage.sys : sys;
		new_info.idle = (idle <= 0) ? old_cpu_usage.idle : idle;
		
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
		
		
		//console.log(percentage);
		return percentage;
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
		
		this.user_friendly_cpu_usage = ko.pureComputed(this.cpu_usage_percentage.bind(this));
		
		this.user_friendly_uptime = ko.pureComputed(function(){
			return (this.uptime() / this[this.options.current_time_base]).toFixed(0);
		}.bind(this));
		
		this.primary_iface_out = ko.pureComputed(function(){
			console.log('this.networkInterfaces[this.primary_iface()]()');
			console.log(this.primary_iface());
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
			console.log('user_friendly_loadavg');
			console.log(this.loadavg());
			Array.each(this.loadavg(), function(item, index){
				arr[index] = item.toFixed(2);
			}.bind(this));
			
			//////console.log(arr);
			return arr;
			
		}.bind(this));
		
		this.list_blk_dev = ko.pureComputed(function(){
			console.log('list_blk_dev');
			console.log(this.blockdevices);
			
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
			console.log('this.mounts');
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
			
			console.log(mounts);
			return mounts;
			
		}.bind(this));
	}
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
