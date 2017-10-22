'use strict'

var App = require('node-express-app'),
	path = require('path'),
	util = require('util'),
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
  get: function(req, res, next){
		
		var callback = function(doc){
			console.log(doc);
			console.log('onGet');
			res.json(JSON.decode(doc));
			this.client.removeEvent('onGet', callback);
		}.bind(this);
		
		var error_callback = function(err){
			//console.log(doc);
			console.log('onGetError');
			res.json(err);
			this.client.removeEvent('onGetError', error_callback);
		}.bind(this);
		
		
		this.client.addEvent('onGet', callback);
		
		this.client.addEvent('onGetError', error_callback);
		
		this.client.api.get({uri: ''});
		
		
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
