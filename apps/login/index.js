'use strict'

var App = require('node-express-app'),
	path = require('path'),
	util = require('util');


module.exports = new Class({
  Extends: App,
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  hidden: true,//don't show on views (nav_bar, content, etc)
  
  options: {
	  
		id: 'login',
		path: '/login',
		
		params: {
		},
		
		routes: {
			
			all: [
				{
				path: '',
				callbacks: ['get']
				},
			]
		},
		
		api: {
			
			version: '1.0.0',
			
			routes: {
				post: [
					{
					path: '',
					callbacks: ['login'],
					version: '',
					},
				],
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
  
  login: function(req, res, next){
		console.log('Login Request');
		console.log(req.headers.authorization);
		
		this.authenticate(req, res, next,  function(err, user, info) {
			
			this.profile('login_authenticate');
			
			if (err) {
				this.log('login', 'error', err);

				return next(err)
			}
			if (!user) {
				console.log('info: '+info);
				this.log('login', 'warn', 'login authenticate ' + info);
				
				res.cookie('bad', true, { maxAge: 99999999, httpOnly: false });
				
				//req.flash('error', info);
				res.send({'status': 'error', 'error': info});

			}
			else{
				req.logIn(user, function(err) {
					if (err) {
					this.log('login', 'error', err);
					return next(err);
					}
					
					this.log('login', 'info', 'login authenticate ' + util.inspect(user));
					
					////add subjects dinamically
			// 		this.server.authorization.processRules({
			// 		  "subjects":[
			// 			{
			// 			  "id": "lbueno",
			// 			  "roles":["admin"]
			// 			},
			// 			{
			// 			  "id": "test",
			// 			  "roles":["user"]
			// 			},
			// 		  ],
			// 		});
					res.cookie('bad', false, { maxAge: 0, httpOnly: false });
					
					res.send({'status': 'ok'});
					
				}.bind(this));
			}
		}.bind(this));
	
	
  },
  get: function(req, res, next){
		res.status(200);
			
		res.format({
			'text/plain': function(){
				res.send('login app');
			},

			'text/html': function(){
				res.send('<h1>login app</h1');
			},

			'application/json': function(){
				res.send({info: 'login app'});
			},

			'default': function() {
				// log the request and respond with 406
				res.status(406).send('Not Acceptable');
			}
		});
	
  },
  initialize: function(options){
		this.profile('login_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('login_init');//end profiling
		
		this.log('login', 'info', 'login started');
  },
  
});
