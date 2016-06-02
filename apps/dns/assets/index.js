//var DNSBodyModel = {};

//head.load([
	//{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
	//{ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }//no dependencies
//], function() {

function getURLParameter(name, URI) {
	URI = URI || location.search;
	
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(URI)||[,""])[1].replace(/\+/g, '%20'))||null;
}

var dns_server = null;
var update_server = function (data){
	dns_server = data;
}

head.load({ jsonp: "/dns/api/server/?callback=update_server" });

head.load({ li: "/public/bower/li/lib/index.js" });//parse Link header

head.ready('jsonp', function(){
	head.ready('history',
	function() {
			 
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
				
				all_toggled: ko.observable(false),
				
				toggle_all: function(){
						self.pagination.all_toggled( (self.pagination.all_toggled() == false) ? true : false );
						console.log('all_toggled');
						console.log(self.pagination.all_toggled());
						return true;//ko needs this for allow the click take DOM action
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
						
						if(res.status == 206){
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
						
							
						console.log('navigate');
						console.log(URI);
						console.log(param);
						
						pager.navigate(URI+param);
						
						//window.location.replace(res.headers.Link.split(';')[0].replace(/<|>/g, ''));
					}
				});
			};
			
			load_page(self.URI, param);

		};
		
		
		console.log(mainBodyModel.dns());
		
		if(mainBodyModel.dns() == null){

			mainBodyModel.dns(new DNSModel());

			console.log('DNS binding applied');
			//window.dispatchEvent('onload');
			//window.dispatchEvent(re_init_mdl);
			
			//http://stackoverflow.com/questions/32363511/how-can-i-update-refresh-google-mdl-elements-that-i-add-to-my-page-dynamically
			// Expand all new MDL elements
      componentHandler.upgradeDom();
			//document.documentElement.classList.add('mdl-js');
			//componentHandler.upgradeAllRegistered();
		}
			
	});
});

//http://stackoverflow.com/questions/31413042/toggle-material-design-lite-checkbox
