var mainBodyModel = {};

var Page = null;

head.js({ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }); //no dependencies
//head.js({ mootools: "/public/bower/mootools/dist/mootools-core.min.js" }); //no dependencies

head.js({ mootools: "/public/bower/mootools/dist/mootools-core.min.js" }, function(){
		head.js({ 'mootools-more': "/public/js/MooTools-More-1.6.0-compressed.js" }); //no dependencies
}); //no dependencies


head.ready('mootools-more', function(){ 
	var MainModel = new Class({
		Implements: [Options, Events],
		
		options : {
		},
		
		initialize: function(options){
			var self = this;
			
			self.setOptions(options);
				
			apps.each(function(app){
				//console.log('app');
				//console.log(app);
				self[app.id] = ko.observable(null);
			});
			
			self.breadcrumbs = ko.observableArray([
				{label: 'dashboard', href: '/dashboard'},
				{label: 'second', href: '/dashboard/more'}
			]); 
			
		}
	});

	//mainBodyModel = new viewModel();
	Page = new Class({
		Implements: [Options, Events],
		
		JS_LOADED: 'jsLoaded',
		JSONP_LOADED: 'jsonpLoaded',
		CSS_LOADED: 'cssLoaded',
		STARTED: 'started',
		
		options: {
			assets: {
				js: {
				},
				css: {
				}
			},
		},
		
		pager: null,
		model: null,
		ko: null,
		
		initialize: function(options){
			
			this.setOptions(options);
			
			if(this.options.assets){
				
				if(this.options.assets.css){
					this.load_css(this.options.assets.css);
				}
				if(this.options.assets.js){
					this.load_js(this.options.assets.js);
				}
				if(this.options.assets.jsonp){
					this.load_jsonp(this.options.assets.jsonp);
				}
			}
			
		},
		load_css: function(assets){
			var self = this;
			Object.each(assets, function(css, id){
					
				 var css = Asset.css(css, {
					 id: id,
					 onLoad: function(){
						 self.fireEvent(self.CSS_LOADED+'_'+id, css);
						 self.fireEvent(self.CSS_LOADED, {id: id, css: css});
					 }
				 });
			});
		},
		load_jsonp: function(assets){
			var self = this;
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
								console.log('requesting.... '+url); // answer object with data
						},
						onComplete: function (data) {
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
		load_js: function(assets){
			var self = this;
			Object.each(assets, function(js, id){
				
				if(typeof(js) == 'array'){
					Array.each(js, function(file){
						self.load_js(file);
					});
				}
				else if(typeof(js) == 'object'){
					Object.each(js, function(file, key){
						var load = {};
						if(key == '_js'){
							load[id] = file;
							self.load_js(load);
						}
						else{
							load[key] = file;
							self.load_js(load);
						}
					});
				}
				else{
				 var js = Asset.javascript(js, {
					 id: id,
					 onLoad: function(){
						 self.fireEvent(self.JS_LOADED+'_'+id, js);
						 self.fireEvent(self.JS_LOADED, {id: id, js: js});
					 },
				 });
			 }
			 
			});
		}
		
	});

	var RootPage = new Class({
		Extends: Page,
		
		options: {
			assets: {
				js: {
					//ko: "/public/bower/knockoutjs/dist/knockout.js",
					//jQuery: "/public/bower/jquery/dist/jquery.min.js",
					////pager: "/public/bower/pagerjs/dist/pager.min.js",
					////history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"
					bootstrap: {
						_js: "/public/bower/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js",
						fastclick: "/public/bower/gentelella/vendors/fastclick/lib/fastclick.js",
						nprogress: "/public/bower/gentelella/vendors/nprogress/nprogress.js",
						gentelella: "/public/bower/gentelella/build/js/custom.min.js"
					}
					
				},
				css: {
					
				}
			},
		},
		
		
		initialize: function(options){
			
			this.parent(options);
			
			this.addEvent(this.JS_LOADED, function(data){
				console.log('self.JS_LOADED');
				console.log(data);
			});
			
			mainBodyModel = new MainModel();
			this.model = mainBodyModel;
			
			this.pager = pager;
			// use HTML5 history
			this.pager.useHTML5history = true;
			// use History instead of history
			this.pager.Href5.history = History;

			//console.log('login');
			//console.log(mainBodyModel.login());
			
			// extend your view-model with pager.js specific data
			this.pager.extendWithPage(this.model);
			
			ko.applyBindings(this.model, document.getElementById("main-body"));
			pager.startHistoryJs();
			
			
			console.log('main-body binding applied');
		}
	});

	head.load([
		{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
		{ jQuery: "/public/bower/jquery/dist/jquery.min.js" }//no dependencies
	], function(){
	/**
	 *  @pager
	 * 
	 * */
			head.load({ pager: "/public/bower/pagerjs/dist/pager.min.js" },function(){
				head.load({ history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"}, function(){
					
					var root_page = new RootPage();
					
							
				});
			});
			
			
	});
	
	//head.ready(document, function() {
		//head.js({ bootstrap: "/public/bower/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js" });
		////head.js({ fastclick: "/public/bower/gentelella/vendors/fastclick/lib/fastclick.js" });
		////head.js({ nprogress: "/public/bower/gentelella/vendors/nprogress/nprogress.js" });
		//head.js({ gentelella: "/public/bower/gentelella/build/js/custom.min.js" });
	//});

});


var load_app_resources = function(page) {//apply on pagerjs external resources
	//console.log('mdl: ');
	//console.log(page);
		//head.ready(function() {
    //// push a function to the end of the page for later execution
    //// runs as soon as the document is ready
    //document.documentElement.classList.add('mdl-js');
		//componentHandler.upgradeAllRegistered();
		//});
		
		head.js({ page: '/public/apps/'+page.currentId+'/index.js' });
		//head.load({ page: '/public/apps/'+page.currentId+'/index.css' });
		//head.ready('page',function(){
			//console.log('loaded...'+page.currentId);
			//document.documentElement.classList.add('mdl-js');
			//componentHandler.upgradeAllRegistered();
		//});
};

