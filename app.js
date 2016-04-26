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
  
  options: {
	  
	id: 'root',
	path: '/',
	
	logs: { 
		path: './logs' 
	},
	
	authentication: {
		users : [
			  //{ id: 1, username: 'lbueno' , role: 'admin', password: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'}, //sha-1 hash
			  { id: 1, username: 'lbueno' , role: 'admin', password: '123'}, //sha-1 hash
			  { id: 2, username: 'test' , role: 'user', password: '123'}
		],
	},
	
	authorization: {
		config: path.join(__dirname,'./config/rbac.json'),
	},
	
	routes: {
		
		post: [
		  {
			path: '',
			callbacks: ['check_authentication', 'post']
		  },
		],
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
				callbacks: ['check_authentication', 'post'],
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
  
  get: function(req, res, next){
		res.render(path.join(__dirname, '/public/views/root'), {
			title: "Root page",
		});
		//console.log('root get');
		//console.log('req.isAuthenticated');
		//console.log(req.isAuthenticated());
		
		//console.log('isAuthorized');
		//console.log(this.isAuthorized({ op: 'view', res: 'abm'}));
		//console.log(this.getSession().getRole().getID());

		
		//if(Object.getLength(req.params) == 0){
			//res.json({ title: 'Root app', content_type: req.get('content-type') });
		//}
		//else if(req.params.service_action){
			//res.json({ title: 'Root app', param: req.params, content_type: req.get('content-type') });
		//}
		//else{
			////console.log({ title: 'Admin app', param: req.params });
			//next();
		//}
		
  },
  
  post: function(req, res, next){
	  
		console.log('root post');
		//console.log(req.headers);
		res.json({ title: 'Root POST' });
		
  },
  
  initialize: function(options){
		this.addEvent(this.ON_USE, function(mount){
			console.log('loading app...');
			console.log(mount);
			console.log(path.join(__dirname, 'apps', mount, '/assets'));
			
			this.express().use('/public/apps' + mount, serveIndex(path.join(__dirname, 'apps', mount, '/assets'), {icons: true}));
			this.express().use('/public/apps' + mount, serveStatic(path.join(__dirname, 'apps', mount, '/assets')));
		});
		
		this.parent(options);//override default options
		
		this.profile('root_init');//start profiling
		
		/*------------------------------------------*/
		if(this.authorization){
			// 	authorization.addEvent(authorization.SET_SESSION, this.logAuthorizationSession.bind(this));
			// 	authorization.addEvent(authorization.IS_AUTHORIZED, this.logAuthorization.bind(this));
			// 	authentication.addEvent(authentication.ON_AUTH, this.logAuthentication.bind(this));
			this.authorization.addEvent(this.authorization.NEW_SESSION, function(obj){
	  
			//   console.log('event');
			//   console.log(obj);
			  
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
		
		var hbs = exphbs.create({
						defaultLayout: 'main',
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
