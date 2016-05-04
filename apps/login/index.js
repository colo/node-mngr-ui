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
		var view = {
			title: "Login",
			base: "/login",
			
      meta: [
				'charset="utf-8"',
				'http-equiv="X-UA-Compatible" content="IE=edge"',
				'name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"',
				'name="mobile-web-app-capable" content="yes"',
				'name="apple-mobile-web-app-capable" content="yes"',
				'name="apple-mobile-web-app-status-bar-style" content="black"',
				'name="apple-mobile-web-app-title" content="Material Design Lite"',
				//'name="msapplication-TileImage" content="/public/mdl-dashboard/images/touch/ms-touch-icon-144x144-precomposed.png"'
				//'name="msapplication-TileColor" content="#3372DF"'


      ],
      //links: [
				//'rel="icon" sizes="192x192" href="/public/mdl-dashboard/images/android-desktop.png"',
				//'rel="apple-touch-icon-precomposed" href="images/ios-desktop.png"',
				//'rel="shortcut icon" href="images/favicon.png"'
      //],
      scripts: [
				"/public/bower/headjs/dist/1.0.0/head.min.js",
      ],
      body_scripts: [
				"/public/apps/login/index.js",
      ],
      css: [
            //"https://code.getmdl.io/1.1.3/material.cyan-light_blue.min.css",
            //"/public/mdl-dashboard/styles.css",
            //'https://fonts.googleapis.com/css?family=Roboto:regular,bold,italic,thin,light,bolditalic,black,medium&amp;lang=en',
            //"https://fonts.googleapis.com/icon?family=Material+Icons"
            "http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css",
            "http://fonts.googleapis.com/css?family=Roboto:400,100,300,500,700,900&subset=latin,latin-ext",
            "/public/apps/login/index.css",
            
      ],
      style: null,
			
			apps: [],
			
		};
		
		res.render(path.join(__dirname, '/assets/index'), view);
		
		//res.status(200);
			
		//res.format({
			//'text/plain': function(){
				//res.send('login app');
			//},

			//'text/html': function(){
				//res.send('<h1>login app</h1');
			//},

			//'application/json': function(){
				//res.send({info: 'login app'});
			//},

			//'default': function() {
				//// log the request and respond with 406
				//res.status(406).send('Not Acceptable');
			//}
		//});
	
  },
  initialize: function(options){
		this.profile('login_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('login_init');//end profiling
		
		this.log('login', 'info', 'login started');
  },
  
});
