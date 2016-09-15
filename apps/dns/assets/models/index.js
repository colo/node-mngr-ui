var DNSModel = function(){
			
	self = this;
	
	self.zones = ko.observableArray([
	]);
	
	self.pagination = {
		ITEMS_PER_PAGE: 10,
		
		//current_page: 1,
		
		total_count: 0,
		total_pages: 1,
		
		disabled: {
			first: ko.observable(true),
			prev: ko.observable(true),
			next: ko.observable(false),
			last: ko.observable(false)
		},
		
		links: ko.observable({
			first: null,
			prev: null,
			next: null,
			last: null,
		}),
		
		//all_toggled: ko.observable(false),
		
		checked: new Array(),//array of checkbox.value checked
		
		/**
		 * don't use it to check the "toogle all" checkbox
		 * */
		check: function(el){
			var checkbox = el;//input checkbox
			
			self.pagination.checked.include(checkbox.value);//pushes the passed element into the array if it's not already present (case and type sensitive).
			
			el.checked = true;
			
			//console.log('checked array');
			//console.log(self.pagination.checked);
			return true;
		},
		
		/**
		 * don't use it to uncheck the "toogle all" checkbox
		 * */
		uncheck: function(el){
			var checkbox = el;//input checkbox
			
			if(self.pagination.checked.contains(checkbox.value)){
				//console.log('checkbox data');
				//console.log(checkbox.value);
				self.pagination.checked = self.pagination.checked.erase(checkbox.value);
			}
			
			el.checked = false;
			
			//console.log('checked array');
			//console.log(self.pagination.checked);
			return true;
		},
		
		toggle_all: function(el){//receives the "toogle all" element

				var els = document.getElementsByName('data_chkbox');//get all labels by "name"
				
				if(el.checked){
					el.checked = true;
					
					Array.each(els, function(el){
						self.pagination.check(el);
					});
				}
				else{//uncheck all
					el.checked = false;
					
					Array.each(els, function(el){
						self.pagination.uncheck(el);
					});
				}
				return true;
		},
		
		/**
		 * don't use it to toogle the "toogle all" checkbox
		 * */
		toggle: function(el){
			var main_chkbox = document.getElementById('data_chkbox');//get "toggle all" element
			
			//console.log(el.checked);
			
			if(el.checked){//doens't have a public property o method to check state :(
				self.pagination.check(el);
				
				var els = document.getElementsByName('data_chkbox');//get all labels->checkbox by "name"
				self.pagination._toogle_main_checkbox(els);
			}
			else{
				self.pagination.uncheck(el);
				main_chkbox.checked = false;
			}
			
			//return el.checked;
			return true;
		},
		
		/**
		 * check the checkboxs that were previously checked (made selection persistant on page change/back and forth)
		 * 
		 * */
		check_checked: function(){
			//console.log('check_checked');
			
			var els = document.getElementsByName('data_chkbox');
			
			Array.each(els, function(el){
				var checkbox = el;//input checkbox
				
				if(self.pagination.checked.contains(checkbox.value)){
					el.checked = true;
				}
			});
			
			self.pagination._toogle_main_checkbox(els);
		},
		
		/**
		 * @private: toggle check/uncheck the "toggle all" check box if all elements are check or not
		 * 
		 * */
		_toogle_main_checkbox: function(els){
			var main_chkbox = document.getElementById('data_chkbox');//get "toggle all" checkbox
			if(main_chkbox){//may not be present on views with no checkbox
				
				//var els = document.getElementsByName('lbl_data_chkbox');//get all labels->checkbox by "name"
				
				try{
					Array.each(els, function(el){//if all checked, check main one
						if(!el.checked){
							throw new Error();
						}
					});
					
					main_chkbox.checked = true;
				}
				catch(e){
					main_chkbox.checked = false;
				}
			}
			
			return true;
		}
	};
	
	
	//console.log('dns server');
	//console.log(dns_server);
	
	var servers = [
			dns_server
	];
	
	var client = resilient({
		 service: { 
			 basePath: '/bind',
			 headers : { "Content-Type": "application/json" }
		 }
	});
	
	client.setServers(servers);
	
	var param = '?first='+self.pagination.ITEMS_PER_PAGE;
	
	if(getURLParameter('last') && getURLParameter('last') >= 0){
		param = '?last='+getURLParameter('last');
	}
	else if(getURLParameter('start') && getURLParameter('start') >= 0){
		param = '?start='+getURLParameter('start');
		
		if(getURLParameter('end') && getURLParameter('end') >= 0){
			
			//don't allow to set more "items per page" than configured
			if((getURLParameter('end') - getURLParameter('start')) > (self.pagination.ITEMS_PER_PAGE - 1)){
				var end = new Number(getURLParameter('start')) + (self.pagination.ITEMS_PER_PAGE - 1);
				param += '&end='+end;
			}
			else{
				param += '&end='+getURLParameter('end');
			}
		}
		else{
			var end = new Number(getURLParameter('start')) + (self.pagination.ITEMS_PER_PAGE - 1);
			param += '&end='+end;
		}
	}
	
	self.URI = window.location.protocol+'//'+window.location.host+window.location.pathname;
	
	load_page = function(URI, param){
		//console.log('loading...');
		//console.log('URI: '+URI);
		//console.log('param: ');
		//console.log(param);
		
		
		client.get('/zones/'+param, function(err, res){
			if(err){
				console.log('Error:', err);
				console.log('Response:', err.data);
			}
			else{
				console.log('Ok:', res);
				console.log('Body:', res.data);
				console.log('headers');
				console.log(res.headers);
				
				self.zones(res.data);
				
				/**
				 * @pagination
				 * 
				 * */
				 //on page load uncheck "toogle all" checkbox (may be checked later)
				var main_chkbox = document.getElementById('data_chkbox');//get "all" checkbox
				
				if(main_chkbox)//may not be present on views with no checkbox
					main_chkbox.checked = false;
				
				if(res.status == 206){//partial content
					self.pagination.total_count = res.headers['Content-Range'].split('/')[1];
					self.pagination.total_pages = Math.ceil(self.pagination.total_count / self.pagination.ITEMS_PER_PAGE);
				}
				else{
					self.pagination.total_pages = 1;
					self.pagination.total_count = res.data.length;
				}
				
				if(self.pagination.total_pages > 1){
					
					if(new RegExp(/first\=/).test(param) ||
						new RegExp(/start\=0/).test(param)){//first page of pages > 1
							
						console.log('first page');
						self.pagination.disabled.first(true);
						self.pagination.disabled.prev(true);
						self.pagination.disabled.next(false);
						self.pagination.disabled.last(false);
						
						//self.pagination.current_page = 1;
					}
					else if(new RegExp(/\?last\=/).test(param) ||
						new RegExp('end\='+new Number(self.pagination.total_count - 1)).test(param)){//last page of pages > 1
							
						console.log('last page');
						self.pagination.disabled.first(false);
						self.pagination.disabled.prev(false);
						self.pagination.disabled.next(true);
						self.pagination.disabled.last(true);
					
						//self.pagination.current_page = self.pagination.total_pages;
						
					}
					else{
						self.pagination.disabled.first(false);
						self.pagination.disabled.prev(false);
						self.pagination.disabled.next(false);
						self.pagination.disabled.last(false);
					}
				}
				else{//no more than 1 page, disable all
					self.pagination.disabled.first(true);
					self.pagination.disabled.prev(true);
					self.pagination.disabled.next(true);
					self.pagination.disabled.last(true);
					
					//self.pagination.current_page = 1;
				}
				
				
				var first = new String(li.parse(res.headers.Link).first.replace(dns_server+'/bind/zones', '')+'='+self.pagination.ITEMS_PER_PAGE).replace('/', '');
				
				var prev = new String(li.parse(res.headers.Link).prev.replace(dns_server+'/bind/zones', '')).replace('/', '');
				
				var next = new String(li.parse(res.headers.Link).next.replace(dns_server+'/bind/zones', '')).replace('/', '');
				
				/**
				 * use 'start&end', 'last=N' "modifies" the number of "items per page" (not the variable)
				 * 
				 * var last_items = last_end - last_start;
				 * var last = new String(li.parse(res.headers.Link).last.replace(dns_server+'/bind/zones', '')+'='+last_items).replace('/', '');
				 * */
				var last_start = (self.pagination.total_pages - 1) * self.pagination.ITEMS_PER_PAGE;
				var last_end = self.pagination.total_count - 1;
				var last = '?start='+last_start+'&end='+last_end;
				
				self.pagination.links({
					first: first,
					prev: prev,
					next: next,
					last : last
				});
				
					
				//console.log('navigate');
				//console.log(URI);
				//console.log(param);
				
				//componentHandler.upgradeDom();
				self.pagination.check_checked();
				/**
				 * @end pagination
				 * 
				 * */
				 
				 pager.navigate(URI+param);//modify browser URL to match current request 
			}
		});
	};
	
	load_page(self.URI, param);

};

/**
 * http://www.matteoagosti.com/blog/2013/02/24/writing-javascript-modules-for-both-browser-and-node/
 * 
 * */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = DNSModel;
}
else {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return DNSModel;
		});
	}
	else {
		window.DNSModel = DNSModel;
	}
}
