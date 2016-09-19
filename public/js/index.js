var mainBodyModel = null;

var root_page = {
	//we need this so pagerjs can bind without errors, it will call the real class method
	beforeHide: function(){},
	afterShow: function(){}
};

var Page = null;

//head.js({ PouchDB: "/public/bower/pouchdb/dist/pouchdb.min.js" }); //no dependencies

//head.ready('PouchDB', function(){
	//window.PouchDB = PouchDB;//for Chrome Fauxton
//});

//head.js({ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }); //no dependencies
//head.js({ mootools: "/public/bower/mootools/dist/mootools-core.min.js" }); //no dependencies

head.js({ mootools: "/public/bower/mootools/dist/mootools-core.min.js" }, function(){
		head.js({ 'mootools-more': "/public/js/MooTools-More-1.6.0-compressed.js" }); //no dependencies
}); //no dependencies



head.ready('mootools-more', function(){ 
	var MainModel = new Class({
		Implements: [Options, Events],
		
		INITIALIZED: 'initialized',
		
		options : {
		},
		
		initialize: function(options){
			var self = this;
			
			self.setOptions(options);
			
			self.apps = ko.observableArray(apps);
			/*
			 * apps[] updated on <body><script>...</script></body>
			 * each app is an observable of this main model, so we can use the 'with' data-binding (ex: with: login)
			 * */	
			//apps.each(function(app){
				////console.log('app');
				////console.log(app);
				//self[app.id] = ko.observable(null);
			//});
			self.apps().forEach(function(app, index){
				console.log('app observable');
				console.log(app.id);
				
				self[app.id] = ko.observable(null);
				
				if(app['subapps']){
					Array.each(app['subapps'], function(subapp, subindex){
						console.log(subapp.with);
						
						self[subapp.with] = ko.observable(null);
					}.bind(this));
				}
				
				if(index == self.apps().length -1){
					console.log('INITIALIZING....');
					this.fireEvent(this.INITIALIZED);
				}
			});
			
			
			
			//self.breadcrumbs = ko.observableArray([
				//{label: 'dashboard', href: '/dashboard'},
				//{label: 'second', href: '/dashboard/more'}
			//]); 
			
		}
	});

	//mainBodyModel = new viewModel();
	Page = new Class({
		Implements: [Options, Events],
		
		JSONP_LOADED: 'jsonpLoaded',
		JSONP_SUCCESS: 'jsonpSuccess',//if all JS succesfully load
		
		JS_LOADED: 'jsLoaded',
		JS_SUCCESS: 'jsSuccess',//if all JS succesfully load
		
		CSS_LOADED: 'cssLoaded',
		CSS_SUCCESS: 'cssSuccess',//if all CSS succesfully load
		
		ASSETS_SUCCESS: 'assetsSuccess',
		
		STARTED: 'started',
		
		pager: null,
		model: null,
		ko: null,
		
		load_jsonp_success: [],
		load_css_success: [],
		load_js_success: [],
		js_assets: {},
		
		all_css_loaded: true,
		all_js_loaded: true,
		all_jsonp_loaded: true,
		all_assets_loaded: false,
		
		options: {
			assets: {
				js: {
				},
				css: {
				},
				jsonp: {
				}
			},
		},
		
		initialize: function(options){
			
			this.setOptions(options);
			
			this.addEvent(this.JS_SUCCESS, function(){
				console.log('this.JS_SUCCESS');
				console.log(this.all_css_loaded);
				console.log(this.all_jsonp_loaded);
				
				this.all_js_loaded = true;
				
				if(this.all_css_loaded && this.all_jsonp_loaded){
					this.fireEvent(this.ASSETS_SUCCESS);
				}
			}.bind(this));
			
			this.addEvent(this.CSS_SUCCESS, function(){
				this.all_css_loaded = true;
				
				if(this.all_js_loaded && this.all_jsonp_loaded){
					this.fireEvent(this.ASSETS_SUCCESS);
				}
			}.bind(this));
			
			this.addEvent(this.JSONP_SUCCESS, function(){
				this.all_jsonp_loaded = true;
				
				if(this.all_js_loaded && this.all_css_loaded){
					this.fireEvent(this.ASSETS_SUCCESS);
				}
			}.bind(this));
			
			if(this.options.assets && Object.getLength(this.options.assets) > 0){
				
				if(Object.getLength(this.options.assets.css) > 0){
					this.load_css(this.options.assets.css);
				}
				else{
					self.fireEvent(self.CSS_SUCCESS);
				}
				
				if(this.options.assets.js.length > 0){
					this.load_js(this.options.assets.js);
				}
				else{
					self.fireEvent(self.JS_SUCCESS);
				}
				
				if(Object.getLength(this.options.assets.jsonp) > 0){
					this.load_jsonp(this.options.assets.jsonp);
				}
				else{
					self.fireEvent(self.JSONP_SUCCESS);
				}
			}
			else{
				console.log('no assets');
				this.fireEvent(this.ASSETS_SUCCESS);
			}
			
		},
		load_css: function(assets){
			var self = this;
			this.all_css_loaded = false;
			
			Object.each(assets, function(css, id){
				//console.log('load_css '+id);
				//console.log(css);
				
				var css = Asset.css(css, {
					id: id,
					onLoad: function(){
						console.log('onLoad css '+id);
						//console.log(css);
						
						/**
						 * to keep record of succesfuly loaded css
						 * */
						self.load_css_success.push(id);
				
						self.fireEvent(self.CSS_LOADED+'_'+id, css);
						self.fireEvent(self.CSS_LOADED, {id: id, css: css});
						
						/**
						 * compare the every key of "css" with "load_css_success", return true when all keys (css) are found
						 * 
						 * */
						var all_success = Object.keys(assets).every(function(asset){
							return (self.load_css_success.indexOf(asset) >= 0) ? true : false;
						});
						
						
						if(all_success){
							console.log('load_css_success');
							self.fireEvent(self.CSS_SUCCESS);
						}
						
					}
				});
			});
		},
		load_jsonp: function(assets){
			var self = this;
			
			this.all_jsonp_loaded = false;
			
			Object.each(assets, function(jsonp, id){
				console.log('jsonp');
				console.log(jsonp);
				
				if(typeof(jsonp) != 'object'){
					var url = jsonp;
					jsonp = {
						url: url,
						noCache: true,
						onRequest: function (url) {
								// a script tag is created with a 
								// src attribute equal to url
								console.log('requesting.... '+url);
						},
						onComplete: function (data) {
							/**
							 * to keep record of succesfuly loaded css
							 * */
							self.load_jsonp_success.push(id);
					
							
							
							/**
							 * compare the every key of "css" with "load_css_success", return true when all keys (css) are found
							 * 
							 * */
							var all_success = Object.keys(assets).every(function(asset){
								return (self.load_jsonp_success.indexOf(asset) >= 0) ? true : false;
							});
							
							
							if(all_success){
								console.log('load_jsonp_success');
								self.fireEvent(self.JSONP_SUCCESS);
							}
							
							self.fireEvent(self.JSONP_LOADED+'_'+id, data);
							self.fireEvent(self.JSONP_LOADED, {id: id, jsonp: data});
							// the request was completed 
							// and data received the server answer.
							//console.log(data); // answer object with data
						}
					};
					
				}
				
				var myJSONP = new Request.JSONP(jsonp).send();

			});
		},
		/**
		 * if assets = string: load file (this assets won't launch Events, nice for loading gentellela/custom.js wich needs everything applied before load)
		 * if assets = []: load each 
		 * if assets = {}: load each {id, file}
		 * if file to load = []: load each chained on event 
		 * 		Ex: second_lib will load on JS_LOADED_first_lib Event
		 *		assets:{
		 * 			complex_dependency:[
		 * 				{ first_lib: 'route_to_first_lib.js'},
		 * 				{ second_lib: 'route_to_second_lib.js'},
		 * 			]
		 * 		}
		 * 			
		 * */
		load_js: function(assets, callback){
			
			this.all_js_loaded = false;
			
			var self = this;
			if(typeOf(assets) == 'array'){
				Array.each(assets, function(js){
					console.log('Array');
					console.log(js);
					self.load_js(js);
				});
			}
			else if(typeOf(assets) == 'object'){
				
				Object.each(assets, function(js, id){
					console.log('Object');
					console.log({js: js, id:id});
					
					if(typeOf(js) == 'array'){
						Array.each(js, function(file, index){
							console.log('file Array');
							console.log(file);
							console.log(index);
							
							if(index == 0){
								self.load_js(file);
							}
							else{
								var prev = Object.keys(js[index - 1])[0];
								
								self.addEvent(self.JS_LOADED+'_'+prev, function(){
									//console.log('on '+prev+' is going to load: ');
									//console.log(file);
									
									self.load_js(file);
								});
							}
						});
					}
					else{
						
						self.js_assets = Object.merge(self.js_assets, assets);
						
						var jsFile = Asset.javascript(js, {
							id: id,
							onLoad: function(){
								/**
								* to keep record of succesfuly loaded css
								* */
								self.load_js_success.push(id);

								self.fireEvent(self.JS_LOADED+'_'+id, js);
								self.fireEvent(self.JS_LOADED, {id: id, js: js});

								/**
								* compare the every key of "css" with "load_css_success", return true when all keys (css) are found
								* 
								* */
								var all_success = Object.keys(self.js_assets).every(function(asset){
									return (self.load_js_success.indexOf(asset) >= 0) ? true : false;
								});


								if(all_success){
									console.log('load_js_success');
									console.log(self.js_assets);
									self.fireEvent(self.JS_SUCCESS);
								}
								
								 
							 },
							 
						});
					}
					
				});
			}
			else{//string
				console.log('string');
				console.log(assets);
				
				var jsFile = Asset.javascript(assets, {
					onLoad: function(){
						if(callback){
							callback.attempt(assets, this);
						}
						else{
							self.fireEvent(self.JS_LOADED, {id: null, js: assets});
						}
					},
				});
				
			}
			
			
		}
		
	});

	var RootPage = new Class({
		Extends: Page,
		
		options: {
			assets: {
				js: [
					{	pager_deps: [
							{ ko: "/public/bower/knockoutjs/dist/knockout.js" },
							{ jQuery: "/public/bower/jquery/dist/jquery.min.js" },
							{ pager: "/public/bower/pagerjs/dist/pager.min.js" },
							{ history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"},
							{ page_deps: [
									{ bootstrap: "/public/bower/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js" },
									//{ fastclick: "/public/bower/gentelella/vendors/fastclick/lib/fastclick.js" },
									//{ nprogress: "/public/bower/gentelella/vendors/nprogress/nprogress.js" },
									"/public/bower/gentelella/build/js/custom.js"
								]
							}
						]
					},
					//{ pouchdb: "/public/bower/pouchdb/dist/pouchdb.min.js"} ,
					////ko: "/public/bower/knockoutjs/dist/knockout.js",
					////jQuery: "/public/bower/jquery/dist/jquery.min.js",
					//////pager: "/public/bower/pagerjs/dist/pager.min.js",
					//////history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"
					//{ gentelella_deps: [
							//{ bootstrap: "/public/bower/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js" },
							////{ fastclick: "/public/bower/gentelella/vendors/fastclick/lib/fastclick.js" },
							////{ nprogress: "/public/bower/gentelella/vendors/nprogress/nprogress.js" },
							//////{ Chart: "/public/bower/gentelella/vendors/Chart.js/dist/Chart.min.js" },
							//////{ gauge: "/public/bower/gentelella/vendors/bernii/gauge.js/dist/gauge.min.js" },
							//////{ progressbar: "/public/bower/gentelella/vendors/bootstrap-progressbar/bootstrap-progressbar.min.js" },
							//////{ iCheck: "/public/bower/gentelella/vendors/iCheck/icheck.min.js" },
							//////{ skycons: "/public/bower/gentelella/vendors/skycons/skycons.js" },
							//////{ flot: [
								//////"/public/bower/gentelella/vendors/Flot/jquery.flot.js",
								//////{ flot_pie: "/public/bower/gentelella/vendors/Flot/jquery.flot.pie.js" },
								//////{ flot_time: "/public/bower/gentelella/vendors/Flot/jquery.flot.time.js" },
								//////{ flot_stack: "/public/bower/gentelella/vendors/Flot/jquery.flot.stack.js" },
								//////{ flot_resize: "/public/bower/gentelella/vendors/Flot/jquery.flot.resize.js" },
								//////{ flot_orderBars: "/public/bower/gentelella/production/js/flot/jquery.flot.orderBars.js" },
								//////{ flot_date: "/public/bower/gentelella/production/js/flot/date.js" },
								//////{ flot_spline: "/public/bower/gentelella/production/js/flot/jquery.flot.spline.js" },
								//////{ flot_curvedLines: "/public/bower/gentelella/production/js/flot/curvedLines.js" },
							//////]},
							//////{ jvectormap: "/public/bower/gentelella/production/js/maps/jquery-jvectormap-2.0.3.min.js" },
							//////{ moment: "/public/bower/gentelella/production/js/moment/moment.min.js" },
							//////{ daterangepicker: "/public/bower/gentelella/production/js/datepicker/daterangepicker.js" },
							//{ gentelella: "/public/bower/gentelella/build/js/custom.min.js" }
						//]
					//}
				],
				//css: {
					//gentelella_css: "/public/bower/gentelella/build/css/custom.min.css"
				//}
			},
		},
		
		
		initialize: function(options){
			var self = this;
			
			//this.parent(options);
			
			//this.addEvent(this.JS_LOADED, function(data){
				//console.log('self.JS_LOADED');
				//console.log(data);
			//});
			
			//mainBodyModel = new MainModel();
			//this.model = mainBodyModel;
			
			//this.pager = pager;
			//// use HTML5 history
			//this.pager.useHTML5history = true;
			//// use History instead of history
			//this.pager.Href5.history = History;

			////console.log('login');
			////console.log(mainBodyModel.login());
			
			//// extend your view-model with pager.js specific data
			//this.pager.extendWithPage(this.model);
			
			//ko.applyBindings(this.model, document.getElementById("main-body"));
			//pager.startHistoryJs();
			
			//this.fireEvent(self.STARTED);
			//console.log('main-body binding applied');
			
			//root_page.addEvent(root_page.ASSETS_SUCCESS, function(){
				//console.log('root_page.ASSETS_SUCCESS');
				//root_page.fireEvent(root_page.STARTED);
			//});
			
			this.addEvent(this.ASSETS_SUCCESS, function(){

				
				if(mainBodyModel == null){
					
				
					if(!self.model){
						
						
						self.model = new MainModel();
						self.addEvent(self.model.INITIALIZED,function(){
							console.log('self.model.INITIALIZED');
							
						});
						
						self.pager = pager;
						// use HTML5 history
						self.pager.useHTML5history = true;
						// use History instead of history
						self.pager.Href5.history = History;
						
						// extend your view-model with pager.js specific data
						self.pager.extendWithPage(self.model);
						
						//console.log(self.model);
						
						
						ko.applyBindings(self.model, document.getElementById("main-body"));
						pager.startHistoryJs();
							
				
						
					
						console.log('main-body binding applied');
					}
					
					mainBodyModel = self.model;
					
					//ko.tasks.schedule(this.start_timed_requests.bind(this));
					
				}
				else{
					self.model = mainBodyModel;
				}
				
				
				self.fireEvent(self.STARTED);
				//self.load_js("/public/bower/gentelella/build/js/custom.js");
				
			});
			
			this.parent(options);
			//self.load_js({ gentelella: "/public/bower/gentelella/build/js/custom.js" });
		},
		beforeHide: function(pager){
			var self = this;
			var page = pager.page;
			
			self.fireEvent('beforeHide', pager);
			
			var resource = page.currentId;
			
			if(resource != ''){
				if(page.parentPage && page.parentPage.currentId)
					resource = page.parentPage.currentId+'_'+page.currentId;
					
				self.fireEvent('beforeHide_'+resource, pager);
				
				console.log('beforeHide');
				console.log(resource);
				//console.log(this);
			}
		},
		afterShow: function(pager){
			var self = this;
			var page = pager.page;
			
			self.fireEvent('afterShow', pager);
			
			var resource = page.currentId;
	
			if(resource != ''){
				if(page.parentPage && page.parentPage.currentId)
					resource = page.parentPage.currentId+'_'+page.currentId;
			
			
				self.fireEvent('afterShow_'+resource, pager);
			
				console.log('afterShow');
				console.log(page);
				console.log(resource);
				//console.log(this);
			}
		},
		//load_js(assets){
			//console.log('LOAD JS');
			//console.log(assets);
			
			//if(assets['page_deps']){
				//this.addEvent(this.STARTED, this.parent.attempt(assets, this));
			//}
			//else{
				//this.parent(assets);
			//}
		//}
	});

	root_page = new RootPage();
		
	////root_page.addEvent(root_page.ASSETS_SUCCESS, function(){
		////console.log('root_page.ASSETS_SUCCESS');
		////root_page.fireEvent(root_page.STARTED);
	////});
	
	//root_page.addEvent(root_page.ASSETS_SUCCESS, function(){
			
		//var self = this;
		
		//if(mainBodyModel == null){
			
		
			//if(!self.model){
				
				
				//self.model = new MainModel();
				
				//self.pager = pager;
				//// use HTML5 history
				//self.pager.useHTML5history = true;
				//// use History instead of history
				//self.pager.Href5.history = History;
				
				//// extend your view-model with pager.js specific data
				//self.pager.extendWithPage(self.model);
				
				////console.log(self.model);
				
				
				//ko.applyBindings(self.model, document.getElementById("main-body"));
				//pager.startHistoryJs();
					
				////self.addEvent(self.model.INITIALIZED,function(){
					////console.log('self.model.INITIALIZED');
					
				////});
				
			
				//console.log('main-body binding applied');
			//}
			
			//mainBodyModel = self.model;
			
			////ko.tasks.schedule(this.start_timed_requests.bind(this));
			
		//}
		//else{
			//self.model = mainBodyModel;
		//}
		
		//root_page.fireEvent(root_page.STARTED);
	//});
	
	//head.load([
		//{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
		//{ jQuery: "/public/bower/jquery/dist/jquery.min.js" }//no dependencies
	//], function(){
	/**
	 *  @pager
	 * 
	 * */
			//head.load({ pager: "/public/bower/pagerjs/dist/pager.min.js" },function(){
				//head.load({ history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"}, function(){
					
					//root_page = new RootPage();
					
					//head.load({ flot: "/public/bower/gentelella/vendors/Flot/jquery.flot.js"}, function(){
						//head.load({ flot_pie: "/public/bower/gentelella/vendors/Flot/jquery.flot.pie.js" },function(){
							//head.load({ flot_time: "/public/bower/gentelella/vendors/Flot/jquery.flot.time.js" },function(){
								
								//head.load({ flot_stack: "/public/bower/gentelella/vendors/Flot/jquery.flot.stack.js" },function(){
									//head.load({ flot_resize: "/public/bower/gentelella/vendors/Flot/jquery.flot.resize.js" },function(){
										//head.load({ flot_orderBars: "/public/bower/gentelella/production/js/flot/jquery.flot.orderBars.js" },function(){
											//head.load({ flot_date: "/public/bower/gentelella/production/js/flot/date.js" },function(){
												//head.load({ flot_spline: "/public/bower/gentelella/production/js/flot/jquery.flot.spline.js" },function(){
													//head.load({ flot_curvedLines: "/public/bower/gentelella/production/js/flot/curvedLines.js" });
												//});
											//});
										//});
									//});
								//});
							
							//});
							
						//});
					//});
					
					
					
				//});
			//});
			
			
	//});
	
	

});


var load_app_resources = function(page) {//apply on pagerjs external resources
	console.log('load_app_resources: ');
	//console.log(page);
	//console.log(page.pageRoute);
	//console.log(page.originalRoute());
	//console.log(page.parentPage.currentId);
	
	var resource = page.currentId+'/index.js';
	
	if(page.parentPage && page.parentPage.currentId)
		resource = page.parentPage.currentId+'/'+page.currentId+'.js'
		
		//head.ready(function() {
    //// push a function to the end of the page for later execution
    //// runs as soon as the document is ready
    //document.documentElement.classList.add('mdl-js');
		//componentHandler.upgradeAllRegistered();
		//});
		
		head.js({ page: '/public/apps/'+resource});
		
		//head.load({ page: '/public/apps/'+page.currentId+'/index.css' });
		//head.ready('page',function(){
			//console.log('loaded...'+page.currentId);
			//document.documentElement.classList.add('mdl-js');
			//componentHandler.upgradeAllRegistered();
		//});
};
