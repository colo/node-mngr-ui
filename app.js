'use strict'

var App = require('node-express-app'),
	path = require('path'),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	multer = require('multer'), // v1.0.5
	upload = multer(), // for parsing multipart/form-data
	serveIndex = require('serve-index'),
	serveStatic = require('serve-static'),
	//cons = require('consolidate'),//template engine wrapper
	exphbs  = require('express-handlebars');//template engine

	//AdminApp = require(path.join(__dirname,'apps/admin/'));
	
	


var MyApp = new Class({
  Extends: App,
  
  
  app: null,
  logger: null,
  authorization:null,
  authentication: null,
  
  //apps: [],
  
  options: {
	  
		id: 'root',
		path: '/',
		
		logs: { 
			path: './logs' 
		},
		
		authentication: {
			users : [
					{ id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
					//{ id: 1, username: 'lbueno' , role: 'admin', password: '123'}, //sha-1 hash
					{ id: 2, username: 'test' , role: 'user', password: '123'}
			],
		},
		
		authorization: {
			config: path.join(__dirname,'./config/rbac.json'),
		},
		
		routes: {
			
			//post: [
				//{
				//path: '',
				//callbacks: ['check_authentication', 'post']
				//},
			//],
			all: [
				{
				path: '',
				callbacks: ['get']
				},
			]
		},
		
		api: {
			
			version: '1.0.0',
			
			path: '/api',
			
			routes: {
				all: [
					{
						path: 'apps',
						callbacks: ['apps'],
						version: '',
					},
				]
			},
			
		},
  },
  apps: function(req, res, next){
		
		if(req.isAuthenticated()){
			res.jsonp(this.express().get('apps'));
		}
		else{
			res.jsonp([{ id: 'login' }]);
		}
		
	},
  set_default_view: function(){
		
		//https://github.com/puikinsh/gentelella
		this.express().set('default_view',{
			title: "",
			base: "/",
      meta: [
				'charset="utf-8"',
				'http-equiv="X-UA-Compatible" content="IE=edge"',
				'name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"',
				'http-equiv="Content-Type" content="text/html; charset=UTF-8"'
      ],
      links: [
				//'rel="icon" sizes="192x192" href="/public/mdl-dashboard/images/android-desktop.png"',
				//'rel="apple-touch-icon-precomposed" href="images/ios-desktop.png"',
				//'rel="shortcut icon" href="images/favicon.png"',
      ],
      scripts: [
				"/public/bower/headjs/dist/1.0.0/head.min.js",
				//"/public/bower/mootools/dist/mootools-core.min.js",
				//"/public/js/MooTools-More-1.6.0-compressed.js"
      ],
      
      body_class: 'nav-md',
      
      body_scripts: [
				"/api/apps/?callback=update_view",
				"/public/js/index.js"
      ],
      body_script: [
				"var apps = [];\n"+
				"var update_view = function(params){ apps = params; };\n"
      ],
      css: [
				/** Bootstrap */
				"/public/bower/gentelella/vendors/bootstrap/dist/css/bootstrap.min.css",
				/** Font Awesome */
				"/public/bower/gentelella/vendors/font-awesome/css/font-awesome.min.css",
				/** iCheck */
				//"/public/bower/gentelella/vendors/iCheck/skins/flat/green.css",
				/** bootstrap-progressbar */
				//"/public/bower/gentelella/vendors/bootstrap-progressbar/css/bootstrap-progressbar-3.3.4.min.css",
				/** jVectorMap */
				//"/public/bower/gentelella/production/css/maps/jquery-jvectormap-2.0.3.css",
				/* Custom Theme Style */
				"/public/bower/gentelella/build/css/custom.min.css"
      ],
      style: "",
			
			apps: this.express().get('apps'),
			
		});
		
	},
  get: function(req, res, next){
		
		if(req.isAuthenticated()){
			res.redirect('/test');
		}
		else{
			res.status(403).redirect('/login');
		}
		
		
  },
  
  //post: function(req, res, next){
	  
		////console.log('root post');
		//////console.log(req.headers);
		//res.json({ title: 'Root POST' });
		
  //},
  
  initialize: function(options){
		
		this.addEvent(this.ON_USE, function(mount, app){
			var app_info = {};
			
			console.log('loading app...');
			console.log(mount);
			console.log(path.join(__dirname, 'apps', mount, '/assets'));
			
			this.express().use('/public/apps' + mount, serveIndex(path.join(__dirname, 'apps', mount, '/assets'), {icons: true}));
			this.express().use('/public/apps' + mount, serveStatic(path.join(__dirname, 'apps', mount, '/assets')));
			
			this.express().use('/public/apps' + mount + '/bower', serveIndex(path.join(__dirname, 'apps', mount, '/bower_components'), {icons: true}));
			this.express().use('/public/apps' + mount + '/bower', serveStatic(path.join(__dirname, 'apps', mount, '/bower_components')));
			
			app_info['name'] = app.options.name || mount.substr(1); //remove mount '/'
			app_info['id'] = app.options.id || mount.substr(1); //remove mount '/'
			app_info['href'] = mount+"/";
			app_info['icon'] = app.options.icon || 'fa-cog';
			
			//var nav_bar = this.express().get('nav_bar');
			////this.apps.push(app_info);
			//nav_bar.push(app_info);
			//this.express().set('nav_bar', nav_bar);
			
			if(!app.hidden){
				//this.express().get('default_view').apps.push(app_info);
				this.express().get('apps').push(app_info);
			}
			
			////console.log(this.apps);
		});
		
		this.parent(options);//override default options
		
		this.express().set('apps', []);
		
		this.profile('root_init');//start profiling
		
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
			// 		  "id": "test",
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
		
		this.express().use(bodyParser.json()); // for parsing application/json
		this.express().use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
		
		this.express().use('/public', serveIndex(__dirname + '/public', {icons: true}));
		this.express().use('/public', serveStatic(__dirname + '/public'));
		
		this.express().use('/public/bower', serveIndex(__dirname + '/bower_components', {icons: true}));
		this.express().use('/public/bower', serveStatic(__dirname + '/bower_components'));
		
		
		var hbs = exphbs.create({
						defaultLayout: 'dashboard',
						layoutsDir: 'public/views/layouts/',
						//helpers      : helpers,
						
						extname: '.html',
						// Uses multiple partials dirs, templates in "shared/templates/" are shared
						// with the client-side of the app (see below).
						partialsDir: [
										'public/shared/',
										'public/views/partials/'
						]
		});
		
		this.express().engine('html', hbs.engine);
		this.express().set('view engine', 'html');
		
		//this.express().set('views', __dirname + '/public/views');
		
		this.set_default_view();
		
		////console.log('DEFAULT_VIEW');
		//this.express().get('default_view').apps.push({name: 'Home', href: "'/'", icon: 'home'});
		
		//this.express().set('nav_bar', [{name: 'Home', href: "'/'", icon: 'home'}]);


		this.profile('root_init');//end profiling
		
		this.log('root', 'info', 'root started');
  },
  
	
});

var root = new MyApp();
root.load(path.join(__dirname, '/apps'));
//var test = new MyApp();
//var admin = new AdminApp();

//root.use('/test', test);
//root.use('/admin', admin);

module.exports = root.express();
