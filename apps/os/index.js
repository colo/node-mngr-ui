'use strict'

var App = require('node-express-app'),
	path = require('path'),
	fs = require('fs'),
	os = require('os'),
	PouchDB = require('pouchdb');
	//websql = require('pouchdb/extras/websql');
	


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  options: {
	  
	  db: { path : path.join(__dirname,'../../../pouchdb/dashboard') },
	  
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
						path: ':prop/:key/:info',
						callbacks: ['get'],
					},
					{
						path: ':prop/:key',
						callbacks: ['get'],
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
		console.log('OS API GET');
		console.log('req.params');
		console.log(req.params);
		console.log(req.query);
		
		var doc_type = req.query.type || 'info';
		
			
		var is_os_func = false;
		
		if(req.params.prop){
			try{
				Object.each(os, function(item, key){
					if(req.params.prop == key){
						is_os_func = true;
						throw new Error('Found');
					}
				});
			}
			catch(e){
				//console.log(e);
			}
		}
		
		if(!is_os_func && req.params.prop){
			
			
			//res.json({});
			this.db.query(doc_type+'/by_path_host', {
				startkey: ["os."+req.params.prop+"\ufff0", "localhost.colo\ufff0"],
				endkey: ["os."+req.params.prop, "localhost.colo"],
				limit: 1,
				descending: true,
				inclusive_end: true,
				include_docs: true
			})
			.then(function (response) {
				var result = null;
				
				if(response.rows[0].doc.data){
					result = response.rows[0].doc.data;
				}
				else{
					
					delete response.rows[0].doc.metadata;
					delete response.rows[0].doc._id;
					delete response.rows[0].doc._rev;
					
					result =  response.rows[0].doc;
				}
				
				if(req.params.key){
					if(req.params.info){
						if(result[req.params.key][req.params.info]){
							res.json(result[req.params.key][req.params.info]);
						}
						else{
							res.status(500).json({error: 'No ['+req.params.info+'] at key ['+req.params.key+'] on property '+req.params.prop});
						}
					}
					else if(result[req.params.key]){
						res.json(result[req.params.key]);
					}
					else{
						res.status(500).json({error: 'Bad key ['+req.params.key+'] on property '+req.params.prop});
					}
				}
				else{
					//if(response.rows[0].doc[req.params.prop]){
						//res.json(response.rows[0].doc[req.params.prop]);
					//}
					//else{
						//res.status(500).json({error: 'Bad property '+req.params.prop});
					//}
					res.json(result);
				}
				
				
				
				//console.log(response.rows);
				console.log(result);

				
				
			}).catch(function (err) {
				console.log('err');
				console.log(err);
				res.status(500).json({error: err});
			});
			
		}
		else{
			if(req.params.prop){
				
				this.db.query(doc_type+'/by_path_host', {
					startkey: ["os", "localhost.colo\ufff0"],
					endkey: ["os", "localhost.colo"],
					limit: 1,
					descending: true,
					inclusive_end: true,
					include_docs: true
				})
				.then(function (response) {
					//delete response.rows[0].doc.metadata;
					//delete response.rows[0].doc._id;
					//delete response.rows[0].doc._rev;
					
					if(req.params.key){
						if(response.rows[0].doc[req.params.prop][req.params.key]){
							res.json(response.rows[0].doc[req.params.prop][req.params.key]);
						}
						else{
							res.status(500).json({error: 'Bad key ['+req.params.key+'] on property '+req.params.prop});
						}
					}
					else{
						if(response.rows[0].doc[req.params.prop]){
							res.json(response.rows[0].doc[req.params.prop]);
						}
						else{
							res.status(500).json({error: 'Bad property '+req.params.prop});
						}
					}
					
					//console.log(response.rows[0].doc);
					
				}).catch(function (err) {
					console.log('err');
					console.log(err);
					res.status(500).json({error: err});
				});
			}
			else{
				this.db.query(doc_type+'/by_path_host', {
					startkey: ["os", "localhost.colo\ufff0"],
					endkey: ["os", "localhost.colo"],
					limit: 1,
					descending: true,
					inclusive_end: true,
					include_docs: true
				})
				.then(function (response) {
					delete response.rows[0].doc.metadata;
					delete response.rows[0].doc._id;
					delete response.rows[0].doc._rev;
					
					res.json(response.rows[0].doc);
					
					//console.log(response.rows[0].doc);
					
				}).catch(function (err) {
					console.log('err');
					console.log(err);
					res.status(500).json({error: err});
				});
			}
		}
		//res.json({});
	},
  primary_iface: function(req, res, next){
		res.set('Content-Type', 'application/javascript').jsonp(this.options.networkInterfaces.primary);
	},
  server: function(req, res, next){
		res.set('Content-Type', 'application/javascript').jsonp("http://"+req.hostname+":8080");
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
		
		this.db = new PouchDB(this.options.db.path, {db: require('sqldown')});
		
		this.db.info().then(function (info) {
			console.log(info);
		})
		
		//dynamically create routes based on OS module (ex: /os/hostname|/os/cpus|...)
		//Object.each(os, function(item, key){
			
			
			//if(key != 'getNetworkInterfaces'){//deprecated func
				//console.log(key);
				
				//var callbacks = [];
			
				////if(key == 'networkInterfaces'){//use internal func
					////this[key] = function(req, res, next){
						////console.log('params');
						////console.log(req.params);
						
					////}
				////}
				////else{
					//this[key] = function(req, res, next){
						//console.log('params');
						//console.log(req.params);
						
						////var result = (typeof(item) == 'function') ? os[key]() : os[key];
						
						////if(req.params.prop && result[req.params.prop]){
							////res.json(result[req.params.prop]);
						////}
						////else if(req.params.prop){
							////res.status(500).json({ error: 'Bad property'});
						////}
						////else{
							////res.json(result);
						////}
					//}
				////}
				
				//this.options.api.routes.get.push({
						//path: key,
						//callbacks: [key]
				//});
				
				//this.options.api.routes.get.push({
						//path: key+'/:prop',
						//callbacks: [key]
				//});
			//}
		//}.bind(this));
		
		this.profile('os_init');//end profiling
		
		this.log('os', 'info', 'os started');
  },
	
});

