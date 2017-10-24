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
  
  pagination: {
		page: 1,
		prev: null,
		next: null
	},
	
  options: {
	  
	  client: {scheme: 'http', url:'127.0.0.1', port: 8081},
	  
	  pagination: {
			rows: 10
		},
		
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
  get: function(req, res, next){
		/*
		var callback = function(resp){
			//console.log(doc);
			console.log('onGet');
			console.log(resp.headers);
			res.json(JSON.decode(resp.body));
			this.client.removeEvent('onGet', callback);
			
			const uris = res.body
			var total = uris.length
			
			
		}.bind(this);
		
		var error_callback = function(resp){
			//console.log(doc);
			console.log('onGetError');
			console.log(resp);
			this.client.removeEvent('onGetError', error_callback);
		}.bind(this);
		
		
		this.client.addEvent('onGet', callback);
		
		this.client.addEvent('onGetError', error_callback);
		*/
		
		//content-range
		const link = (this.pagination.next) ? this.pagination.next : '?first='+this.options.pagination.rows;
		
		this.client.api.get({uri: link}, function(err, resp, body, req){
			console.log('some callback');
			//console.log(resp.headers);
			
			
			const items = []
			var content_range = null;
			
			if(resp.headers['content-range'])
				content_range = resp.headers['content-range'].split('/')[1].toInt();
			
			if(err){
				res.json.status(500)(err);
			}
			else{
				
				this.pagination.prev = new String(li.parse(resp.headers.link).prev.match(new RegExp(/\/[^\/]+$/g))).replace('/', '');
				this.pagination.next = new String(li.parse(resp.headers.link).next.match(new RegExp(/\/[^\/]+$/g))).replace('/', '');
				//console.log(next);
				
				const uris =JSON.decode(body);
				
				console.log(uris);
				
				var total = uris.length;
				
				this.client.api.get({uri: 'enabled'}, function(err, resp, body, req){
					console.log('---enabled---');
					
					if(err){
						res.json.status(500)(err);
					}
					else{
						
						//console.log(body);
						
						const enabled_uris = JSON.decode(body)
						
						Array.each(uris, function (uri, index){
							
							
							//get vhost properties
							this.client.api.get({uri: uri}, function(err, resp, body, req){
								console.log('---properties---');
								
								if(err){
									res.json.status(500)(err);
								}
								else{
									
									const data = JSON.decode(body)
									//console.log(data);
									if(data instanceof Array){//uri has more than 1 vhost
										total += data.length - 1
										
										
										Array.each(data, function(tmp_item, tmp_index){
												const vhost = {}
												vhost.id = uri +'_'+tmp_index
												vhost.uri = uri
												
												var tmp_listen = tmp_item.listen.split(":")
												if(tmp_listen instanceof Array || typeof(tmp_listen) == 'array')
													tmp_listen = tmp_listen = tmp_listen[tmp_listen.length - 1]
												
												//console.log(tmp_listen)
												
												tmp_listen = tmp_listen.split(' ')
												if(tmp_listen instanceof Array || typeof(tmp_listen) == 'array')
													tmp_listen = tmp_listen[0]
												
												vhost.port = tmp_listen
												
												if(enabled_uris.contains(vhost.uri)){
													
													this.client.api.get({uri: '/enabled/'+uri}, function(err, resp, body, req){
														console.log('---enabled/'+uri);
														
														if(err){
															res.json.status(500)(err);
														}
														else{
															const enabled_data = JSON.decode(body);
														
															if(enabled_data instanceof Array){
																Array.each(enabled_data, function(enabled_data_item, index){
																	if(vhost.enabled !== true)
																		vhost.enabled = (tmp_item.listen == enabled_data_item.listen) ? true : false
																		
																})
															}
															else{
																vhost.enabled = (tmp_item.listen == enabled_data.listen) ? true : false
															}
															
														}
														
													}.bind(this));
													
													vhost.enabled = true;
												}
											
												items.push(vhost);
												
										}.bind(this))
										
										
									}
									else{
										//console.log(data)
										
										const vhost = {}
										vhost.id = uri
										vhost.uri = uri
										
										//console.log(data.listen)
										
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
												
												//console.log('-----tmp_listen----')
												//console.log(tmp_listen)
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
										
										items.push(vhost)
									}
									
									/*console.log('---total---')
									console.log(total)
									console.log(items.length)*/
									
									//if(items.length == total){
									/**
									 * We select N rows of URIs, but one URI may have more than one vhost associated.
									 * We must return only this.options.pagination.rows number of vhosts,
									 * and save the remaining one for next page.
									 * */
									if(items.length == this.options.pagination.rows || items.length == total){
										
										if(content_range)
											total = content_range;
											
										res.json({total: total, items: items});
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
