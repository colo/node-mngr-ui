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
				
				current_page: 1,
				
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
			
				check_disabled: function(button){
					console.log('check_disabled');
					console.log(button);
					console.log('check_disabled->current_page');
					console.log(self.pagination.current_page);
					
					var result = false;
					
					switch(button){
						case 'first': if(self.pagination.current_page == 0) result = true; break;
					}
					
					return result;
				},
			};
			
			
			console.log('dns server');
			console.log(dns_server);
			
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
					param += '&end='+getURLParameter('end');
				}
				else{
					var end = new Number(getURLParameter('start')) + 9;
					param += '&end='+end;
				}
			}
			
			//console.log('start');
			//console.log(getURLParameter('start'));
			//console.log('end');
			//console.log(getURLParameter('end'));
			
			//console.log('param');
			//console.log(param);
			
			//pager.navigate('http://localhost:8080/dns/?start='+start+'&end='+end);
			//console.log('pager.Page.getFullRoute()');
			
			self.URI = window.location.protocol+'//'+window.location.host+window.location.pathname;
			
			//pager.navigate(URI+'/'+param);//change window URI
			
			load_page = function(URI, param){
				console.log('loading...');
				console.log('URI: '+URI);
				console.log('param: ');
				console.log(param);
				
				
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
						
						self.pagination.total_count = res.headers['Content-Range'].split('/')[1];
						
						self.pagination.total_pages = Math.ceil(self.pagination.total_count / self.pagination.ITEMS_PER_PAGE);
						
						if(self.pagination.total_pages > 1){
							
							if(new RegExp(/first\=/).test(param) ||
								new RegExp(/start\=0/).test(param)){//first page of pages > 1
									
								console.log('first page');
								self.pagination.disabled.first(true);
								self.pagination.disabled.prev(true);
								self.pagination.disabled.next(false);
								self.pagination.disabled.last(false);
								
								self.pagination.current_page = 1;
							}
							else if(new RegExp(/\?last\=/).test(param) ||
								new RegExp('end\='+new Number(self.pagination.total_count - 1)).test(param)){//last page of pages > 1
									
								console.log('last page');
								self.pagination.disabled.first(false);
								self.pagination.disabled.prev(false);
								self.pagination.disabled.next(true);
								self.pagination.disabled.last(true);
							
								self.pagination.current_page = self.pagination.total_pages;
								
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
							
							self.pagination.current_page = 1;
						}
						
						
						var first = new String(li.parse(res.headers.Link).first.replace(dns_server+'/bind/zones', '')+'='+self.pagination.ITEMS_PER_PAGE).replace('/', '');
						var prev = new String(li.parse(res.headers.Link).prev.replace(dns_server+'/bind/zones', '')).replace('/', '');
						var next = new String(li.parse(res.headers.Link).next.replace(dns_server+'/bind/zones', '')).replace('/', '');
						
						//var last = new String(li.parse(res.headers.Link).last.replace(dns_server+'/bind/zones', '')+'='+self.pagination.ITEMS_PER_PAGE).replace('/', '');
						
						var last_start = (self.pagination.total_pages - 1) * self.pagination.ITEMS_PER_PAGE;
						var last_end = self.pagination.total_count - 1;
						var last = '?start='+last_start+'&end='+last_end;
						
						self.pagination.links({
							//links should have more properties to check enable/disable??
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

		}
			
	});
});
