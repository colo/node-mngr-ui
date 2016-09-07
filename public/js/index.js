var mainBodyModel = {};

var root_page = {
	//we need this so pagerjs can bind without errors, it will call the real class method
	beforeHide: function(){},
	afterShow: function(){}
};

var Page = null;

head.js({ PouchDB: "/public/bower/pouchdb/dist/pouchdb.min.js" }); //no dependencies

head.ready('PouchDB', function(){
	window.PouchDB = PouchDB;//for Chrome Fauxton
});

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
								console.log('requesting.... '+url);
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
						Array.each(js, function(file){
							console.log('file Array');
							console.log(file);
							self.load_js(file);
						});
					}
					else{
					
						var jsFile = Asset.javascript(js, {
							 id: id,
							 onLoad: function(){
								 self.fireEvent(self.JS_LOADED+'_'+id, js);
								 self.fireEvent(self.JS_LOADED, {id: id, js: js});
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
					 self.fireEvent(self.JS_LOADED, {id: null, js: assets});
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
					//{ pouchdb: "/public/bower/pouchdb/dist/pouchdb.min.js"} ,
					////ko: "/public/bower/knockoutjs/dist/knockout.js",
					////jQuery: "/public/bower/jquery/dist/jquery.min.js",
					//////pager: "/public/bower/pagerjs/dist/pager.min.js",
					//////history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"
					{ gentelella_deps: [
							{ bootstrap: "/public/bower/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js" },
							//{ fastclick: "/public/bower/gentelella/vendors/fastclick/lib/fastclick.js" },
							//{ nprogress: "/public/bower/gentelella/vendors/nprogress/nprogress.js" },
							//{ Chart: "/public/bower/gentelella/vendors/Chart.js/dist/Chart.min.js" },
							//{ gauge: "/public/bower/gentelella/vendors/bernii/gauge.js/dist/gauge.min.js" },
							//{ progressbar: "/public/bower/gentelella/vendors/bootstrap-progressbar/bootstrap-progressbar.min.js" },
							//{ iCheck: "/public/bower/gentelella/vendors/iCheck/icheck.min.js" },
							//{ skycons: "/public/bower/gentelella/vendors/skycons/skycons.js" },
							//{ flot: [
								//"/public/bower/gentelella/vendors/Flot/jquery.flot.js",
								//{ flot_pie: "/public/bower/gentelella/vendors/Flot/jquery.flot.pie.js" },
								//{ flot_time: "/public/bower/gentelella/vendors/Flot/jquery.flot.time.js" },
								//{ flot_stack: "/public/bower/gentelella/vendors/Flot/jquery.flot.stack.js" },
								//{ flot_resize: "/public/bower/gentelella/vendors/Flot/jquery.flot.resize.js" },
								//{ flot_orderBars: "/public/bower/gentelella/production/js/flot/jquery.flot.orderBars.js" },
								//{ flot_date: "/public/bower/gentelella/production/js/flot/date.js" },
								//{ flot_spline: "/public/bower/gentelella/production/js/flot/jquery.flot.spline.js" },
								//{ flot_curvedLines: "/public/bower/gentelella/production/js/flot/curvedLines.js" },
							//]},
							//{ jvectormap: "/public/bower/gentelella/production/js/maps/jquery-jvectormap-2.0.3.min.js" },
							//{ moment: "/public/bower/gentelella/production/js/moment/moment.min.js" },
							//{ daterangepicker: "/public/bower/gentelella/production/js/datepicker/daterangepicker.js" },
							{ gentelella: "/public/bower/gentelella/build/js/custom.min.js" }
						]
					}
				],
				css: {
					
				}
			},
		},
		
		
		initialize: function(options){
			
			
			this.parent(options);
			
			//this.addEvent('beforeHide', function(){
				//console.log('Event.beforeHide');
				////throw new Error()
			//});
			
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
			
		},
		beforeHide: function(pager){
			var self = this;
			self.fireEvent('beforeHide', pager);
			self.fireEvent('beforeHide_'+pager.page.currentId, pager);
			
			console.log('beforeHide');
			console.log(pager.page.currentId);
			//console.log(this);
			
		},
		afterShow: function(pager){
			var self = this;
			self.fireEvent('afterShow', pager);
			self.fireEvent('afterShow_'+pager.page.currentId, pager);
			
			console.log('afterShow');
			console.log(pager.page.currentId);
			//console.log(this);
			
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
					
					root_page = new RootPage();
					
					head.load({ flot: "/public/bower/gentelella/vendors/Flot/jquery.flot.js"}, function(){
						head.load({ flot_pie: "/public/bower/gentelella/vendors/Flot/jquery.flot.pie.js" },function(){
							head.load({ flot_time: "/public/bower/gentelella/vendors/Flot/jquery.flot.time.js" },function(){
								
								head.load({ flot_stack: "/public/bower/gentelella/vendors/Flot/jquery.flot.stack.js" },function(){
									head.load({ flot_resize: "/public/bower/gentelella/vendors/Flot/jquery.flot.resize.js" },function(){
										head.load({ flot_orderBars: "/public/bower/gentelella/production/js/flot/jquery.flot.orderBars.js" },function(){
											head.load({ flot_date: "/public/bower/gentelella/production/js/flot/date.js" },function(){
												head.load({ flot_spline: "/public/bower/gentelella/production/js/flot/jquery.flot.spline.js" },function(){
													head.load({ flot_curvedLines: "/public/bower/gentelella/production/js/flot/curvedLines.js" });
												});
											});
										});
									});
								});
							
							});
							
						});
					});
					
					
					
				});
			});
			
			
	});
	
	//head.ready(document, function() {
		//head.js({ bootstrap: "/public/bower/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js" }, function(){
		//head.js({ fastclick: "/public/bower/gentelella/vendors/fastclick/lib/fastclick.js" }, function(){
		//head.js({ nprogress: "/public/bower/gentelella/vendors/nprogress/nprogress.js" }, function(){
		//head.js({ Chart: "/public/bower/gentelella/vendors/Chart.js/dist/Chart.min.js" }, function(){
		//head.js({ gauge: "/public/bower/gentelella/vendors/bernii/gauge.js/dist/gauge.min.js" }, function(){
		//head.js({ progressbar: "/public/bower/gentelella/vendors/bootstrap-progressbar/bootstrap-progressbar.min.js" }, function(){
		//head.js({ iCheck: "/public/bower/gentelella/vendors/iCheck/icheck.min.js" }, function(){
		//head.js({ skycons: "/public/bower/gentelella/vendors/skycons/skycons.js" }, function(){
		//head.js({ flot: "/public/bower/gentelella/vendors/Flot/jquery.flot.js" }, function(){
		//head.js({ flot_pie: "/public/bower/gentelella/vendors/Flot/jquery.flot.pie.js" }, function(){
		//head.js({ flot_time: "/public/bower/gentelella/vendors/Flot/jquery.flot.time.js" }, function(){
		//head.js({ flot_stack: "/public/bower/gentelella/vendors/Flot/jquery.flot.stack.js" }, function(){
		//head.js({ flot_resize: "/public/bower/gentelella/vendors/Flot/jquery.flot.resize.js" }, function(){
		//head.js({ flot_orderBars: "/public/bower/gentelella/production/js/flot/jquery.flot.orderBars.js" }, function(){
		//head.js({ flot_date: "/public/bower/gentelella/production/js/flot/date.js" }, function(){
		//head.js({ flot_spline: "/public/bower/gentelella/production/js/flot/jquery.flot.spline.js" }, function(){
		//head.js({ flot_curvedLines: "/public/bower/gentelella/production/js/flot/curvedLines.js" }, function(){
		//head.js({ jvectormap: "/public/bower/gentelella/production/js/maps/jquery-jvectormap-2.0.3.min.js" }, function(){
		//head.js({ moment: "/public/bower/gentelella/production/js/moment/moment.min.js" }, function(){
		//head.js({ daterangepicker: "/public/bower/gentelella/production/js/datepicker/daterangepicker.js" }, function(){
		//head.js({ gentelella: "/public/bower/gentelella/build/js/custom.min.js" })
		//})})})})})})})})})})})})})})})})})})})});
		
	//});

});


var load_app_resources = function(page) {//apply on pagerjs external resources
	//console.log('mdl: ');
	console.log(page);
	console.log(page.pageRoute);
	console.log(page.originalRoute());
	
	
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

//var beforeHide = function(page){
	//console.log('beforeHide');
	//console.log(page);
//}
