'use strict'

var App = require('node-express-app'),
	path = require('path'),
	fs = require('fs'),
	PouchDB = require('pouchdb');
	


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  options: {
	  
		id: 'os',
		path: '/os',
		
		/*authentication: {
			users : [
					{ id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
					{ id: 2, username: 'test' , role: 'user', password: '123'}
			],
		},*/
		
		authorization: {
			init: false,
			config: path.join(__dirname,'./config/rbac.json'),
		},
		
		params: {
			service_action: /start|stop/,
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
			
			version: '1.0.0',
			
			path: '/api',
			
			routes: {
				
				get: [
					{
						path: 'networkInterfaces/primary',
						callbacks: ['primary_iface'],
						version: '',
					},
					{
						//content_type: '',
						path: 'server',
						callbacks: ['server'],
						version: '',
					},
					{
						path: ':prop',
						callbacks: ['get'],
					},
					{
						path: '',
						callbacks: ['get'],
					},
				]
			},
			
		},
  },
  get: function(req, res, next){
		if(req.params.prop){
			res.json({});
		}
		else{
			res.json({});
		}
	},
  primary_iface: function(req, res, next){
		res.set('Content-Type', 'application/javascript').jsonp(this.options.networkInterfaces.primary);
	},
  server: function(req, res, next){
		res.set('Content-Type', 'application/javascript').jsonp("http://"+req.hostname+":8081");
	},
  render: function(req, res, next){
		if(!req.isAuthenticated()){
			res.status(403).redirect('/');
		}
		else{
			var view = Object.clone(this.express().get('default_view'));
			view.tile = "Test";
			
			view.apps.each(function(value, index){
				if(value.id == this.options.id){
					
					//value.role = 'start';
					view.apps[index]['role'] = 'start';
				}
				else{
					view.apps[index]['role'] = null;
				}
			}.bind(this));
			
			view.body_scripts.push('/public/apps/os/index.js');
			
				
			res.render(path.join(__dirname, '/assets/index'), view);
		}
  },
  
  
  initialize: function(options){
		this.profile('os_init');//start profiling
		
		options = Object.merge(options, JSON.decode(fs.readFileSync(path.join(__dirname, 'config/config.json' ), 'ascii')));
		//console.log(JSON.decode(fs.readFileSync(path.join(__dirname, 'config/config.json' ), 'ascii')));
		
		this.parent(options);//override default options
		
		/*------------------------------------------*/
		if(this.authorization){
			// 	authorization.addEvent(authorization.SET_SESSION, this.logAuthorizationSession.bind(this));
			// 	authorization.addEvent(authorization.IS_AUTHORIZED, this.logAuthorization.bind(this));
			// 	authentication.addEvent(authentication.ON_AUTH, this.logAuthentication.bind(this));
			this.authorization.addEvent(this.authorization.NEW_SESSION, function(obj){
	  
			//   //console.log('event');
			//   //console.log(obj);
			  
			  if(!obj.error){
				
			// 	web.authorization.processRules({
			// 	  "subjects":[
			// 		{
			// 		  "id": "lbueno",
			// 		  "roles":["admin"]
			// 		},
			// 		{
			// 		  "id": "os",
			// 		  "roles":["user"]
			// 		},
			// 	  ],
			// 	});

				this.authorization.processRules({
				  "subjects": function(){
					  if(obj.getID() == "test")
						return [{ "id": "test", "roles":["user"]}];
					  
					  if(obj.getID() == "lbueno")
						return [{ "id": "lbueno", "roles":["admin"]}];
				  },
				});
			  }
			  
			}.bind(this));
		}
		
		this.profile('os_init');//end profiling
		
		this.log('os', 'info', 'os started');
  },
	
});

