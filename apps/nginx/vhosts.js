'use strict'

var App = require('node-express-app'),
	path = require('path'),
	util = require('util'),
	li = require('li'),
	vhosts_client = require('./clients/vhosts');
	


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  client: null,
  //hidden: true,//don't show on views (nav_bar, content, etc)
  
  
  options: {
		
		/**
		 * @todo req.query sanitizer as req.params
		 *
		 * query: {
		 * rows: /^(0|[1-9][0-9]*)$/,
		 * page: /^(0|[1-9][0-9]*)$/
		 * },
		*/
		
	  session: {
			pagination: {
				page: 1,
				rows: 10,
				sort: 'uri',
				descending: false
				//prev: null,
				//next: null
			},
			content_range: {
				start: 0,
				end: 0,
				total: 0
			}
		},
		
	  client: {scheme: 'http', url:'127.0.0.1', port: 8081},
	  
	  
	  layout:{
			name: 'Nginx Vhosts',
			description: 'Nginx Vhosts',
			menu : {
				available: false,
				icon: 'fa-cog'
			},
			content: {
				available: false,
			},
			
			hidden: true,
		},
		
		id: 'nginx-vhosts',
		path: '/nginx/vhosts',
		
		params: {
		},
		
		routes: {
			
			all: [
				{
				path: '',
				callbacks: ['render']
				},
			]
		},
		
		api: {
			
			path: '/api',
			
			version: '1.0.0',
			
			routes: {

				all: [
					{
						path: '',
						callbacks: ['get'],
						version: '',
					},
				]
			},
			
		},
  },
  get_page_uri: function(){
		var uri = '';
		const page = this.options.session.pagination.page - 1;
		const rows = this.options.session.pagination.rows;
		const total = this.options.session.content_range.total;
		
		if(this.options.session.pagination.descending === true){
			if(total == 0){
				uri = '?last='+rows;
			}
			else{
				const end = (total - (page * rows)) - 1;
				const start = (end - (rows - 1)) > 0 ? end - (rows - 1) : 0;
				uri = '?start='+start+'&end='+end;
			}
			
			/*const start = page * rows;
			const end = start + (rows - 1);
			uri = '?start='+start+'&end='+end;*/

			//if(this.options.session.content_range.total != 0 && this.options.session.content_range.start < this.options.session.content_range.total){
				//console.log('---has total---');
				//console.log(this.options.session.content_range);
				//const end = this.options.session.content_range.end - (this.options.session.content_range.start - 1);
				//const start = (end - (this.options.session.pagination.rows - 1) > 0) ? end - (this.options.session.pagination.rows - 1) : 0;
				//link = '?start='+start+'&end='+end;
			//}
			//else{
				//link = '?last='+this.options.session.pagination.rows;
			//}
		}
		else{
			//const end = (this.options.session.pagination.rows - 1) + this.options.session.content_range.end;
			//link = '?start='+this.options.session.content_range.end+'&end='+end;
			/*switch(page) {
					case 0:
						uri = '?first='+rows;
						break;
					default:
						const start = page * rows;
						const end = start + (rows - 1);
						uri = '?start='+start+'&end='+end;
			}*/
			
			const start = page * rows;
			const end = start + (rows - 1);
			uri = '?start='+start+'&end='+end;
		}
		
		return uri;
	},
  get: function(req, res, next){
		
		
		var sent = false;
		
		console.log(req.query);
		
		this.options.session.pagination = {
			sort : req.query.sort || this.options.session.pagination.sort,
			//descending : (req.query.descending == "true") ? true : this.options.session.pagination.descending,
			descending : JSON.parse(req.query.descending),
			page : req.query.page || this.options.session.pagination.page,
			rows : req.query.rows || this.options.session.pagination.rows
		};
		
		const page_uri = this.get_page_uri();
		
		
		console.log('---link: '+page_uri);
		
		this.client.api.get({uri: page_uri}, function(err, resp, body, req){
			
			const items = [];
			
			if(resp.headers['content-range']){
				this.options.session.content_range.total = resp.headers['content-range'].split('/')[1].toInt();
				this.options.session.content_range.end = resp.headers['content-range'].split('/')[0].split('-')[0].toInt();
				this.options.session.content_range.end = resp.headers['content-range'].split('/')[0].split('-')[1].toInt();
			}
				
			
			if(err){
				res.json.status(500)(err);
			}
			else{
				
				//this.options.session.pagination.prev = new String(li.parse(resp.headers.link).prev.match(new RegExp(/\/[^\/]+$/g))).replace('/', '');
				//this.options.session.pagination.next = new String(li.parse(resp.headers.link).next.match(new RegExp(/\/[^\/]+$/g))).replace('/', '');
				////console.log(next);
				
				const uris =JSON.decode(body);
				
				if(this.options.session.pagination.descending === true)
					uris.reverse();
				
				//console.log(this.options.session.pagination.descending);
				console.log(uris);
					
				var total = uris.length;
				
				this.client.api.get({uri: 'enabled'}, function(err, resp, body, req){
					//console.log('---enabled---');
					
					if(err){
						res.json.status(500)(err);
					}
					else{
						
						////console.log(body);
						
						const enabled_uris = JSON.decode(body)
						
						Array.each(uris, function (uri, index){
							
							
							//get vhost properties
							this.client.api.get({uri: uri}, function(err, resp, body, req){
								//console.log('---properties---');
								
								if(err){
									res.json.status(500)(err);
								}
								else{
									
									const data = JSON.decode(body)
									////console.log(data);
									const vhost = {}
									
									if(data instanceof Array){//uri has more than 1 vhost
										//total += data.length - 1
										
										
										vhost.id = uri;
										vhost.uri = uri;
										vhost.sub_items = [];
										
										Array.each(data, function(tmp_item, tmp_index){
												const sub_vhost = {}
												sub_vhost.id = uri +'_'+tmp_index
												sub_vhost.uri = uri
												
												var tmp_listen = tmp_item.listen.split(":")
												if(tmp_listen instanceof Array || typeof(tmp_listen) == 'array')
													tmp_listen = tmp_listen = tmp_listen[tmp_listen.length - 1]
												
												////console.log(tmp_listen)
												
												tmp_listen = tmp_listen.split(' ')
												if(tmp_listen instanceof Array || typeof(tmp_listen) == 'array')
													tmp_listen = tmp_listen[0]
												
												sub_vhost.port = tmp_listen
												
												if(enabled_uris.contains(sub_vhost.uri)){
													
													this.client.api.get({uri: '/enabled/'+uri}, function(err, resp, body, req){
														//console.log('---enabled/'+uri);
														
														if(err){
															res.json.status(500)(err);
														}
														else{
															const enabled_data = JSON.decode(body);
														
															if(enabled_data instanceof Array){
																Array.each(enabled_data, function(enabled_data_item, index){
																	if(sub_vhost.enabled !== true)
																		sub_vhost.enabled = (tmp_item.listen == enabled_data_item.listen) ? true : false
																		
																})
															}
															else{
																sub_vhost.enabled = (tmp_item.listen == enabled_data.listen) ? true : false
															}
															
														}
														
													}.bind(this));
													
													sub_vhost.enabled = true;
												}
												
												if(items.length < this.options.session.pagination.rows)
													vhost.sub_items.push(sub_vhost);
												
										}.bind(this))
										
										
									}
									else{
										////console.log(data)
										
										//const vhost = {}
										vhost.id = uri
										vhost.uri = uri
										
										////console.log(data.listen)
										
										if(typeof(data.listen) == 'string'){
											var tmp_listen = data.listen.split(":")
											
											if(tmp_listen instanceof Array || typeof(tmp_listen) == 'array')
												tmp_listen = tmp_listen = tmp_listen[tmp_listen.length - 1]
											
											tmp_listen = tmp_listen.split(' ')
											if(tmp_listen instanceof Array || typeof(tmp_listen) == 'array')
												tmp_listen = tmp_listen[0]
												
											vhost.port = tmp_listen
											
										}
										else{//array
											var port = ''
											Array.each(data.listen, function(listen, listen_index){
												var tmp_listen = listen.split(":")
												
												if(tmp_listen instanceof Array || typeof(tmp_listen) == 'array')
													tmp_listen = tmp_listen[tmp_listen.length - 1]
												
												////console.log('-----tmp_listen----')
												////console.log(tmp_listen)
												tmp_listen = tmp_listen.split(' ')
												if(tmp_listen instanceof Array || typeof(tmp_listen) == 'array')
													tmp_listen = tmp_listen[0]
												
												port += tmp_listen
												if(listen_index < data.listen.length - 1)
													port += ' : '
											})
											
											vhost.port = port
										}
										
										if(enabled_uris.contains(vhost.uri))
											vhost.enabled = true
										
										//if(items.length < this.options.session.pagination.rows)
											//items.push(vhost);
										
									}
									
									if(items.length < this.options.session.pagination.rows)
										items.push(vhost);
											
									//uri_counter++;
									
									console.log('---total---')
									console.log(total)
									console.log(items.length)
									
									if(items.length == total){
									
									/**
									 * We select N rows of URIs, but one URI may have more than one vhost associated.
									 * We must return only this.options.session.pagination.rows number of vhosts,
									 * and save the remaining one for next page.
									 * */
									//if((items.length == this.options.session.pagination.rows || items.length == total) && sent === false){
										
										
										if(this.options.session.content_range.total != 0)
											total = this.options.session.content_range.total;
										
										res.json({total: total, items: items});
										sent = true;
									}
									
									
								}
								
							}.bind(this));
							
						
						}.bind(this));
					
					
					}	
				}.bind(this));
				
				
			}
		}.bind(this));
		
		
	},
  render: function(req, res, next){
		
		if(req.isAuthenticated()){
				res.status(403).redirect('/');
		}
		else{
			
			res.render(path.join(__dirname, '/assets/vhosts'), {layout: false});
		
		}
  },
  initialize: function(options){
		this.profile('nginx-vhosts_init');//start profiling
		
		this.parent(options);//override default options
		
		this.client = new vhosts_client(this.options.client);
			
		this.profile('nginx-vhosts_init');//end profiling
		
		this.log('nginx-vhosts', 'info', 'nginx-vhosts started');
  },
  
});
